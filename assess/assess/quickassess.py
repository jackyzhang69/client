from pydantic import ValidationError
from base.utils.utils import print_validation_error
from assess.model.control import App, Command
from assess.cli.cli import MyArgumentParser, Cli
from assess.cli.noc_functions import (
    get_find,
    get_wages,
    get_info,
    get_qnocs,
    get_qareas,
    get_sp,
    get_er,
    get_duties,
    get_special_nocs
)
from assess.cli.noc_parsers import (
    noc_parser,
    find_parser,
    wages_parser,
    sp_parser,
    qnocs_parser,
    qareas_parser,
    er_parser,
    info_parser,
    duties_parser,
    get_special_nocs_parser
)
from assess.cli.pt_functions import bcss, skes, ees, oinp_fws, oinp_ds, oinp_igs, oinp_mgs,oinp_pgs
from assess.cli.pt_parsers import pt_parser, bcss_parser, skes_parser, ees_parser,oinp_fws_parser,oinp_ds_parser,oinp_igs_parser,oinp_master_doctor_parser
from assess.cli.lmia_functions import solution
from assess.cli.lmia_parsers import lmia_parser, solution_parser
from assess.cli.stage_parsers import (
    stage_parser,
    stage_common_parser,
    stages_parser,
    stages_common_parser,
    client_parser,
    path_parser,
    report_parser,
    load_save_parser,
    show_parser,
)
from assess.cli.stage_functions import (
    doc,
    time,
    fee,
    app_req,
    emp_req,
    docs,
    times,
    fees,
    app_reqs,
    emp_reqs,
    client,
    path,
    report,
    save,
    load,
    show,
)
from client.system.config import console
from assess.model.assess import Project


""" init cli """
cli = Cli(root="assess")
""" Init the project, which includes all information of the assessment """
project = Project()


""" Assembly the noc command and parser map """
noc_cmd_func_map = {
    "wages": get_wages,
    "find": get_find,
    "er": get_er,
    "qnocs": get_qnocs,
    "qareas": get_qareas,
    "info": get_info,
    "sp": get_sp,
    "duties": get_duties,
    "special_nocs": get_special_nocs,
}
noc_cmd_parser_map = {
    "wages": wages_parser(),
    "find": find_parser(),
    "er": er_parser(),
    "qnocs": qnocs_parser(),
    "qareas": qareas_parser(),
    "info": info_parser(),
    "sp": sp_parser(),
    "duties": duties_parser(),
    "special_nocs": get_special_nocs_parser(),
}

""" Assembly the pt command and parser map """ ""
pt_cmd_func_map = {"bcss": bcss, "skes": skes, "ees": ees,"oinp_fws":oinp_fws,"oinp_ds":oinp_ds,"oinp_igs":oinp_igs,"oinp_mgs":oinp_mgs,"oinp_pgs":oinp_pgs}
pt_cmd_parser_map = {"bcss": bcss_parser(), "skes": skes_parser(), "ees": ees_parser(),"oinp_fws":oinp_fws_parser(),"oinp_ds":oinp_ds_parser(),"oinp_igs":oinp_igs_parser(),"oinp_mgs":oinp_master_doctor_parser(),"oinp_pgs":oinp_master_doctor_parser()}


""" Assembly the lmia command and parser map """ ""
lmia_cmd_func_map = {
    "solution": solution,
    "doc": doc,
    "time": time,
    "fee": fee,
}
lmia_cmd_parser_map = {
    "solution": solution_parser(),
    "doc": stage_common_parser(),
    "time": stage_common_parser(),
    "fee": stage_common_parser(),
}


""" Assembly the stage command and parser map """
stage_cmd_func_map = {
    "doc": doc,
    "time": time,
    "fee": fee,
    "app_req": app_req,
    "emp_req": emp_req,
}
stage_cmd_parser_map = {
    "doc": stage_common_parser(),
    "time": stage_common_parser(),
    "fee": stage_common_parser(),
    "app_req": stage_common_parser(),
    "emp_req": stage_common_parser(),
}

""" Assembly the stages command and parser map """
stages_cmd_func_map = {
    "docs": docs,
    "times": times,
    "fees": fees,
    "app_reqs": app_reqs,
    "emp_reqs": emp_reqs,
    "client": client,
    "path": path,
    "report": report,
    "save": save,
    "load": load,
    "show": show,
}
stages_cmd_parser_map = {
    "docs": stages_common_parser(),
    "times": stages_common_parser(),
    "fees": stages_common_parser(),
    "app_reqs": stages_common_parser(),
    "emp_reqs": stages_common_parser(),
    "client": client_parser(),
    "path": path_parser(),
    "report": report_parser(),
    "save": load_save_parser(),
    "load": load_save_parser(),
    "show": show_parser(),
}


""" App level definition """
""" noc app """


def noc_app(tokens, project: Project):
    cmd = Command(
        tokens=tokens, cmd_func_map=noc_cmd_func_map, cmd_parser_map=noc_cmd_parser_map
    )
    cmd.excute(project)


""" pt app """


def pt_app(tokens, project: Project):
    cmd = Command(
        tokens=tokens, cmd_func_map=pt_cmd_func_map, cmd_parser_map=pt_cmd_parser_map
    )
    cmd.excute(project)


""" lmia app """


def lmia_app(tokens, project: Project):
    cmd = Command(
        tokens=tokens,
        cmd_func_map=lmia_cmd_func_map,
        cmd_parser_map=lmia_cmd_parser_map,
    )
    cmd.excute(project)


""" stage app """


def stage_app(tokens, project: Project):
    cmd = Command(
        tokens=tokens,
        cmd_func_map=stage_cmd_func_map,
        cmd_parser_map=stage_cmd_parser_map,
    )
    cmd.excute(project)


""" stages app """


def stages_app(tokens, project: Project):
    cmd = Command(
        tokens=tokens,
        cmd_func_map=stages_cmd_func_map,
        cmd_parser_map=stages_cmd_parser_map,
    )
    cmd.excute(project)


""" app and parse map"""
cmd_app_map = {
    "noc": noc_app,
    "pt": pt_app,
    "lmia": lmia_app,
    "stage": stage_app,
    "stages": stages_app,
}
app_parser_map = {
    "noc": noc_parser(),
    "pt": pt_parser(),
    "lmia": lmia_parser(),
    "stage": stage_parser(),
    "stages": stages_parser(),
}


""" main parser """


def main_parser():
    parser = MyArgumentParser()
    parser.add_argument(
        "command",
        help="""
        The assess application has a number of commands as following:
        "noc","pt","lmia","stage","stages","load","save","show","exit","quit". 
        In addtion, you can run shell command also.
        """,
    )
    return parser


def main():
    while True:
        try:
            a = App(
                cmd_app_map=cmd_app_map,
                app_parser=main_parser(),
                cli=cli,
                app_parser_map=app_parser_map,
            )
            a.excute(project)
        except Exception as e:
            if type(e)==ValidationError:
                console.print(print_validation_error(e),style="red")
            else:
                console.print(e, style="red")


if __name__ == "__main__":
    main()
