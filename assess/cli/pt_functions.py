from assess.bcpnp.skilled import BCPNP_Skill, BCPNP_Skills
from assess.sinp.entrepreneur import SINP_EP, SINP_EPs
from assess.oinp.skilled import OINP_Skill, OINP_Skills
from assess.ee.ee import EE, EEs
from assess.ee.fsw import FSW
from client.system.config import console
from datetime import date, timedelta, datetime
from base.utils.client.show import makeTable, markdown_table
from assess.model.assess import Project


def get_info(the_model):
    info_markdown = getattr(the_model, "info")()
    console.print(info_markdown,style="white")


def show_solutions(args, solutions, the_model):
    model_obj = the_model(solutions=solutions)
    model_obj.show(markdown=args.markdown)


""" get solutions based on args combination. Usually the variables are: 
1. is_working_in_the_position
2. Canadian_work_experience
3. hourly_rate
4. area
5. clb
"""


def get_bcss_solutions(args):
    """
    Based on args combination and output a list of Scoring of bcpnp skilled immigraton
    """
    solution_list = []
    for is_working in args.is_working_in_the_position:
        for has_one_year_canadian_experience in args.has_one_year_canadian_experience:
            additional_wp = (
                1
                if has_one_year_canadian_experience == 1
                and len(args.has_one_year_canadian_experience)
                == 2  # it's 0,1, so if 1, it means will work 1 more year
                else 0
            )
            for hourly_rate in args.hourly_rate:
                for area in args.area:
                    for clb in args.clb:
                        factors = {
                            "work_experience": args.work_experience + additional_wp,
                            "is_working_in_the_position": is_working,
                            "has_one_year_canadian_experience": has_one_year_canadian_experience,
                            "hourly_rate": hourly_rate,
                            "area": area,
                            "regional_exp_alumni": args.regional_exp_alumni,
                            "education": args.education,
                            "education_bonus": args.education_bonus,
                            "professional_designation": args.professional_designation,
                            "clb": clb,
                            "english_french_above_clb4": args.english_french_above_clb4,
                        }
                        bc_solution = BCPNP_Skill(
                            noc_code=args.noc_code, stage_name=args.stream, **factors
                        )
                        solution_list.append(bc_solution)

    return solution_list


""" gte ee solutions based on args combination. Usually the variables are:
    1. with_spouse
    2. first_clbs
    3. canadain_work_experience
    4. aeo
"""


def get_ee_solutions(args):
    solution_list = []
    additional_age = 0  # if working in Canada for 1 year, age will increase by 1,...
    for with_spouse in args.with_spouse:
        pa_clbs = " ".join(args.first_clbs).split("|")
        for first_clbs in pa_clbs:
            for i, canadian_work_experience in enumerate(args.canadian_work_experience):
                if i > 0:
                    additional_age = (
                        args.canadian_work_experience[i]
                        - args.canadian_work_experience[0]
                    )
                for aeo in args.aeo:
                    factors = {
                        "with_spouse": with_spouse,
                        "age": args.age + additional_age,
                        "education": args.education,
                        "studied": args.studied,
                        "studied_years": args.studied_years,
                        "first_clbs": first_clbs.strip().split(" "),
                    "first_clbs_type": args.first_clbs_type,
                        "second_clbs": args.second_clbs,
                        "second_clbs_type": args.second_clbs_type,
                        "canadian_work_experience": canadian_work_experience,
                        "foreign_work_experience": args.foreign_work_experience,
                        "with_trade_certification": args.with_trade_certification,
                        "noc_code": args.noc_code,
                        "canadian_relative": args.canadian_relative,
                        "spouse_education": args.spouse_education,
                        "spouse_clbs": args.spouse_clbs,
                        "spouse_clbs_type": args.spouse_clbs_type,
                        "spouse_canadian_work_experience": args.spouse_canadian_work_experience,
                        "aeo": aeo,
                        "pnp_nominated": args.pnp_nominated,
                        "stream": args.stream,
                    }
                    ee_solution = EE(stage_name="ee", **factors)
                    solution_list.append(ee_solution)
    return solution_list


""""  Get Ske solutions based on args combination. Usually the variables are:
    1. visited: list 0 1, default [0] 
    2. investment: list int, default [0]
    3. key_ecconomic: list 0 1, default [0]
"""


def get_skes_solutions(args):
    solution_list = []
    for is_visited in args.visited:
        for investment in args.investment:
            for key_economic in args.key_economic:
                factors = {
                    "age": args.age,
                    "visited": is_visited,
                    "edu_type": args.edu_type,
                    "net_asset": args.net_asset,
                    "work_experience": args.work_experience,
                    "ownership50p": args.ownership50p,
                    "business_revenue": args.business_revenue,
                    "innovation_experience": args.innovation_experience,
                    "investment": investment,
                    "key_economic": key_economic,
                }
                solution = SINP_EP(stage_name="sinp_ep", **factors)
                solution_list.append(solution)

    return solution_list

