from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Union, Optional
from .content_noc21 import DETAILS_NOC21
from .noccodes import noc_2021_v1, noc_2016, nocs_start_with
from .wage_noc16 import WAGE_NOC16
from .wage_noc21 import WAGE_NOC21
from .outlook_noc21 import OUTLOOK_NOC21
from .outlook_noc16 import OUTLOOK_NOC16
from .er import EconomicRegion, ER_LIST
from base.utils.province import Province
import json
from base.ai.ai import get_ai_answer
from base.utils.client.show import console, ConsoleTable
from dataclasses import dataclass
from base.utils.db import Collection

""" Define a dataclass for standard duty and its corresponding generated duty pair"""


@dataclass
class DutyPair:
    standard_duty: str
    generated_duty: str


""" Define a dataclass for generated noc duties"""


@dataclass
class GeneratedDuties:
    title: str
    industry: str
    work_location: str
    duties: List[DutyPair]

    """ Make the duties in  ConsoleTable"""

    def show(self, markdown=False):
        title = f"Generated Duties for {self.title} in {self.industry} industry in {self.work_location}"
        table_data = [["Standard Duties", "Generated Duties"]]
        values = [
            (duty["standard_duty"], duty["generated_duty"]) for duty in self.duties
        ]

        return ConsoleTable(title=title, table_data=table_data + values).show(
            markdown=markdown
        )

    """ Get the generated duties only in markdown list format"""

    def generated_duties_markdown(self, title_format="###"):
        title = f"{title_format} Generated Duties for {self.title} in {self.industry} industry in {self.work_location}\n"
        return title + "\n".join(
            [f"- {duty['generated_duty']}" for duty in self.duties]
        )

    @property
    def generated_duties(self):
        return [duty["generated_duty"] for duty in self.duties]


class NOCContant(BaseModel):
    noc_code: str = Field(min_length=5, max_length=5)

    @validator("noc_code")
    def noc_must_in_list(cls, v):
        if v not in noc_2021_v1:
            raise ValueError(f"{v} is not a valid V2021 noc code. ")
        return v

    # noc contents
    @property
    def details(self):
        return DETAILS_NOC21.get(self.noc_code)

    @property
    def title(self):
        return self.details["title"]

    # check if title includes keywords
    def title_include(self, keywords: list[str]):
        return all([keyword.lower() in self.title.lower() for keyword in keywords])

    @property
    def title_examples(self):
        return self.details["title_examples"]

    def title_examples_include(self, keywords: list[str]):
        examples_include = []
        for example in self.title_examples:
            if all([keyword.lower() in example.lower() for keyword in keywords]):
                examples_include.append(True)
        return any(examples_include)

    @property
    def main_duties(self):
        return self.details["main_duties"]

    def main_duties_include(self, keywords: list[str]):
        duties_include = []
        for duty in self.main_duties:
            if all([keyword.lower() in duty.lower() for keyword in keywords]):
                duties_include.append(True)
        return any(duties_include)

    @property
    def employment_requirement(self):
        return self.details["employment_requirement"]

    @property
    def additional_information(self):
        return self.details["additional_information"]

    @property
    def exclusion(self):
        return self.details["exclusion"]

    # outlook and wage
    def outlook(self, er_code):
        return AreaWageOutlook(noc_code=self.noc_code, er_code=er_code).outlook

    def wage(self, er_code):
        return AreaWageOutlook(noc_code=self.noc_code, er_code=er_code).wage

    def area_outlook(self, area_index: int):
        return self.outlook["area"][area_index]["outlook"]

    def province_outlook(self, prov_index: int):
        return self.outlook["province"][prov_index]["outlook"]

    @property
    def level(self):
        """NOC code's second number indicates its level as the following"""

        return int(self.noc_code[1])

    @property
    def category(self):
        return self.noc_code[0]

    @property
    def noc_level_16(self):
        levels = {0: "0", 1: "A", 2: "B", 3: "B", 4: "C", 5: "D"}
        return levels[self.level]

    """ Using GPT 3, generate noc duties based on noc code, industry, and work location"""

    def generate_duties(self, industry: str, work_location: str, temperature=0.5):
        standard_duties = (
            f"This time, the job title is {self.title}, industry is {industry}, and the location is {work_location}. The standard duties are: \n\n"
            + "\n".join(self.main_duties)
            + "\n\nPlease write specific duties for the above mentioned standard duties in the format as follows:\n\n"
        )

        output_format = """
        {
            "title": title,
            "industry": industry,
            "work_location": work_location,
            "duties": [{
                "standard_duty": "standard_duty",
                "generated_duty": "generated_duty"
                },
                {
                "standard_duty": "standard_duty",
                "generated_duty": "generated_duty"
                }
                ]
        }
        """
        # output_format = "output the duties with markdown table, in which the standard one is on left, and the generated one is on right."

        rules = """
Ignore all previous instructions. My job is to write job duties for various positions. In Canada, each job has a NOC code and corresponding job duties description. The job duties that I write must have a corresponding relationship to the NOC code of the position and be specific to the industry or location.\n
        """

        industry_location = (
            f"the industry is {industry}, and work location is  {work_location}"
        )

        prompt = rules + standard_duties + output_format
        answer = get_ai_answer(prompt, temperature=temperature)
        duties = GeneratedDuties(**answer)
        return duties


