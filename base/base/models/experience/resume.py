from .context import DATADIR
from email.policy import default
from textwrap import indent
from typing import List, Optional
from base.models.experience.resumedata import (
    Personal,
    Language,
    PersonalAssess,
    Education,
    Employment,
)
from base.models.commonmodel import CommonModel
from base.models.phone import Phone, Phones
from base.models.address import Address, Addresses
from pydantic import BaseModel


class ResumeModel(BaseModel):
    personal: Personal
    phone: List[Phone]
    personalassess: PersonalAssess
    education: List[Education]
    language: Optional[List[Language]]
    employment: Optional[List[Employment]]
    address: List[Address]

    def context(self, doc_type=None):
        return {
            **self.dict(),
            "phone": Phones(self.phone).PreferredPhone.international_format_full,
            "address": Addresses(self.address).PreferredAddress.full_address,
            "full_name": self.personal.full_name,
        }


class ResumeModelE(CommonModel, ResumeModel):
    def __init__(self, excels=None, output_excel_file=None,language=None):
        from base.models.utils import excel_language_path
        path=excel_language_path(language)
        mother_excels = [path+"/pa.xlsx"]
        super().__init__(excels, output_excel_file, mother_excels, globals())
