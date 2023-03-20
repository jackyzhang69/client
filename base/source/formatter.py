""" Formatter for source
1. All info-sheet and table-sheet should be named uniquely
2. variable names are the key of the dictionary
3. varible can have three keys: "comment", "style", "validation" to control the excel output
4. language should be accessed by index, 0 for English, 1 for Chinese, 2... for others in the future

"""
from base.namespace import Language
from base.source.validation import Validation
from dataclasses import dataclass


""" sheet-level and excel-level protection options"""

HEADFORMAT = {}
PRE_FORMAT_ROWS_IN_TABLE = 100
SHEET_DESCRIPTION_WIDTH = 70
SHEET_VALUE_WIDTH = 70
TABLE_VALUE_WIDTH = 12

"""Special case: if in the special list, call the special method  and return the result"""
SPECIAL_TABLE_LIST = [
    "table-personid",
    "table-address",
    "table-phone",
    "table-eraddress",
    "table-contact",
]

PROTECTION_OPTIONS = {
    "objects": False,
    "scenarios": False,
    "format_cells": True,
    "format_columns": True,
    "format_rows": True,
    "insert_columns": False,
    "insert_rows": False,
    "insert_hyperlinks": False,
    "delete_columns": False,
    "delete_rows": False,
    "select_locked_cells": True,
    "sort": False,
    "autofilter": False,
    "pivot_tables": True,
    "select_unlocked_cells": True,
}

TITLE_FORMAT = {
    "font_size": 24,
    "bold": True,
    "font_color": "000000",
    "align": "center",
    "valign": "middle",
    "bg_color": "C0C0C0",
    "border": 1,
}

COLUMN_TITLE_FORMAT = {
    "font_size": 14,
    "bold": True,
    "font_color": "000000",
    "align": "center",
    "valign": "vcenter",
    "bg_color": "C0C0C0",
    "border": 1,
    "text_wrap": True,
}

VARIABLE_TITLE_FORMAT = {
    "font_size": 14,
    "font_color": "000000",
    "align": "center",
    "valign": "vcenter",
    "bg_color": "C0C0C0",
    "border": 1,
}

DESCRIPTION_FORMAT = {
    "font_size": 14,
    "font_color": "000000",
    "align": "right",
    "valign": "vcenter",
    "bg_color": "f4f3ee",
    "border": 1,
    "text_wrap": True,
}

VALUE_FORMAT = {
    "font_size": 14,
    "font_color": "719c75",
    "align": "left",
    "valign": "vcenter",
    "locked": False,
    "border": 1,
    "text_wrap": 1,
    "num_format": "@",
}

COMMENT_FORMAT = {
    "x_scale": 1.2,
    "y_scale": 3,
    "font_size": 12,
    "author": "Jacky Zhang",
}


""" Cell level style,comment, and validation definition"""


