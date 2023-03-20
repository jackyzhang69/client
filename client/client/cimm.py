from client.system.config import (
    app,
    console,
    error_style,
    success_style,
    show_error,
    show_warning,
    print_errors,
)
from pathlib import Path
import typer
from base.utils.client.show import (
    makeTable,
    markdown_table,
    ConsoleTable,
)
from base.utils.client.utils import remove_ext
from base.utils.client.utils import append_ext
from base.model_collections import get_models
from client.system.config import Default
from rich.table import Table
from client.system.imm_api import imm_api_post
from typing import Union
from base.source.excel import Excel
import json


def getJsonData(excel_file_name):
    e = Excel(excel_name=excel_file_name)
    return e.json


# Define some common arguments
chinese: bool = typer.Option(
    False, "-c", "--chinese", help="Is Chinese?", is_flag=True, flag_value=True
)
markdown: bool = typer.Option(
    False, "-m", "--markdown", help="Output as markdown?", is_flag=True, flag_value=True
)
model: str = typer.Argument(..., help="Model")
output_excel_name: str = typer.Argument(..., help="Output excel file name")
input_excel_name: str = typer.Argument(..., help="Input excel file name")
outputjson: str = typer.Argument(
    None,
    help="Output json file name. Without input, excel's name will be used  by adding '.json'",
)
rcic: str = typer.Option(Default.rcic, "-r", "--rcic", help="RCIC's short name")
application_type: Union[str, None] = typer.Option(
    None,
    "-a",
    "--application_type",
    help="Application type. Currently only for imm5645",
)
word_name: str = typer.Argument(
    None,
    help="Output word name. If none, willl use excel's name without ext, plus .docx",
)


def getModel(model_name: str):
    # get model, and its instance
    models = get_models(rcic_company_id_name="", temp_num=1)
    model = models.get(model_name)
    if not model:
        show_error(f"{model_name} is not a valid model name.")
        exit(1)
    class_list = model["class_list"]
    the_class = __import__(model["path"], fromlist=class_list)
    the_model = getattr(the_class, class_list[1])  # No 2 is the Excel model
    return the_model


@app.command()
def man(model: str = typer.Argument(None, help="A model name, such as 5708")):
    """Manual of imm app"""
    models = get_models(rcic_company_id_name="", temp_num=1)
    # give specific manu for a model
    if model:
        if model not in models:
            show_error(
                f"{model} is not valid in defined models. Please use 'imm man' to check all models"
            )
            return
        help = models.get(model).get("help")
        if help:
            table = makeTable(f"Help for model {model}", help.get("helps"))
            console.print(table)
        else:
            print("There is no help info provided yet.")
    else:

        table = Table(title="Models List")
        table.add_column("Model", justify="left", style="cyan", no_wrap=True)
        table.add_column("Word", style="magenta")
        table.add_column("Pdf Form", style="magenta")
        table.add_column("Web Form ", style="magenta")
        table.add_column("Description", justify="left", style="green")

        contents = []
        for model, value in models.items():
            word_template = value.get("docx_template")
            pdf_function = value.get("pdf_function")
            web_function = value.get("web_function")
            if word_template:
                temp_name = ", ".join(word_template)
            else:
                temp_name = ""
            contents.append(
                [
                    model,
                    Path(temp_name).name,
                    pdf_function,
                    web_function,
                    value["remark"],
                ]
            )
        print(
            "Every model can do at least two things. 1. make: output excel based on model  2. check: check excel content based on the model\nFor specific help, enter imm model_name to get the model's details.",
        )
        for content in contents:
            table.add_row(*content)

        console.print(table)


@app.command()
def make(
    model: str = model,
    output_excel_name: str = output_excel_name,
    chinese: bool = chinese,
):
    """Make excel based on model"""
    language = "chinese" if chinese else "english"
    output_excel_name = append_ext(output_excel_name, ".xlsx")
    file_exists = Path(output_excel_name).exists()
    if file_exists:
        overwrite = typer.confirm(f"{output_excel_name} is existed, overwrite?")
        if not overwrite:
            return
    # create excel
    data = {"model": model, "language": language}
    r = imm_api_post("case/make", data)
    if r.status_code != 200:
        console.print(r.json().get("detail"), style=error_style)
        return

    with open(output_excel_name, "wb") as f:
        f.write(r.content)
    console.print(f"{output_excel_name} has been created", style=success_style)