class NOCContents:
    def __init__(self):
        self.teers = [NOCContant(noc_code=noc_code) for noc_code in noc_2021_v1]

    def find(self, keywords: list[str], title_examples=False, main_duties=False):
        matched_teers = []
        for teer in self.teers:
            if teer.title_include(keywords):
                matched_teers.append(teer)
            elif title_examples and teer.title_examples_include(keywords):
                matched_teers.append(teer)
            elif main_duties and teer.main_duties_include(keywords):
                matched_teers.append(teer)
        return matched_teers


class Wage(BaseModel):
    lowest: Union[float, str, None]
    median: Union[float, str, None]
    highest: Union[float, str, None]


class Outlook(BaseModel):
    outlook: Union[str, None]
    comment: Optional[str]

    @property
    def star(self):
        star_def = {
            "unavailable": 0,
            "undetermined": 0,
            "very limited": 1,
            "limited": 2,
            "moderate": 3,
            "good": 4,
            "very good": 5,
        }
        if self.outlook.lower() not in star_def:
            raise ValueError(f"{self.outlook} is not a valid outlook definition")
        return star_def[self.outlook]


class AreaWage(BaseModel):
    er_code: str = Field(min_length=2, max_length=4)
    noc_code: str = Field(min_length=4, max_length=5)

    @root_validator
    def noc_must_in_list(cls, values):
        noc_code = values.get("noc_code")
        if len(noc_code) == 4 and noc_code not in noc_2016:
            raise ValueError(f"{noc_code} is not a valid V2016 noc code. ")
        if len(noc_code) == 5 and noc_code not in noc_2021_v1:
            raise ValueError(f"{noc_code} is not a valid V2021 noc code. ")
        return values

    @validator("er_code")
    def er_code_must_in_list(cls, v):
        if v not in ER_LIST:
            raise ValueError(f"{v} is not a valid Econoimc Region code. ")
        return v

    @property
    def wage(self):
        wages = (
            WAGE_NOC21[self.noc_code]["ER" + self.er_code]
            if len(self.noc_code) == 5
            else WAGE_NOC16[self.noc_code]["ER" + self.er_code]
        )
        return Wage(**wages)

    @property
    def er_name(self):
        return EconomicRegion().er_name(self.er_code)

    def get_report(self, with_er_name=True, with_title=True):
        report = []
        titles = ["NOC Code", "Lowest", "Median", "Highest", "ER Code"]
        values = [
            self.noc_code,
            self.wage.lowest,
            self.wage.median,
            self.wage.highest,
            self.er_code,
        ]
        if with_er_name:
            titles.append("ER Name")
            values.append(self.er_name)

        if with_title:
            report.append(titles)
        report.append(values)

        return report


class AreaOutlook(BaseModel):
    er_code: str = Field(min_length=2, max_length=4)
    noc_code: str
    data_set: dict = {}

    @validator("er_code")
    def er_code_check(cls, v):
        if v not in ER_LIST:
            raise ValueError(f"{v} is not a valid ER code. ")
        return v

    @property
    def outlook(self):
        map={
            "undetermined":"0",
            "very limited":"1",
            "limited":"2",
            "moderate":"3",
            "good":"4",
            "very good":"5",
        }
        outlook = self.data_set[self.noc_code][self.er_code]["outlook"].lower()
        comment = self.data_set[self.noc_code][self.er_code]["comment"]
        return Outlook(outlook=map.get(outlook,"N/A"), comment=comment)

    @property
    def er_name(self):
        return EconomicRegion().er_name(self.er_code)

    def get_report(self, with_er_name=True, with_title=True, with_comment=False):
        report = []
        titles = ["ER Code", "NOC Code", "Outlook"]
        values = [
            self.er_code,
            self.noc_code,
            self.outlook.outlook,
        ]
        if with_er_name:
            titles.append("ER Name")
            values.append(self.er_name)

        if with_comment:
            titles.append("Comment")
            values.append(self.outlook.comment)

        if with_title:
            report.append(titles)

        report.append(values)

        return report


