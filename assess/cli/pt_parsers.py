from assess.cli.cli import MyArgumentParser, DateFormatter
from datetime import date, timedelta
import argparse

""" Common functions"""
def less_than(x,number:int):
    x = int(x)
    if x > number:
        raise argparse.ArgumentTypeError(f"{x} is an invalid value. The maximum value is {number}." )
    return x
    
    
def pt_parser():
    parser = MyArgumentParser(prog="pt",epilog="""
        bcss: BC Skills |
        ees: Express Entries |
        skes: SK Entreprenaurs |
        oinp_fws:OINP Foreign Workers |
        oinp_ds: OINP Demands |
        oinp_mgs:OINP Masters Graduate |
        oinp_pgs: OINP PhD Graduate |
        oinp_hcps: OINP Health Care Professionals |
        oinp_sts: OINP Skilled Trades |
        oinp_fssws: OINP Foreign Skilled Workers 
        """)
    parser.add_argument(
        "command",
        help="""
        bcss,
        ees,
        skes,
        oinp_fws,
        oinp_ds,
        oinp_mgs,
        oinp_pgs,
        oinp_hcps,
        oinp_sts,
        oinp_fssws,
        """
    )
    return parser


""" 
BC Skilled batch scoring 
"""


def bcss_parser():
    parser = MyArgumentParser(
        prog="bcss",
        add_help=False,
        exit_on_error=False,
        description="BCPNP Skilled Worker Scoring for possible solution combination",
    )
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
    parser.add_argument("-n", "--noc_code", type=str, help="NOC code", required=True)
    parser.add_argument(
        "-s", "--stream", type=str, default="bc_sw", help="Program stream"
    )
    parser.add_argument(
        "-we",
        "--work_experience",
        type=int,
        help="Work experience years.",
        required=True,
    )
    parser.add_argument(
        "-w",
        "--is_working_in_the_position",
        type=int,
        default=[0],
        nargs="+",
        help="Is working in the position of job offer.Input 0, 1 or 0, and 1",
    )

    """if input 0 and 1 , after 1, should do 2 things: 1. set one year cad expe as true, 2. add 1 more year work exp at all."""
    parser.add_argument(
        "-o",
        "--has_one_year_canadian_experience",
        type=int,
        default=[0],
        nargs="+",
        help="Have one year Canadian work experience..Input 0, 1 or 0, and 1",
    )
    parser.add_argument(
        "-r",
        "--hourly_rate",
        type=float,
        nargs="+",
        help="Hourly rate(s)",
        required=True,
    )
    parser.add_argument(
        "-a",
        "--area",
        type=int,
        default=[0],
        nargs="+",
        help="Area. 0,1,2 or any combination",
    )
    # TODO: be careful to set true if after work in future for 1 year
    parser.add_argument(
        "-ab",
        "--regional_exp_alumni",
        action="store_true",
        help="Regional bonus for experience or alumni",
    )
    # TODO: 只能是不考虑在这里教育的问题。 过2周再说。
    parser.add_argument(
        "-e", "--education", type=int, help="Highest education level", required=True
    )
    parser.add_argument(
        "-eb", "--education_bonus", type=int, default=2, help="Education bonus"
    )
    parser.add_argument(
        "-pd",
        "--professional_designation",
        action="store_true",
        help="Eligible professional designation in BC",
    )
    parser.add_argument(
        "-l", "--clb", type=int, default=[0], nargs="+", help="Primary language CLB"
    )
    parser.add_argument(
        "-ef",
        "--english_french_above_clb4",
        action="store_true",
        help="Both English and French is above CLB 4",
    )
    parser.add_argument(
        "-sd",
        "--start_date",
        type=str,
        action=DateFormatter,
        default=(date.today() - timedelta(days=365)).strftime("%Y-%m-%d"),
        help="Start date",
    )
    parser.add_argument(
        "-ed",
        "--end_date",
        type=str,
        action=DateFormatter,
        default=date.today().strftime("%Y-%m-%d"),
        help="End date",
    )

    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Show report in Chinese"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )
    parser.add_argument(
        "-p", "--pick", type=int, help="Pick the best solution"
    )
    return parser


