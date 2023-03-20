from assess.cli.cli import MyArgumentParser, Cli, HelpAction, ChoiceAction
from base.utils.client.show import makeTable, markdown_table
from base.utils.client.utils import append_ext
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
from client.system.config import console
from base.utils.client.show import print_validation_error
import json, os
from base.utils.client.show import markdown_title_list
from assess.cli.cli import Command
from base.ai.ai import AIModel, get_ai_answer
from pydantic import ValidationError
from assess.nocs.noccodes import noc16_to_21, noc21_to_16
from typing import Union
from base.utils.db import Collection


""" 
NOC application
"""


def get_find_by_ai(args):
    keywords = " ".join(args.keywords)
    prompt = f"find '{keywords}' in Canada noc title, title examples, or main duties and determinal the job title. Output rules: 1. output the title, and its noc code if you sure. 2. if there are similarities, you may give me more than one 3. Using strict json format of the title and the code"
    ai_answer = get_ai_answer(prompt, model=AIModel.DAVINCI)
    if type(ai_answer) == list:
        for answer in ai_answer:
            noc2016 = answer["noc"]
            answer["noc2021"] = noc16_to_21(noc2016)
    return ai_answer


def show_find_result(result: Union[list, str]):
    if type(result) == list:
        titles = ["No", "Title", "Noc 2016", "Noc 2021"]
        table_data = [titles]
        for i, r in enumerate(result):
            table_data.append([i, r["title"], r["noc"], ", ".join(r["noc2021"])])

        table = makeTable("Matched NOCs", table_data)
        console.print(table)
    else:
        console.print(result, style="white")


def get_find(keywords, title_example, main_duties, markdown=False):
    try:
        keywords_list = keywords.split(" ") if type(keywords) == str else keywords
        nocs = NOCContents().find(
            keywords_list, title_examples=title_example, main_duties=main_duties
        )
        result = [["No", "Noc", "Teer Level", "Noc Level", "Title"]]
        for i, x in enumerate(nocs):
            result.append([i, x.noc_code, x.level, x.noc_level_16, x.title])
        table = makeTable("Matched Nocs", result)
    except Exception as e:
        console.print(e, style="red")
    else:
        if markdown:
            console.print(markdown_table(result, title="Matched Nocs"))
        else:
            console.print(table)


def get_er(province, markdown=False):
    try:
        er_list = EconomicRegion().get_ers(province.upper())
        table = makeTable(f"Ecornomic Region Inforation of {province.upper()}", er_list)
    except Exception as e:
        console.print(e, style="red")
    else:
        if markdown:
            console.print(
                markdown_table(
                    er_list, title=f"Ecornomic Region Inforation of {province.upper()}"
                )
            )
        else:
            console.print(table)


def write(save, fmt):
    if save:
        if fmt and fmt.lower() == "html":
            filename = append_ext(save, "html")
            console.save_html(filename)
        elif fmt and fmt.lower() == "txt":
            filename = append_ext(save, "txt")
            console.save_text(filename)
        elif fmt and fmt.lower() == "svg":
            filename = append_ext(save, "svg")
            console.save_svg(filename)
        else:
            console.print(f"{fmt} is not a valid format to save", style="red")
            return
        console.print(f"{filename} saved", style="green")


def get_wages(noc_codes, er_code, markdown=False, not_table=False):
    try:
        noc_code_list = (
            noc_codes.split(" ") if noc_codes and type(noc_codes) != list else noc_codes
        )
        reports = []
        for i, code in enumerate(noc_code_list):
            if i == 0:
                reports += AreaWageOutlook(noc_code=code, er_code=er_code).get_report()
            else:
                reports += AreaWageOutlook(noc_code=code, er_code=er_code).get_report(
                    with_title=False
                )
    except Exception as e:
        if not noc_codes:
            console.print("You didn't enter noc codes.", style="red")
    else:
        if markdown:
            if not_table:
                titles = reports.pop(0)
                for i, r in enumerate(reports):
                    console.print(f"##### NOC {i+1}")
                    for index, title in enumerate(titles):
                        console.print(f"- **{title}**: {r[index]}")
            else:
                console.print(
                    markdown_table(
                        reports,
                        title=f"Wage and Outlook of Noc({noc_codes}) in area {EconomicRegion().er_name(er_code)} ",
                    )
                )
        else:
            console.print(
                makeTable(
                    f"Wage and Outlook of Noc({noc_codes}) in area {EconomicRegion().er_name(er_code)}",
                    reports,
                )
            )


