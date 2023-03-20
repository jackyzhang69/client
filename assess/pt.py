from assess.ee.fsw import FSW
from assess.ee.ee import EE
from client.system.config import (
    app,
    typer,
    console,
)
from assess.bcpnp.skilled import BCPNP_Skill
from assess.sinp.entrepreneur import SINP_EP
from assess.oinp.skilled import OINP_Skill
from typing import Union
from rich.prompt import Prompt, Confirm, FloatPrompt, IntPrompt
from datetime import date, timedelta, datetime
from assess.cli.pt_functions import get_info
from assess.model.report import Report

""" 
Define arguments and options
"""
# 1. Common
info: bool = typer.Option(False, "-i", help="Show program definition information.")
noc_code: str = typer.Option("", "-n", help="NOC code ")
start_date: str = typer.Option(
    (date.today() - timedelta(days=365)).strftime("%Y-%m-%d"),
    "-sd",
    help="Start date",
)
end_date: str = typer.Option(date.today().strftime("%Y-%m-%d"), "-ed", help="End date")
work_experience: int = typer.Option(0, "-we", help="Work experience years. ")
is_working_in_the_position: bool = typer.Option(
    False, "-w", help="Is working in the position of job offer."
)
has_one_year_canadian_experience: bool = typer.Option(
    False, "-o", help="Have one year Canadian work experience. "
)
hourly_rate: float = typer.Option(26.44, "-r", help="Hourly rate")
education: int = typer.Option(2, "-e", help="Highest education level. ")
clb: int = typer.Option(5, "-l", help="Primary language CLB. ")
clbs: str = typer.Option("6 6 6 6", "-l", help="Frist language clbs(r w l s)")
second_clbs: Union[str, None] = typer.Option(
    None, "-sl", help="Second language clbs(r w l s)"
)
spouse_clbs: Union[str, None] = typer.Option(
    None, "-spl", help="Spouse language clbs(r w l s)"
)
age: int = typer.Option(25, "-a", help="Age. ")
aeo: bool = typer.Option(False, "-aeo", help="Has Arranged Employment Offer")
# App indicators
percentage: bool = typer.Option(False, "-pc", help="Show score/max percentage. ")
description: bool = typer.Option(False, "-ds", help="Show description ")
order_by_percetage: bool = typer.Option(
    False, "-op", help="Show ordered by percentage. "
)
chinese: bool = typer.Option(False, "-c", help="Show report in Chinese")
markdown: bool = typer.Option(False, "-m", help="Print out in markdown format")

# 2. BCPNP
area: int = typer.Option(0, "-a", help="Area.")
regional_exp_alumni: bool = typer.Option(
    False, "-ab", help="Regional bonus for experience or alumni. "
)
education_bonus: int = typer.Option(3, "-eb", help="Education bonus. ")
professional_designation: bool = typer.Option(
    False, "-pd", help="Eligible professional designation in BC. "
)
english_french_above_clb4: bool = typer.Option(
    False, "-ef", help="Both English and French is above CLB 4."
)

# 3. SK Entrepreneur
visited: bool = typer.Option(False, "-v", help="Visited SK?.")
edu_type: str = typer.Option(
    "0", "-et", help="Education type, 1 as trade 2 as Qualified Bachelor "
)
net_asset: str = typer.Option("500000", "-n", help="Net Asset.")
ownership50p: bool = typer.Option(False, "-o", help="Ownership over 50 percent ")
revenue: str = typer.Option("500000", "-r", help="Business revenue")
innovation: bool = typer.Option("False", "-in", help="Has innovative experience")
investment: str = typer.Option("200000", "-iv", help="Investment")
key_economic: bool = typer.Option(False, "-k", help="Is in key Economic factor")

# 4. ON Job offer stream
has_workpermit: bool = typer.Option(False, "-w", help="Has valid work permit. ")
worked6m: bool = typer.Option(False, "-w6", help="Has worked 6m+. ")
earning_40k_plus: bool = typer.Option(False, "-e4", help="Earning 40K+. ")
num_official_language: int = typer.Option(1, "-nl", help="Number of official languages")
field: int = typer.Option(3, "-f", help="Education field. ")
num_canadian_education: int = typer.Option(2, "-e", help="Highest education level. ")
study_location: int = typer.Option(0, "-fl", help="Study location ")

