from assess.model.scoringbase import ScoringBase
from assess.model.scoringengine import getKeyValuePoint, getRangePoint
from typing import Union, List
from assess.ee import ee_data as ed
from pydantic import BaseModel, validator
from assess.model.chancebase import ITABases
from datetime import date, timedelta
from assess.model.stage import Stage
from base.namespace import Language, get_stage_name_by_string
from base.utils.client.show import ConsoleTable
from base.utils.utils import transpose_list
from assess.model.solution import Solutions
from base.namespace import PRProgram as prp
from assess.ee.fsw import FSW
from base.utils.language import convert
from pydantic import root_validator
from rich.markdown import Markdown


# a class for calculating EE Points
class EEScoring(ScoringBase):
    with_spouse: bool
    age: int
    education: int
    studied: bool
    studied_years: int
    first_clbs: list[float]
    first_clbs_type: str
    second_clbs: Union[list[float], None]
    second_clbs_type: Union[str, None]
    canadian_work_experience: int
    foreign_work_experience: int
    with_trade_certification: bool
    aeo: bool
    noc_code: str
    canadian_relative: bool
    spouse_education: Union[int, None]
    spouse_clbs: Union[list[float], None]
    spouse_clbs_type: Union[str, None]
    spouse_canadian_work_experience: int
    pnp_nominated: bool
    spouse_studied_in_ca: bool = False

    @root_validator
    def convert_clbs(cls, values):
        values["first_clbs"] = convert(values["first_clbs"], values["first_clbs_type"])
        if values["second_clbs"]:
            values["second_clbs"] = convert(
                values["second_clbs"], values["second_clbs_type"]
            )
        if values["spouse_clbs"]:
            values["spouse_clbs"] = convert(
                values["spouse_clbs"], values["spouse_clbs_type"]
            )
        return values

    """ Get FSW points """

    @property
    def fsw_point(self):
        factors = {
            "age": self.age,
            "education": self.education,
            "clbs": self.first_clbs,
            "second_clbs": self.second_clbs,
            "spouse_clbs": self.spouse_clbs,
            "studied": self.studied,
            "spouse_studied": self.spouse_studied_in_ca,
            "worked": True if self.canadian_work_experience > 0 else False,
            "spouse_worked": True
            if self.spouse_canadian_work_experience > 0
            else False,
            "work_experience": self.foreign_work_experience,
            "aeo": self.aeo,
            "relative": self.canadian_relative,
        }
        fsw = FSW(**factors)
        return fsw.total_point

    @property
    def age_point(self):
        if self.age < 18 or self.age > 44:
            return 0
        elif self.age in range(20, 30):
            if self.with_spouse:
                return 100
            else:
                return 110
        else:
            return (
                getKeyValuePoint(ed.age_with_sp_points, self.age)
                if self.with_spouse
                else getKeyValuePoint(ed.age_without_sp_points, self.age)
            )

    # A. Core / human capital factors
    @property
    def education_point(self):
        data = (
            ed.edu_level_with_sp_points
            if self.with_spouse
            else ed.edu_level_without_sp_points
        )
        return getKeyValuePoint(data, self.education)

    @property
    def first_language_point(self):
        points = 0
        for clb in self.first_clbs:
            clb = 10 if clb > 10 else clb
            data = (
                ed.clb_with_sp_points if self.with_spouse else ed.clb_without_sp_points
            )
            points += getKeyValuePoint(data, clb)
        return points

    @property
    def second_language_point(self):
        if not self.second_clbs:
            return 0

        points = 0
        for clb in self.second_clbs:
            clb = 9 if clb > 9 else clb
            data = (
                ed.clb2_with_sp_points
                if self.with_spouse
                else ed.clb2_without_sp_points
            )
            points += getKeyValuePoint(data, clb)
        return points

    @property
    def language_point(self):
        return self.first_language_point + self.second_language_point

    @property
    def canadian_we_point(self):
        if self.canadian_work_experience < 1:
            return 0
        we = 5 if self.canadian_work_experience > 5 else self.canadian_work_experience
        data = (
            ed.canadian_work_experience_with_sp_points
            if self.with_spouse
            else ed.canadian_work_experience_without_sp_points
        )
        return getKeyValuePoint(data, we)

    # B. Spouse or common-law partner factors
    @property
    def sp_edu_point(self):
        return getKeyValuePoint(ed.sp_edu_points, self.spouse_education)

    @property
    def sp_language_point(self):
        if not self.spouse_clbs:
            return 0

        points = 0
        for clb in self.spouse_clbs:
            if clb >= 5:
                clb = 9 if clb > 9 else clb
                points += getKeyValuePoint(ed.sp_language_points, clb)
        return points

    @property
    def sp_ca_we_point(self):
        years = self.spouse_canadian_work_experience
        if not years:
            return 0
        if years < 1:
            return 0

        if years > 5:
            years = 5
        return getKeyValuePoint(ed.sp_ca_we_points, years)

    # CRS – C. Skill transferability factors (Maximum 100 points for this section)

    # With good official language proficiency (Canadian Language Benchmark Level [CLB] 7 or higher) and a post-secondary degree
    @property
    def _edu_language_point(self):
        clb = min(self.first_clbs) if self.first_clbs else 0
        if clb < 7:
            return 0
        data = ed.edu_language9_points if clb >= 9 else ed.edu_language7_points
        return getKeyValuePoint(data, clb)

    # With Canadian work experience and a post-secondary degree
    @property
    def _edu_ca_we_point(self):
        years = self.canadian_work_experience
        if years < 1:
            return 0

        if years >= 2:
            data = ed.edu_ca_we2_points
        else:
            data = ed.edu_ca_we1_points
        return getKeyValuePoint(data, self.education)

    @property
    def skill_transferability_education_points(self):
        score = self._edu_language_point + self._edu_ca_we_point
        return 50 if score > 50 else score

    # Foreign work experience – With good official language proficiency (Canadian Language Benchmark Level [CLB] 7 or higher)
    @property
    def _foreign_we_language_point(self):
        clb = min(self.first_clbs) if self.first_clbs else 0
        years = self.foreign_work_experience
        if years > 3:
            years = 3
        if clb < 7:
            return 0

        data = (
            ed.foreign_we_languange9_points
            if clb >= 9
            else ed.foreign_we_languange7_points
        )
        return getKeyValuePoint(data, years)

    # Foreign work experience – With Canadian work experience
    @property
    def _foreign_we_ca_we_point(self):
        foreign_years = self.foreign_work_experience
        ca_years = self.canadian_work_experience
        if foreign_years > 3:
            foreign_years = 3
        if ca_years < 1:
            return 0

        data = (
            ed.foreign_we_ca2_we_points
            if ca_years >= 2
            else ed.foreign_we_ca1_we_points
        )
        return getKeyValuePoint(data, foreign_years)

    @property
    def skill_transferability_foreign_work_points(self):
        score = self._foreign_we_language_point + self._foreign_we_ca_we_point
        return 50 if score > 50 else score

    # Certificate of qualification (trade occupations) – With good official language proficiency (Canadian Language Benchmark Level [CLB] 5 or higher)
    # Points for certificate of qualification + CLB 5 or more on all first official language abilities, one or more under 7 (Maximum 25 points)
    # Points for certificate of qualification + CLB 7 or more on all four first official language abilities (Maximum 50 points)

    @property
    def trade_language_point(self):
        clb = min(self.first_clbs) if self.first_clbs else 0
        if not self.with_trade_certification or clb < 5:
            return 0

        if clb >= 7:
            return 50
        elif clb >= 5:
            return 25

    @property
    def skill_transferability_points(self):
        return (
            self.trade_language_point
            + self.skill_transferability_foreign_work_points
            + self.skill_transferability_education_points
        )

    # CRS – D. Additional points (Maximum 600 points)
    @property
    def sibling_point(self):
        # 1. Sibling: brother or sister living in Canada who is a citizen or permanent resident of Canada	15
        return 15 if self.canadian_relative else 0

    @property
    def french_point(self):
        # Scored NCLC 7 or higher on all four French language skills and scored CLB 4 or lower in English (or didn’t take an English test)	25
        # Scored NCLC 7 or higher on all four French language skills and scored CLB 5 or higher on all four English skills	50
        nclc_points = 0
        if self.first_clbs_type.upper() == "F":
            if min(self.first_clbs) >= 7:
                if self.second_clbs:
                    nclc_points = 50 if min(self.second_clbs) >= 5 else 25
                elif self.second_clbs == None:
                    nclc_points = 25  # didn't take English test
        elif (
            self.second_clbs
            and self.second_clbs_type
            and self.second_clbs_type.upper() == "F"
        ):
            if self.second_clbs and min(self.second_clbs) >= 7:
                if self.first_clbs:
                    nclc_points = (
                        50 if min(self.first_clbs) >= 5 else 25
                    )  # first language must be existed
        return nclc_points

    @property
    def study_in_canada_point(self):
        # Post-secondary education in  Canada - credential of one or two years	15
        # Post-secondary education in  Canada - credential three years or longer	30

        edu_in_canada_points = 0
        if self.studied:
            if self.studied_years == 1 or self.studied_years == 2:
                edu_in_canada_points = 15
            elif self.studied_years >= 3:
                edu_in_canada_points = 30
        return edu_in_canada_points

    @property
    def aeo_point(self):
        # Arranged employment - NOC 00	200
        # Arranged emplorelative_pointsyment – any other NOC 0, A or B	50
        aeo_points = 0
        if self.aeo:
            aeo_points = 200 if self.noc_code[0:2] == "00" else 50
        return aeo_points

    @property
    def pnp_point(self):
        # Provincial or territorial nomination	600
        return 600 if self.pnp_nominated else 0

    @property
    def additional_point(self):
        point = (
            self.sibling_point
            + self.french_point
            + self.study_in_canada_point
            + self.aeo_point
            + self.pnp_point
        )
        return 600 if point > 600 else point

    @property
    def total_point(self):
        return (
            # A Core
            self.age_point
            + self.education_point
            + self.language_point
            + self.canadian_we_point
            # Spouse
            + self.sp_edu_point
            + self.sp_language_point
            + self.sp_ca_we_point
            # skill transferability
            + self.skill_transferability_points
            # Additional point
            + self.additional_point
        )

    @property
    def points_detail(self):
        return {
            "item_points": {
                "FSW Eligibility Point": {
                    "item_chinese": "FSW资格分数",
                    "description": "FSW Eligibility Point",
                    "point": 100,  # maximum point for this item
                    "value": self.fsw_point,
                    "score": self.fsw_point,
                },
                "Age": {
                    "item_chinese": "年龄",
                    "description": "Age",
                    "point": 110,  # maximum point for this item
                    "value": self.age,
                    "score": self.age_point,
                },
                "Level of education": {
                    "item_chinese": "教育程度",
                    "description": "Level of education",
                    "point": 150,
                    "value": ed.edu_levels.get(self.education, "Wrong level"),
                    "score": self.education_point,
                },
                "Language ": {
                    "item_chinese": "语言",
                    "description": "Language",
                    "point": 160,
                    "value": f"{self.first_clbs_type}: {self.first_clbs}\n2nd Lang: {self.second_clbs_type}: {self.second_clbs}",
                    "score": self.language_point,
                },
                "Canadian work experience": {
                    "item_chinese": "加拿大工作经验",
                    "description": "Canadian work experience",
                    "point": 80,
                    "value": self.canadian_work_experience,
                    "score": self.canadian_we_point,
                },
                "Spouse education": {
                    "item_chinese": "配偶教育水平",
                    "description": "Spouse education level",
                    "point": 10,
                    "value": ed.edu_levels.get(self.spouse_education, "None"),
                    "score": self.sp_edu_point,
                },
                "Spouse language": {
                    "item_chinese": "配偶语言水平",
                    "description": "Spouse language level",
                    "point": 20,
                    "value": self.spouse_clbs,
                    "score": self.sp_language_point,
                },
                "Spouse Canadian work experience": {
                    "item_chinese": "配偶加拿大工作经验",
                    "description": "Spouse Canadian work experience",
                    "point": 10,
                    "value": self.spouse_canadian_work_experience,
                    "score": self.sp_ca_we_point,
                },
                "Transferability: Education": {
                    "item_chinese": "技能转移性：教育",
                    "description": "Skill transferability factors: Education",
                    "point": 50,
                    "value": f'{ed.edu_levels.get(self.education,"Wrong education level")}\nclb: {self.first_clbs}\nWork Exp: {self.canadian_work_experience}',
                    "score": self.skill_transferability_education_points,
                },
                "Transferability: Foreign work experience": {
                    "item_chinese": "技能转移性：海外工作经验",
                    "description": "Skill transferability factors:Foreign work experience ",
                    "point": 50,
                    "value": f"clb: {self.first_clbs}\nForeign work exp: {self.foreign_work_experience}\nCanadian work exp: {self.canadian_work_experience}",
                    "score": self.skill_transferability_foreign_work_points,
                },
                "Certificate of qualification": {
                    "item_chinese": "技工证书",
                    "description": "Certificate of qualification (for people in trade occupations)",
                    "point": 50,
                    "value": "Yes" if self.with_trade_certification else "No",
                    "score": self.trade_language_point,
                },
                "Additional: Siblings": {
                    "item_chinese": "加拿大兄弟姐妹",
                    "description": "Brother or sister living in Canada (citizen or permanent resident)",
                    "point": 15,
                    "value": "Yes" if self.canadian_relative else "No",
                    "score": self.sibling_point,
                },
                "Additional: Siblings": {
                    "item_chinese": "加拿大兄弟姐妹",
                    "description": "Brother or sister living in Canada (citizen or permanent resident)",
                    "point": 15,
                    "value": "Yes" if self.canadian_relative else "No",
                    "score": self.sibling_point,
                },
                "Additional: Siblings": {
                    "item_chinese": "附加分：加拿大兄弟姐妹",
                    "description": "Brother or sister living in Canada (citizen or permanent resident)",
                    "point": 15,
                    "value": "Yes" if self.canadian_relative else "No",
                    "score": self.sibling_point,
                },
                "Additional: French language": {
                    "item_chinese": "附加分：法语",
                    "description": "French language skills",
                    "point": 50,
                    "value": "Yes" if self.french_point > 0 else "No",
                    "score": self.french_point,
                },
                "Additional: Canadian post-secondary education": {
                    "item_chinese": "附加分：加拿大大学教育",
                    "description": "Additional: Canadian post-secondary education",
                    "point": 30,
                    "value": self.studied_years,
                    "score": self.study_in_canada_point,
                },
                "Additional: AEO": {
                    "item_chinese": "附加分： 合法的工作Offer",
                    "description": "Arranged employment",
                    "point": 200,
                    "value": "Yes" if self.aeo else "No",
                    "score": self.aeo_point,
                },
                "Additional: PNP nomination": {
                    "item_chinese": "附加分： 省提名",
                    "description": "PN nomination",
                    "point": 600,
                    "value": "Yes" if self.pnp_nominated else "No",
                    "score": self.pnp_point,
                },
            },
            "category_points": {
                "Core/Human capital factors": {
                    "item_chinese": "核心/人力资本因素",
                    "point": 500,
                    "score": self.age_point
                    + self.education_point
                    + self.language_point
                    + self.canadian_we_point,
                },
                "Spouse factors": {
                    "item_chinese": "配偶因素",
                    "point": 40,
                    "score": self.sp_edu_point
                    + self.sp_language_point
                    + self.sp_ca_we_point,
                },
                "Skill Transferablity": {
                    "item_chinese": "技能可转移性",
                    "point": 100,
                    "score": self.skill_transferability_points,
                },
                "Additional": {
                    "item_chinese": "其他",
                    "point": 600,
                    "score": self.additional_point,
                },
            },
        }