@app.command()
def check(
    model: str = model,
    input_excel_name: str = input_excel_name,
    chinese: bool = chinese,
):
    """Check input excel based on model"""
    language = "chinese" if chinese else "english"
    input_excel_name = append_ext(input_excel_name, ".xlsx")
    data = {"model": model, "data": getJsonData(input_excel_name), "language": language}
    r = imm_api_post("case/check", data)

    if r.status_code == 200:
        console.print(r.json()["success"], style=success_style)
    else:
        print_errors(r)


@app.command()
def run(
    model: str = model,
    input_excel_name: str = input_excel_name,
    chinese: bool = chinese,
    markdown: bool = markdown,
):
    """Run app only"""
    language = "chinese" if chinese else "english"
    input_excel_name = append_ext(input_excel_name, ".xlsx")
    data = {"model": model, "data": getJsonData(input_excel_name), "language": language}
    r = imm_api_post("case/run", data)

    if r.status_code == 200:
        data = r.json()["success"]
        if type(data) == dict:
            """if data is a dict, it is a table data"""
            if data.get("table"):
                """get table data dict"""
                table_dict = data.get("table")
                """ create a TableData object"""
                table_obj = ConsoleTable(**table_dict)
                if markdown:
                    table = markdown_table(table_obj.table_data, title=table_obj.title)
                else:
                    table = makeTable(
                        table_obj.title,
                        table_obj.table_data,
                        with_footer=table_obj.with_footer,
                        highlight_rows=table_obj.highlight_rows,
                        highlight_cols=table_obj.highlight_cols,
                        highlight_style=table_obj.highlight_style,
                    )
                console.print(table)
            else:
                [print(f"{k}:{v}") for k, v in data.items()]
        else:
            console.print(data, style=success_style)
    else:
        print_errors(r)


@app.command()
def word(
    model: str = model,
    input_excel_name: str = input_excel_name,
    doctype: str = typer.Argument(
        ...,
        help="Which document to generate, such as sl, ert,eet,... Use 'imm man' to check word column for details",
    ),
    word_name: str = word_name,
    rciccompany: str = typer.Option(
        Default.rciccompany,
        "-r",
        "--rciccompany",
        help="Rcic company short name defined in docx templates",
    ),
    tempnum: int = typer.Option(
        1, "-t", "--tempnum", help="template number", min=1, max=5
    ),
    chinese: bool = chinese,
):
    """Make word based on model and input excel"""
    language = "chinese" if chinese else "english"
    # check
    input_excel_name = append_ext(input_excel_name, ".xlsx")
    if word_name:
        word_name = append_ext(word_name, ".docx")
    else:
        word_name = remove_ext(input_excel_name) + ".docx"

    word_file_exists = Path(word_name).exists()
    excel_file_exists = Path(input_excel_name).exists()

    if not excel_file_exists:
        console.print(f"{input_excel_name} is not existed.", style=error_style)
        return

    if word_file_exists:
        overwrite = typer.confirm(f"{word_name} is existed, overwrite?")
        if not overwrite:
            return

    models = get_models(rcic_company_id_name=rciccompany, temp_num=tempnum)
    template_docx_dict = models.get(model).get("docx_template")
    if not template_docx_dict:
        console.print(
            f"There is no template existing in model {model.get('class_list')[0]}",
            style=error_style,
        )
        return

    data = {
        "model": model,
        "data": getJsonData(input_excel_name),
        "output_name": word_name,
        "doctype": doctype,
        "rciccompany": rciccompany,
        "tempnum": tempnum,
        "language": language,
    }
    r = imm_api_post("case/word", data)

    if r.status_code == 200:
        with open(word_name, "wb") as f:
            f.write(r.content)
        console.print(f"{word_name} has been downloaded from web", style=success_style)
    else:
        print_errors(r)


