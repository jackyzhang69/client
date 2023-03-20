from enum import Enum
from dataclasses import dataclass
from base.utils.utils import best_match

class Sex(Enum):
    MALE = ("male",)
    FEMALE = "female"


class Language(Enum):
    ENGLISH = 0
    CHINESE = 1


Month = Enum(
    "Month",
    (
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ),
)


class BCPNPProgram(Enum):
    # BC
    BC_SKILLED_WORKER = "bc_sw"
    BC_HEALTH_AUTHORITY = "bc_ha"
    BC_INTERNATIONAL_GRADUATE = "bc_ig"
    BC_INTERNATIONAL_POST_GRADUATE = "bc_ipg"
    BC_ENTRY_LEVEL_AND_SEMI_SKILLED_WORKER = "bc_elss"
    EE_BC_SKILLED_WORKER = "bc_eesw"
    EE_BC_HEALTH_AUHORITY = "bc_eeha"
    EE_BC_INTERNATIONAL_GRADUATE = "bc_eeig"
    EE_BC_INTERNATIONAL_POST_GRADUATE = "bc_eeipg"

class SINPProgram(Enum):
    SINP_ENTREPRENEUR = "sinp_ep"
    
class OINPProgram(Enum):
    OINP_PROGRAM = "oinp"
    OINP_FOREIGN_WORKER = "oinp_fw"
    OINP_INTERNATIONAL_GRADUATE = "oinp_ig"
    OINP_DEMAND = "oinp_d"
    OINP_MASTER_GRADUATE="oinp_mg"
    OINP_PHD_GRADUATE="oinp_pg"
    OINP_HUMAN_CAPITAL_PRIORITIES="oinp_hcp" 
    OINP_SKILLED_TRADES="oinp_st"
    OINP_FRENCH_SPEAKING_SKILLED_WORKER="oinp_fssw"
# PR
class PRProgram(Enum):
    PR_AIPP = "pr_aipp"
    PR_SE_FEDERAL = "pr_se_fed"
    PR_QUBEC_BUSINESS_CLASS = "pr_bs_qc"
    PR_QUBEC_SKILLED_WORKER = "pr_sw_qc"
    PR_PNP = "pr_pnp"
    PR_SP = "pr_sp"
    PR_EE_PNP = "ee_pnp"
    PR_EE_FSW = "ee_fsw"
    PR_EE_FST = "ee_fst"
    PR_EE_CEC = "ee_cec"
    PR_EE_ALL = "ee_all"
    PR_EE = "ee"
    PR_SUV = "pr_suv"
    PR_PGP = "pr_pgp"
    PR_SPOUSE_IN = "pr_sp_in"
    PR_SPOUSE_OUT = "pr_sp_out"
    PR_DEPENDANT = "pr_dp"
    CITIZEN_GRANT = "citizen_grant"
    PR_RENEW = "pr_card_renew"
    PR_INITIAL = "pr_card_first"


# TR
class TRProgram(Enum):
    VISITOR = "visitor"
    STUDENT = "student"
    WORKER = "worker"
    INADMISSIBLITY = "tr_inadmissibility"
    TR_VISA_OUT = "visa_out"
    TR_VISA_IN = "visa_in"
    TR_VISA_IN_PAPER = "visa_in_paper"
    TR_EXTENSION = "visa_ext"
    TR_EXTENSION_PAPER = "visa_ext_paper"
    TR_SUPERVISA = "supervisa"
    TR_STUDY_PERMIT_OUT = "sp_out"
    TR_STUDY_PERMIT_IN = "sp_in"
    TR_STUDY_PERMIT_EXT = "sp_ext"
    TR_STUDY_PERMIT_EXT_PAPER = "sp_ext_paper"
    TR_WORK_PERMIT_OUT = "wp_out"
    TR_WORK_PERMIT_IN = "wp_in"
    TR_WORK_PERMIT_IN_PAPER = "wp_in_paper"
    TR_SEASONAL_AGRICULTRUAL_WORK_PROGRAM = "sawp"


class OtherService(Enum):
    EMPLOYER_COMPLAINCE_FEE = "ecf"
    BIOMETRICS = "biometrics"
    JOB_SEEKING = "job_seeking"
    ADVERTISEMENT = "advertisement"


class DocumentType(Enum):
    ID_STATUS = "id_status"
    CERTIFICATE = "certificate"
    FORM = "form"
    FINANCE = "finance"
    QUALIFICATION = "qualification"


