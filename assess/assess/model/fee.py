from pydantic import BaseModel
from typing import Literal, List, Union
from enum import Enum
from base.namespace import Language, get_stage_name_by_string
from base.utils.client.show import ConsoleTable


class Fee(BaseModel):
    fee_name: str
    description: List[str]
    fee: float
    role: Literal["pa", "sp", "dp", "dpu18", "each", "family", "group"]


class Fees:
    def __init__(
        self,
        fees: List[Fee],
        stage_name: str,
        language: Enum = Language.ENGLISH,
    ):
        self.name = stage_name
        self.language = language
        self.fees = fees

    def get_role(self, role: str):
        roles = {
            "pa": ["Principle Applicant", "主申请"],
            "sp": ["Spouse", "配偶"],
            "dp": ["Dependant Children", "孩子"],
            "dpu18": ["Dependant Child under 18", "18岁以下孩子"],
            "each": ["Each", "每人"],
            "family": ["Family", "家庭"],
            "group": ["Group", "团体"],
        }
        return roles[role][self.language.value]

    @property
    def total(self):
        return sum([f.fee for f in self.fees])

    def get_fee_table(self, with_title=True):
        titles = [["Payee", "Fee", "Description"], ["付款人", "金额", "说明"]]
        fees = [titles[self.language.value]] if with_title else []
        for f in self.fees:
            fees.append(
                [
                    self.get_role(f.role),
                    "$" + str(f.fee),
                    f.description[self.language.value],
                ]
            )
        fees.append(
            [
                "小计" if self.language == Language.CHINESE else "Total",
                "$" + str(self.total),
                "",
            ]
        )
        """ assemble the table"""
        title = f"Fee for {get_stage_name_by_string(self.name)}"
        table = ConsoleTable(title=title, table_data=fees, with_footer=True)

        return table