def ees_parser():
    parser = MyArgumentParser(
        prog="ees",
        add_help=False,
        exit_on_error=False,
        description="EE for possible solution combination",
    )
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
    parser.add_argument("-a", "--age", type=int, help="Age", required=True)
    parser.add_argument(
        "-e", "--education", type=int, help="Highest education level", required=True
    )

    parser.add_argument(
        "-st",
        "--studied",
        action="store_true",
        help="Studied in Canada",
    )
    parser.add_argument("-sy", "--studied-years", type=int,default=0, help="Years of studied in Canada")

    parser.add_argument(
        "-l", "--first_clbs", type=str,nargs="+", help="Frist language clbs,multiple, format: r w l s | r w l s"
    )
    parser.add_argument("-t", "--first_clbs_type", type=str, help="Language type", default="IELTS")

    parser.add_argument(
        "-sl", "--second_clbs", nargs="?", help="Second language clbs, format: r w l s"
    )
    parser.add_argument("-slt", "--second_clbs_type", type=str, help="Language type", default="TEF")

    parser.add_argument(
        "-we",
        "--foreign_work_experience",
        type=int,
        help="Foreign work experience years.",
        required=True,
    )
    parser.add_argument(
        "-cwe",
        "--canadian_work_experience",
        type=int,
        nargs="+",
        default=[0],
        help="Canadian work experience years.",
    )
    
    parser.add_argument(
        "-tc",
        "--with_trade_certification",
        action="store_true",
        help="With trade certification.",
    )
    
    parser.add_argument(
        "-aeo",
        "--aeo",
        type=int,
        nargs="+",    
        default=[0],
        help="Has Arranged Employment Offer.",
    )
        
    parser.add_argument("-n", "--noc_code", type=str, help="NOC code", required=True)
        
    parser.add_argument(
        "-r",
        "--canadian_relative",
        action="store_true",
        help="Has Canadian relative",
    )
    
    parser.add_argument(
        "-pnp",
        "--pnp_nominated",
        action="store_true",
        help="PNP nominated",
    )
    
    parser.add_argument(
        "-ws",
        "--with_spouse",
        type=int,
        nargs="+",
        default=[0],
        help="Apply together with spouse",
    )
    parser.add_argument(
        "-se", "--spouse_education", type=int, help="Spouse highest education level"
    )
    parser.add_argument(
        "-spl", "--spouse_clbs", type=str,nargs="+", help="Spouse language clbs,multiple, format: r w l s | r w l s"
    )
    parser.add_argument("-splt", "--spouse_clbs_type", type=str, help="Spouse Language type", default="IELTS")
    parser.add_argument(
        "-scwe",
        "--spouse_canadian_work_experience",
        type=int,
        default=0,
        help="Spouse Canadian work experience years.",
    )

    parser.add_argument(
        "-s", "--stream", type=str, default="ee_all", help="Program stream"
    )

    parser.add_argument(
        "-sd",
        "--start_date",
        type=str,
        action=DateFormatter,
        default=(date.today() - timedelta(days=365)).strftime("%Y-%m-%d"),
        help="Start date",
    )
    parser.add_argument(
        "-ed",
        "--end_date",
        type=str,
        action=DateFormatter,
        default=date.today().strftime("%Y-%m-%d"),
        help="End date",
    )

    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Show report in Chinese"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )
    parser.add_argument(
        "-p", "--pick", type=int, help="Pick the best solution"
    )
    return parser


def skes_parser():
    parser = MyArgumentParser(
        prog="ske",
        add_help=False,
        exit_on_error=False,
        description="SINP Entreprenaue Scoring",
    )
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
    parser.add_argument("-a", "--age", type=str, help="Age")
    parser.add_argument("-v", "--visited", nargs="+", default=[0],help="Visited SK? 1 as yes 0 as no. Combine multiple times, format: 0 1")
    parser.add_argument(
        "-et",
        "--edu_type",
        type=int,
        choices=[0, 1,2],
        help="Education type, 0 as trade, 1 as Qualified Bachelor,2 for others ",
    )
    parser.add_argument("-n", "--net_asset", type=int, help="Net Asset.")
    parser.add_argument("-we", "--work_experience", type=int, help="Work experience")
    parser.add_argument(
        "-o", "--ownership50p", action="store_true", help="Ownership over 50 percent "
    )
    parser.add_argument("-r", "--business_revenue", type=int, help="Business revenue")
    parser.add_argument(
        "-ie",
        "--innovation_experience",
        action="store_true",
        help="Has innovative experience",
    )
    parser.add_argument("-iv", "--investment", type=int,nargs="+",default=[0], help="Investment")
    parser.add_argument(
        "-k", "--key_economic", nargs="+",default=[0], help="Is in key Economic factor"
    )
    parser.add_argument(
        "-pc", "--percentage", action="store_true", help="Show score/max percentage"
    )
    parser.add_argument(
        "-ds", "--description", action="store_true", help="Show description"
    )
    parser.add_argument(
        "-op",
        "--order_by_percetage",
        action="store_true",
        help="Show ordered by percentage",
    )
    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Show report in Chinese"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )
    parser.add_argument(
        "-p", "--pick", type=int, help="Pick the best solution"
    )
    
    return parser

