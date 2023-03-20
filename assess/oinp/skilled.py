from pydantic import BaseModel, validator
from assess.model.scoringengine import getKeyValuePoint, getRangePoint
from . import skilled_data as od
from rich.markdown import Markdown
from assess.model.scoringbase import ScoringBase
from assess.nocs.noccodes import noc_2021_v1
from assess.nocs.model import NOCContant
from assess.model.chancebase import ITABases
from . import skilled_data as sw
from datetime import date, timedelta, datetime
import json
from base.namespace import OINPProgram
from base.utils.client.show import ConsoleTable
from base.utils.utils import transpose_list
from assess.model.solution import Solutions
from typing import List
from base.namespace import Language, get_stage_name_by_string
from assess.model.stage import Stage


class Scoring(ScoringBase):
    noc_code: str
    hourly_rate: float
    has_workpermit: bool
    worked6m: bool
    earning_40k_plus: bool
    area: int

    @validator("noc_code")
    def validate_noc_code(cls, v):
        if v not in noc_2021_v1:
            raise ValueError(f"{v} is not a valid NOC 2021 code")
        return v

    @property
    def noc(self):
        return NOCContant(noc_code=self.noc_code)

    @property
    def teer_level_point(self):
        return getKeyValuePoint(od.teer_level_points, self.noc.level)

    @property
    def category_point(self):
        return getKeyValuePoint(od.category_points, self.noc.category)

    @property
    def hourly_rate_point(self):
        return getRangePoint(od.hourly_rate_points, self.hourly_rate)

    @property
    def wrokpermit_point(self):
        return getKeyValuePoint(od.workpermit_points, self.has_workpermit)

    @property
    def working_6m_plus_point(self):
        return getKeyValuePoint(od.woring_6m_plus_points, self.worked6m)

    @property
    def earning_4k_plus_point(self):
        return getKeyValuePoint(od.earning_40k_plus_points, self.earning_40k_plus)

    @property
    def area_point(self):
        return getKeyValuePoint(od.area_points, self.area)

    @property
    def basic_points_detail(self):
        return {
            "item_points": {
                "Teer level": {
                    "item_chinese": "TEER级别",
                    "description": "NOC TEER category",
                    "point": 10,  # maximum point for this item
                    "value": self.noc.level,
                    "score": self.teer_level_point,
                },
                "Teer category": {
                    "item_chinese": "TEER分类",
                    "description": "NOC broad occupational category",
                    "point": 10,
                    "value": self.noc.category,
                    "score": self.category_point,
                },
                "Hourly rate ": {
                    "item_chinese": "时薪",
                    "description": "Hourly rate",
                    "point": 10,
                    "value": self.hourly_rate,
                    "score": self.hourly_rate_point,
                },
                "Has workpermit": {
                    "item_chinese": "有合法工签",
                    "description": "With valid work permit",
                    "point": 10,
                    "value": "Yes" if self.has_workpermit else "NO",
                    "score": self.wrokpermit_point,
                },
                "Working more than 6 months": {
                    "item_chinese": "在Joboffer职位工作超过6个月",
                    "description": "6 months or more working in job offer position ",
                    "point": 3,
                    "value": "Yes" if self.worked6m else "No",
                    "score": self.working_6m_plus_point,
                },
                "Earning more than 40K": {
                    "item_chinese": "超过4万加元收入",
                    "description": "$40k or more earnings in a year.",
                    "point": 3,
                    "value": "Yes" if self.earning_40k_plus else "No",
                    "score": self.earning_4k_plus_point,
                },
                "Area": {
                    "item_chinese": "地区",
                    "description": "Area of employment within ON",
                    "point": 10,
                    "value": od.areas.get(self.area, "Wrong area"),
                    "score": self.area_point,
                },
            },
            "category_points": {
                "Job offer": {
                    "item_chinese": "工作Offer",
                    "point": 30,
                    "score": self.teer_level_point
                    + self.category_point
                    + self.hourly_rate_point,
                },
                "Work status": {
                    "item_chinese": "工作状态",
                    "point": 16,
                    "score": self.wrokpermit_point
                    + self.working_6m_plus_point
                    + self.earning_4k_plus_point,
                },
                "Area within ON": {
                    "item_chinese": "地区",
                    "point": 25,
                    "score": self.area_point,
                },
            },
        }