class DocumentName(Enum):
    # IDs and Status
    PASSPORT_FRONT_PAGE = "passport_fp"
    PASSPORT_ALL_PAGES = "passport_ap"
    PASSPORT_ALL_PAGES_WITH_STAMPS = "passport_ap_with_stampes"
    NATIONAL_ID = "national_id"
    PR_CARD = "pr_card"
    CITIZENSHIP_CERTIFICATE = "citizenship_certificate"
    DRIVER_LICENSE = "driver_license"
    BIRTH_CERTIFICATE = "birth_certificate"
    ALL_CANADA_STATUSES = "all_canada_statuses"
    CURRENT_VALID_STATUS = "current_valid_status"
    CONFIRM_OF_NOMINATION = "confirm_of_nomination"
    LMIA_DECISION_LETTER = "lmia_decision_letter"
    # Certificates
    MARRIAGE_CERTIFICATE = "marriage_certificate"
    DIVORCE_CERTIFICATE = "divorce_certificate"
    DEATH_CERTIFICATE = "death_certificate"
    ADOPTION_CERTIFICATE = "adoption_certificate"
    POLICE_CLEARANCE_CERTIFICATE = "police_clearance_certificate"
    MEDICAL_REPOPRT = "medical_report"
    HEALTH_INSURANCE = "health_insurance"
    PHOTO = "photo"
    PROOF_OF_PAYMENT = "proof_of_payment"

    # Qualification
    RESUME = "resume"
    EMPLOYMENT_CERTIFICATE = "employment_certificate"
    ENGLISH_CERTIFICATE = "English_certificate"
    FRENCH_CERTIFICATE = "French_certificate"
    EDUCATION_CERTIFICATE = "education_certificate"
    EDUCATION_CREDENTIAL_ASSESSMENT = "education_credential_assessment"
    EMPLOYER_RECOMMENDATION_LETTER = "employer_recommendation_letter"
    JOB_OFFER = "job_offer"
    DETAILED_JOB_DESCRIPTION = "detailed_job_description"
    COMPANY_BRIEF = "company_brief"
    EMPLOYER_CERTIFICATE = "employer_certificate"
    CERTIFICATE_OF_INCORPORATION = "certificate_of_incorporation"
    BUSINESS_LICENSE = "business_license"
    JOB_ADVERTISEMENT = "job_advertisement"
    RECRUITMENT_SUMMARY = "recruitment_summary"
    EE_PROFILE = "ee_profile"
    SUBMISSION_LETTER = "submission_letter"
    LEASE_AGREEMENT = "Commercial_lease_agreement"
    EMPLOYEE_LIST = "employee_list"
    ORGANIZATIONAL_CHART = "organizational_chart"

    # Financial
    BANK_STATEMENT = "bank_statement"
    T4 = "T4"
    PAY_STUB = "pay_stub"
    PROOF_OF_ASSETS = "proof_of_assets"
    CREDIT_REPORT = "credit_reports"
    T1 = "T1"
    T2_SCHEDULE_100 = "T2_schedule_100"
    T2_SCHEDULE_125 = "T2_schedule_125"
    T2_SCHEDULE_141 = "T2_schedule_141"
    NOA = "NOA"
    FINANCIAL_STATEMENT = "financial_statement"
    EMPLOYMENT_LETTER = "employment_letter"
    FINANCIAL_SPONSOR_LETTER = "letter_of_financial_sponsor"
    PENSION_STATEMENT = "pension_statement"
    DISABILTY_PAYMENT = "disability_payment"
    INVESTMENT_PORTOFOLIOS = "investment_portfolios"
    RETRIEMENT_ACCOUNTS = "Retirement_accounts"
    PAYROLL_RECORDS = "payroll_records"
    T4_SUMMARY = "t4_summary"
    PD7A = "PD7A"
    ATTESTATION_LETTER = "attestation_letter"


class LMIAStream(Enum):
    GLOBAL_TALENT_STREAM = "lmia_gts"
    AGRICULTURAL_STREAM = "lmia_as"
    SEASONAL_AGRICULTURAL_WORKER_PROGRAM = "lmia_sawp"
    PERMANENT_RESIDENCE_STREAM = "lmia_ee"
    PERMANENT_RESIDENCE_STREAM_PR_ONLY = "lmia_ee_pr"
    PERMANENT_RESIDENCE_STREAM_PR_WP = "lmia_ee_pr_wp"
    IN_HOME_CAREGIVERS = "lmia_ihc"
    HIGH_WAGE_STREAM = "lmia_hws"
    LOW_WAGE_STREAM = "lmia_lws"


class Employment(Enum):
    EMPLOYER = "employer"


