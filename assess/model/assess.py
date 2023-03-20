""" 
Assess Model
- Used for assessing 
"""

from pydantic import BaseModel, EmailStr, root_validator, validator
from typing import List, Optional, Union
from datetime import date
from base.models.commonmodel import CommonModel
from base.models.educationbase import EducationBase, EducationHistory
from base.models.employmentbase import EmploymentBase
from base.models.employmenthistory import EmploymentHistory
from base.models.language import LanguageBase, Languages
from base.models.utils import makeList
from base.namespace import Language as Language_Enum
from assess.model.stage import Stage,Stages
from base.utils.utils import age as get_age
from assess.model.solution import Solutions
from base.utils.canada import province_abbr
from base.utils.client.show import console
import pickle


class Personal(BaseModel):
    last_name: str
    first_name: str
    native_last_name: str
    native_first_name: str
    sex: str
    dob: date
    email: Optional[EmailStr]
    has_sibling_canadian: bool

    @property
    def age(self):
        return get_age(self.dob)

    def salution(self, language: Language_Enum = Language_Enum.ENGLISH):
        if self.sex.upper() == "MALE":
            return (
                f"Mr. {self.first_name} {self.last_name}"
                if language == Language_Enum.ENGLISH
                else f"{self.native_last_name}{self.native_first_name}先生"
            )
        else:
            return (
                f"Ms. {self.first_name} {self.last_name}"
                if language == Language_Enum.ENGLISH
                else f"{self.native_last_name}{self.native_first_name}女士"
            )


class Status(BaseModel):
    current_country: str
    current_country_status: str
    current_workpermit_type: Optional[str]
    has_vr: Optional[bool]


class Language(LanguageBase):
    remark:str


class Education(EducationBase):
    is_trade: bool
    academic_year: float
    city: str
    province: str
    country: str


class Employment(EmploymentBase):
    employment_type: str  # self-employed or employed
    company: str
    city: Optional[str]
    province: Optional[str]
    country: str
    share_percentage: float
    work_under_status: Optional[str]
    duties: List[str]

    _normalize_duties = validator("duties", allow_reuse=True, pre=True)(makeList)

    """ 
    1. if country is Canada:
    - province and city is must; otherwise, it's optional.
    - work_under_status is must
    
    """

    @root_validator(pre=True)
    def validate_canada(cls, values):
        if values["country"].upper() == "CANADA":
            if values["province"] is None or values["province"] not in province_abbr:
                raise ValueError(
                    "Province is missing or mis-spelled since the country is Canada"
                )
            if values["city"] is None:
                raise ValueError("City is required since the country is Canada")
            if values["work_under_status"] is None:
                raise ValueError(
                    "Work under status is required since the country is Canada"
                )
        return values


class AssessModel(BaseModel):
    personal: Personal
    status: Status
    language: List[Language]
    education: List[Education]
    employment: List[Employment]


class AssessModelE(CommonModel, AssessModel):
    def __init__(self, excels=None, output_excel_file=None, language=None):
        from base.models.utils import excel_language_path

        path = excel_language_path(language)
        mother_excels = [path + "/pa.xlsx"]
        super().__init__(
            excels, output_excel_file, mother_excels, globals(), language=language
        )


class Project(BaseModel):
    """Project for a family immigrating to Canada"""

    """ Principle Applicant """
    pa: Union[AssessModel, None] = None

    """ Spouse"""
    sp: Union[AssessModel, None] = None

    """ dependant children number (For all) """
    children_num: int = 0

    """# among all dependant children, how many unde 18 years old."""
    children_under18_num: int = 0

    """ stages in immigration path, exp: LMIA, WP,BCPNP,PR """
    immigration_path: List[Stage] = []

    """ Solutions for some stages"""
    solutions: List[Solutions] = []

    """ Temporary solution for previous calculation"""
    previous_solution: Stage=None
    
    def save(self,filename):
        with open(filename,'wb') as f:
            pickle.dump(self,f)
        console.print(f"Saved to {filename}",style="green")
        
    def load(self,filename):
        with open(filename, "rb") as file:
            data = pickle.load(file)
        self.pa=data.pa
        self.sp=data.sp
        self.children_num=data.children_num
        self.children_under18_num=data.children_under18_num
        self.immigration_path=data.immigration_path
        self.solutions=data.solutions
        self.previous_solution=data.previous_solution
        console.print(f"Loaded from {filename}",style="green")
    
    def show(self,args):
        if args.solutions:
            for s in self.solutions:
                s.show(markdown=args.markdown)
        if args.path:
            print(self.immigration_path)
        
        # print(self.pa)
        # print(self.sp)