# 5. EE / FSW


# convert ee args
def convert_ee_locals(var_dict: dict):
    var_dict["first_clbs"] = var_dict["first_clbs"].split(" ")
    if var_dict["second_clbs"]:
        var_dict["second_clbs"] = var_dict["second_clbs"].split(" ")
    if var_dict["spouse_clbs"]:
        var_dict["spouse_clbs"] = var_dict["spouse_clbs"].split(" ")
    return var_dict


# Promptly get arguments and options
# Promptly get arguments and options
def get_bcs_factors():
    stream = Prompt.ask(
        "BCPNP stream",
        choices=["bc_sw", "bc_ig", "bc_elss", "ee_bc_sw", "ee_bc_ig"],
        default="bc_sw",
    )
    noc_code = Prompt.ask("Noc code")
    work_experience = IntPrompt.ask("Direct related work experience years")
    is_working_in_the_position = Confirm.ask(
        "Is working in the position of job offer?", default=False
    )
    has_one_year_canadian_experience = Confirm.ask(
        "Has one year Canadian work experience?", default=False
    )
    hourly_rate = FloatPrompt.ask("Hourly rate")
    area = Prompt.ask("Area", choices=["0", "1", "2"], default="0")
    regional_exp_alumni = Confirm.ask(
        "Has regional experience or alumni", default=False
    )
    education = IntPrompt.ask("Education level: ")
    education_bonus = IntPrompt.ask(
        "Where is your highest education tooken", choices=["0", "1", "2"], default="2"
    )
    professional_designation = Confirm.ask(
        "Have you received professional designation", default=False
    )
    clb = IntPrompt.ask("CLB level")
    english_french_above_clb4 = Confirm.ask(
        "Both English and French level are above CLB 4+", default=False
    )
    start_date = Prompt.ask(
        "Searching date since",
        default=(date.today() - timedelta(days=365)).strftime("%Y-%m-%d"),
    )
    end_date = Prompt.ask(
        "Searching date util", default=date.today().strftime("%Y-%m-%d")
    )
    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    return locals()


def get_ee_factors():
    stream = Prompt.ask(
        "EE stream",
        choices=["ALL", "CEC", "FST", "PNP"],
        default="ALL",
    )
    age = IntPrompt.ask("PA's age: ")
    education = IntPrompt.ask("PA's education level: ")
    studied = Confirm.ask("PA has studied in Canada?", default=False)
    studied_years = (
        IntPrompt.ask("How many years of the studied program in Canada? ")
        if studied
        else 0
    )
    # language
    first_clbs = Prompt.ask("PA primary language clb level(r w l s): ").split(" ")
    first_clbs_type = Prompt.ask(
        "PA primary language type",
        choices=["IELTS", "CELPIP", "TEF", "TCF"],
        default="IELTS",
    )
    has_second_clbs = Confirm.ask(
        "The PA has second official language score", default=False
    )
    if has_second_clbs:
        second_clbs = Prompt.ask("PA second language clb level(r w l s): ").split(" ")
        second_clbs_type = Prompt.ask(
            "PA second language type",
            choices=["IELTS", "CELPIP", "TEF", "TCF"],
            default="TEF",
        )
    else:
        second_clbs = None
        second_clbs_type = None

    # work experience
    foreign_work_experience = IntPrompt.ask("PA foreign work experience(years) ")
    canadian_work_experience = IntPrompt.ask("PA Canadian work experience(years) ")
    with_trade_certification = Confirm.ask(
        "The PA has trade certification", default=False
    )
    aeo = Confirm.ask("The PA has AEO", default=False)
    noc_code = Prompt.ask("PA noc code")

    # other
    canadian_relative = Confirm.ask(
        "The PA or spouse has Canadian siblings", default=False
    )
    pnp_nominated = Confirm.ask("The PA has PNP nomination", default=False)

    # spouse
    with_spouse = Confirm.ask(
        "The PA has spouse and the spouse will apply together", default=False
    )
    if with_spouse:
        spouse_education = IntPrompt.ask("Spouse education level ")
        spouse_clbs = Prompt.ask(
            "Spouse language clb levels(r w l s). Default is None ", default=None
        )
        spouse_clbs = spouse_clbs.split(" ") if spouse_clbs else None
        spouse_canadian_work_experience = IntPrompt.ask(
            "Spouse Canadian work experience(years) "
        )
    else:
        spouse_education = None
        spouse_clbs = None
        spouse_canadian_work_experience = 0

    start_date = Prompt.ask(
        "Searching date since",
        default=(date.today() - timedelta(days=365)).strftime("%Y-%m-%d"),
    )
    end_date = Prompt.ask(
        "Searching date util", default=date.today().strftime("%Y-%m-%d")
    )
    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    print(locals())
    return locals()