class Form(Enum):
    IMM5257 = "IMM5257"
    IMM1294 = "IMM1294"
    IMM1295 = "IMM1295"
    IMM5645 = "IMM5645"
    IMM5708 = "IMM5708"
    IMM5709 = "IMM5709"
    IMM5710 = "IMM5710"
    IMM0008 = "IMM0008"
    IMM0008_SCH4 = "IMM0008_SCH4"
    IMM0008_SCH4A = "IMM0008_SCH4A"
    IMM0008_SCH5 = "IMM0008_SCH5"
    IMM0008_SCH6 = "IMM0008_SCH6"
    IMM0008_SCH6A = "IMM0008_SCH6A"
    IMM0008_SCH13 = "IMM0008_SCH13"
    IMM0008_SCH14 = "IMM0008_SCH14"
    IMM0115 = "IMM0115"
    IMM0104 = "IMM0104"
    IMM1283 = "IMM1283"
    IMM1344 = "IMM1344"
    IMM5283 = "IMM5283"
    IMM5406 = "IMM5406"
    IMM5409 = "IMM5409"
    IMM5475 = "IMM5475"
    IMM5476 = "IMM5476"
    IMM5481 = "IMM5481"
    IMM5501 = "IMM5501"
    IMM5519 = "IMM5519"
    IMM5532 = "IMM5532"
    IMM5546 = "IMM5546"
    IMM5562 = "IMM5562"
    IMM5604 = "IMM5604"
    IMM0157 = "IMM0157"
    IMM5669 = "IMM5669"
    IMM5748 = "IMM5748"
    IMM5768 = "IMM5768"
    IMM5910 = "IMM5910"
    IMM5911 = "IMM5911"
    IMM5982 = "IMM5982"
    IMM5983 = "IMM5983"
    IMM5984 = "IMM5984"
    AGRI_FOOD_PILOT_SCHEDULE_1 = "Agri-Food_Pilot__Schedule_1"
    MEDICAL_CONDITION_STATEMENT = "Medical_Condition_Statement"
    IMM0135 = "IMM0135"
    IMM0136 = "IMM0136"
    IMM0138_SCH20 = "IMM0138_SCH20"
    EMP5519 = "EMP5519"
    EMP5624 = "EMP5624"
    EMP5625 = "EMP5625"
    EMP5626 = "EMP5626"
    EMP5628 = "EMP5628"
    EMP5627 = "EMP5627"
    EMP5593 = "EMP5593"
    EMP5661 = "EMP5661"
    EMP5575 = "EMP5575"
    EMP5595 = "EMP5595"
    EMP5598 = "EMP5598"
    EMP5600 = "EMP5600"
    EMP5667 = "EMP5667"
    EMP5389 = "EMP5389"
    EMPLOYER_DECLARATION_FORM = "Employer Declaration Form"
    USE_OF_A_REPRESENTATIVE_FORM_EMPLOYER = "Use of a Representative Form - Employer"
    USE_OF_A_REPRESENTATIVE_FORM_APPLICANT = "Use of a Representative Form - Applicant"
    EMPLOYER_FORM_ON="Employer Form OINP"


ALL_STAGES = [PRProgram, TRProgram, OtherService, LMIAStream, BCPNPProgram,SINPProgram,OINPProgram]


@dataclass
class ValidItem:
    is_valid: bool
    message: str


def is_valid_stage(stage: str):
    """check if a stage string is a valid Enum value"""
    valid_stages = [
        prop.value
        for enum in ALL_STAGES
        for prop in enum
    ]
    if stage in valid_stages:
        item = ValidItem(is_valid=True, message=f"{stage} is a valid stage name")
    else:
        similar_item = best_match(stage, valid_stages)
        item = ValidItem(
            is_valid=False,
            message=f"{stage} is not a valid stage name. Is it {similar_item}?",
        )
    return item


""" A decorator for checking whether the stage string matches a valid stage"""


def stage_validator(func):
    def wrapper(stage: str = "", *args, **kwargs):
        result = is_valid_stage(stage)
        if result.is_valid:
            return func(stage, *args, **kwargs)
        else:
            raise ValueError(result.message) 

    return wrapper


@stage_validator
def get_stage_enum_by_string(stage_name: str):
    """get an enum object by string"""
    stage_enums = [
        prop
        for enum in ALL_STAGES
        for prop in enum
    ]
    for stage_enum in stage_enums:
        try:
            stage_enum(stage_name)
        except Exception as e:
            pass
        else:
            return stage_enum(stage_name)


@stage_validator
def get_stage_name_by_string(stage: str, huam_reading: bool = True):
    """get an enum property name by string"""
    stage_objs = [prop for enum in ALL_STAGES for prop in enum]
    for stage_enum in stage_objs:
        if stage_enum.value == stage:
            return (
                stage_enum.name.replace("_", " ").title()
                if huam_reading
                else stage_enum.name
            )


def get_value_list_of_enum(enum: Enum):
    return [v.value for v in list(enum.__members__.values())]