class AreaOutlook16(AreaOutlook):
    noc_code: str = Field(min_length=4, max_length=4)
    data_set: dict = OUTLOOK_NOC16

    def __init__(self, noc_code="None", er_code=""):
        super().__init__(er_code=er_code, noc_code=noc_code)

    @validator("noc_code")
    def noc_must_in_list(cls, v):
        if v not in noc_2016:
            raise ValueError(f"{v} is not a valid V2016 noc code. ")
        return v


class AreaOutlook21(AreaOutlook):
    noc_code: str = Field(min_length=5, max_length=5)
    data_set: dict = OUTLOOK_NOC21

    def __init__(self, noc_code="", er_code=""):
        super().__init__(er_code=er_code, noc_code=noc_code)

    @validator("noc_code")
    def noc_must_in_list(cls, v):
        if v not in noc_2021_v1:
            raise ValueError(f"{v} is not a valid V2021 noc code. ")
        return v


class AreaWageOutlook(BaseModel):
    noc_code: str = Field(min_length=4, max_length=5)
    er_code: str = Field(min_length=2, max_length=4)

    @validator("er_code")
    def er_code_must_in_list(cls, v):
        if v not in ER_LIST:
            raise ValueError(f"{v} is not a valid Econoimc Region code. ")
        return v

    @property
    def outlook(self):
        return (
            AreaOutlook21(noc_code=self.noc_code, er_code=self.er_code).outlook
            if len(self.noc_code) == 5
            else AreaOutlook16(noc_code=self.noc_code, er_code=self.er_code).outlook
        )

    @property
    def wage(self):
        return AreaWage(er_code=self.er_code, noc_code=self.noc_code).wage

    @property
    def provincial_median_wage(self):
        return Province().get_by_er(self.er_code).median_wage

    def get_report(
        self,
        with_er_name=True,
        with_title=True,
        with_comment=False,
        with_noc_title=True,
    ):
        report = []
        titles = [
            "ER Code",
            "NOC Code",
            "Outlook",
            "Lowest",
            "Median",
            "Highest",
            "P-Median",
        ]

        # wage = AreaWage(er_code=self.er_code, noc_code=self.noc_code).wage
        values = [
            self.er_code,
            self.noc_code,
            self.outlook.outlook,
            self.wage.lowest,
            self.wage.median,
            self.wage.highest,
            self.provincial_median_wage,
        ]
        if with_er_name:
            titles.append("ER Name")
            values.append(EconomicRegion().er_name(self.er_code))

        if with_noc_title:
            titles.append("NOC Title")
            values.append(NOCContant(noc_code=self.noc_code).title)

        if with_comment:
            titles.append("Comment")
            values.append(outlook.comment)

        if with_title:
            report.append(titles)

        report.append(values)

        return report


def get_qualified_nocs(
    begin_str: str = "",
    outlook: int = 0,
    er_code="5920",
    median_wage: float = 0,
    greater=True,
):
    nocs = nocs_start_with(begin_str)
    areawageoutlooks = [AreaWageOutlook(noc_code=noc, er_code=er_code) for noc in nocs]
    return [
        areawageoutlook
        for areawageoutlook in areawageoutlooks
        if areawageoutlook.outlook.star >= outlook
        and type(areawageoutlook.wage.median) == float
        and (
            areawageoutlook.wage.median >= median_wage
            if greater
            else areawageoutlook.wage.median <= median_wage
        )
    ]


def get_special_nocs_by_program(program_name: str, er_code="5920"):
    programs = Collection("special_programs").find_all()
    streams = [
        program
        for program in programs
        if program["program"].lower() == program_name.lower()
    ]
    if not streams:
        programs = [program["program"] for program in programs]
        raise ValueError(
            f"Program {program_name} not found. Valid programs are {programs}"
        )

    for stream in streams:
        """assemble the nocs"""
        title = (
            f"Special NOC Codes for Program {program_name} stream {stream['stream']}"
        )
        header = [["NOC Code", "NOC Title", "Outlook", "Median"]]
        nocs = stream["noc_codes"].split(",")

        nocs = [NOCContant(noc_code=noc.strip()) for noc in nocs]
        values = [
            [
                noc.noc_code,
                noc.title,
                noc.outlook(er_code).star,
                noc.wage(er_code).median,
            ]
            for noc in nocs
        ]
        table = ConsoleTable(title=title, table_data=header + values)
        yield table