# Foreign Worker stream
class ScoringFW(Scoring):
    clb: int
    num_official_language: int = 1

    def __init__(self, **args):
        super().__init__(**args)

    @property
    def language_point(self):
        return getKeyValuePoint(od.language_points, self.clb)

    @property
    def num_official_luanguage_point(self):
        return getKeyValuePoint(
            od.num_official_language_points, self.num_official_language
        )

    @property
    def total_point(self):
        return (
            self.teer_level_point
            + self.category_point
            + self.hourly_rate_point
            + self.wrokpermit_point
            + self.working_6m_plus_point
            + self.earning_4k_plus_point
            + self.language_point
            + self.num_official_luanguage_point
            + self.area_point
        )

    @property
    def points_detail(self):
        item_points = {
            **self.basic_points_detail["item_points"],
            "Language level": {
                "item_chinese": "语言水平",
                "description": "Canadian Language Benchmark Level",
                "value": self.clb,
                "point": 10,
                "score": self.language_point,
            },
            "Knowledge of officla language": {
                "item_chinese": "掌握官方语言数量",
                "description": "Knowledge of official languages",
                "point": 10,
                "value": self.num_official_language,
                "score": self.num_official_luanguage_point,
            },
        }
        category_points = {
            **self.basic_points_detail["category_points"],
            "Language Proficiency in English or French": {
                "point": 20,
                "score": self.language_point + self.num_official_luanguage_point,
            },
        }
        return {"item_points": item_points, "category_points": category_points}


# Demand Skill stream
class ScoringDS(Scoring):
    def __init__(self, **args):
        super().__init__(**args)

    @property
    def total_point(self):
        return (
            self.teer_level_point
            + self.category_point
            + self.hourly_rate_point
            + self.wrokpermit_point
            + self.working_6m_plus_point
            + self.earning_4k_plus_point
            + self.area_point
        )

    @property
    def points_detail(self):
        return self.basic_points_detail


# International Graduates stream
class ScoringIG(Scoring):
    clb: int
    num_official_language: int = 1
    education: int = 4
    field: int = 3
    num_canadian_education: int = 1
    study_location: int = 0

    def __init__(self, **args):
        super().__init__(**args)

    @property
    def language_point(self):
        return getKeyValuePoint(od.language_points, self.clb)

    @property
    def num_official_luanguage_point(self):
        return getKeyValuePoint(
            od.num_official_language_points, self.num_official_language
        )

    @property
    def education_point(self):
        return getKeyValuePoint(od.education_points, self.education)

    @property
    def field_point(self):
        return getKeyValuePoint(od.field_points, self.field)

    @property
    def num_canadian_education_point(self):
        return getKeyValuePoint(
            od.num_canadian_education_points, self.num_canadian_education
        )

    @property
    def study_location_point(self):
        return getKeyValuePoint(od.study_location_poitns, self.study_location)

    @property
    def total_point(self):
        return (
            self.teer_level_point
            + self.category_point
            + self.hourly_rate_point
            + self.wrokpermit_point
            + self.working_6m_plus_point
            + self.earning_4k_plus_point
            + self.area_point
            # below is in this class
            + self.language_point
            + self.num_official_luanguage_point
            + self.education_point
            + self.field_point
            + self.num_canadian_education_point
            + self.study_location_point
        )

    @property
    def points_detail(self):
        item_points = {
            **self.basic_points_detail["item_points"],
            "Language level": {
                "item_chinese": "语言水平",
                "description": "Canadian Language Benchmark Level",
                "value": self.clb,
                "point": 10,
                "score": self.language_point,
            },
            "Knowledge of officla language": {
                "item_chinese": "掌握官方语言数量",
                "description": "Knowledge of official languages",
                "point": 10,
                "value": self.num_official_language,
                "score": self.num_official_luanguage_point,
            },
            "Hiest level of education": {
                "item_chinese": "最高学历",
                "description": "Highest level of education",
                "point": 10,
                "value": od.educations.get(self.education),
                "score": self.education_point,
            },
            "Field of study": {
                "item_chinese": "专业",
                "description": "Field of study",
                "point": 12,
                "value": self.field,
                "score": self.field_point,
            },
            "Canadian education experience": {
                "item_chinese": "加拿大证书数量",
                "description": "Canadian education experience",
                "point": 10,
                "value": self.num_canadian_education,
                "score": self.num_canadian_education_point,
            },
            "Location of study": {
                "item_chinese": "学习地点",
                "description": "Location of study",
                "point": 10,
                "value": od.areas.get(self.study_location, "Wrong area"),
                "score": self.study_location_point,
            },
        }
        category_points = {
            **self.basic_points_detail["category_points"],
            "Language Proficiency in English or French": {
                "point": 20,
                "score": self.language_point + self.num_official_luanguage_point,
            },
            "Education": {
                "point": 42,
                "score": self.education_point
                + self.field_point
                + self.num_canadian_education_point
                + self.study_location_point,
            },
        }
        return {"item_points": item_points, "category_points": category_points}


