from client.system.config import console
from assess.model.stage import Stage, Stages
from base.namespace import Language
from base.utils.client.show import console, show_markdown_content
from assess.model.assess import Project, AssessModel
from base.namespace import is_valid_stage
from assess.model.report import Report
from base.source.excel import Excel

# def get_info(the_model):
#     info_markdown = getattr(the_model, "info")()
#     console.print(info_markdown)

""" For stage"""


def doc(args, project: Project):
    # if type(args)==str and args in ["-i","--info"] or args.info:
    #     get_info(stage)
    #     return
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    stage = Stage(stage_name=args.stream, language=language)
    stage.docs_table.show(markdown=args.markdown)


def time(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    stage = Stage(stage_name=args.stream, language=language)
    stage.processing_time.show()


def fee(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    stage = Stage(stage_name=args.stream, language=language)
    stage.fees_table.show(markdown=args.markdown)


def app_req(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    stage = Stage(stage_name=args.stream, language=language)
    show_markdown_content(stage.applicant_qualification)


def emp_req(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    stage = Stage(stage_name=args.stream, language=language)
    show_markdown_content(stage.employer_qualification)


""" For stages"""


def docs(args, project: Project):
    # if type(args)==str and args in ["-i","--info"] or args.info:
    #     get_info(stage)
    #     return
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    path = args.path if args.path else project.immigration_path
    if not path:
        console.print(
            "You didn't specify a path, please use 'path' command to set a path. Or you can directly input stages after 'stages docs' command, like 'stages stage1 stage2 stage3"
        )
        return
    for stream in path:
        stage = Stage(stage_name=stream, language=language)
        stage.docs_table.show(markdown=args.markdown)


def times(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    path = args.path if args.path else project.immigration_path
    if not path:
        console.print(
            "You didn't specify a path, please use 'path' command to set a path. Or you can directly input stages after 'stages docs' command, like 'stages stage1 stage2 stage3"
        )
        return

    stage_list = [Stage(stage_name=stream, language=language) for stream in path]
    stages = Stages(stages=stage_list)
    stages.print_all_stage_processing_time(language=language, markdown=args.markdown)


def fees(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    path = args.path if args.path else project.immigration_path
    if not path:
        console.print(
            "You didn't specify a path, please use 'path' command to set a path. Or you can directly input stages after 'stages docs' command, like 'stages stage1 stage2 stage3"
        )
        return

    for stream in path:
        stage = Stage(stage_name=stream, language=language)
        stage.fees_table.show(markdown=args.markdown)


def app_reqs(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    path = args.path if args.path else project.immigration_path
    if not path:
        console.print(
            "You didn't specify a path, please use 'path' command to set a path. Or you can directly input stages after 'stages docs' command, like 'stages stage1 stage2 stage3"
        )
        return

    for stream in path:
        stage = Stage(stage_name=stream, language=language)
        show_markdown_content(stage.applicant_qualification)
        print('\n')


def emp_reqs(args, project: Project):
    language = Language.CHINESE if args.chinese else Language.ENGLISH
    path = args.path if args.path else project.immigration_path
    if not path:
        console.print(
            "You didn't specify a path, please use 'path' command to set a path. Or you can directly input stages after 'stages docs' command, like 'stages stage1 stage2 stage3"
        )
        return

    for stream in path:
        stage = Stage(stage_name=stream, language=language)
        show_markdown_content(stage.employer_qualification)
        print('\n')

""" For client info"""


def client(args, project: Project):
    pa_excel=Excel(args.pa)
    sp_excel=Excel(args.spouse) if args.spouse else None
    pa = AssessModel(**pa_excel.dict)
    sp = AssessModel(**sp_excel.dict) if args.spouse else None
    
    children_num = args.children_num if args.children_num else 0
    children_under18_num = args.children_under18_num if args.children_under18_num else 0
    project.pa = pa
    project.sp = sp
    project.children_num = children_num
    project.children_under18_num = children_under18_num


""" Immigration path"""


def path(args, project):
    """Check each stage in stages is valid stage defined in system namespace"""
    result = []
    for stage in args.stages:
        check_result = is_valid_stage(stage)
        if not check_result.is_valid:
            result.append(check_result.message)
    if len(result) > 0:
        console.print("\n".join(result), style="red")
        return

    for stage in args.stages:
        if stage not in project.immigration_path:
            project.immigration_path.append(stage)
            console.print(
                f"{', '.join(args.stages)} appended to the project's immigration path",
                style="green",
            )
        else:
            console.print(f"{stage} is in the path already. Ignored.", style="yellow")


def report(args, project):
    Report(args=args, project=project).get_report()


def save(args, project):
    project.save(args.filename)


def load(args, project):
    project.load(args.filename)


def show(args, project):
    project.show(args)
