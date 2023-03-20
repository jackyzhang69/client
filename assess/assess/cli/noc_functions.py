from client.system.config import console
from assess.nocs.model import (
    AreaWageOutlook,
    NOCContant,
    NOCContents,
    get_qualified_nocs,
    Outlook,
)
from base.ai.ai import AIModel, get_ai_answer
from assess.nocs.noccodes import noc16_to_21, noc21_to_16
from base.utils.client.show import (
    makeTable,
    markdown_table,
    markdown_title_list,
)
from base.utils.client.utils import append_ext
from typing import Union
from assess.nocs.er import EconomicRegion
from base.utils.db import Collection
from assess.nocs.model import get_qualified_nocs
from assess.nocs.outlook_noc21 import OUTLOOK_NOC21
from assess.model.assess import Project
from assess.nocs.model import get_special_nocs_by_program

"""Functions for the noc command group."""


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


def get_find(args, project: Project):
    try:
        if args.ai:
            result = get_find_by_ai(args)
            show_find_result(result)
            return

        nocs = NOCContents().find(
            args.keywords, title_examples=args.examples, main_duties=args.duties
        )
        result = [["No", "Noc", "Teer Level", "Noc Level", "Title"]]
        for i, x in enumerate(nocs):
            result.append([i, x.noc_code, x.level, x.noc_level_16, x.title])
        table = makeTable("Matched Nocs", result)
    except Exception as e:
        console.print(e, style="red")
    else:
        if args.markdown:
            console.print(markdown_table(result, title="Matched Nocs"))
        else:
            console.print(table)


