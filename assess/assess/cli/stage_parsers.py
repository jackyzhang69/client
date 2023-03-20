from assess.cli.cli import MyArgumentParser, DateFormatter
from datetime import datetime
import argparse


def valid_date(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        msg = "Not a valid date: '{0}'.".format(s)
        raise argparse.ArgumentTypeError(msg)


def stage_parser():
    parser = MyArgumentParser(prog="stage")
    parser.add_argument(
        "command",
        help="Command for stage:  doc, time, fee,app_req, emp_req",
    )
    return parser


def stage_common_parser():
    parser = MyArgumentParser(
        prog="stage",
        add_help=False,
        exit_on_error=False,
        description="Get stage properties(doc,processing time, and fee) based on stream",
    )
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
    parser.add_argument("stream", type=str, help="Specify stream")
    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Show report in Chinese"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )

    return parser


def stages_parser():
    parser = MyArgumentParser(prog="stages")
    parser.add_argument(
        "command",
        help="Command for stages:path, docs, times, fees",
    )
    return parser


def stages_common_parser():
    parser = MyArgumentParser(
        prog="stage",
        add_help=False,
        exit_on_error=False,
        description="Get stage properties(doc,processing time, and fee) based on stream",
    )
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
    parser.add_argument(
        "-p",
        "--path",
        type=str,
        nargs="+",
        default=[],
        help="Adding stages(streams) to the immigration path",
    )
    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Show report in Chinese"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )

    return parser


def client_parser():
    parser = MyArgumentParser(prog="load")
    parser.add_argument("pa", type=str, help="Principle applicant's excel file path")
    parser.add_argument(
        "-sp", "--spouse", type=str, help="Spouse's excel file path", default=None
    )
    parser.add_argument(
        "-dp", "--children_num", type=int, help="Children's number", default=0
    )
    parser.add_argument(
        "-dpu18",
        "--children_under18_num",
        type=int,
        help="Children under 18's number",
        default=0,
    )
    return parser


def path_parser():
    parser = MyArgumentParser(prog="path")
    parser.add_argument("stages", type=str, nargs="+", help="a list of stages")

    return parser


def load_save_parser():
    parser = MyArgumentParser(prog="load or save")
    parser.add_argument(
        "filename", type=str, help="filename to load / save the project"
    )

    return parser


def show_parser():
    parser = MyArgumentParser(prog="show")
    parser.add_argument("-s", "--solutions", action="store_true", help="show solutions")
    parser.add_argument(
        "-p", "--path", action="store_true", help="show immigration path"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )

    return parser


def report_parser():
    parser = MyArgumentParser(
        prog="project",
        add_help=False,
        exit_on_error=False,
        description="project operation",
    )
    parser.add_argument(
        "-t",
        "--processing_time",
        action="store_true",
        help="Output project processing time ",
    )
    parser.add_argument(
        "-s", "--start_date", type=valid_date, help="Start date for ITA data checking "
    )
    parser.add_argument(
        "-e", "--end_date", type=valid_date, help="End date for ITA data checking"
    )
    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Output in Chinese?"
    )

    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Output in Markdown format?"
    )
    return parser