class ScoringMG_PG(ScoringBase):
    has_workpermit: bool
    earning_40k_plus: bool
    field: int
    study_location: int
    num_canadian_education: int
    clb: int
    num_official_language: int

    @property
    def wrokpermit_point(self):
        return getKeyValuePoint(od.workpermit_points, self.has_workpermit)

    @property
    def earning_4k_plus_point(self):
        return getKeyValuePoint(od.earning_40k_plus_points, self.earning_40k_plus)

    @property
    def field_point(self):
        return getKeyValuePoint(od.field_points, self.field)

    @property
    def study_location_point(self):
        return getKeyValuePoint(od.study_location_poitns, self.study_location)

    @property
    def num_canadian_education_point(self):
        return getKeyValuePoint(
            od.num_canadian_education_points, self.num_canadian_education
        )

    @property
    def language_point(self):
        return getKeyValuePoint(od.language_points, self.clb)

    @property
    def num_official_luanguage_point(self):
        return getKeyValuePoint(
            od.num_official_language_points, self.num_official_language
        )

    @property
    def total_point(self):
        return (
            self.wrokpermit_point
            + self.earning_4k_plus_point
            + self.language_point
            + self.num_official_luanguage_point
            + self.field_point
            + self.num_canadian_education_point
            + self.study_location_point
        )

    @property
    def points_detail(self):
        item_points = {
            "Has workpermit": {
                "item_chinese": "有合法工签",
                "description": "With valid work permit",
                "point": 10,
                "value": "Yes" if self.has_workpermit else "NO",
                "score": self.wrokpermit_point,
            },
            "Earning more than 40K": {
                "item_chinese": "超过4万加元收入",
                "description": "$40k or more earnings in a year.",
                "point": 3,
                "value": "Yes" if self.earning_40k_plus else "No",
                "score": self.earning_4k_plus_point,
            },
            "Language level": {
                "item_chinese": "语言水平",
                "description": "Canadian Language Benchmark Level",
                "value": self.clb,
                "point": 10,
                "score": self.language_point,
            },
            "Knowledge of officla language": {
                "item_chinese": "掌握官方语言数量",
                "description": "Knowledge of official languages",
                "point": 10,
                "value": self.num_official_language,
                "score": self.num_official_luanguage_point,
            },
            "Field of study": {
                "item_chinese": "专业",
                "description": "Field of study",
                "point": 12,
                "value": self.field,
                "score": self.field_point,
            },
            "Canadian education experience": {
                "item_chinese": "加拿大证书数量",
                "description": "Canadian education experience",
                "point": 10,
                "value": self.num_canadian_education,
                "score": self.num_canadian_education_point,
            },
            "Location of study": {
                "item_chinese": "学习地点",
                "description": "Location of study",
                "point": 10,
                "value": od.areas.get(self.study_location, "Wrong area"),
                "score": self.study_location_point,
            },
        }
        category_points = {
            "Work status": {
                "item_chinese": "工作状态",
                "point": 13,
                "score": self.wrokpermit_point + self.earning_4k_plus_point,
            },
            "Language Proficiency in English or French": {
                "point": 20,
                "score": self.language_point + self.num_official_luanguage_point,
            },
            "Education": {
                "point": 42,
                "score": self.field_point
                + self.num_canadian_education_point
                + self.study_location_point,
            },
        }
        return {"item_points": item_points, "category_points": category_points}