@dataclass
class CellFormatter:
    language: Language = Language.ENGLISH

    @property
    def cell_formatter(self):
        v = Validation(self.language)
        default = {"num_format": "@"}
        money_format_int = {"num_format": "$#,##0"}
        money_format_with_one_decimal = {"num_format": "$#,##0.0"}
        rmb_money = {"num_format": "¥#,##0"}
        int_number_format = {"num_format": "###,0"}
        int_number_format_without_comma = {"num_format": "###0"}
        decimal_format = {"num_format": "###,0.0"}
        date_format = {"num_format": "yyyy-mm-dd"}
        percetage_format = {"num_format": "0.0%"}

        return {
            "info-background": {
                "q1a": {"validation": v.yes_no},
                "q1b": {"validation": v.yes_no},
                "q1c": {"validation": v.yes_no},
                "q2a": {"validation": v.yes_no},
                "q2b": {"validation": v.yes_no},
                "q2c": {"validation": v.yes_no},
                "q3a": {"validation": v.yes_no},
                "q4a": {"validation": v.yes_no},
                "q5": {"validation": v.yes_no},
                "q6": {"validation": v.yes_no},
            },
            "info-bcpnp": {
                "case_stream": {
                    "validation": v.bcpnp_case_stream,
                },
                "has_applied_before": {
                    "validation": v.yes_no,
                },
                "has_eligible_pro_designation": {
                    "validation": v.yes_no,
                },
                "q1": {"validation": v.yes_no},
                "q2": {"validation": v.yes_no},
                "q3": {"validation": v.yes_no},
                "q4": {"validation": v.yes_no},
                "q5": {"validation": v.yes_no},
                "q6": {"validation": v.yes_no},
                "q7": {"validation": v.yes_no},
                "regional_exp_alumni": {
                    "validation": v.regional_exp_alumni,
                },
                "submission_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
            },
            "info-ee": {
                "translate": ["ee_job_title"],
                "ee_expiry_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "ee_score": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
            },
            "info-emp5624": {
                "has_active_lmbp": {
                    "validation": v.yes_no,
                },
                "hird_canadian": {
                    "validation": v.yes_no,
                },
                "why_not": {"validation": v.yes_no},
            },
            "info-emp5626": {
                "current_canadian_number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "current_tfw_number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "end_month": {"validation": v.months},
                "has_finished_tp": {
                    "validation": v.yes_no,
                },
                "is_in_seasonal_industry": {
                    "validation": v.yes_no,
                },
                "last_canadian_number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "last_tfw_number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "named": {"validation": v.yes_no},
                "start_month": {
                    "validation": v.months,
                },
                "tp_waivable": {
                    "validation": v.yes_no,
                },
                "waive_creteria": {
                    "validation": v.waive_creteria,
                },
            },
            "info-emp5627": {
                "four_week_start_date": {"style": date_format},
                "four_week_end_date": {"style": date_format},
                "accommodation_type": {
                    "validation": v.accommodation_type,
                },
                "bathrooms": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "bedrooms": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "cap_exempted": {
                    "validation": v.yes_no,
                },
                "exemption_rationale": {
                    "comment": [
                        "specify why you areeligible for the selected cap exemption. If choose low-wage positions that do not go beyond 270 calendar days, indicate the estimated peak period start date and end date",
                        "说明你为什么符合免于CAP的理由。对于Seasonal 270天的豁免,提供估计都高峰时间的开始和结束日期",
                    ],
                },
                "is_in_seasonal_industry": {
                    "validation": v.yes_no,
                },
                "named": {"validation": v.yes_no},
                "people": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "provide_accommodation": {
                    "validation": v.yes_no,
                },
                "rent_amount": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "rent_unit": {
                    "validation": v.rent_unit,
                },
                "which_exemption": {
                    "validation": v.cap_exemption_type,
                },
                "q_a": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "q_b": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "q_c": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "q_d": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "q_e": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "q_f": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "q_g": {"validation": v.positive_int_decimal, "style": decimal_format},
                "q_h": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
            },
            "table-emp5624lmbp": {
                "start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "benefit": {
                    "width": 30,
                },
                "activity": {
                    "width": 40,
                },
                "commitment": {
                    "width": 30,
                },
                "committed_targets": {
                    "width": 30,
                },
            },
            "info-general": {
                "before_last_profit": {},
                "before_last_revenue": {},
                "canadian_ft_employee_num": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "canadian_pt_employee_num": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "corporate_structure": {
                    "validation": v.corporate_structure,
                },
                "establish_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "ft_employee_number": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "has_bc_employer_certificate": {
                    "validation": v.yes_no,
                },
                "has_jobbank_account": {
                    "validation": v.yes_no,
                },
                "has_lmia_approved": {
                    "validation": v.yes_no,
                },
                "last_profit": {
                    "comment": ["S125 line 9999", "S125表9999行"],
                },
                "last_revenue": {
                    "comment": ["S125 line 8089", "S125表8089行"],
                },
                "num_pnps": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "num_pnps_approved": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "num_pnps_in_process": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "pt_employee_number": {
                    "comment": [
                        "part-time job is defined for working less than 30 hours per week",
                        "每周工作时间少于30小时的为兼职",
                    ],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "retained_earning": {
                    "comment": ["S100 line 3849", "S100表3849行"],
                },
                "when_lmia_approved": {
                    "validation": v.date_format,
                },
            },
            "info-incanadacommon": {
                "most_recent_entry_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "original_entry_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "original_purpose": {
                    "validation": v.tr_original_purpose,
                },
            },
            "info-joboffer": {
                "atypical_schedule": {
                    "validation": v.yes_no,
                },
                "atypical_schedule_explain": {
                    "comment": [
                        "explain the " "detailed work " "schedule",
                        "请说明工作时间是如何安排的",
                    ],
                },
                "days": {
                    "validation": v.positive_int_decimal,
                    "style": int_number_format,
                },
                "dental_insurance": {
                    "validation": v.yes_no,
                },
                "disability_insurance": {
                    "validation": v.yes_no,
                },
                "duties": {
                    "comment": [
                        "detailed description of duties, one line for one duty,edit and proofread in advance,then copy and paste here",
                        "详细职责描述,可将excel行拉长。每条职责一行,一般在别的编辑器里面写好copy过来即可。",
                    ],
                },
                "education_level": {
                    "validation": v.education_level,
                },
                "empolyer_provided_persion": {
                    "validation": v.yes_no,
                },
                "english_french": {
                    "validation": v.yes_no_exempt,
                },
                "extended_medical_insurance": {
                    "validation": v.yes_no,
                },
                "has_probation": {
                    "validation": v.yes_no,
                },
                "hours": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "is_trade": {"validation": v.yes_no},
                "is_working": {"validation": v.yes_no},
                "job_duration": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "job_duration_unit": {
                    "validation": v.job_duration_unit,
                },
                "license_met": {
                    "validation": v.yes_no,
                },
                "license_request": {
                    "validation": v.yes_no,
                },
                "offer_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "oral": {
                    "validation": v.english_or_french,
                },
                "ot_after_hours": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "ot_after_hours_unit": {
                    "comment": [
                        "the unit for the time period that you start to calculate the over-time work,if you count OT work after 8 hours per day, then the unit is day;if you coundt OT work after 40 hours per week, then the unit is week",
                        "加班工资开始计算的单位,比如,每天超过8小时,那么该单位就是day;如果每周超过40小时,那么单位就是week",
                    ],
                    "validation": v.ot_after_hours_unit,
                },
                "ot_ratio": {
                    "comment": [
                        "the ratio of over-time hourly rate to regulat hourly rate e.g.:1.5",
                        "加班工资是平时工资的倍数,比如1.5",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "other_language_required": {
                    "validation": v.yes_no,
                },
                "payment_way": {
                    "validation": v.payment_way,
                    "comment": ["How long pay once", "多久发一次工资"],
                },
                "wage_unit": {
                    "validation": v.wage_unit,
                },
                "permanent": {"validation": v.yes_no},
                "probation_duration": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "specific_edu_requirement": {
                    "comment": [
                        "specify the requirement for education level, filed in one sentence",
                        "一句话描述对学历、教育程度、相关专业的要求",
                    ],
                },
                "trade_type": {
                    "validation": v.trade_education_type,
                },
                "vacation_pay_days": {
                    "validation": v.positive_int_decimal,
                    "style": int_number_format,
                },
                "vacation_pay_percentage": {
                    "comment": [
                        "usually the percentage is4%,then enter 4",
                        "一般是4%,就填写4即可",
                    ],
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "wage_rate": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "wage_unit": {
                    "validation": v.wage_unit,
                },
                "work_start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "writing": {
                    "validation": v.english_or_french,
                },
            },
            "info-lmi": {
                "canadian_lost_job": {
                    "validation": v.yes_no,
                },
                "fill_shortage_benefit": {
                    "comment": ["skip if no fill-shortage " "benefit", "如果没有,就不用填任何东西"],
                },
                "is_work_sharing": {
                    "validation": v.yes_no,
                },
                "job_creation_benefit": {
                    "comment": ["skip if no job-creation " "benefit", "如果没有,就不用填任何东西"],
                },
                "labour_dispute": {
                    "validation": v.yes_no,
                },
                "laid_off_canadians": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "laid_off_in_12": {
                    "validation": v.yes_no,
                },
                "laid_off_tfw": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "other_benefit": {
                    "comment": ["skip if no other benefit", "如果没有,就不用填任何东西"],
                },
                "skill_transfer_benefit": {
                    "comment": [
                        "skip if no " "skill-transferring " "benefit",
                        "如果没有,就不用填任何东西",
                    ],
                },
            },
            "info-lmiacase": {
                "area_index": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
                "area_median_wage": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "provide_details_even_waived": {"validation": v.yes_no},
                "duration_number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "duration_unit": {
                    "validation": v.lmia_duration_unit,
                },
                "has_another_employer": {
                    "validation": v.yes_no,
                },
                "has_attestation": {
                    "validation": v.yes_no,
                },
                "is_in_10_days_priority": {
                    "validation": v.yes_no,
                },
                "is_waived_from_advertisement": {
                    "validation": v.yes_no,
                },
                "noc_outlook": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
                "number_of_tfw": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "provincial_median_wage": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "purpose_of_lmia": {
                    "validation": v.purpose_of_lmia,
                },
                "stream_of_lmia": {
                    "comment": [
                        "EE(Express Entry: 5593),HWS(High Wage Stream: 5626),WS(Low Wage Stream: 5627),GTS(Global Talent Stream: 5624, 5625),AC (Academic: 5626),AG (Agriculture: 5519, 5510), CG(CareGiver 5604)",
                        "EE(快速通道: 5593),HWS(高工资流: 5626),WS(低工资流: 5627),GTS(全球人才计划: 5624, 5625),AC (学术类: 5626),AG (农业类: 5519, 5510), CG(CareGiver 5604)",
                    ],
                    "validation": v.stream_of_lmia,
                },
                "top10_wages": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "unemploy_rate": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "use_jobbank": {
                    "validation": v.yes_no,
                },
            },
            "info-marriage": {
                "marital_status": {
                    "comment": [
                        "if current marital status is widowed, seperated, or divorced, then don't input information for current marriage,but need to select previous marriage and input information",
                        "如果婚姻状态是离婚,分居,或矜寡,则当前配偶等信息就不需要。而之前婚姻必须选择和填写",
                    ],
                    "validation": v.marital_status,
                },
                "married_date": {
                    "comment": ["skip this box if single", "若是single则不需要填写"],
                    "validation": v.date_format,
                    "style": date_format,
                },
                "pre_end_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "pre_relationship_type": {
                    "validation": v.pre_relationship_type,
                },
                "pre_sp_dob": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "pre_sp_last_name": {
                    "comment": [
                        "only input the information for your most recent previous marriage",
                        "只填写最近一段婚姻",
                    ],
                },
                "pre_start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "previous_married": {
                    "validation": v.yes_no,
                },
                "sp_canada_status": {
                    "validation": v.imm_status,
                },
                "sp_in_canada": {
                    "validation": v.yes_no,
                },
                "sp_language_type": {
                    "validation": v.language_test_type,
                },
            },
            "info-othernumber": {
                "children": {
                    "comment": [
                        "The number of children under 22 and has no spouse or common-law partner",
                        "22岁以下未婚或有同居伴侣的",
                    ],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "co_signer_sponsored_number": {
                    "comment": [
                        "Undertaking Years:Spouse-3 years, child (Type A)-10 years or until 25, Child (Type C)-3 years, parent/grandparent-20 years, other-10 years",
                        "担保年数:配偶-3年, 孩子(A类)-10年或到25岁,孩子(C类)-3年, 父母/祖父母-20年, 其他-10年",
                    ],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "has_spouse": {"validation": v.yes_no},
                "sponsor_sponsored_number": {
                    "comment": [
                        "Undertaking Years:Spouse-3 years, child (Type A)-10 years or until 25, Child (Type C)-3 years, parent/grandparent-20 years, other-10 years",
                        "担保年数:配偶-3年, 孩子(A类)-10年或到25岁,孩子(C类)-3年, 父母/祖父母-20年, 其他-10年",
                    ],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
            },
            "info-personal": {
                "description_width": 80,
                "value_width": 40,
                "translate": [
                    "country_of_birth",
                    "place_of_birth",
                    "citizen",
                    "citizen2",
                    "native_language",
                    "additional_info",
                ],
                "accompany_to_canada": {
                    "validation": v.yes_no,
                },
                "dependant_type": {
                    "comment": [
                        "Type A: child is under the age of 22, not married or in a common-law relationship, Type B:only for the child whose age was locked in before Aug1, 2014,and,the child has been continuously enrolled or attending full-time studies at a post-secondary institution and has financially depended on a parent since before turning 22 or since marrying or entering into a common-law relationship before turning 22。 Type C:The child is 22 years of age or older but has financially depended on a parent since before 22, and is unable to be financially self-supporting due to a physical or mental condition",
                        "Type A: 22岁以下的申请人, Type B:22岁以上,但一直在读书的。 Type C:22岁以上但有疾病需要依赖父母的",
                    ],
                    "validation": v.dependant_type,
                },
                "did_eca": {"validation": v.yes_no},
                "dob": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "eca_supplier": {
                    "validation": v.eca_supplier,
                },
                "english_french": {
                    "comment": [
                        "English(if you only speak English), French(If you only speak French), Both(if you cann speak both English and French) Neither(if you can't speak English nor French)",
                        "English(英语) French(法语)Both(两个都会) Neither(两个都不会)",
                    ],
                    "validation": v.english_french,
                },
                "eye_color": {
                    "validation": v.eye_color,
                },
                "first_name": {
                    "comment": ["Same as appears on your " "passport", "保持跟护照一致都拼音名"],
                },
                "has_sibling_canadian": {
                    "validation": v.yes_no,
                },
                "height": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "intended_province": {
                    "validation": v.canada_provinces,
                },
                "ita_assessed": {
                    "comment": [
                        "must be assessed by Canadian Industry Training Authority",
                        "这个是加拿大行业培训机构(Industry Training Authority)",
                    ],
                    "validation": v.yes_no,
                },
                "language_test": {
                    "validation": v.yes_no,
                },
                "last_name": {
                    "comment": ["Same as appears on your passport", "保持跟护照一致都拼音姓"],
                },
                "liquid_asset": {
                    "validation": v.positive_int,
                    "style": money_format_int,
                },
                "net_asset": {
                    "validation": v.positive_int,
                    "style": money_format_int,
                },
                "other_school_years": {
                    "comment": ["input 0 if no other school years", "如果没有,请填写0"],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "post_secondary_school_years": {
                    "comment": ["input 0 if no other school years", "如果没有,请填写0"],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "primary_school_years": {
                    "comment": ["input 0 if no other school years", "如果没有,请填写0"],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "relationship_to_pa": {
                    "validation": v.relationship_to_pa,
                },
                "secondary_school_years": {
                    "comment": ["input 0 if no other school years", "如果没有,请填写0"],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "sex": {"validation": v.sex},
                "uci": {
                    "comment": [
                        "Unified Client Identity number issued by IRCC, you can find it on your study permit/work permit/visitor record or your Canadain visas",
                        "加拿大签证上Unified Client Identity号码",
                    ],
                },
                "which_one_better": {
                    "validation": v.english_or_french,
                },
            },
            "info-personalassess": {
                "translate": [
                    "work_experience_brief",
                    "education_brief",
                    "competency_brief",
                    "language_brief",
                    "performance_remark",
                    "self_description",
                    "skill_list",
                    "activity",
                ],
                "work_experience_brief": {
                    "comment": [
                        "this part justify why you qualified for the position (for BCPNP or LMIA), so brief your education ground, work experience and history, your professional and personal qualities, your language abilities。IF you have already been working for this employer, then input your employer's comment about your work performance here",
                        "教育背景,工作经历,个人品质,语言能力 用于PNP的雇主信或者LMIA申请回答为什么申请人合格的问题。工作表现评价用于已经在该雇主那里工作的情况,在雇主推荐信中使用。",
                    ],
                },
            },
            "info-position": {
                "has_same": {"validation": v.yes_no},
                "has_same_number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "highest": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "is_new": {"validation": v.yes_no},
                "laidoff_current": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "laidoff_with12": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "lmia_refused": {
                    "validation": v.yes_no,
                },
                "lowest": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "under_cba": {"validation": v.yes_no},
                "vacancies_number": {
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "worked_working": {
                    "validation": v.yes_no,
                },
                "how_when_offer": {
                    "comment": [
                        "indicate how and when did you offer this job to the temporary foreign work(s)",
                        "请说明什么时候以及如何给TFW提供offer的",
                    ],
                },
            },
            "info-prbackground": {
                "q1": {"validation": v.yes_no},
                "q10": {"validation": v.yes_no},
                "q11": {"validation": v.yes_no},
                "q2": {"validation": v.yes_no},
                "q3": {"validation": v.yes_no},
                "q4": {"validation": v.yes_no},
                "q5": {"validation": v.yes_no},
                "q6": {"validation": v.yes_no},
                "q7": {"validation": v.yes_no},
                "q8": {"validation": v.yes_no},
                "q9": {"validation": v.yes_no},
            },
            "info-prcase": {
                "communication_language": {
                    "validation": v.english_or_french,
                },
                "consent_of_info_release": {
                    "validation": v.yes_no,
                },
                "has_csq": {"validation": v.yes_no},
                "imm_category": {
                    "validation": v.pr_imm_category,
                },
                "imm_program": {
                    "validation": v.pr_imm_program,
                },
                "imm_under": {
                    "validation": v.pr_imm_under,
                },
                "intended_province": {
                    "validation": v.canada_provinces,
                },
                "interview_language": {
                    "validation": v.english_french_chinese,
                },
                "last_entry_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "need_translator": {
                    "validation": v.yes_no,
                },
                "number": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                },
                "submission_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
            },
            "info-recruitmentsummary": {
                "after_offer_coomunication": {
                    "validation": v.yes_no,
                },
                "emails_for_certificates": {
                    "validation": v.yes_no,
                },
                "emails_for_making_interview": {
                    "validation": v.yes_no,
                },
                "emais_for_references": {
                    "validation": v.yes_no,
                },
                "interview_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "interview_process_evidence": {
                    "validation": v.yes_no,
                },
                "interview_record": {
                    "validation": v.yes_no,
                },
                "joboffer_email": {
                    "validation": v.yes_no,
                },
                "joboffer_email_reply": {
                    "validation": v.yes_no,
                },
                "reference_check_evidence": {
                    "validation": v.yes_no,
                },
                "reference_checked": {
                    "validation": v.yes_no,
                },
                "reply2apply": {
                    "validation": v.yes_no,
                },
            },
            "info-sp": {
                "dli": {
                    "comment": [
                        "skip this box if you are registered in parimary or secondary school, look for the number from the Letter of Acceptance from the post-secondary institions",
                        "中小学无需填写,大学参考学校给的offer",
                    ],
                },
                "dual_intent": {
                    "validation": v.yes_no,
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "end_date": {"validation": v.date_format, "style": date_format},
                "fund_available": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "other": {
                    "comment": [
                        "e.g.:input relative, scholarship etc.",
                        "填写亲戚- relative,或奖学金-scholarship等",
                    ],
                },
                "other_cost": {
                    "comment": [
                        "input the amount of living cost for one year in Canadian currency,e.g.:12000",
                        "填写一年的大致生活等其它开支,加币,如12000",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "paid_person": {
                    "validation": v.sp_paid_person,
                },
                "province": {
                    "validation": v.canada_provinces,
                },
                "refused_case": {
                    "validation": v.yes_no,
                },
                "room_cost": {
                    "comment": [
                        "input the amount of accommodation cost for one year in Canadian currency,e.g.:12000",
                        "填写一年的大致住宿费用,加币,如12000",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "study_level": {
                    "validation": v.education_level,
                },
                "tuition_cost": {
                    "comment": [
                        "input the amount of tuition fee for one year in Canadian currency,e.g.:49800",
                        "填写一年的大致学费,加币,如49800",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
            },
            "info-spincanada": {
                "application_purpose": {
                    "validation": v.sp_in_application_purpose,
                },
                "apply_work_permit": {
                    "validation": v.yes_no,
                },
                "dli": {
                    "comment": [
                        "skip this box if you are registered in primary or secondary school, look for the number from the Letter of Acceptance from the post-secondary institions",
                        "中小学无需填写,大学参考学校给的offer",
                    ],
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "expiry_date": {"validation": v.date_format, "style": date_format},
                "fund_available": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "other": {
                    "comment": [
                        "e.g.:input relative, scholarship etc.",
                        "填写亲戚- relative,或奖学金-scholarship等",
                    ],
                },
                "other_cost": {
                    "comment": [
                        "input the amount of living cost for one year in Canadian currency,e.g.:12000",
                        "填写一年的大致生活等其它开支,加币,如12000",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "paid_person": {
                    "validation": v.sp_paid_person,
                },
                "province": {
                    "validation": v.canada_provinces,
                },
                "room_cost": {
                    "comment": [
                        "input the amount of accommodation cost for one year in Canadian currency,e.g.:12000",
                        "填写一年的大致住宿费用,加币,如12000",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "study_level": {
                    "validation": v.education_level,
                },
                "tuition_cost": {
                    "comment": [
                        "input the amount of tuition fee for one year in Canadian currency,e.g.:49800",
                        "填写一年的大致学费,加币,如49800",
                    ],
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "work_permit_type": {
                    "validation": v.sp_apply_wp_type,
                },
            },
            "info-status": {
                "translate": [
                    "current_country",
                    "other_status_explaination",
                    "last_entry_place",
                ],
                "current_country_status": {
                    "comment": [
                        "",
                        "Citizen:公民, Permanent Resident:永久居民, Work Permit:工签, Study Permit:学签, Visitor Record:VR, Other:其它",
                    ],
                    "validation": v.imm_status,
                },
                "current_status_end_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "current_status_start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "current_workpermit_type": {
                    "validation": v.workpermit_type,
                },
                "has_vr": {"validation": v.yes_no},
                "last_entry_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
            },
            "info-trbackground": {
                "q1a": {"validation": v.yes_no},
                "q1b": {"validation": v.yes_no},
                "q2a": {"validation": v.yes_no},
                "q2b": {"validation": v.yes_no},
                "q2c": {"validation": v.yes_no},
                "q3a": {"validation": v.yes_no},
                "q4a": {"validation": v.yes_no},
                "q5": {"validation": v.yes_no},
                "q6": {"validation": v.yes_no},
            },
            "info-trcase": {
                "applying_end_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "applying_start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "same_as_cor": {
                    "comment": [
                        "Is your application going to the Canada embassy in your residence country?",
                        "你的申请是递交到你当前居住地(比如：中国)的加拿大使馆吗?",
                    ],
                    "validation": v.yes_no,
                },
                "applying_status": {
                    "validation": v.imm_status,
                    "comment": [
                        "",
                        "Citizen:公民, Permanent Resident:永久居民, Work Permit:工签, Study Permit:学签, Visitor Record:VR, Other:其它",
                    ],
                },
                "service_in": {
                    "validation": v.english_or_french,
                },
                "submission_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
            },
            "info-trcasein": {
                "consent_of_info_release": {
                    "validation": v.yes_no,
                },
                "doc_number": {
                    "comment": [
                        "usually in bold blak,starting with a letter and followed by nine digits numbers, on the top-right of your study permit/work permit/visitor record",
                        "学签/工签/VR的右上角黑色的,一般为1个字母+9位数字",
                    ],
                },
                "is_spouse_canadian": {
                    "validation": v.yes_no,
                },
                "most_recent_entry_date": {
                    "comment": [
                        "skip this box if your most recent entry is the same as your first entery",
                        "如果这是第一次,此处不用填写",
                    ],
                    "validation": v.date_format,
                    "style": date_format,
                },
                "most_recent_entry_place": {
                    "comment": [
                        "skip this box if your most recent entry is the same as your first entery",
                        "如果这是第一次,此处不用填写",
                    ],
                },
                "original_entry_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "original_other_reason": {
                    "comment": [
                        "If choose other,brief the reason here",
                        "若上一行填other则将原因补充在这里",
                    ],
                },
                "original_purpose": {
                    "comment": [
                        "Business,Tourism,study-,work,family visit,or other",
                        "Business-商业,Tourism-旅游,study-学习,work-工作,family visit-家庭访问,或者other-其它",
                    ],
                    "validation": v.tr_original_purpose,
                },
                "service_in": {
                    "validation": v.english_or_french,
                },
                "submission_date": {
                    "comment": ["you can leave out this box", "可以不用填写"],
                    "validation": v.date_format,
                    "style": date_format,
                },
            },
            "info-visa": {
                "application_purpose": {
                    "validation": v.visa_application_purpose,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "funds_available": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "name1": {
                    "comment": [
                        "input the name and address of your school or your workplace",
                        "可填写学校或工作单位的名称和地址",
                    ],
                },
                "name2": {
                    "comment": [
                        "input another name and address of your school or your workplace if you have one",
                        "可填写学校或工作单位的名称和地址",
                    ],
                },
                "relationship1": {
                    "comment": [
                        "e.g.: input-my school if you put your school as the person or institute you are going to visit",
                        "比如：如果是学校,就写my school.",
                    ],
                },
                "relationship2": {
                    "comment": ["same as relationship 1", "比如：如果是学校,就写my school."],
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "visit_purpose": {
                    "validation": v.visit_purpose_5257,
                },
            },
            "info-vrincanada": {
                "application_purpose": {
                    "validation": v.vr_application_purpose,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "funds_available": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_int,
                },
                "name1": {
                    "comment": [
                        "input the name and address of your school or your workplace",
                        "可填写学校或工作单位的名称和地址",
                    ],
                },
                "name2": {
                    "comment": [
                        "input another name and address of your school or your workplace if you have one",
                        "可填写学校或工作单位的名称和地址",
                    ],
                },
                "other_explain": {
                    "comment": [
                        "if you choose other for visitingg purpose, specify here,such as accompany child studying in Canada",
                        "如果访问目的填写的是Other,请说明。比如:accompany child studying in Canada",
                    ],
                },
                "paid_person": {
                    "validation": v.sp_paid_person,
                },
                "relationship1": {
                    "comment": [
                        "e.g.: input-my school if you put your school as the person or institute you are going to visit",
                        "比如：如果是学校,就写my school.",
                    ],
                },
                "relationship2": {
                    "comment": ["same as relationship 1", "比如：如果是学校,就写my school."],
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "visit_purpose": {
                    "validation": v.tr_original_purpose,
                },
            },
            "info-wp": {
                "application_description": {
                    "comment": [
                        "brief your application " "purpose in a few words",
                        "简短几个词说明目的,用于submission " "letter的标题",
                    ],
                },
                "dual_intent": {
                    "comment": [
                        "you have both the intent to apply for a temporary visa/permit and the intent to apply for permanent residence in the future",
                        "双重倾向是你既有申请临时签证的愿望,同时又会考虑申请永久居民。",
                    ],
                    "validation": v.yes_no,
                },
                "economic_tie": {
                    "comment": [
                        "indicate and describe your properties, investments, and any other economic ties in your homecountry to prove that you will return to your home country",
                        "阐述申请人的经济方面的,比如物业,产业,投资等关系,说明因此会在临时访问后会返回母国",
                    ],
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "family_tie": {
                    "comment": [
                        "indicate and describe your family relationships in your homecountry to prove that you will return to your home country by the end of your authorized stay period",
                        "阐述申请人的家庭关系,说明因此会在临时访问后会返回母国",
                    ],
                },
                "other_tie": {
                    "comment": [
                        "indicate and describe any other ties in your homecountry to prove that you will return to your home country",
                        "阐述申请人的其他关系,说明因此会在临时访问后会返回母国",
                    ],
                },
                "refused_case": {
                    "validation": v.yes_no,
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "work_permit_type": {
                    "validation": v.wp_apply_wp_type,
                },
                "work_province": {
                    "validation": v.canada_provinces,
                },
            },
            "info-wpincanada": {
                "application_purpose": {
                    "validation": v.wp_in_application_purpose,
                },
                "caq_number": {
                    "comment": [
                        "Only for Quebec employment",
                        "如果工作是在魁北克的,需要拿到CAQ号码,其他省份不需要",
                    ],
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "expiry_date": {"validation": v.date_format, "style": date_format},
                "pnp_certificated": {
                    "validation": v.yes_no,
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "work_permit_type": {
                    "validation": v.wp_apply_wp_type,
                },
                "work_province": {
                    "validation": v.canada_provinces,
                },
            },
            "table-address": {
                "translate": [
                    "unit",
                    "street_number",
                    "street_name",
                    "district",
                    "city",
                    "province",
                    "country",
                ],
                "residential_address": {
                    "comment": [
                        "copy your mailing address if they are the same. if you are living in Canada, province can't be skipped and must be writtenn in abbreviation, e.g.:AB, BC",
                        "如果地址跟邮件地址相同,请copy邮件地址到这里.如果国家是加拿大,必须填写省份,而且用缩写,比如： AB, BC",
                    ],
                },
            },
            "table-addresshistory": {
                "translate": ["street_and_number", "city", "province", "country"],
                "title_note": [
                    "List all activities in the past ten years or since your 18th birthday (if less than 28 years old). Note: 1. From top to bottom, start with the most recent history. 2. There should be no blank between each history. 3. Only applicants aged 18 or above need to fill in this part.",
                    "列举过去十年或18岁生日后(若小于28岁)所有从事的活动历史。注意:1. 从上到下，从最近的历史开始写。 2. 每段历史之间不允许有空档。3. 18岁以上的申请人才需要填写",
                ],
                "end_date": {"validation": v.date_format, "style": date_format},
                "start_date": {"validation": v.date_format, "style": date_format},
                "street_and_number": {"width": 30},
            },
            "table-advertisement": {
                "end_date": {"validation": v.date_format, "style": date_format},
                "start_date": {"validation": v.date_format, "style": date_format},
            },
            "table-assumption": {
                "title_note": [
                    "Future Canadian job assumptions, this is used as an assessment, and customers do not need to fill it out. The start date and end date are future dates, and the type of work permit is also assumed, which are used to calculate Canadian work experience and possible points.",
                    "未来加拿大工作假设,这是作为评估使用，客户不需要填写。 开始日期和结束日期是未来日期，工签类型也是假设，都是用来计算加拿大工作经验以及可能的算分等使用",
                ],
                "start_date": {"validation": v.date_format, "style": date_format},
                "end_date": {"validation": v.date_format, "style": date_format},
                "hourly_rate": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "province": {
                    "validation": v.canada_provinces,
                },
                "work_permit_type": {
                    "validation": v.workpermit_type,
                    "width": 30,
                },
            },
            "table-canadarelative": {
                "age": {"validation": v.positive_int, "style": int_number_format},
                "province": {
                    "validation": v.canada_provinces,
                },
                "relationship": {
                    "validation": v.relationship,
                    "width": 15,
                },
                "sex": {
                    "validation": v.sex,
                },
                "status": {
                    "validation": v.imm_status,
                },
                "years_in_canada": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                    "width": 25,
                },
            },
            "table-captfw": {
                "designated_position": {
                    "comment": [
                        "Designated positions include: on-farm primary agricultural positions, caregiving positions, highly mobile or true temporary position, seasonal positions?",
                        "是否属于些职位: on-farm primary agricultural positions, caregiving positions, highly mobile or truly temporary position, seasonal positions?",
                    ],
                    "validation": v.yes_no,
                    "width": 20,
                },
                "employee": {
                    "comment": [
                        "Temporary Foreign Workers in this sheet should include:TFW already work at this location, hired but not yet started working, and TFW(s) the employer is going to hire AND are included in this LMIA application",
                        "本表格中海外劳工包括：已在职的,已聘但尚未上岗,以及本次lmia中准备招聘的",
                    ],
                },
                "hourly_rate": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "hours_per_week": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "in_application": {
                    "validation": v.yes_no,
                    "width": 20,
                },
                "is_working": {
                    "validation": v.yes_no,
                    "width": 20,
                },
                "pr_in_process": {
                    "comment": [
                        " The foreign national (TFW) has already received confirmation from a federal or provincial program but not a PR yet, e.g. not landing yet",
                        " 该Foreign worker拿到了省提名或PR " "visa, 但是没有登陆。",
                    ],
                    "validation": v.yes_no,
                    "width": 30,
                },
                "pr_support_only_lmia": {
                    "comment": [
                        "is this LMIA application only for supporting Permanent Residence application?",
                        "本次申请的是否是Pr support only的LMIA?",
                    ],
                    "validation": v.yes_no,
                    "width": 20,
                },
            },
            "table-contact": {
                "preferred_language": {
                    "validation": v.english_french,
                },
                "province": {
                    "validation": v.canada_provinces,
                },
                "display_type": {
                    "width": 20,
                },
            },
            "table-cor": {
                "translate": ["country"],
                "title_note": [
                    " Only for the places where have been resided more than 6 months in the past 5 years",
                    "只有过去5年居住超过6个月的地方,才需要填写",
                ],
                "end_date": {
                    "comment": [
                        "In first line, the end date must be later than today or leave it blank if it's your citizen country",
                        "第一行的结束日期必须晚于今天,如果当前居住国是国籍所在国,可以不填写结束日期",
                    ],
                    "validation": v.date_format,
                    "style": date_format,
                },
                "start_date": {
                    "comment": [
                        "Input the information of your current living country in the first line, then input any country other than your country of citizenship or your current country of residence for more than 6 months during the past 5 years.. ",
                        "第一行必须填写当前居住国,如果在非国籍所在国,到期日期需要填写您所持签证的到期日. 第二行开始只需要填写过去5年,不需要包含国籍所在国的居住",
                    ],
                    "validation": v.date_format,
                    "style": date_format,
                },
                "status": {
                    "validation": v.imm_status,
                    "width": 30,
                },
                "country": {
                    "width": 30,
                },
            },
            "table-cosignerincome": {
                "ei_regualar_benefits": {
                    "comment": ["Refer to NOA " "line 11900", "参考NOA第11900行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "oas": {
                    "comment": ["Refer to NOA line 11300", "参考NOA第11300行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "prov_payment_training": {
                    "comment": ["Refer to  " "(T4A-Box 028)", "参考 (T4A-Box " "028)"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 25,
                },
                "prov_social_assistanance": {
                    "comment": ["Refer to " "NOA line " "14500", "参考NOA第14500行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "refuge_rap_payment": {
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "total_income": {
                    "comment": ["Refer to the Line " "15000 in NOA", "参考NOA第15000行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "year": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                    "width": 6,
                },
            },
            "table-education": {
                # "academic_year": {
                #     "validation": v.positive_int_decimal,
                #     "style": decimal_format,
                # },
                "translate": [
                    "school_name",
                    "field_of_study",
                    "street_address",
                    "city",
                    "province",
                    "country",
                    "description",
                ],
                "school_name": {
                    "width": 20,
                },
                "field_of_study": {
                    "width": 20,
                },
                "street_address": {
                    "width": 20,
                },
                "description": {
                    "comment": [
                        "If there is anything you want to add on",
                        "其他你认为需要说明的内容",
                    ],
                    "width": 20,
                },
                "education_level": {
                    "validation": v.education_level,
                    "width": 20,
                },
                "end_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "graduate_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "is_trade": {
                    "comment": [
                        "is it of trade category, such as plumber and electrician?",
                        "是否是技工类别？比如水电工",
                    ],
                    "validation": v.yes_no,
                },
                "start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "academic_year": {
                    "comment": [
                        "What is the normal number of years to complete your studies according to the university?",
                        "按照学校规定，正常几年完成学业？",
                    ]
                },
            },
            "table-employee_list": {
                "employee": {
                    "width": 20,
                },
                "job_title": {
                    "width": 20,
                },
                "hourly_rate": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "annual_wage": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "lowest": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "median": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "highest": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
                "percentage_to_median": {
                    "style": percetage_format,
                },
                "employment_start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                    "width": 12,
                },
                "hours_per_week": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "immigration_status": {
                    "validation": v.imm_status,
                },
                "wage": {
                    "validation": v.positive_int_decimal,
                    "style": money_format_with_one_decimal,
                },
            },
            "table-employment": {
                "translate": [
                    "job_title",
                    "department",
                    "company",
                    "unit",
                    "street_address",
                    "city",
                    "province",
                    "country",
                    "duties_brief",
                    "duties	company_brief",
                    "fullname_of_certificate_provider",
                    "position_of_certificate_provider",
                    "department_of_certificate_provider",
                    "phone_of_certificate_provider",
                    "email_of_certificate_provider",
                    "employment_certificate",
                    "remark",
                ],
                "title_note": [
                    "The work experience part is the core, except for the noc code, all other customers need to fill in. For example: even if the share ratio is 0, please write it as 0. In the job responsibilities section, list as much detail as possible. To facilitate matching suitable jobs in Canada.",
                    "工作经验部分是核心,除了noc代码之外,其他客户都需要填写。比如:即使股份比例是0,也请写明为0。 工作职责部分，尽量详细列出。便于匹配加拿大合适的工作。",
                ],
                "bcpnp_qualified": {
                    "validation": v.yes_no,
                },
                "duties": {
                    "comment": [
                        "detailed description of duties, one line for one duty,edit and proofread in advance,then copy and paste here",
                        "可以用鼠标把这个单元拉大,逐条列出你的所有工作职责,可以在其他编辑器中写好然后复制到这里",
                    ],
                },
                "duties_brief": {"width": 30},
                "ee_qualified": {
                    "validation": v.yes_no,
                },
                "employment_certificate": {
                    "validation": v.yes_no,
                },
                "employment_type": {
                    "validation": v.employment_type,
                    "comment": [
                        "Please pick self-employed or employed",
                        "属于自雇(self-employed)还是他雇(employed)？",
                    ],
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "noc_code": {
                    "comment": ["for RCIC's use", "这个客户不需要填写,由移民顾问填写"],
                },
                "share_percentage": {
                    "comment": ["Share percentage, no % needed", "股份比例,不用加%，直接输入数字"],
                    "validation": v.positive_int_decimal,
                    "style": percetage_format,
                },
                "start_date": {"validation": v.date_format, "style": date_format},
                "weekly_hours": {
                    "validation": v.positive_int_decimal,
                    "style": decimal_format,
                },
                "work_under_status": {
                    "comment": [
                        "Please pick the status that you are working under",
                        "请选择你在该阶段工作时的身份，如果是在本国工作，就可以不选",
                    ],
                    "validation": v.workpermit_type,
                    "width": 25,
                },
            },
            "table-eraddress": {
                "mailing_address": {
                    "comment": [
                        "copy the business " "address if they are the " "same",
                        "如果地址跟商业地址相同,请copy商业地址到这里",
                    ],
                },
                "province": {
                    "validation": v.canada_provinces,
                },
                "display_type": {
                    "width": 20,
                },
            },
            "table-family": {
                "translate": [
                    "place_of_birth",
                    "birth_country",
                    "country_of_citizenship",
                    "address",
                    "occupation",
                    "place_of_death",
                ],
                "title_note": [
                    "1. Fill in spouse, children, parents, siblings 2. Only applicants over 18 years old need to fill in",
                    "1. 填写配偶,子女,父母,兄弟姐妹 2. 只有18岁以上的申请人需要填写",
                ],
                "accompany_to_canada": {
                    "validation": v.yes_no,
                },
                "date_of_birth": {
                    "validation": v.date_format,
                },
                "date_of_death": {
                    "validation": v.date_format,
                },
                "marital_status": {
                    "validation": v.marital_status,
                },
                "relationship": {
                    "comment": [
                        "fill this part for your:Spouse, children, mother, father, siblings,including step-siblings",
                        "请填写你的: 配偶,子女,母亲,父亲,兄弟姐妹,包括同母异父/同母异父的兄弟姐妹,",
                    ],
                    "validation": v.family_relationship,
                },
                "address": {
                    "width": 20,
                },
            },
            "table-finance": {
                "year": {
                    "comment": [
                        "please input the financial information for the previous fiscal year, and the year before",
                        "请填写上一年度,以及上上年度2年的财务信息",
                    ],
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                    "width": 15,
                },
                "total_asset": {
                    "validation": v.int_decimal,
                    "style": money_format_int,
                    "width": 15,
                },
                "net_asset": {
                    "validation": v.int_decimal,
                    "style": money_format_int,
                    "width": 15,
                },
                "revenue": {
                    "validation": v.int_decimal,
                    "style": money_format_int,
                    "width": 15,
                },
                "net_income": {
                    "validation": v.int_decimal,
                    "style": money_format_int,
                    "width": 15,
                },
                "retained_earning": {
                    "validation": v.int_decimal,
                    "style": money_format_int,
                    "width": 15,
                },
            },
            "table-government": {
                "translate": ["country", "department", "position"],
                "title_note": [
                    "Only for applicants over 18 years old",
                    "只需要填写18岁以上的申请人",
                ],
                "department": {
                    "width": 20,
                },
                "position": {
                    "width": 20,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "start_date": {"validation": v.date_format, "style": date_format},
            },
            "table-history": {
                "translate": [
                    "activity",
                    "city_and_country",
                    "status",
                    "name_of_company_or_school",
                ],
                "title_note": [
                    "List all activities in the past ten years or since your 18th birthday (if less than 28 years old). Note: 1. From top to bottom, start with the most recent history. 2. There should be no blank between each history. 3. Only applicants aged 18 or above need to fill in this part.",
                    "列举过去十年或18岁生日后(若小于28岁)所有从事的活动历史。注意:1. 从上到下，从最近的历史开始写。 2. 每段历史之间不允许有空档。3. 18岁以上的申请人才需要填写",
                ],
                "end_date": {"validation": v.date_format, "style": date_format},
                "start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "activity": {
                    "width": 30,
                },
                "city_and_country": {
                    "width": 20,
                },
                "name_of_company_or_school": {
                    "width": 30,
                },
            },
            "table-illtreatment": {
                "translate": ["location", "province", "country", "detail"],
                "title_note": [
                    "Have you witnessed/participated in the abuse of prisoners,citizens, looting or desecration of places of worship. leave blank if not",
                    "你是否见证或参与过监狱中的虐待、公民的虐待、抢劫或破坏宗教场所。如果没有请留空",
                ],
                "location": {
                    "width": 20,
                },
                "detail": {
                    "width": 20,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "start_date": {"validation": v.date_format, "style": date_format},
            },
            "table-interviewrecord": {
                "accepted": {
                    "validation": v.yes_no,
                },
                "canadian_status": {
                    "validation": v.interview_canadian_status,
                },
                "interviewed": {
                    "validation": v.yes_no,
                },
                "offered": {
                    "validation": v.yes_no,
                },
                "record": {
                    "width": 50,
                },
            },
            "table-rciclist": {
                "employer_legal_name": {"width": 25},
                "employer_operating_name": {"width": 25},
            },
            "info-rcic": {"province": {"validation": v.canada_provinces}},
            "table-language": {
                "title_note": [
                    "If it has been tested, select real for remark (remark), otherwise select estimated",
                    "如果已经考过,选择Real,如果是估计成绩,选择Estimation",
                ],
                "pin": {
                    "comment": ["input only for CELPIP test", "仅仅当考试类型是CELPIP时需要"],
                },
                "registration_number": {
                    "comment": [
                        "enter Registration  Number for  CELPIP,Test report  form number for  IELTS, Attestation  no. for TEF, N° de  l'attestation for TCF",
                        "CELPIP叫registration  number, IELTS叫 Test  report form number,  TEF叫Attestation n*,  TCF叫N° de  l'attestation",
                    ],
                },
                "remark": {
                    "validation": v.language_test_remark,
                    "comment": [
                        "If it has been tested, select real for remark (remark), otherwise select estimated",
                        "如果已经考过,选择Real,如果是估计成绩,选择Estimation",
                    ],
                },
                "report_date": {
                    "comment": [
                        "IELTS: administrator signature date,CELPIP: date of signing,TEF: date of session,TEF: date of session",
                        "IELTS: administrator signature date,CELPIP: date of signing,TEF: date of session,TEF: date of session",
                    ],
                    "validation": v.date_format,
                    "style": date_format,
                },
                "test_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "test_type": {
                    "validation": v.language_test_type,
                },
            },
            "table-marriage": {
                "sp_canada_status": {
                    "comment": [
                        "choose:Citizen, Visitor(including for tourism, business, and family visit),Student,Worker,Other",
                        "请选择:Citizen (公民),Visitor(访问者,包括旅游,探亲,商务等),Student(学生),Worker(工人),Other(其他)",
                    ],
                },
            },
            "table-member": {
                "translate": [
                    "organization_name",
                    "organization_type",
                    "position",
                    "city",
                    "province",
                    "country",
                ],
                "title_note": [
                    "Only for applicants over 18 years old",
                    "只需要填写18岁以上的申请人",
                ],
                "organization_name": {
                    "width": 30,
                },
                "organization_type": {
                    "comment": [
                        "Example:Religious,Political,Trade Union,Professional,Other",
                        "比如:宗教,政治,工会,专业,其他",
                    ],
                    "width": 20,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "start_date": {"validation": v.date_format, "style": date_format},
            },
            "table-military": {
                "translate": [
                    "country",
                    "service_detail",
                    "rank",
                    "combat_detail",
                    "reason_for_end",
                ],
                "title_note": [
                    "Only for applicants over 18 years old",
                    "只需要填写18岁以上的申请人",
                ],
                "combat_detail": {
                    "comment": [
                        "Dates and places of any active aombat",
                        "参加过的战斗的时间、地点",
                    ],
                    "width": 30,
                },
                "end_date": {"validation": v.date_format, "style": date_format},
                "reason_for_end": {
                    "comment": [
                        "reasons for end of " "service, e.g,retired or be " "released",
                        "说明结束这段服役经历的原因,比如退役...",
                    ],
                    "width": 30,
                },
                "service_detail": {
                    "comment": [
                        "the information of the Branch of service, Unit numbers, and name of your commanding officers",
                        "你的部队信息： 部门,番号,长官姓名",
                    ],
                    "width": 30,
                },
                "start_date": {"validation": v.date_format, "style": date_format},
            },
            "table-personid": {
                "title_note": [
                    "Fill in all current valid documents, including: valid passports from all countries, ID cards, and permanent resident status from other countries",
                    "请填写所有有效的证件,包括:所有国家的有效护照,身份证,其他国家的永久居民身份证",
                ],
                "translate": ["country"],
                "variable_type": {"width": 20},
                "display_type": {"width": 20},
                "number": {
                    "width": 25,
                    "comment": ["Please enter the number of the document", "请填写证件号码"],
                },
                "expiry_date": {
                    "comment": [
                        "if there is no expiry date,then put the date of current date plus another 30 years",
                        "如果没有到期日期,请填写当前日期加上30年的日期",
                    ],
                    "validation": v.date_format,
                    "style": date_format,
                },
                "issue_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
            },
            "table-phone": {
                "display_type": {
                    "width": 20,
                },
                "cellular": {
                    "comment": [
                        "mobile phone number recommended, if no mobile phone number, inputfamily number, or work number",
                        "优选手机作为通讯选择。如果有手机,只填写手机即可,如果没有,依次可以选择家庭电话,工作电话",
                    ],
                },
                "country_code": {
                    "comment": [
                        "Only number, no + or other symbols",
                        "只填写数字,不要填写+或其他符号",
                    ],
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
                "number": {
                    "comment": [
                        "Write area code together with the phone number, no space between them, if there is area code",
                        "如果有区号，请把区号和电话号码写在一起,不要用空格隔开",
                    ],
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
                "ext": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
            },
            "table-sponsorfamilysize": {
                "children": {
                    "comment": [
                        "The number of children under 22 and has no spouse or common-law partner",
                        "22岁以下未婚或有同居伴侣的",
                    ],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                },
                "spouse": {
                    "comment": [
                        "if co-sign, include them for all 4 years, NO MATTER WHEN GOT MARRIED; if not co-sign, include them from the qualified year as a spouse or c-l partner,includes one's children",
                        "如果是共同签名,则应将其包括在所有 4 年内,无论何时结婚; 如果不是共同签名,则应从符合条件的配偶或共同生活伴侣年度开始计入。包括其孩子",
                    ],
                    "validation": v.positive_int_include_zero,
                    "style": int_number_format,
                    "width": 15,
                },
                "year": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
            },
            "table-familysize": {
                "year": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                },
                "sponsor_spouse": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                    "width": 15,
                },
                "sponros_children": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                    "width": 15,
                },
                "previous_sponsored": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                    "width": 15,
                },
                "pa_spouse": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                    "width": 15,
                },
                "pa_children": {
                    "validation": v.positive_int,
                    "style": int_number_format,
                    "width": 15,
                },
            },
            "table-sponsorincome": {
                "ei_regualar_benefits": {
                    "comment": ["Refer to NOA " "line 11900", "参考NOA第11900行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "oas": {
                    "comment": ["Refer to NOA line 11300", "参考NOA第11300行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "prov_payment_training": {
                    "comment": ["Refer to  " "(T4A-Box 028)", "参考 (T4A-Box " "028)"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 25,
                },
                "prov_social_assistanance": {
                    "comment": ["Refer to " "NOA line " "14500", "参考NOA第14500行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "refuge_rap_payment": {
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "total_income": {
                    "comment": ["Refer to the Line 15000 " "in NOA", "参考NOA第15000行"],
                    "validation": v.positive_int_include_zero,
                    "style": money_format_int,
                    "width": 15,
                },
                "year": {
                    "validation": v.positive_int,
                    "style": int_number_format_without_comma,
                    "width": 6,
                },
            },
            "table-travel": {
                "translate": ["destination", "purpose"],
                "title_note": [
                    "1. Only fill in the past 10 years 2. Not required for the country of nationality and current residence 3. Only for applicants over 18 years old",
                    "1. 只填写过去10年的旅行记录 2. 不需要填写现居住国和国籍国 3. 只需要填写18岁以上的申请人",
                ],
                "end_date": {"validation": v.date_format, "style": date_format},
                "length": {"validation": v.positive_int, "style": int_number_format},
                "start_date": {
                    "validation": v.date_format,
                    "style": date_format,
                },
                "destination": {"width": 20},
                "purpose": {"width": 20},
            },
        }