def get_er(args, project: Project):
    try:
        er_list = EconomicRegion().get_ers(args.province.upper())
        table = makeTable(
            f"Ecornomic Region Inforation of {args.province.upper()}", er_list
        )
    except Exception as e:
        console.print(e, style="red")
    else:
        if args.markdown:
            console.print(
                markdown_table(
                    er_list,
                    title=f"Ecornomic Region Inforation of {args.province.upper()}",
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


def get_wages(args, project: Project):
    try:
        noc_code_list = (
            args.noc_codes.split(" ")
            if args.noc_codes and type(args.noc_codes) != list
            else args.noc_codes
        )
        reports = []
        for i, code in enumerate(noc_code_list):
            if i == 0:
                reports += AreaWageOutlook(
                    noc_code=code, er_code=args.er_code
                ).get_report()
            else:
                reports += AreaWageOutlook(
                    noc_code=code, er_code=args.er_code
                ).get_report(with_title=False)
    except Exception as e:
        if not args.noc_codes:
            console.print("You didn't enter noc codes.", style="red")
    else:
        if args.markdown:
            if args.not_table:
                titles = reports.pop(0)
                for i, r in enumerate(reports):
                    console.print(f"##### NOC {i+1}")
                    for index, title in enumerate(titles):
                        console.print(f"- **{title}**: {r[index]}")
            else:
                console.print(
                    markdown_table(
                        reports,
                        title=f"Wage and Outlook of Noc({args.noc_codes}) in area {EconomicRegion().er_name(args.er_code)} ",
                    )
                )
        else:
            console.print(
                makeTable(
                    f"Wage and Outlook of Noc({args.noc_codes}) in area {EconomicRegion().er_name(args.er_code)}",
                    reports,
                )
            )


def get_info(args, project: Project):
    try:
        report = NOCContant(noc_code=args.noc_code)
    except Exception as e:
        console.print(e, style="red")
    else:
        if args.markdown:
            console.print(markdown_title_list([report.title], title="Title"))
        else:
            console.print("\nTitle\n", style="green")
            console.print(report.title)
        if args.examples:
            if args.markdown:
                console.print(
                    markdown_title_list(
                        report.title_examples, title="Title args.examples"
                    )
                )
            else:
                console.print("\nTitle args.examples\n", style="green")
                [print(x) for x in report.title_examples]

        if args.requirements:
            if args.markdown:
                console.print(
                    markdown_title_list(
                        report.employment_requirement,
                        title="Employment args.requirements",
                    )
                )
            else:
                console.print("\nEmployment args.requirements\n", style="green")
                [print(x) for x in report.employment_requirement]
        if args.duties:
            if args.markdown:
                console.print(
                    markdown_title_list(report.main_duties, title="Main args.duties")
                )
            else:
                console.print("\nMain args.duties\n", style="green")
                [print(x) for x in report.main_duties]

        if args.additional:
            if args.markdown:
                console.print(
                    markdown_title_list(
                        report.additional_information, title="General Information"
                    )
                )
            else:
                console.print("\nAdditional Information\n", style="green")
                [print(x) for x in report.additional_information]

        if args.exclusion:
            if args.markdown:
                console.print(
                    markdown_title_list(report.exclusion, title="Exclusion")
                )
            else:
                console.print("\nExclusion\n", style="green")
                [print(x) for x in report.exclusion]


def get_qnocs(args, project: Project):
    nocs = get_qualified_nocs(
        begin_str=args.start_with,
        er_code=args.er_code,
        outlook=args.outlook,
        median_wage=args.median_wage,
        greater=not args.less,
    )
    try:
        reports = []
        for index, noc in enumerate(nocs):
            if index == 0:
                reports += noc.get_report(with_er_name=False)
            else:
                reports += noc.get_report(with_title=False, with_er_name=False)
        table = makeTable("Qualified args.nocs Report", reports)
    except Exception as e:
        console.print(e, style="red")
    else:
        if args.markdown:
            console.print(
                markdown_table(
                    reports,
                    title=f"Qualified args.nocs info in Area {EconomicRegion().er_name(args.er_code)} ({args.er_code})",
                )
            )
        else:
            console.print(
                f"Qualified args.nocs info in Area {EconomicRegion().er_name(args.er_code)} ({args.er_code})",
                style="green",
            )
            console.print(table)


def get_qareas(args, project: Project):
    try:
        areas = []
        er_data = OUTLOOK_NOC21.get(args.noc_code)
        for er_code, value in er_data.items():
            outlook = Outlook(**value)
            if outlook.star >= args.outlook:
                areas.append(er_code)
        # make table data
        table_data = [["No", "ER Code", "ER Name"]]
        for i, area in enumerate(areas):
            table_data.append([i, area, EconomicRegion().er_name(area)])

        if len(table_data) == 1:  # only has title row
            console.print("There is no matching result", style="red")
            return
        table = makeTable(
            f"Qualified Areas for NOC {args.noc_code} with {args.outlook} stars outlook",
            table_data,
        )
    except Exception as e:
        console.print(e, style="red")
    else:
        console.print(table)


def get_sp(args, project: Project):
    try:
        collection = Collection("special_programs").find_all()
        if not collection:
            return False

        qualified_programs = []
        for program in collection:
            if args.noc_code in program["noc_codes"]:
                qualified_programs.append(program)

        table_data = []
        titles = ["Program", "Stream"]
        if args.description:
            titles.append("args.description")
        if args.remark:
            titles.append("args.remark")
        if args.source:
            titles.append("args.source")
        table_data.append(titles)

        for qp in qualified_programs:
            values = [qp["program"], qp["stream"]]
            if args.description:
                values.append(qp["description"])
            if args.remark:
                values.append(qp["remark"])
            if args.source:
                values.append(qp["source"])
            table_data.append(values)
        if len(table_data) == 1:
            console.print("There is no matching programs", style="red")
            return
        table = makeTable(
            f"Special Programs related to the NOC {args.noc_code}", table_data
        )
    except Exception as e:
        console.print(e, style="red")
    else:
        console.print(table)


def get_duties(args, project: Project):
    noc = NOCContant(noc_code=args.noc_code)
    console.print("Please wait for a moment, AI is working...", style="white")
    duties = noc.generate_duties(
        " ".join(args.industry),
        " ".join(args.work_location),
        temperature=args.temperature,
    )
    if args.compare:
        duties.show(markdown=args.markdown)
    else:
        console.print(duties.generated_duties_markdown(), style="white")

def get_special_nocs(args,project:Project):
    if args=="-i":
        programs = Collection("special_programs").find_all()
        collection=list(set([p["program"] for p in programs ]))
        for index,c in enumerate(collection):
            console.print(f"{index+1}. {c}")
        
        return
    for table in get_special_nocs_by_program(args.program,er_code=args.er_code):
        table.show(markdown=args.markdown)