@app.command()
def webform(
    model: str = model,
    input_excel_name: str = input_excel_name,
    outputjson: str = outputjson,
    rcic: str = rcic,
    initial: bool = typer.Option(
        False,
        "-i",
        "--initial",
        help="Is this for starting a new case. Only used for BCPNP webform.",
        is_flag=True,
        flag_value=True,
    ),
    previous: bool = typer.Option(
        False,
        "-p",
        "--previous",
        help="Does this client have previous BCPNP application?",
        is_flag=True,
        flag_value=True,
    ),
    uploaddir: str = typer.Option(
        ".",
        "-u",
        "--uploaddir",
        help="A directory in which all files will be uploaded.",
    ),
    chinese: bool = chinese,
):
    """Make json file based on model and input excel for webform filling"""
    language = "chinese" if chinese else "english"
    input_excel_name = append_ext(input_excel_name, ".xlsx")
    if outputjson:
        outputjson = append_ext(outputjson, ".json")
    else:
        outputjson = remove_ext(input_excel_name) + ".json"
    if not uploaddir:
        show_warning(
            "You did not input uploading directory. Without it , the files in current folder will be uploaded."
        )

    data = {
        "model": model,
        "data": getJsonData(input_excel_name),
        "output_name": outputjson,
        "rcic": rcic,
        "upload_dir": uploaddir,
        "language": language,
        "initial": initial,
        "previous": previous,
    }
    r = imm_api_post("case/webform", data)

    if r.status_code == 200:
        with open(outputjson, "wb") as f:
            f.write(r.content)
        console.print(f"{outputjson} has been downloaded from web", style=success_style)
    else:
        print_errors(r)


@app.command()
def pdfform(
    model: str = model,
    input_excel_name: str = input_excel_name,
    outputjson: str = outputjson,
    rcic: str = rcic,
    chinese: bool = chinese,
    application_type: str = application_type,
):
    """Make json file based on model and input excel for pdf form filling"""
    language = "chinese" if chinese else "english"
    input_excel_name = append_ext(input_excel_name, ".xlsx")

    if outputjson:
        outputjson = append_ext(outputjson, ".json")
    else:
        outputjson = remove_ext(input_excel_name) + ".json"

    valid_5645_type = ["Visitor", "Student", "Worker", "Other"]
    if (
        model == "5645"
        and application_type
        and application_type.title() not in valid_5645_type
    ):
        console.print(
            f"Form 5645 needs application type as {','.join(valid_5645_type)}",
            style="red",
        )
        return

    data = {
        "model": model,
        "data": getJsonData(input_excel_name),
        "output_name": outputjson,
        "rcic": rcic,
        "language": language,
        "application_type": application_type and application_type.title(),
    }
    r = imm_api_post("case/pdfform", data)

    if r.status_code == 200:
        with open(outputjson, "wb") as f:
            f.write(r.content)
        console.print(f"{outputjson} has been downloaded from web", style=success_style)
    else:
        print_errors(r)


# Employment certificates
@app.command()
def ec(
    input_excel_name: str = input_excel_name,
    word_name: str = word_name,
    chinese: bool = chinese,
):
    """Make Employment Certificate word based on input excel"""
    language = "chinese" if chinese else "english"
    # check
    input_excel_name = append_ext(input_excel_name, ".xlsx")
    if word_name:
        word_name = append_ext(word_name, ".docx")
    else:
        word_name = remove_ext(input_excel_name) + ".docx"

    word_file_exists = Path(word_name).exists()
    excel_file_exists = Path(input_excel_name).exists()

    if not excel_file_exists:
        console.print(f"{input_excel_name} is not existed.", style=error_style)
        return

    if word_file_exists:
        overwrite = typer.confirm(f"{word_name} is existed, overwrite?")
        if not overwrite:
            return

    # step 1: get which company to make employment certificate
    request1 = {"source": getJsonData(input_excel_name), "language": language}
    r1 = imm_api_post("case/get_companies", request1)
    if r1.status_code == 200:
        companies = r1.json()
        for index, company in enumerate(companies):
            print(f"{index}: {company}")
        company_index = input(
            "Please input the index of company for employment certificate: "
        )
        if not company_index.isdigit():
            console.print("Your input must be integer", style=error_style)
            exit(1)
        if int(company_index) < 0 or int(company_index) >= len(companies):
            console.print(
                f"Your input must between 0 and {len(companies)}", style=error_style
            )
            exit(1)
        company = companies[int(company_index)]
        # step 2: get the company's certificate
        request2 = {
            **request1,
            "company": company,
        }
        r2 = imm_api_post("case/get_certificate", request2)
        if r2.status_code == 200:
            with open(word_name, "wb") as f:
                f.write(r2.content)
            console.print(
                f"{word_name} has been downloaded from web", style=success_style
            )
        else:
            print_errors(r2)
    else:
        print_errors(r1)


if __name__ == "__main__":
    app()
