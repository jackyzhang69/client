from pydantic import validator, EmailStr,root_validator,BaseModel
from typing import Optional, List
from base.models.employerbase import EmployerBase
from base.models.jobofferbase import JobofferBase
from base.models.address import Address, Addresses
from base.models.utils import makeList
from datetime import date
from base.models.utils import checkRow
from base.models.contact import ContactBase, Contacts
from base.models.mediaaccount import MediaAccount
from base.models.commonmodel import CommonModel

class General(EmployerBase):
    # company_intro: str
    recruit_email: EmailStr
    business_intro: str
    # cra_number: str
    # ft_employee_number: int
    # pt_employee_number: int
    # establish_date: date
    industry: str
    # registration_number: str


class JobOffer(JobofferBase):
    disability_insurance: bool
    dental_insurance: bool
    empolyer_provided_persion: bool
    extended_medical_insurance: bool
    extra_benefits: Optional[str]
    specific_edu_requirement: str
    skill_experience_requirement: str
    other_requirements: Optional[list]
    # offer_date: date
    # supervisor_name: Optional[str]
    # supervisor_title: Optional[str]
    # vacation_pay_days: int
    # vacation_pay_percentage: float
    # employer_rep: str
    # employer_rep_title: str
    payment_way: str
    has_probation: bool
    probation_duration: Optional[int]
    duties_brief: str
    duties: list

    _str2bool_duties = validator("duties", allow_reuse=True, pre=True)(makeList)

    @root_validator
    def checkProbation(cls, values):
        if values.get("has_probation") and not values.get("probation_duration"):
            raise ValueError(
                "Since it is has probation period, but you did not specify the probation duration in info-joboffer sheet"
            )
        return values

    @property
    def date_of_offer(self):
        return self.offer_date.strftime("%b %d, %Y")

    @property
    def vacation_pay_percent(self):
        return "{:,.1f}%".format(self.vacation_pay_percentage * 100)
    

    _str2bool_duties = validator("duties", allow_reuse=True, pre=True)(makeList)
    _str2bool_other_requirements = validator(
        "other_requirements", allow_reuse=True, pre=True
    )(makeList)

    @property
    def benefits(self):
        bs = []
        if self.disability_insurance:
            bs.append("Disability insurance")
        if self.dental_insurance:
            bs.append("Dental insurance")
        if self.empolyer_provided_persion:
            bs.append("Employer provided persion")
        if self.extended_medical_insurance:
            bs.append("Extended medical insurance")
        if self.extra_benefits:
            bs.append(self.extra_benefits)
        return ", ".join(bs)


class ErAddress(Address):
    def __init_subclass__(cls) -> None:
        return super().__init_subclass__()


class ErAddresses(Addresses):
    def __init__(self, address_list: List[Address]) -> None:
        super().__init__(address_list)



# class LmiaCase(BaseModel):
#     provincial_median_wage: float


class Contact(ContactBase):
    position: Optional[str]

    @root_validator
    def checkCompletion(cls, values):
        all_fields = ["last_name", "first_name", "phone", "email", "position"]
        required_fields = ["last_name", "first_name", "phone", "email", "position"]
        checkRow(values, all_fields, required_fields)
        return values


class JobPostModel(BaseModel):
    contact:List[Contact]
    eraddress:List[ErAddress]
    joboffer:JobOffer
    general:General
    mediaaccount:List[MediaAccount]
    
    
class JobPostModelE(CommonModel, JobPostModel):
    def __init__(self, excels=None, output_excel_file=None,language=None):
        from base.models.utils import excel_language_path
        path=excel_language_path(language)
        mother_excels = [path+"/er.xlsx",path+"/recruitment.xlsx"]
        super().__init__(excels, output_excel_file, mother_excels, globals())

    