class OINP_Skill(Stage):
    stream: str
    factors: dict

    @property
    def scoring(self):
        theScoring = Scoring
        if self.stream == OINPProgram.OINP_FOREIGN_WORKER.value:
            theScoring = ScoringFW
        elif self.stream == OINPProgram.OINP_DEMAND.value:
            theScoring = ScoringDS
        elif self.stream == OINPProgram.OINP_INTERNATIONAL_GRADUATE.value:
            theScoring = ScoringIG
        elif self.stream in [
            OINPProgram.OINP_MASTER_GRADUATE.value,
            OINPProgram.OINP_PHD_GRADUATE.value,
        ]:
            theScoring = ScoringMG_PG
        return theScoring(**self.factors)

    def get_possibility(
        self, start_date=date.today() - timedelta(days=365), end_date=date.today()
    ):
        return ITABases("oinp", start_date=start_date, end_date=end_date).get_chance(
            self.scoring.total_point,
            self.stream,
        )

    def get_ita_report(
        self,
        stream,
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
    ):

        return ITABases(
            "oinp",
            start_date=start_date,
            end_date=end_date,
        ).get_ita_report(stream)

    @staticmethod
    def info():
        with open("assess/oinp/info.txt", "r") as f:
            info_markdown = f.read()
        return Markdown(info_markdown)


class OINP_Skills(Solutions):
    """
    List of BCPNP_Skill objects. Can output tables for seriers of data combination
    """

    solutions: List[OINP_Skill]

    # Return a list of BCPNP Skill Immigration solutions including a title (with start date, end date, stream, target info), and in each solution, output factors, point, possiblity.
    def show(
        self,
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
        transpose=True,
        is_sorted=True,
        markdown=False,
        markdown_title_style="###",
    ):
        first_solution = self.solutions[0]
        rate = first_solution.get_possibility(start_date=start_date, end_date=end_date)
        stage_name = get_stage_name_by_string(first_solution.stage_name)
        title = f"Solutions List for stream {first_solution.stream} on program {stage_name}. \nPossibility analysis data from {start_date.isoformat()} to {end_date.isoformat()}\n ITA rounds:{rate.rounds} Min: {rate.min_score} Median: {rate.median_score} Max: {rate.max_score}"
        head_data = (
            ["Solution"]
            + ["Point", "ITA Rate"]
            + [
                item
                for item in self.solutions[0]
                .scoring.points_detail["item_points"]
                .keys()
            ]
        )
        table_data = []
        for solution in self.solutions:
            item_points = solution.scoring.points_detail["item_points"]
            ita_rate = solution.get_possibility(
                start_date=start_date, end_date=end_date
            ).percentage
            row_data = [
                solution.scoring.total_point,
                f"{ita_rate:.0%}",
            ] + [item["value"] for item in item_points.values()]
            table_data.append(row_data)

        # if do sort
        table_data = (
            sorted(table_data, key=lambda x: x[1], reverse=True)
            if is_sorted
            else table_data
        )  # sorted by Score

        """ add index"""
        [row.insert(0, str(index)) for index, row in enumerate(table_data)]

        # add head data in
        table_data.insert(0, head_data)
        # check if do transpose
        table_data = (
            transpose_list(table_data)
            if transpose and len(self.solutions) < 10
            else table_data
        )
        ConsoleTable(title=title, table_data=table_data).show(
            markdown=markdown, markdown_title_style=markdown_title_style
        )