def get_info(
    noc_code, examples, requirements, duties, additional, exclusion, markdown=False
):
    try:
        report = NOCContant(noc_code=noc_code)
    except Exception as e:
        console.print(e, style="red")
    else:
        if markdown:
            console.print(markdown_title_list([report.title], title="Title"))
        else:
            console.print("\nTitle\n", style="green")
            console.print(report.title)
        if examples:
            if markdown:
                console.print(
                    markdown_title_list(report.title_examples, title="Title Examples")
                )
            else:
                console.print("\nTitle Examples\n", style="green")
                [print(x) for x in report.title_examples]

        if requirements:
            if markdown:
                console.print(
                    markdown_title_list(
                        report.employment_requirement, title="Employment Requirements"
                    )
                )
            else:
                console.print("\nEmployment Requirements\n", style="green")
                [print(x) for x in report.employment_requirement]
        if duties:
            if markdown:
                console.print(
                    markdown_title_list(report.main_duties, title="Main Duties")
                )
            else:
                console.print("\nMain Duties\n", style="green")
                [print(x) for x in report.main_duties]

        if additional:
            if markdown:
                console.print(
                    markdown_title_list(
                        report.additional_information, title="General Information"
                    )
                )
            else:
                console.print("\nAdditional Information\n", style="green")
                [print(x) for x in report.additional_information]

        if exclusion:
            if markdown:
                console.print(markdown_title_list(report.exclusion, title="Exclusion"))
            else:
                console.print("\nExclusion\n", style="green")
                [print(x) for x in report.exclusion]


def get_qnocs(er_code, nocs, markdown=False):
    try:
        reports = []
        for index, noc in enumerate(nocs):
            if index == 0:
                reports += noc.get_report(with_er_name=False)
            else:
                reports += noc.get_report(with_title=False, with_er_name=False)
        table = makeTable("Qualified NOCs Report", reports)
    except Exception as e:
        console.print(e, style="red")
    else:
        if markdown:
            console.print(
                markdown_table(
                    reports,
                    title=f"Qualified NOCs info in Area {EconomicRegion().er_name(er_code)} ({er_code})",
                )
            )
        else:
            console.print(
                f"Qualified NOCs info in Area {EconomicRegion().er_name(er_code)} ({er_code})",
                style="green",
            )
            console.print(table)


def get_qareas(noc_code, outlook_star):
    try:
        areas = []
        er_data = OUTLOOK_NOC21.get(noc_code)
        for er_code, value in er_data.items():
            outlook = Outlook(**value)
            if outlook.star >= outlook_star:
                areas.append(er_code)
        # make table data
        table_data = [["No", "ER Code", "ER Name"]]
        for i, area in enumerate(areas):
            table_data.append([i, area, EconomicRegion().er_name(area)])

        if len(table_data) == 1:  # only has title row
            console.print("There is no matching result", style="red")
            return
        table = makeTable(
            f"Qualified Areas for NOC {noc_code} with {outlook_star} stars outlook",
            table_data,
        )
    except Exception as e:
        console.print(e, style="red")
    else:
        console.print(table)


def get_sp(noc_code, description, remark, source):
    try:
        collection = Collection("imm_data").find_one({"name": "special_programs"})
        if not collection:
            return False

        qualified_programs = []
        for program in collection["data"]:
            if noc_code in program["noc_codes"]:
                qualified_programs.append(program)

        table_data = []
        titles = ["Program", "Stream"]
        if description:
            titles.append("description")
        if remark:
            titles.append("remark")
        if source:
            titles.append("source")
        table_data.append(titles)

        for qp in qualified_programs:
            values = [qp["program"], qp["stream"]]
            if description:
                values.append(qp["description"])
            if remark:
                values.append(qp["remark"])
            if source:
                values.append(qp["source"])
            table_data.append(values)
        if len(table_data) == 1:
            console.print("There is no matching programs", style="red")
            return
        table = makeTable(f"Special Programs related to the NOC {noc_code}", table_data)
    except Exception as e:
        console.print(e, style="red")
    else:
        console.print(table)