"""BCPNP Skill Worker scoring"""


@app.command()
def bcs(
    info: bool = info,
    noc_code: str = noc_code,
    stream: str = typer.Option("bc_sw", "-s", help="Program stream"),
    work_experience: int = work_experience,
    is_working_in_the_position: bool = is_working_in_the_position,
    has_one_year_canadian_experience: bool = has_one_year_canadian_experience,
    hourly_rate: float = hourly_rate,
    area: int = area,
    regional_exp_alumni: bool = regional_exp_alumni,
    education: int = education,
    education_bonus: int = education_bonus,
    professional_designation: bool = professional_designation,
    clb: int = clb,
    english_french_above_clb4: bool = english_french_above_clb4,
    percentage: bool = percentage,
    description: bool = description,
    order_by_percetage: bool = order_by_percetage,
    chinese: bool = chinese,
    markdown: bool = markdown,
    start_date: str = start_date,
    end_date: str = end_date,
    prompt: bool = typer.Option(
        False, "-p", help="Input by questions prompt and answer"
    ),
):
    """
    BC Skill Worker Program
    """
    if info:
        get_info(BCPNP_Skill)
        return
    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    factors = {**locals(), **get_bcs_factors()} if prompt else locals()
    factors["stage_name"] = factors["stream"]
    bcpnp=BCPNP_Skill(**factors)
    print(bcpnp)
    # Report(bcpnp,factors).get_report()

"""SINP Entrepreneur  scoring"""


@app.command()
def ske(
    info: bool = info,
    age: int = age,
    visited: bool = visited,
    edu_type: str = edu_type,
    net_asset: str = net_asset,
    work_experience: int = work_experience,
    ownership50p: bool = ownership50p,
    revenue: str = revenue,
    innovation: bool = innovation,
    investment: str = investment,
    key_economic: bool = key_economic,
    percentage: bool = percentage,
    description: bool = description,
    order_by_percetage: bool = order_by_percetage,
    start_date: str = start_date,
    end_date: str = end_date,
):
    """
    SK Entreprenuer Program
    """
    if info:
        get_info(SINP_EP)
        return
    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    Report(SINP_EP(factors=locals()), locals()).get_report()


"""OINP Job Offer  stream"""


@app.command()
def onig(
    info: bool = info,
    noc_code: str = noc_code,
    hourly_rate: float = hourly_rate,
    has_workpermit: bool = has_workpermit,
    worked6m: bool = worked6m,
    earning_40k_plus: bool = earning_40k_plus,
    area: int = area,
    clb: int = clb,
    num_official_language: int = num_official_language,
    education: int = education,
    field: int = field,
    num_canadian_education: int = num_canadian_education,
    study_location: int = study_location,
    chinese: bool = chinese,
    markdown: bool = markdown,
    start_date: str = start_date,
    end_date: str = end_date,
):
    """
    OINP Job Offer program:  International Graduate Stream
    """
    if info:
        get_info(OINP_Skill)
        return

    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    the_obj = OINP_Skill(noc_code=noc_code, stream="IG", factors=locals())
    Report(the_obj, locals()).get_report()


# OINP Foreign Worker
@app.command()
def onfw(
    info: bool = info,
    noc_code: str = noc_code,
    hourly_rate: float = hourly_rate,
    has_workpermit: bool = has_workpermit,
    worked6m: bool = worked6m,
    earning_40k_plus: bool = earning_40k_plus,
    area: int = area,
    clb: int = clb,
    num_official_language: int = num_official_language,
    education: int = education,
    field: int = field,
    start_date: str = start_date,
    end_date: str = end_date,
):
    """
    OINP Job Offer program: Foreign Worker Stream
    """

    if info:
        get_info(OINP_Skill)
        return

    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    the_obj = OINP_Skill(noc_code=noc_code, stream="FW", factors=locals())
    Report(the_obj, locals()).get_report()


