from pydantic import validator, root_validator
from typing import List, Union
from assess.model.solution import Solutions
from base.namespace import get_stage_name_by_string, LMIAStream
from rich.markdown import Markdown
from assess.nocs.noccodes import noc_2021_v1
from base.utils.client.show import ConsoleTable
from assess.model.stage import Stage
from assess.nocs.model import AreaWageOutlook, NOCContant
from assess.nocs.er import EconomicRegion, ER_LIST
from base.utils.db import Collection
from assess.model.fee import Fee, Fees
from base.utils.db import Collection

class LMIA(Stage):
    noc_code: str
    noc_title: Union[str, None] = None
    er_code: str
    hourly_rate: float
    support_pr: bool
    support_wp: bool
    possible_clb:int=0
    ee_qualified: bool=False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stage_name = self.stream

    @property
    def fees(self):
        if self.support_pr and not self.support_wp:
            the_fees = [
                Fee(
                    fee_name=self.stage_name,
                    description=["LMIA Fee", "LMIA 申请费"],
                    fee=0,
                    role="pa",
                )
            ]
            return Fees(
                fees=the_fees, stage_name=self.stage_name, language=self.language
            )
        else:
            return super().fees

    @root_validator
    def get_value_from_basic_input(cls, values):
        """noc_code, er_code, and hourly_rate is required to be inputed by user. Others will be calculated out"""
        noc_code = values.get("noc_code")
        if noc_code not in noc_2021_v1:
            raise ValueError(f"{noc_code} is not a valid V2021 noc code. ")

        er_code = values.get("er_code")
        if er_code not in ER_LIST:
            raise ValueError(f"{er_code} is not a valid Economic Region code. ")

        noc_title = values.get("noc_title")
        noc_title = noc_title or NOCContant(noc_code=noc_code).title

        values["noc_title"] = noc_title
        
        """ Check if ee qualified. 1. clb >-7 if level 0-3 2. clb>=5 if level >=4 and in fst noc list"""
        ee_fst_nocs=Collection("special_programs").find_one({"program": "EE", "stream": "FST"})["noc_codes"]
        possible_clb=values.get("possible_clb")
        
        def ee_qualified():
            level=NOCContant(noc_code=noc_code).level
            if level<=3:
                return True if possible_clb>=7 else False
            else:
                return True if possible_clb>=5 and noc_code in ee_fst_nocs else False
            
        ee_qualified=ee_qualified( )
        values["ee_qualified"]=ee_qualified
        
        if not ee_qualified and values["support_pr"]:
            raise ValueError(f"Applicant is not qualified for EE program because of his/her language level and/or noc level>=4 but the noc is not in FST list, but you required support PR by -p. ")
        
        return values

    @property
    def noc(self):
        return NOCContant(noc_code=self.noc_code)
    
    @property
    def get_area_wage_outlook(self):
        return AreaWageOutlook(noc_code=self.noc_code, er_code=self.er_code)

    @property
    def lowest(self):
        return self.get_area_wage_outlook.wage.lowest

    @property
    def median(self):
        return self.get_area_wage_outlook.wage.median

    @property
    def highest(self):
        return self.get_area_wage_outlook.wage.highest

    @property
    def provincial_median(self):
        return self.get_area_wage_outlook.provincial_median_wage

    @property
    def er_name(self):
        return EconomicRegion().er_name(er_code=self.er_code)

    @property
    def province(self):
        return EconomicRegion().get_prov(er_code=self.er_code)

    @staticmethod
    def info():
        with open("assess/lmia/info.txt") as f:
            info_markdown = f.read()
        return Markdown(info_markdown)

    @property
    def is_in_special_programs(self):
        result = []
        collection = Collection("imm_data").find_one({"name": "special_programs"})
        if not collection:
            return False
        for program in collection["data"]:
            if program["program"] == "LMIA" and self.noc_code in program["noc_codes"]:
                result.append(program["stream"])

        return (True, result) if len(result) > 0 else (False, result)

    @property
    def stream(self):
        """Check if higher than local median wage, if so, raise an error"""
        if self.hourly_rate < self.median:
            raise ValueError(
                f"The hourly rate{self.hourly_rate} is less than the local median wage {self.median}, so this LMIA could not be processed."
            )

        """ Check if higher than provincial median wage"""
        stream = (
            LMIAStream.HIGH_WAGE_STREAM.value
            if self.hourly_rate >= self.provincial_median
            else LMIAStream.LOW_WAGE_STREAM.value
        )
        self.stage_name = stream
        return stream

    @property
    def purpose(self):
        """Check if support PR"""
        purpose = ""
        if self.support_wp:
            purpose += "Work Permit / PR" if self.support_pr and self.ee_qualified else "Work Permit only"
        else:
            if self.support_pr:
                if self.ee_qualified:
                    purpose += "PR only ($1,000 application fee waived)"
                else:
                    raise ValueError(
                        "You only want to support PR, but the client is not qualified for EE, so it will not work."
                    )
            else:
                raise ValueError(
                    f"Your application support neither PR nor WP? What are you doing here? "
                )
        return purpose

    def specify_stream(self, special_stream):
        self.stage_name = special_stream

    @property
    def special_stream(self):
        """Check if the node is in a special stream"""
        is_special_program=self.is_in_special_programs
        if not is_special_program:
            return False
        is_special, stream = is_special_program
        return ", ".join(stream) if is_special else ""

    @property
    def solution(self):
        table_data = [["Key Parameter", "Value"]]
        title = "LMIA solution"
        rows = [
            ["NOC Title", self.noc_title],
            ["NOC Code", self.noc_code],
            ["ER Code", self.er_code],
            ["ER Name", self.er_name],
            ["Province", self.province],
            ["Hourly Rate", self.hourly_rate],
            [
                "Local Wages",
                f"Lowest: {self.lowest} Median: {self.median} Highest: {self.highest}",
            ],
            ["Provincial Median", self.provincial_median],
            ["Stream", get_stage_name_by_string(self.stream)],
            ["Purpose", self.purpose],
        ]
        """ Check if CAP calculation is required if it is LWS"""
        if self.is_cap_required():
            rows.append(["CAP", "CAP calculation is required."])
        
        """ Based on above, determine the stream, which could be a list"""
        if self.special_stream:
            rows.append(["Special Stream", self.special_stream])

        table_data += rows
        return ConsoleTable(title, table_data)

    def is_cap_required(self):
        
        # 1. Check if it is LWS
        if self.stream == LMIAStream.LOW_WAGE_STREAM.value:
            # 2. Check if it is ee qualified
            if self.ee_qualified:
                return False if self.support_pr else True
            return True
        return False