""" Command parser"""


def noc_parser():
    parser = MyArgumentParser(prog="noc")
    parser.add_argument(
        "command",
        choices=[
            "find",
            "wages",
            "qnocs",
            "qareas",
            "info",
            "er",
            "sp",
            "h",
            "help",
            "exit",
        ],
    )
    return parser


def sp_parser():
    parser = MyArgumentParser(
        prog="sp",
        add_help=False,
        exit_on_error=False,
        description="Find a noc code's special programs",
    )
    parser.add_argument(
        "-h",
        "--help",
        action=HelpAction,
        help="show this help message and return",
    )

    parser.add_argument(
        "noc_code", type=str, help="Input noc code. If input multiple noc code"
    )
    parser.add_argument(
        "-d", "--description", action="store_true", help="Program description"
    )
    parser.add_argument("-r", "--remark", action="store_true", help="Program remark")
    parser.add_argument("-s", "--source", action="store_true", help="Program source")
    return parser


def wages_parser():
    parser = MyArgumentParser(
        prog="wages",
        add_help=False,
        exit_on_error=False,
        description="Find out a list of noc codes' wages and outlook",
    )
    parser.add_argument(
        "-h",
        "--help",
        action=HelpAction,
        help="show this help message and return",
    )

    parser.add_argument(
        "noc_codes",
        nargs="+",
        help="Input noc code(s). If input multiple noc codes, please enter within quotation mark. exp: '11100 62200'",
    )
    parser.add_argument(
        "-e",
        "--economic_region",
        type=str,
        default="5920",
        nargs="?",
        help="Input Economic code",
    )
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )
    parser.add_argument(
        "-n",
        "--not_table",
        action="store_true",
        help="Markdown output not talbe",
    )
    return parser


def qnocs_parser():
    parser = MyArgumentParser(
        prog="qnocs",
        add_help=False,
        exit_on_error=False,
        description="Find qualfied noc codes based on economic region, outlook, and median wage",
    )

    parser.add_argument(
        "start_with",
        type=str,
        help="Input start number (s) of noc codes. Input all will search all nocs",
    )
    parser.add_argument(
        "outlook",
        type=int,
        default=3,
        choices=range(1, 6),
        action=ChoiceAction,
        help="Input outlook star(s) to seek nocs with more than the stars' outlook",
    )
    parser.add_argument(
        "-e",
        "--economic_region",
        type=str,
        default="5920",
        help="Input Economic code",
    )
    parser.add_argument(
        "-w",
        "--median_wage",
        type=int,
        default=0,
        help="Input wage to seek nocs with more than the wage'",
    )
    parser.add_argument(
        "-l",
        "--less",
        action="store_true",
        help="Input wage to seek nocs with less than the wage'",
    )
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )

    return parser


def info_parser():
    parser = MyArgumentParser(
        prog="info",
        add_help=False,
        exit_on_error=False,
        description="Get noc contents: title, title examples, duties, employment requirements, etc...",
    )
    parser.add_argument(
        "-h",
        "--help",
        action=HelpAction,
        help="show this help message and return",
    )
    parser.add_argument(
        "noc_code", type=str, help="Input noc code. If input multiple noc code"
    )
    # noc's title examples,  duties, requirements, additional info, and exclusions
    parser.add_argument(
        "-e",
        "--examples",
        action="store_true",
        help="Flag to match with title examples",
    )
    parser.add_argument(
        "-d", "--duties", action="store_true", help="Flag to match with main duties"
    )
    parser.add_argument(
        "-r",
        "--requirements",
        action="store_true",
        help="Output employment requirements",
    )
    parser.add_argument(
        "-a", "--additional", action="store_true", help="Output additional information"
    )
    parser.add_argument(
        "-x", "--exclusion", action="store_true", help="Output exclusion titles"
    )
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )

    return parser


