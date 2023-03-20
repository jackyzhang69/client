from assess.cli.cli import MyArgumentParser
from assess.cli.cli import MyArgumentParser, Cli, HelpAction, ChoiceAction


def sp_parser():
    parser = MyArgumentParser(
        prog="sp",
        add_help=False,
        exit_on_error=False,
        description="Find a noc code's special programs",
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
        "noc_codes",
        nargs="+",
        help="Input noc code(s). If input multiple noc codes, please enter within quotation mark. exp: '11100 62200'",
    )
    parser.add_argument(
        "-e",
        "--er_code",
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
        "--er_code",
        type=str,
        default="5920",
        help="Input Economic code",
    )
    parser.add_argument(
        "-w",
        "--median_wage",
        type=float,
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
    # parser.add_argument(
    #     "-h",
    #     "--help",
    #     action=HelpAction,
    #     help="show this help message and return",
    # )
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


""" Duties generated by AI"""


def duties_parser():
    parser = MyArgumentParser(
        prog="duties",
        add_help=False,
        exit_on_error=False,
        description="Generated duties for noc codes by AI",
    )
    parser.add_argument("noc_code", type=str, help="Input noc code")
    parser.add_argument(
        "-t", "--temperature", type=float, help="Input temperature for AI ", default=0.7
    )
    parser.add_argument(
        "-i", "--industry", type=str, nargs="+", help="Industry", required=True
    )
    parser.add_argument(
        "-l",
        "--work_location",
        type=str,
        nargs="+",
        help="Work location",
        required=True,
    )
    parser.add_argument(
        "-c",
        "--compare",
        action="store_true",
        help="Compare the standard duties",
        default=False,
    )
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )
    return parser


""" Get nocs of special programs by AI"""


def get_special_nocs_parser():
    parser = MyArgumentParser(
        prog="Special nocs",
        add_help=False,
        exit_on_error=False,
        description="get special noc codes",
    )
    parser.add_argument("-p","--program", type=str, help="Input the program name")
    parser.add_argument(
        "-e", "--er_code", type=str, help="Input Er Code ", default="5920"
    )
    parser.add_argument(
        "-i",
        "--info",
        action="store_true",
        help="Flag to give all program info",
    )
    parser.add_argument(
        "-m",
        "--markdown",
        action="store_true",
        help="Flag to output markdown format info",
    )
    return parser


def noc_parser():
    parser = MyArgumentParser(prog="noc")
    parser.add_argument(
        "command",
        choices=["find", "wages", "qnocs", "qareas", "info", "er", "sp", "duties","special_nocs"],
        help="Command for noc",
    )
    return parser
