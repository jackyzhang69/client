from client.system.config import console
from assess.nocs.model import (
    AreaWageOutlook,
    NOCContant,
    NOCContents,
    get_qualified_nocs,
    Outlook,
)
from assess.nocs.er import EconomicRegion
from assess.nocs.noccodes import noc_2021_v1
from assess.nocs.outlook_noc21 import OUTLOOK_NOC21
from client.system.config import (
    app,
    typer,
    console,
)
import json
from assess.nocs.app import (
    get_wages,
    get_info,
    get_find,
    get_er,
    write,
    get_qnocs,
    get_qareas,
    get_sp,
)

markdown: bool = typer.Option(
    False,
    "-m",
    "--markdown",
    help="Flag to output markdown format info",
)


@app.command()
def find(
    keywords: str = typer.Argument(
        ...,
        help="Input key words to search noc codes. You can input multiple keywords within quotation mark, exp: 'marketing manager'",
    ),
    examples: bool = typer.Option(
        False,
        "-e",
        "--examples",
        help="Flag to match with title examples",
        is_flag=True,
    ),
    duties: bool = typer.Option(
        False,
        "-d",
        "--duties",
        help="Flag to match with main duties",
        is_flag=True,
    ),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
    markdown: bool = markdown,
):
    get_find(keywords, examples, duties, markdown=markdown)
    write(save, fmt)


@app.command()
def wages(
    noc_codes: str = typer.Argument(
        ...,
        help="Input noc code(s). If input multiple noc codes, please enter within quotation mark. exp: '11100 62200'",
    ),
    er_code: str = typer.Argument("5920", help="Input Economic code"),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
    markdown: bool = markdown,
    mkd_table: bool = typer.Option(
        False, "-nt", "--not_table", help="Markdown output not talbe"
    ),
):
    get_wages(noc_codes, er_code, markdown=markdown, not_table=mkd_table)
    write(save, fmt)


@app.command()
def info(
    noc_code: str = typer.Argument(..., help="Input noc code"),
    examples: bool = typer.Option(
        False,
        "-e",
        "--examples",
        help="Output title examples",
    ),
    requirements: bool = typer.Option(
        False,
        "-r",
        "--requirements",
        help="Output employment requirements",
    ),
    duties: bool = typer.Option(
        False,
        "-d",
        "--duties",
        help="Output main duties",
    ),
    additional: bool = typer.Option(
        False,
        "-a",
        "--additional",
        help="Output additional information",
    ),
    exclusion: bool = typer.Option(
        False,
        "-x",
        "--exclusion",
        help="Output exclusion titles",
    ),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
    markdown: bool = markdown,
):
    get_info(
        noc_code,
        examples,
        requirements,
        duties,
        additional,
        exclusion,
        markdown=markdown,
    )
    write(save, fmt)


@app.command()
def er(
    province: str = typer.Argument("all", help="Input province abbreviation"),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
    markdown: bool = markdown,
):
    get_er(province, markdown=markdown)


""" 
Quick NOCs
1. find batch of nocs starts with a specific string 
2.  find nocs with outlook index higher to a specific value
3. find nocs with median wage higher than a specific value
"""


@app.command()
def qnocs(
    start_with: str = typer.Argument(
        ..., help="Input start number (s) of noc codes. Input all will search all nocs"
    ),
    er_code: str = typer.Argument("5920", help="Input Economic Region code"),
    outlook_star: int = typer.Option(
        0,
        "-o",
        help="Input outlook star(s) to seek nocs with more than the stars' outlook",
    ),
    median_wage: int = typer.Option(
        0, "-w", help="Input wage to seek nocs with more than the wage'"
    ),
    greater: bool = typer.Option(
        True,
        "-l",
        "--less",
        help="Greater than the wage",
        is_flag=True,
        flag_value=False,
    ),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
    markdown: bool = markdown,
):
    nocs = get_qualified_nocs(
        begin_str=start_with,
        er_code=er_code,
        outlook=outlook_star,
        median_wage=median_wage,
        greater=greater,
    )

    get_qnocs(er_code, nocs, markdown)
    write(save, fmt)


""" 
Quick Areas
1. Find a list of areas for a specific NOC code with a outlook star
"""


@app.command()
def qareas(
    noc_code: str = typer.Argument(..., help="Noc code. "),
    outlook_star: int = typer.Argument(
        3, help="Input outlook star(s) to seek nocs with more than the stars' outlook"
    ),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
):
    if noc_code not in noc_2021_v1:
        console.print(f"{noc_code} is not a valid NOC 2021 code", style="red")
        return

    get_qareas(noc_code, outlook_star)
    write(save, fmt)


""" 
Special programs
1. Find all the programs based on the noc
"""


@app.command()
def sp(
    noc_code: str = typer.Argument(..., help="Noc code. "),
    description: bool = typer.Option(
        False,
        "-d",
        help="Program description",
    ),
    remark: bool = typer.Option(False, "-r", help="Program remark"),
    source: bool = typer.Option(False, "-s", help="Program source"),
    save: str = typer.Option(None, "-s", "--save", help="Save output as file"),
    fmt: str = typer.Option("html", "-f", "--format", help="File format"),
):
    get_sp(noc_code, description, remark, source)
    write(save, fmt)

def main():
    app()

if __name__ == "__main__":
    main()