""" Stage name is 'ee', stream name is like 'all', 'pnp', 'fst', 'cec'"""


class EE(Stage, EEScoring):
    stream: str

    @validator("stream")
    def validate_stream(cls, v):
        if v not in [
            prp.PR_EE_ALL.value,
            prp.PR_EE_CEC.value,
            prp.PR_EE_FST.value,
            prp.PR_EE_PNP.value,
        ]:
            raise ValueError(f"{v} is not a valid EE stream")
        return v

    """ Get possibility of getting ITA"""

    def get_possibility(
        self, start_date=date.today() - timedelta(days=365), end_date=date.today()
    ):
        ita_bases = ITABases(self.stage_name, start_date=start_date, end_date=end_date)
        return ita_bases.get_chance(self.total_point, self.stream)

    def show_ita_records(
        self,
        stream,
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
        markdown=False,
    ):
        itas = ITABases(
            self.stage_name, start_date=start_date, end_date=end_date
        ).get_ita_report(stream)
        title = f"ITA records for stream {get_stage_name_by_string(stream)} from {start_date.isoformat()} to {end_date.isoformat()}"
        ConsoleTable(title=title, table_data=itas).show(markdown=markdown)

    @staticmethod
    def info():
        with open("assess/ee/info.txt", "r") as f:
            info_markdown = f.read()

        return Markdown(info_markdown)


class EEs(Solutions):
    solutions: List[EE]

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
        stream_name = get_stage_name_by_string(first_solution.stage_name)
        title = f"Solutions List for stream {stream_name}. \nPossibility analysis data from {start_date.isoformat()} to {end_date.isoformat()}\n ITA rounds:{rate.rounds} Min: {rate.min_score} Median: {rate.median_score} Max: {rate.max_score}"
        head_data = (
            ["Solution"]
            + ["Point", "ITA Rate"]
            + [item for item in first_solution.points_detail["item_points"].keys()]
        )
        table_data = []
        for solution in self.solutions:
            item_points = solution.points_detail["item_points"]
            row_data = [
                solution.total_point,
                solution.get_possibility(
                    start_date=start_date, end_date=end_date
                ).percentage,
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
        need_transpose = True if transpose and len(self.solutions) < 10 else False
        table_data = transpose_list(table_data) if need_transpose else table_data
        highlight = (
            {"highlight_rows": [0, 1, 2]}
            if need_transpose
            else {"highlight_cols": [0, 1, 2]}
        )
        ConsoleTable(title="EE Solutions", **highlight, table_data=table_data).show(
            markdown=markdown, markdown_title_style=markdown_title_style
        )
