from pydantic import BaseModel, validator
from typing import List
from assess.model.scoringengine import getKeyValuePoint, getRangePoint
from . import skilled_data as bd
from rich.markdown import Markdown
from assess.model.scoringbase import ScoringBase
from assess.nocs.noccodes import noc_2021_v1
from .chance import ITAs, ITA
from . import skilled_data as sw
import json
from datetime import date, timedelta
from base.utils.utils import transpose_list
from assess.model.stage import Stage
from base.utils.db import Collection


class BCScoring(ScoringBase):
    work_experience: int
    is_working_in_the_position: bool
    has_one_year_canadian_experience: bool
    hourly_rate: float
    area: int
    regional_exp_alumni: bool
    education: int
    education_bonus: int
    professional_designation: bool
    clb: int
    english_french_above_clb4: bool

    @property
    def work_experience_point(self):
        return getRangePoint(bd.work_experience_points, self.work_experience)

    @property
    def working_in_the_position_point(self):
        return getKeyValuePoint(
            bd.working_in_the_position_points, self.is_working_in_the_position
        )

    @property
    def one_year_Canadian_work_experience_point(self):
        return getKeyValuePoint(
            bd.one_year_experience_point, self.has_one_year_canadian_experience
        )

    @property
    def educaiton_level_point(self):
        return getKeyValuePoint(bd.education_points, self.education)

    @property
    def education_bonus_point(self):
        return getKeyValuePoint(bd.education_bonus_points, self.education_bonus)

    @property
    def professional_designation_point(self):
        return getKeyValuePoint(
            bd.professional_designation, self.professional_designation
        )

    @property
    def language_level_point(self):
        return getKeyValuePoint(bd.language_points, self.clb)

    @property
    def language_bonus_point(self):
        return getKeyValuePoint(
            bd.english_french_above_clb4, self.english_french_above_clb4
        )

    @property
    def wage_point(self):
        return getRangePoint(bd.wage_points, self.hourly_rate)

    @property
    def region_point(self):
        return getKeyValuePoint(bd.region_points, self.area)

    @property
    def region_bonus_point(self):
        return getKeyValuePoint(bd.regional_bonus, self.regional_exp_alumni)

    @property
    def total_point(self):
        return (
            self.work_experience_point
            + self.working_in_the_position_point
            + self.one_year_Canadian_work_experience_point
            + self.educaiton_level_point
            + self.education_bonus_point
            + self.professional_designation_point
            + self.language_level_point
            + self.language_bonus_point
            + self.wage_point
            + self.region_point
            + self.region_bonus_point
        )

    @property
    def points_detail(self):
        return {
            "item_points": {
                "Work experience": {
                    "item_chinese": "工作经验",
                    "description": "The total  work experience of years at same or direct-related position during past  10 years",
                    "point": 20,  # maximum point for this item
                    "value": self.work_experience,
                    "score": self.work_experience_point,
                },
                "Work in the position": {
                    "item_chinese": "正在该Joboffer的职位工作",
                    "description": "Currently working full-time in B.C. for the employer in the occupation identified in the BC PNP registration",
                    "point": 10,
                    "value": "Yes" if self.is_working_in_the_position else "No",
                    "score": self.working_in_the_position_point,
                },
                "One year Canadian work experience ": {
                    "item_chinese": "1年加拿大直接工作经验",
                    "description": "At least 1 year of directly related experience in Canada",
                    "point": 10,
                    "value": "Yes" if self.has_one_year_canadian_experience else "No",
                    "score": self.one_year_Canadian_work_experience_point,
                },
                "Education level": {
                    "item_chinese": "教育水平",
                    "description": "Highest education level",
                    "point": 27,
                    "value": bd.education.get(self.education),
                    "score": self.educaiton_level_point,
                },
                "Education bonus": {
                    "item_chinese": "教育附加",
                    "description": "Additional points for education in B.C. or Canada",
                    "point": 8,
                    "value": bd.education_bonus.get(self.education_bonus, "No"),
                    "score": self.education_bonus_point,
                },
                "Professional designation": {
                    "item_chinese": "合格的专业技能",
                    "description": "Eligible professional designation in BC.",
                    "point": 5,
                    "value": "Yes" if self.professional_designation else "No",
                    "score": self.professional_designation_point,
                },
                "Language level": {
                    "item_chinese": "语言水平",
                    "description": "Canadian Language Benchmark Level",
                    "value": self.clb,
                    "point": 30,
                    "score": self.language_level_point,
                },
                "English and French above CLB 4": {
                    "item_chinese": "英法水平都超过CLB4",
                    "description": "Language proficiency in both English and French",
                    "point": 10,
                    "value": "Yes" if self.english_french_above_clb4 else "No",
                    "score": self.language_bonus_point,
                },
                "Hourly rate": {
                    "item_chinese": "小时工资",
                    "description": "Hourly Wage of the BC Job Offer",
                    "point": 55,
                    "value": self.hourly_rate,
                    "score": self.wage_point,
                },
                "Region": {
                    "item_chinese": "地区",
                    "description": "Area of employment within BC",
                    "point": 15,
                    "value": bd.areas.get(self.area, "Wrong area"),
                    "score": self.region_point,
                },
                "Regional additional": {
                    "item_chinese": "地区额外加分",
                    "description": "Regional Experience or regional Alumni",
                    "point": 10,
                    "value": "Yes" if self.regional_exp_alumni else "No",
                    "score": self.region_bonus_point,
                },
            },
            "category_points": {
                "Directly Related Work Experience": {
                    "item_chinese": "直接相关工作经验",
                    "point": 40,
                    "score": self.work_experience_point
                    + self.working_in_the_position_point
                    + self.one_year_Canadian_work_experience_point,
                },
                "Highest Level of Education": {
                    "item_chinese": "最高学历",
                    "point": 40,
                    "score": self.educaiton_level_point
                    + self.education_bonus_point
                    + self.professional_designation_point,
                },
                "Language Proficiency in English or French": {
                    "item_chinese": "英法语言水平",
                    "point": 40,
                    "score": self.language_level_point + self.language_bonus_point,
                },
                "Hourly Wage of the BC Job Offer": {
                    "item_chinese": "BC工作报价的小时工资",
                    "point": 55,
                    "score": self.wage_point,
                },
                "Area within BC": {
                    "item_chinese": "BC地区",
                    "point": 25,
                    "score": self.region_point + self.region_bonus_point,
                },
            },
        }
