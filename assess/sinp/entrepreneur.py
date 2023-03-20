from assess.model.scoringengine import (
    getKeyValuePoint,
    getRangePoint,
    getRangeWithFlagPoint,
)
from . import entrepreneur_data as sd
from rich.markdown import Markdown
from assess.model.scoringbase import ScoringBase
from assess.model.chancebase import ITABases
from datetime import date, timedelta
from assess.model.stage import Stage
from assess.model.solution import Solutions
from base.utils.client.show import ConsoleTable
from typing import List
from base.namespace import Language, get_stage_name_by_string
from base.utils.utils import transpose_list


class SKEPScoring(ScoringBase):
    age: int = 0  # unit: years
    visited: bool = False
    clb: int = 0
    edu_type: int = 0
    net_asset: float = 0
    work_experience: int = 0
    owership50p: bool = False
    business_revenue: float = 0
    innovation_experience: bool = False
    investment: float = 0
    key_economic: bool = False

    @property
    def age_point(self):
        return getRangePoint(sd.age_points, self.age)

    @property
    def visited_point(self):
        return getKeyValuePoint(sd.visited_points, self.visited)

    @property
    def language_level_point(self):
        return getKeyValuePoint(sd.language_points, self.clb)

    @property
    def edu_point(self):
        return getKeyValuePoint(sd.education_points, self.edu_type)

    @property
    def net_asset_point(self):
        return getRangePoint(sd.net_asset_points, self.net_asset)

    @property
    def experience_point(self):
        return getRangeWithFlagPoint(
            sd.experience_points,
            self.work_experience,
            flag=True,
            with_flag_point=sd.ownership50plus_flag_points,
        )

    @property
    def business_revenue_point(self):
        return getRangePoint(sd.business_revenue_points, self.business_revenue)

    @property
    def innovation_point(self):
        return getKeyValuePoint(sd.innovation_points, self.innovation_experience)

    @property
    def investment_point(self):
        return getRangePoint(sd.investment_points, self.investment)

    @property
    def key_economic_point(self):
        return getKeyValuePoint(sd.key_economic_points, self.key_economic)

    @property
    def total_point(self):
        return (
            self.age_point
            + self.visited_point
            + self.language_level_point
            + self.edu_point
            + self.net_asset_point
            + self.experience_point
            + self.business_revenue_point
            + self.innovation_point
            + self.investment_point
            + self.key_economic_point
        )

    @property
    def human_capital_point(self):
        return (
            self.age_point
            + self.visited_point
            + self.language_level_point
            + self.edu_point
            + self.net_asset_point
        )

    @property
    def business_experience_point(self):
        return (
            self.experience_point + self.business_revenue_point + self.innovation_point
        )

    @property
    def business_establishment_point(self):
        return self.investment_point + self.key_economic_point

    @property
    def points_detail(self):
        return {
            "item_points": {
                "Age": {
                    "item_chinese": "年龄",
                    "description": "Age",
                    "point": 15,  # maximum point for this item
                    "value": self.age,
                    "score": self.age_point,
                },
                "Exploratory visited": {
                    "item_chinese": "访问过萨省",
                    "description": "Has conducted an exploratory visit to Saskatchewan for at least five working days",
                    "point": 15,
                    "value": "Yes" if self.visited else "No",
                    "score": self.visited_point,
                },
                "Language ": {
                    "item_chinese": "语言水平CLB",
                    "description": "Language CLB level",
                    "point": 15,
                    "value": self.clb,
                    "score": self.language_level_point,
                },
                "Education level": {
                    "item_chinese": "教育水平",
                    "description": "Qualified education",
                    "point": 15,
                    "value": self.edu_type,
                    "score": self.edu_point,
                },
                "Net asset": {
                    "item_chinese": "个人净资产",
                    "description": "Net business and personal asset",
                    "point": 15,
                    "value": f"{self.net_asset:,.0f}",
                    "score": self.net_asset_point,
                },
                "Experience": {
                    "item_chinese": "工作经验",
                    "description": "Work experience",
                    "point": 20,
                    "value": self.work_experience,
                    "score": self.experience_point,
                },
                "Business revenue": {
                    "item_chinese": "现有生意营业额",
                    "description": "Current business revenue",
                    "value": f"{self.business_revenue:,.0f}",
                    "point": 20,
                    "score": self.business_revenue_point,
                },
                "Innovation": {
                    "item_chinese": "创新性工作经历",
                    "description": "Previous verifiable experience in: Export Trade, Registered patents, Gazelle business",
                    "point": 10,
                    "value": "Yes" if self.innovation_experience else "No",
                    "score": self.innovation_point,
                },
                "Investment": {
                    "item_chinese": "投资额",
                    "description": "Investment",
                    "point": 20,
                    "value": f"{self.investment:,.0f}",
                    "score": self.investment_point,
                },
                "key_economic": {
                    "item_chinese": "关键经济领域",
                    "description": "In key economic",
                    "point": 15,
                    "value": "Yes" if self.key_economic else "No",
                    "score": self.key_economic_point,
                },
            },
            "category_points": {
                "Human Capital": {
                    "item_chinese": "人力资本",
                    "point": 75,
                    "score": self.human_capital_point,
                },
                "Business Experience": {
                    "item_chinese": "生意经验",
                    "point": 50,
                    "score": self.business_experience_point,
                },
                "Business Establishment": {
                    "item_chinese": "商业成就",
                    "point": 35,
                    "score": self.business_establishment_point,
                },
            },
        }


class SINP_EP(Stage, SKEPScoring):
    # factors: dict

    # @property
    # def scoring(self):
    #     return Scoring(**self.factors)

    @staticmethod
    def info():
        with open("assess/sinp/info.txt", "r") as f:
            info_markdown = f.read()
        return Markdown(info_markdown)

    def get_possibility(
        self, start_date=date.today() - timedelta(days=365), end_date=date.today()
    ):
        return ITABases("sinp", start_date=start_date, end_date=end_date).get_chance(
            self.total_point, "sinp_ep"
        )

    def report(
        self,
        stream,
        language="English",
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
    ):
        return ITABases(
            "SINP",
            start_date=start_date,
            end_date=end_date,
        ).get_ita_report(stream)


""" Aggregation of EE """""
class SINP_EPs(Solutions):
    solutions: List[SINP_EP]

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
            ita_rate=solution.get_possibility(
                    start_date=start_date, end_date=end_date
                ).percentage
            row_data = [
                solution.total_point,
                f"{ita_rate:.1%}",
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
        need_transpose=True if transpose and len(self.solutions) < 10 else False
        table_data = (
            transpose_list(table_data)
            if  need_transpose
            else table_data
        )
        highlight={
                "highlight_rows":[0,1]
                
            } if need_transpose else {
                "highlight_cols":[0,1]
            }
        ConsoleTable(title=title, **highlight,table_data=table_data).show(
            markdown=markdown, markdown_title_style=markdown_title_style
        )