"""
This module is used to make, and check PR excel files, generate webform json data, as well as make appendix docx.
"""


from base.source.excel import Excel
from base.utils.utils import age
import json, dotenv, os
from client.system.imm_api import imm_api_post
from datetime import datetime
from client.system.config import (
    console,
    app,
    typer,
    error_style,
    success_style,
    show_error,
    show_success,
    print_errors,
    BASEDIR,
)
from functools import reduce
from base.utils.client.utils import append_ext
import shutil
from typing import Union, Optional, List


def getJsonData(excel_file_name):
    e = Excel(excel_name=excel_file_name)
    return e.json


def make_pr_excel(filename, language, dp_above_18=None, dp_under_18=None):

    # Create a temp directory
    temp_dir = BASEDIR / str(datetime.timestamp(datetime.now())).split(".")[0]
    os.makedirs(temp_dir)

    try:
        # create forms seperately
        if dp_under_18 == True:
            excels = ["0008dp"]
        elif dp_above_18 == True:
            excels = ["0008dp", "5669", "5562", "5406"]
        else:
            excels = ["0008", "5669", "5562", "5406"]

        for model in excels:
            data = {"model": model, "language": language}
            r = imm_api_post("case/make", data)
            if r.status_code == 401:
                console.print(r.json().get("detail"), style=error_style)
                return
            output_excel_name = temp_dir / f"{model}.xlsx"
            with open(output_excel_name, "wb") as f:
                f.write(r.content)

        # merge forms
        es = [Excel(temp_dir / f"{e}.xlsx", language=language) for e in excels]
        e = reduce(lambda a, b: a + b, es)
        filename = append_ext(filename, ".xlsx")
        e.make_excel(filename, protection=True)
        console.print(f"{filename} has been created", style=success_style)
    finally:
        # delete temp directory
        shutil.rmtree(temp_dir)


def check_pr_excel(filename, language, dp_above_18=None, dp_under_18=None):
    """Check input excel based on model"""
    excel_name = append_ext(filename, ".xlsx")

    if dp_under_18 == True:
        excels = ["0008dp"]
    elif dp_above_18 == True:
        excels = ["0008dp", "5669", "5562", "5406"]
    else:
        excels = ["0008", "5669", "5562", "5406"]
    for model in excels:
        data = {"model": model, "data": getJsonData(excel_name), "language": language}
        r = imm_api_post("case/check", data)

        if r.status_code == 200:
            console.print(f"Imm{model} checked and passed.", style=success_style)
        else:
            console.print(f"Imm{model} checked and found errors:", style=error_style)
            print_errors(r)


def getAppActions(pa):
    request = {"pa": pa.json}
    r = imm_api_post("pr/pickapp", request)
    if r.status_code == 200:
        return r.json()
    else:
        print_errors(r)
        return []


def getFormActions(pa, sp, dps, model):
    request = {
        "pa": pa.json,
        "sp": sp.json if sp else None,
        "dps": [dp.json for dp in dps],
        "model": model,
    }
    r = imm_api_post("pr/webform", request)
    if r.status_code == 200:
        return r.json()
    else:
        print_errors(r)
        return []


def login_prportal(rcic: str):
    # login
    path = os.path.abspath(os.path.join(os.path.expanduser("~"), ".immenv"))
    config = dotenv.dotenv_values(path)
    rcic = rcic or config.get("rcic")
    if not rcic:
        show_error(
            "You did not speficy using which rcic's portal. Please use -r rcic name"
        )
        return
    rcic_account = {
        "account": config.get(rcic + "_prportal_account"),
        "password": config.get(rcic + "_prportal_password"),
    }
    if not rcic_account["account"] or not rcic_account["password"]:
        show_error(
            f"{rcic}'s prportal account and/or password is not existed. Check the .immenv file in your home directory and add your profile"
        )
        exit(1)

    r = imm_api_post("pr/login", rcic_account)
    if r.status_code == 200:
        return r.json()
    else:
        print_errors(r)
        return []


def output(output, actions):
    if output:
        filename = append_ext(output, ".json")
        with open(filename, "w") as f:
            json.dump(actions, f, indent=3, default=str)
            show_success(f"{filename} is created")
    else:
        show_success(json.dumps(actions, indent=3, default=str))


def makeDocx(persons, docx_file):
    request = {"context": persons, "language": "English"}
    r = imm_api_post("pr/appendix", request)

    if r.status_code == 200:
        with open(docx_file, "wb") as f:
            f.write(r.content)
        show_success(f"{docx_file} has been downloaded from web")
    else:
        print_errors(r)


def is_above_18(dp):
    person = dp.dict.get("personal")
    dob = person.get("dob")
    return True if age(dob) >= 18 else False