""" OINP common parser part"""
def oinp_common_parser(prog:str,stream_description:str):
    parser = MyArgumentParser(
        prog=prog,
        add_help=False,
        exit_on_error=False,
        description=f"OINP {stream_description} Scoring for possible solution combination",
    )
    parser.add_argument("-n", "--noc_code", type=str, help="NOC code")
    parser.add_argument(
        "-r",
        "--hourly_rate",
        type=float,
        nargs="+",
        help="Hourly rate(s)",
        required=True,
    )
    parser.add_argument(
        "-a",
        "--area",
        type=lambda x: less_than(x,3),
        default=[0],
        nargs="+",
        help="Area 0,1,2,3 or any combination",
    )
    parser.add_argument("-wp","--has_workpermit",type=lambda x: less_than(x,1),nargs="+",help="Has valid work permit. could be 0 or 1 or 0 1",default=[0])
    parser.add_argument("-w6","--worked6m",action="store_true",help="Has worked more than 6 months")
    parser.add_argument("-e4","--earning_40k_plus",action="store_true",help="Has earned 40k+ at least one year in the last 5 years ")

    """ Add output help parser"""
    parser=add_output_help_parser(parser)

    return parser

# language parser as add_on
def add_language_parser(parser:MyArgumentParser):
    parser.add_argument("-l","--language",type=int,nargs="+",help="Language CLB level. Multiple seperated by space",default=[0])
    parser.add_argument("-nl","--num_official_language",type=lambda x: less_than(x,2),help="Number of official languages tested",default=1)
    return parser

def add_output_help_parser(parser:MyArgumentParser):
    parser.add_argument(
        "-i", "--info", action="store_true", help="Show program definition information."
    )
        # common for every stream
    parser.add_argument(
        "-c", "--chinese", action="store_true", help="Show report in Chinese"
    )
    parser.add_argument(
        "-m", "--markdown", action="store_true", help="Print out in markdown format"
    )
    parser.add_argument(
        "-p", "--pick", type=int, help="Pick the best solution"
    )
    
    return parser

    

def oinp_fws_parser():
    parser=oinp_common_parser("oinp_fws","Foreign Worker")
    parser=add_language_parser(parser)
    return parser

def oinp_ds_parser():
    return oinp_common_parser("oinp_ds","Demand Stream")
    
def oinp_igs_parser():
    parser=oinp_common_parser("oinp_igs","International Graduate Stream")
    parser.add_argument("-e","--education",type=lambda x: less_than(x,4),help="Education level")
    parser.add_argument("-f","--field",type=lambda x: less_than(x,2),help="Field of study",default=2)
    parser.add_argument("-sl","--study_location",type=int,help="Study location",default=0)
    parser.add_argument("-nce","--num_canadian_education",type=lambda x: less_than(x,2),help="Number of Canadian education",default=1)
    parser=add_language_parser(parser)
    
    return parser


def oinp_master_doctor_parser():
    parser = MyArgumentParser(
        prog="oinp_mgs_pgs",
        add_help=False,
        exit_on_error=False,
        description="OINP Master and Doctor stream Scoring for possible solution combination",
    )

    parser.add_argument("-wp","--has_workpermit",type=lambda x: less_than(x,1),nargs="+",help="Has valid work permit. could be 0 or 1 or 0 1",default=[0])
    parser.add_argument("-e4","--earning_40k_plus",action="store_true",help="Has earned 40k+ at least one year in the last 5 years ")
    parser.add_argument("-f","--field",type=lambda x: less_than(x,2),help="Field of study",default=2)
    parser.add_argument("-sl","--study_location",type=int,help="Study location",default=0)
    parser.add_argument("-nce","--num_canadian_education",type=lambda x: less_than(x,2),help="Number of Canadian education",default=1)
    parser=add_language_parser(parser)
    parser=add_output_help_parser(parser)
    
    return parser
    