@app.command()
def onds(
    info: bool = info,
    noc_code: str = noc_code,
    hourly_rate: float = hourly_rate,
    has_workpermit: bool = has_workpermit,
    worked6m: bool = worked6m,
    earning_40k_plus: bool = earning_40k_plus,
    area: int = area,
    start_date: str = start_date,
    end_date: str = end_date,
):
    """
    OINP Job Offer Program: Demand Skill Stream
    """
    if info:
        get_info(OINP_Skill)
        return

    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    the_obj = OINP_Skill(noc_code=noc_code, stream="DS", factors=locals())
    Report(the_obj, locals()).get_report()


@app.command()
def fsw(
    info: bool = info,
    age: int = age,
    education: int = education,
    clbs: str = clbs,
    second_clbs: Union[str, None] = second_clbs,
    spouse_clbs: Union[str, None] = spouse_clbs,
    studied: bool = typer.Option(False, "-s", help="Studied in Canada"),
    spouse_studied: bool = typer.Option(False, "-ss", help="Spouse studied in Canada"),
    worked: bool = typer.Option(False, "-w", help="Worked in Canada"),
    spouse_worked: bool = typer.Option(False, "-sw", help="Spouse worked in Canada"),
    work_experience: int = work_experience,
    aeo: bool = aeo,
    relative: bool = typer.Option(False, "-r", help="Has Canadian relatives"),
    percentage: bool = percentage,
    description: bool = description,
    order_by_percetage: bool = order_by_percetage,
    markdown: bool = markdown,
):
    """
    FSW 6 factors for EE qualification
    """
    if info:
        get_info(FSW)
        return
    clbs = clbs.split(" ")
    second_clbs = second_clbs.split(" ") if second_clbs else None
    spouse_clbs = spouse_clbs.split(" ") if spouse_clbs else None

    try:
        the_obj = FSW(**locals())
        the_obj.print(
            percentage=percentage,
            description=description,
            order_by_percetage=order_by_percetage,
            markdown=markdown,
        )
    except Exception as e:
        console.print(e, style="red")


@app.command()
def ee(
    stream: str = typer.Option("ALL", "-s", help="Program stream"),
    age: int = age,
    education: int = education,
    studied: bool = typer.Option(False, "-st", "--studied", help="Studied in Canada"),
    studied_years: int = typer.Option(
        0, "-sy", "--studied-years", help="Studied years in Canada"
    ),
    first_clbs: str = clbs,
    first_clbs_type: str = typer.Option(
        "IELTS", "-t", "--language-type", help="First language type"
    ),
    second_clbs: Union[str, None] = second_clbs,
    second_clbs_type: str = typer.Option(
        None, "-st", "--second-type", help="Second language type"
    ),
    foreign_work_experience: int = work_experience,
    canadian_work_experience: int = typer.Option(
        0, "-cwe", help="Canadian work experience"
    ),
    with_trade_certification: bool = typer.Option(
        False, "-tc", help="With trade certification"
    ),
    aeo: bool = aeo,
    noc_code: str = noc_code,
    canadian_relative: bool = typer.Option(False, "-r", help="Canadian relative"),
    pnp_nominated: bool = typer.Option(False, "-pnp", help="PNP nominated"),
    with_spouse: bool = typer.Option(
        False, "-ws", "--with-spouse", help="Apply PR together with spouse"
    ),
    spouse_education: Union[int, None] = typer.Option(
        None, "-se", help="Spouse education"
    ),
    spouse_clbs: Union[str, None] = spouse_clbs,
    spouse_canadian_work_experience: int = typer.Option(
        0, "-scwe", help="Spouse Canadian work experience"
    ),
    prompt: bool = typer.Option(
        False, "-p", help="Input by questions prompt and answer"
    ),
    markdown: bool = markdown,
    chinese: bool = chinese,
    start_date: str = start_date,
    end_date: str = end_date,
):
    """
    Express Entry Program
    """
    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    factors = (
        {**locals(), **get_ee_factors()} if prompt else convert_ee_locals(locals())
    )

    ee = EE(stream=stream, factors=factors)
    Report(ee, factors=factors).get_report()


if __name__ == "__main__":
    app()