""" 
Define arguments and Options
"""
arg_pa: str = typer.Argument(..., help="Principle applicant")
arg_sp: Union[None, str] = typer.Option(None, "-sp", "--spouse", help="Spouse")
arg_dp: Optional[List[str]] = typer.Option(
    None, "-dp", "--dependant", help="Dependants"
)
arg_dp_u18: Optional[List[str]] = typer.Option(
    None, "-dpu18", "--dependant-under-18", help="Dependants under 18"
)
dp_under_18: bool = typer.Option(
    False, "-u", "--under18", help="Dependant under 18", is_flag=True, flag_value=True
)
dp_above_18: bool = typer.Option(
    False, "-a", "--above18", help="Dependant above 18", is_flag=True, flag_value=True
)


def get_family_members(arg_pa, arg_sp, arg_dp):
    pa_excel = append_ext(arg_pa, ".xlsx")
    pa = Excel(pa_excel)

    if arg_sp:
        sp_excel = append_ext(arg_sp, ".xlsx")
        sp = Excel(sp_excel)
    else:
        sp = None

    dps = []
    if arg_dp:
        dp_excels = append_ext(arg_dp, ".xlsx")
        for excel in dp_excels:
            dps.append(Excel(excel))

    return (pa, sp, dps)


@app.command()
def appendix(
    arg_pa: str = arg_pa,
    arg_sp: Union[None, str] = arg_sp,
    arg_dp: Optional[List[str]] = arg_dp,
    to: str = typer.Option(
        ..., "-t", "--to", help="Output appendix docx name. With or without '.docx'"
    ),
):
    pa, sp, dps = get_family_members(arg_pa, arg_sp, arg_dp)
    sp = [sp.dict] if sp else []
    dps = [dp.dict for dp in dps if dp and is_above_18(dp)]
    makeDocx([pa.dict, *sp, *dps], append_ext(to, ".docx"))
    return


@app.command()
def webform(
    arg_pa: str = arg_pa,
    arg_sp: Union[None, str] = arg_sp,
    arg_dp: Optional[List[str]] = arg_dp,
    arg_forms: Optional[List[str]] = typer.Option(
        None, "-f", "--form", help="Form to generate"
    ),
    rcic: str = typer.Option("jacky", "-r", "--rcic", help="RCIC's short name"),
    output_json: str = typer.Option(None, "-t", "--to", help="Json file name"),
):
    if not arg_dp:
        arg_dp = []

    pa, sp, dps = get_family_members(arg_pa, arg_sp, arg_dp)
    dps_a18 = [dp for dp in dps if is_above_18(dp)]
    # actions container
    actions = []

    actions += login_prportal(rcic)
    # pick an existing application.
    actions += getAppActions(pa)

    # if args.form exists, then loop the form and generate them, else generate all forms
    if arg_forms:
        a5406 = a5562 = a5669 = a0008 = []
        for form in arg_forms:
            if form == "5406":
                a5406 = getFormActions(pa, sp, dps_a18, "5406")
            elif form == "5562":
                a5562 = getFormActions(pa, sp, dps_a18, "5562")
            elif form == "5669":
                a5669 = getFormActions(pa, sp, dps_a18, "5669")
            elif form == "0008":
                a0008 = getFormActions(pa, sp, dps, "0008")

            else:
                show_error(
                    f"{form} is not a valid form number in '5562','5406','5669','0008'"
                )

                return
        actions += a5406 + a5562 + a5669 + a0008
        output(output_json, actions)
        return
    else:
        for form in ["5406", "5562", "5669", "0008"]:
            if form != "0008":
                actions += getFormActions(pa, sp, dps_a18, form)
            else:
                actions += getFormActions(pa, sp, dps, form)

        output(output_json, actions)
        return


@app.command()
def make(
    output_excel: str = typer.Argument(
        ..., help="Output excel name for PR data.'.xlsx' is optional"
    ),
    chinese: bool = typer.Option(
        False, "-c", "--chinese", help="is Chinese?", is_flag=True, flag_value=True
    ),
    dp_under_18: bool = dp_under_18,
    dp_above_18: bool = dp_above_18,
):
    language = "chinese" if chinese else "english"
    if dp_above_18 and dp_under_18:
        raise ValueError(
            "Cannot have a dependant both under 18 and above 18. Use -u or -a, or not at all"
        )
    make_pr_excel(
        output_excel, language, dp_above_18=dp_above_18, dp_under_18=dp_under_18
    )
    return


@app.command()
def check(
    inpout_excel: str = typer.Argument(
        ..., help="Excel name to be checked.'.xlsx' is optional"
    ),
    chinese: bool = typer.Option(
        False, "-c", "--chinese", help="is Chinese?", is_flag=True, flag_value=True
    ),
    dp_under_18: bool = dp_under_18,
    dp_above_18: bool = dp_above_18,
):
    language = "chinese" if chinese else "english"
    if dp_above_18 and dp_under_18:
        console.print(
            "Cannot have a dependant both under 18 and above 18. Use -u or -a, or not at all",
            style="red",
        )
        return
    check_pr_excel(
        append_ext(inpout_excel, ".xlsx"),
        language,
        dp_above_18=dp_above_18,
        dp_under_18=dp_under_18,
    )
    return


if __name__ == "__main__":
    app()
