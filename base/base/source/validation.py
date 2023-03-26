"""
This module defines the validation rules for the source data    
"""

from datetime import date
from dataclasses import dataclass
from datetime import date
from base.namespace import Language


@dataclass
class Validation:
    language: Language = Language.ENGLISH

    yes_no = {"validate": "list", "source": ["Yes", "No"]}
    yes_no_exempt = {"validate": "list", "source": ["Yes", "No", "Exempt"]}
    language_test_remark = {"validate": "list", "source": ["Real", "Estimation"]}
    pr_renew_situation={
        "validate": "list",
        "source": ([
            " Renew your present PR card ",
            " Replace a lost, stolen or damaged PR card ",
            " Obtain your first PR card "
        ])
    }
    pr_travel_document =    {
        "validate": "list",
        "source": ([
            "Travel document",
            "PR travel document"
        ])
    }
    
    pr_absence_reasons={
        "validate": "list",
        "source": ([
            "A",
            "B",
            "C",
            "Other"
        ])
    }
    
    bcpnp_case_stream = {
        "validate": "list",
        "source": (
            [
                "EE-Skilled Worker",
                "EE-International Graduate",
                # "EE-International Post-Graduate",
                # "EE-Health Authority",
                "Skilled Worker",
                "International Graduate",
                # "Entry-Level and Semi-Skilled Worker",
                # "International Post-Graduate",
                # "Health Authority",
            ]
        ),
    }

    corporate_structure = {
        "validate": "list",
        "source": [
            "Incorporated",
            "Limited Liability Partnership",
            "Extra-provincially-registered",
            "federally-incorporated",
            "Other",
        ],
    }

    canada_provinces = {
        "validate": "list",
        "source": [
            "AB",
            "BC",
            "MB",
            "NB",
            "NL",
            "NS",
            "NT",
            "NU",
            "ON",
            "PE",
            "QC",
            "SK",
            "YT",
        ],
    }
    
    canada_provinces_full = {
        "validate": "list",
        "source": [
            "Newfoundland and Labrador",
            "Prince Edward Island",
            "Nova Scotia",
            "New Brunswick",
            "Quebec",
            "Ontario",
            "Manitoba",
            "Saskatchewan",
            "Alberta",
            "British Columbia",
            "Yukon",
            "Northwest Territories",
            "Nunavut",
        ],
    }

    

    english_french = {
        "validate": "list",
        "source": ["English", "French", "Both", "Neither"],
    }

    english_or_french = {"validate": "list", "source": ["English", "French"]}

    english_french_chinese = {
        "validate": "list",
        "source": ["Chinese", "English", "French"],
    }

    imm_status = {
        "validate": "list",
        "source": [
            "Citizen",
            "Permanent Resident",
            "Worker",
            "Student",
            "Visitor",
            "Refugess",
            "Other",
        ],
    }

    wage_unit = {
        "validate": "list",
        "source": ["hourly", "weekly", "monthly", "annually"],
    }
    payment_way = {
        "validate": "list",
        "source": ["weekly", "bi-weekly", "monthly"],
    }

    lmia_duration_unit = {"validate": "list", "source": ["months", "years"]}

    ot_after_hours_unit = {"validate": "list", "source": ["day", "week"]}

    job_duration_unit = {"validate": "list", "source": ["day", "week", "month", "year"]}

    purpose_of_lmia = {
        "validate": "list",
        "source": [
            "Supporting Permanent Resident only",
            "Supporting Work Permit only",
            "Supporting both Work Permit and Permanent Resident",
        ],
    }

    stream_of_lmia = {
        "validate": "list",
        "source": ["EE", "HWS", "LWS", "GTS", "AC", "AG", "CG"],
    }

    rent_unit = {"validate": "list", "source": ["week", "month"]}

    accommodation_type = {
        "validate": "list",
        "source": ["house", "apartment", "dorm", "other"],
    }

    sex = {"validate": "list", "source": ["Male", "Female"]}

    workpermit_type = {
        "validate": "list",
        "source": [
            "Co-op Work Permit",
            "Exemption from Labour Market Impact Assessment",
            "Labour Market Impact Assessment Stream",
            "Live-in Caregiver Program",
            "Open Work Permit",
            "Open work permit for vulnerable workers",
            "Other",
            "Post Graduation Work Permit",
            "Start-up Business Class",
            # "International Experience Canada (IEC)",
        ],
    }

    marital_status = {
        "validate": "list",
        "source": [
            "Annulled Marriage",
            "Common-Law",
            "Divorced",
            "Married",
            "Separated",
            "Single",
            "Unknown",
            "Widowed",
        ],
    }

    pre_relationship_type = {"validate": "list", "source": ["Common-Law", "Married"]}

    language_test_type = {
        "validate": "list",
        "source": ["IELTS", "CELPIP", "TEF", "TCF"],
    }

    education_level = {
        "validate": "list",
        "source": [
            "Doctor",
            "Master",
            "Post-graduate diploma",
            "Bachelor",
            "Associate",
            "Diploma/Certificate",
            "High school",
            "Less than high school",
        ],
    }

    trade_education_type = {
        "validate": "list",
        "source": [
            "Apprenticeship diploma/certificate",
            "Trade diploma/certificate",
            "Vocational school diploma/certificate",
        ],
    }

    relationship = {
        "validate": "list",
        "source": [
            "Grand Parent",
            "Parent",
            "Spouse",
            "Child",
            "Grand Child",
            "Sibling",
            "Aunt",
            "Uncle",
            "Niece",
            "Newphew",
            "Friend",
        ],
    }

    family_relationship = {
        "validate": "list",
        "source": [
            "Spouse",
            "Son",
            "Daughter",
            "Mother",
            "Father",
            "Brother",
            "Sister",
        ],
    }

    pr_imm_program = {"validate": "list", "source": ["Economic", "Family"]}

    pr_imm_category = {
        "validate": "list",
        "source": [
            "Provincial Nominee Program (PNP)",
            "Atlantic Immigration Program",
            "Self-Employed Persons Class",
            "Spouse",
            "Common-law Partner",
            "Dependent Child",
            "Other Relative",
        ],
    }

    pr_imm_under = {
        "validate": "list",
        "source": [
            "Spouse or common-law partner in Canada class",
            "Family class (outside Canada)",
        ],
    }

    interview_canadian_status = {
        "validate": "list",
        "source": ["Citizen", "PR", "Foreigner", "Unknown"],
    }

    tr_application_purpose = {
        "validate": "list",
        "source": ["apply or extend", "restore status", "TRP"],
    }

    sp_paid_person = {"validate": "list", "source": ["Myself", "Parents", "Other"]}

    vr_application_purpose = {
        "validate": "list",
        "source": [
            "apply or extend visitor record",
            "restore status as visotor",
            "TRP",
        ],
    }

    sp_in_application_purpose = {
        "validate": "list",
        "source": ["apply or extend study permit", "restore status as student", "TRP"],
    }

    sp_apply_wp_type = {
        "validate": "list",
        "source": [
            "Co-op Work Permit",
            "Open Work Permit",
            "Post Graduation Work Permit",
        ],
    }

    wp_in_application_purpose = {
        "validate": "list",
        "source": [
            "apply WP for same employer",
            "apply WP for new employer",
            "restore status as worker",
            "TRP with same employer",
            "TRP with new employer",
        ],
    }

    wp_apply_wp_type = {
        "validate": "list",
        "source": [
            "Co-op Work Permit",
            "Exemption from Labour Market Impact Assessment",
            "Labour Market Impact Assessment Stream",
            "Live-in Caregiver Program",
            "Open Work Permit",
            "Open Work Permit for Vulnerable Workers",
            "Other",
            "Post Graduation Work Permit",
            "Start-up Business Class",
        ],
    }
    visa_application_purpose = {
        "validate": "list",
        "source": ["Visitor Visa", "Transit"],
    }
    tr_original_purpose = {
        "validate": "list",
        "source": ["Business", "Tourism", "Study", "Work", "Other", "Family Visit"],
    }

    visit_purpose_5257 = {
        "validate": "list",
        "source": [
            "Business",
            "Tourism",
            "Short-Term Studies",
            "Returning Student",
            "Returning Worker",
            "Super Visa: For Parents or Grandparents",
            "Other",
            "Family Visit",
        ],
    }

    eye_color = {
        "validate": "list",
        "source": ["Black", "Brown", "Blue", "Green"],
    }

    employment_type = {
        "validate": "list",
        "source": ["Employed", "Self-employed"],
    }

    relationship_to_pa = {
        "validate": "list",
        "source": [
            "Adopted Child",
            "Child",
            "Common-law partner",
            "Grandchild",
            # "Other": "5: 85",
            "Spouse",
            "Step-Child",
            "Step-Grandchild",
            "Parent",
            "Adoptive Parent",
        ],
    }

    dependant_type = {
        "validate": "list",
        "source": [
            "Type A Dependant",
            "Type B Dependant",
            "Type C Dependant",
        ],
    }

    eca_supplier = {
        "validate": "list",
        "source": [
            "Comparative Education Service - University of Toronto School of Continuing Studies",
            "International Credential Assessment Service of Canada",
            "World Education Services",
            "International Qualifications Assessment Service",
            "International Credential Evaluation Service",
            # "Medical Council of Canada (for Doctors)",
            # "Pharmacy Examining Board of Canada (for Pharmacists)",
        ],
    }

    language_remark = {
        "validate": "list",
        "source": ["Test Score", "Estimation"],
    }

    cap_exemption_type = {
        "validate": "list",
        "source": [
            "Caregiver positions in a health care facility (NOC 3012, 3233, and 3413)",
            "On-farm primary agricultural positions",
            "Position for the Global Talent Stream",
            "Position(s) is/are highly mobile",
            "Position(s) is/are truly temporary",
            "Seasonal 270-day exemption",
        ],
    }

    months = {
        "validate": "list",
        "source": [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
    }

    waive_creteria = {
        "validate": "list",
        "source": [
            "Caregiver positions in health care institutions",
            "Limited duration positions",
            "On-farm primary agricultural positions",
            "Positions within a specialized occupation",
            "Unique skills or traits",
        ],
    }

    regional_exp_alumni = {
        "validate": "list",
        "source": [
            "Regional Experience",
            "Regional Alumni",
            "Does not apply",
        ],
    }

    @property
    def date_format(self):
        input_titles = ["Enter date", "请输入日期"]
        input_messages = ["Format:1999-06-30", "格式:1999-06-30"]
        return {
            "validate": "date",
            "criteria": ">",
            "value": date(1800, 1, 1),
            "input_title": input_titles[self.language.value],
            "input_message": input_messages[self.language.value],
        }

    @property
    def positive_int(self):
        input_titles = ["Positive integer", "请输入正整数"]
        input_messages = ["Must be greater than 0", "必须是大于0"]
        return {
            "validate": "integer",
            "criteria": ">",
            "value": 0,
            "input_title": input_titles[self.language.value],
            "input_message": input_messages[self.language.value],
        }

    @property
    def positive_int_include_zero(self):
        input_titles = ["Positive integer,includes 0", "请输入正整数,包括0"]
        input_messages = ["Greater than or equal to 0", "必须是大于或等于0"]
        return {
            "validate": "integer",
            "criteria": ">=",
            "value": 0,
            "input_title": input_titles[self.language.value],
            "input_message": input_messages[self.language.value],
        }

    @property
    def positive_int_decimal(self):
        input_titles = [
            "Integer or decimal >=0",
            "请输入正整数或小数,包括0",
        ]
        input_messages = ["Greater than or equal to 0", "必须是大于或等于0"]
        return {
            "validate": "decimal",
            "criteria": ">=",
            "value": 0,
            "input_title": input_titles[self.language.value],
            "input_message": input_messages[self.language.value],
        }

    @property
    def int_decimal(self):
        # input_titles = ["Integer or decimal", "整数或小数"]
        input_messages = [
            "integer or decimal",
            "整数或小数",
        ]
        return {
            "validate": "decimal",
            "criteria": "between",
            "minimum": -100000000000,
            "maximum": 100000000000,
            # "input_title": input_titles[self.language.value],
            "input_message": input_messages[self.language.value],
        }