def er_parser():
    parser = MyArgumentParser(
        prog="er",
        add_help=False,
        exit_on_error=False,
        description="Find a province' or all Canada economic region and its code",
    )
    parser.add_argument(
        "-h",
        "--help",
        action=HelpAction,
        help="show this help message and return",
    )

    parser.add_argument(
        "province", type=str, default="all", help="Input province abbreviation"
    )

    # output format
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )
    # parser.add_argument("-s", "--save", type=str, help="Save output as file")
    # parser.add_argument("-f", "--format", type=str, default="html", help="File format")

    return parser


def find_parser():
    parser = MyArgumentParser(
        prog="find",
        add_help=False,
        exit_on_error=False,
        description="According input keywords and search noc list's title, title examples, or duties for related noc codes ",
    )
    parser.add_argument(
        "-h",
        "--help",
        action=HelpAction,
        help="show this help message and return",
    )
    parser.add_argument(
        "keywords",
        nargs="+",
        help="Input key words to search noc codes. You can input multiple keywords within quotation mark, exp: 'marketing manager'",
    )
    # noc's title examples,  duties, requirements, additional info, and exclusions
    parser.add_argument(
        "-e",
        "--examples",
        action="store_true",
        help="Flag to match with title examples",
    )
    parser.add_argument(
        "-d", "--duties", action="store_true", help="Flag to match with main duties"
    )
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )
    # Get AI answer
    parser.add_argument(
        "-a",
        "--ai",
        action="store_true",
        help="Flag to match with title examples",
    )

    return parser


def qareas_parser():
    parser = MyArgumentParser(
        prog="qareas",
        add_help=False,
        exit_on_error=False,
        description="Find areas for qualfied noc codes",
    )
    parser.add_argument(
        "noc_code", type=str, help="Input noc code. If input multiple noc code"
    )
    parser.add_argument(
        "outlook",
        type=int,
        default=3,
        nargs="?",
        choices=range(1, 6),
        action=ChoiceAction,
        help="Input outlook star(s) to seek nocs with more than the stars' outlook",
    )
    return parser


def noc_command(cmd):
    match cmd:
        case Command(command="clear" | "ls", tokens=[*keywords]):
            os.system(cmd.command)
        case Command(command="info", tokens=[*keywords]):
            parser = info_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            get_info(
                args.noc_code,
                args.examples,
                args.requirements,
                args.duties,
                args.additional,
                args.exclusion,
                args.markdown,
            )

        case Command(command="er", tokens=[*keywords]):
            parser = er_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            get_er(args.province, args.markdown)

        case Command(command="find", tokens=[*keywords]):
            parser = find_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            if cmd.tokens and any(token in cmd.tokens for token in ("-a", "--ai")):
                result = get_find_by_ai(args)
                show_find_result(result)
            else:
                get_find(args.keywords, args.examples, args.duties, args.markdown)

        case Command(command="wages", tokens=[*keywords]):
            parser = wages_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            get_wages(
                args.noc_codes, args.economic_region, args.markdown, args.not_table
            )

        case Command(command="qnocs", tokens=[*keywords]):
            parser = qnocs_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            nocs = get_qualified_nocs(
                begin_str=args.start_with,
                er_code=args.economic_region,
                outlook=args.outlook,
                median_wage=args.median_wage,
                greater=not args.less,
            )
            get_qnocs(args.economic_region, nocs, args.markdown)

        case Command(command="qareas", tokens=[*keywords]):
            parser = qareas_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            get_qareas(args.noc_code, args.outlook)

        case Command(command="sp", tokens=[*keywords]):
            parser = sp_parser()
            if cmd.tokens and any(token in cmd.tokens for token in ("-h", "--help")):
                parser.print_help()
                return
            args = parser.parse_args(cmd.tokens)
            get_sp(args.noc_code, args.description, args.remark, args.source)

        case Command(command="", tokens=[*keywords]):
            pass

        case _:
            console.print(f"No such command: {cmd.command}", style="red")


def noc_app(cli: Cli):
    while True:
        cmd = cli.get_command()
        if cmd.command in ["e", "q", "quit", "exit"]:
            cli.command_chain.pop(-1)
            break
        if cmd.command in ["h", "help"]:
            noc_parser().print_help()
            continue
        try:
            noc_command(cmd)
        except ValidationError as e:
            print_validation_error(e)
        except Exception as e:
            console.print(e, style="red")
