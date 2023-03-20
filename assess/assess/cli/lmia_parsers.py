from assess.cli.cli import MyArgumentParser, DateFormatter
from datetime import date, timedelta

def lmia_parser():
    parser = MyArgumentParser(prog="lmia")
    parser.add_argument(
        "command",
        help="Command for lmia:  solution, doc, time, fee",
    )
    return parser

def solution_parser():
    parser = MyArgumentParser(
        prog="solution",
        add_help=False,
        exit_on_error=False,
        description="Calculate for LMIA solution",
    )
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
    parser.add_argument(
        "-p", "--support_pr", action="store_true", help="Support PR."
    )
    parser.add_argument(
        "-w", "--support_wp", action="store_true", help="Support Work Permit."
    )
    parser.add_argument(
        "-l", "--possible_clb", type=int, help="Possible or real clb level",default=0
    )
    parser.add_argument("-n", "--noc_code", type=str, help="NOC code", required=True)
    parser.add_argument("-e", "--er_code", type=str, help="ER code", default="5920")
    parser.add_argument(
        "-r",
        "--hourly_rate",
        type=float,
        help="Hourly rate",
        required=True,
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )
    parser.add_argument(
        "-s", "--stream", type=str, help="Specify LMIA stream manually"
    )
    parser.add_argument(
        "-save", "--save", action="store_true", help="Save the solution to the project"
    )

    return parser