def get_oinp_fws_solutions(args):
    solution_list = []
    for hourly_rate in args.hourly_rate:
        for area in args.area:
            for clb in args.language:
                for has_workpermit in args.has_workpermit:
                    factors = {
                        "noc_code": args.noc_code,
                        "hourly_rate": hourly_rate,
                        "area": area,
                        "has_workpermit": has_workpermit,
                        "worked6m":args.worked6m,
                        "earning_40k_plus":args.earning_40k_plus,
                        "clb": clb,
                        "num_official_language": args.num_official_language,
                    }
                    solution=OINP_Skill(stage_name="oinp",stream="oinp_fw",factors=factors)
                    solution_list.append(solution)
    return solution_list

def get_oinp_ds_solutions(args):
    solution_list = []
    for hourly_rate in args.hourly_rate:
        for area in args.area:
                for has_workpermit in args.has_workpermit:
                    factors = {
                        "noc_code": args.noc_code,
                        "hourly_rate": hourly_rate,
                        "area": area,
                        "has_workpermit": has_workpermit,
                        "worked6m":args.worked6m,
                        "earning_40k_plus":args.earning_40k_plus,
                    }
                    solution=OINP_Skill(stage_name="oinp",stream="oinp_d",factors=factors)
                    solution_list.append(solution)
    return solution_list

def get_oinp_igs_solutions(args):
    solution_list = []
    for hourly_rate in args.hourly_rate:
        for area in args.area:
            for clb in args.language:
                for has_workpermit in args.has_workpermit:
                    factors = {
                        "noc_code": args.noc_code,
                        "hourly_rate": hourly_rate,
                        "area": area,
                        "has_workpermit": has_workpermit,
                        "worked6m":args.worked6m,
                        "earning_40k_plus":args.earning_40k_plus,
                        "clb": clb,
                        "num_official_language": args.num_official_language,
                        "education": args.education,
                        "field": args.field,
                        "num_canadian_education": args.num_canadian_education,
                        "study_location": args.study_location,
                    }
                    solution=OINP_Skill(stage_name="oinp",stream="oinp_ig",factors=factors)
                    solution_list.append(solution)
    return solution_list

def get_oinp_mgs_pgs_solutions(args,stream):
    solution_list = []
    for clb in args.language:
        for has_workpermit in args.has_workpermit:
            factors = {
                "has_workpermit": has_workpermit,
                "earning_40k_plus":args.earning_40k_plus,
                "clb": clb,
                "num_official_language": args.num_official_language,
                "field": args.field,
                "num_canadian_education": args.num_canadian_education,
                "study_location": args.study_location,
            }
            solution=OINP_Skill(stage_name="oinp",stream=stream,factors=factors)
            solution_list.append(solution)
    return solution_list

def pick_solution(args, project, solutions):
    solution = solutions[args.pick]
    """ save the solution to the project """
    project.previous_solution = solution
    if solution not in project.solutions:
        project.solutions.append(solution)
        console.print(
            f"Solution No. {args.pick} is saved to the project.", style="green"
        )
    else:
        console.print(
            f"Solution No. {args.pick} is already in the project. Ignored.",
            style="yellow",
        )


def bcss(args, project: Project):
    if type(args) == str and args in ["-i", "--info"] or args.info:
        get_info(BCPNP_Skill)
        return

    solutions = get_bcss_solutions(args)
    show_solutions(args, solutions, BCPNP_Skills)

    if args.pick is not None:
        pick_solution(args, project, solutions)


def ees(args, project: Project):
    if type(args) == str and args in ["-i", "--info"] or args.info:
        get_info(EE)
        return

    solutions = get_ee_solutions(args)
    show_solutions(args, solutions, EEs)

    if args.pick is not None:
        pick_solution(args, project, solutions)


def skes(args, project: Project):
    if type(args) == str and args in ["-i", "--info"] or args.info:
        get_info(SINP_EP)
        return

    solutions = get_skes_solutions(args)
    show_solutions(args, solutions, SINP_EPs)

    if args.pick is not None:
        pick_solution(args, project, solutions)

# Common function for all oinp job offer streams
def oinp_joboffer_common_functions(args, project: Project,get_solution_function):
    if type(args) == str and args in ["-i", "--info"] or args.info:
        get_info(OINP_Skill)
        return

    solutions = get_solution_function(args)
    oinp_skills=OINP_Skills(solutions=solutions)
    oinp_skills.show(markdown=args.markdown)
    
    if args.pick is not None:
        pick_solution(args, project, solutions)

# Common function for all oinp master and doctor streams
def oinp_master_doctor_common_functions(args, project: Project,stream):
    if type(args) == str and args in ["-i", "--info"] or args.info:
        get_info(OINP_Skill)
        return

    solutions = get_oinp_mgs_pgs_solutions(args,stream)
    oinp_skills=OINP_Skills(solutions=solutions)
    oinp_skills.show(markdown=args.markdown)
    
    if args.pick is not None:
        pick_solution(args, project, solutions)
                
def oinp_fws(args, project: Project):
    oinp_joboffer_common_functions(args, project,get_oinp_fws_solutions)
        
def oinp_ds(args, project: Project):
    oinp_joboffer_common_functions(args, project,get_oinp_ds_solutions)

def oinp_igs(args, project: Project):
    oinp_joboffer_common_functions(args, project,get_oinp_igs_solutions)

def oinp_mgs(args, project: Project):
    oinp_master_doctor_common_functions(args, project,"oinp_mg")

def oinp_pgs(args, project: Project):
    oinp_master_doctor_common_functions(args, project,"oinp_pg")


        