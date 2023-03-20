from unicodedata import category
from pydantic import BaseModel
from typing import List
from base.namespace import Language,get_stage_name_by_string
from base.utils.client.show import ConsoleTable
from enum import Enum

class ScoringBase(BaseModel):
    language: Enum = Language.ENGLISH

    @property
    def total_point(self):
        pass

    """ 
    . 1st level key is item_points (include item as key and its value) and category_points (include category nad its sub items points)
    """

    @property
    def points_detail(self):
        pass

    def make_order_by_percentage(self, title: list, items: list):
        # make item points list ordered by percentage
        def get_percentage(percentage):
            index = title.index(
                "百分比" if self.language == Language.CHINESE else "Percentage"
            )
            return percentage[index]

        items.sort(key=get_percentage, reverse=True)
        return items

    # return a points detail list with title
    def item_points(
        self, description=False, percentage=False, order_by_percetage=False
    ):
        items = []
        title = (
            ["项目", "事实", "分数"]
            if self.language == Language.CHINESE
            else ["Item", "Fact", "Score"]
        )
        footer = [
            "总分" if self.language == Language.CHINESE else "Total",
            "",
            f"{self.total_point}",
        ]
        if percentage:
            title.append("最高分" if self.language == Language.CHINESE else "Max Point")
            title.append("百分比" if self.language == Language.CHINESE else "Percentage")
            [footer.append("") for i in range(2)]

        if description:
            title.append("说明" if self.language == Language.CHINESE else "Description")
            [footer.append("") for i in range(2)]

        for item, detail in self.points_detail["item_points"].items():
            details = [
                detail["item_chinese"] if self.language == Language.CHINESE else item,
                str(detail.get("value")),
                str(detail.get("score", "0")),
            ]  # item and score is default output
            if percentage:
                score = detail.get("score")
                point = detail.get("point")
                the_percentage = float(f"{score/point:.2f}")

                details.append(str(detail.get("point")))
                details.append(the_percentage)
            if description:
                details.append(detail.get("description"))
            items.append(details)

        if percentage:
            if order_by_percetage:
                items = self.make_order_by_percentage(title, items)
            # format percentage with %
            for item in items:
                index = title.index(
                    "百分比" if self.language == Language.CHINESE else "Percentage"
                )
                item[index] = f"{item[index]:.1%}"

        items.insert(0, title)
        items.append(footer)
        return items

    # return a points detail list with title
    def category_points(
        self, description=False, percentage=False, order_by_percetage=False
    ):
        items = []
        title = (
            ["类别", "分数"] if self.language == Language.CHINESE else ["Category", "Score"]
        )
        footer = [
            "总计" if self.language == Language.CHINESE else "Total",
            f"{self.total_point}",
        ]

        if percentage:
            title.append("最高分" if self.language == Language.CHINESE else "Max Point")
            title.append("百分比" if self.language == Language.CHINESE else "Percentage")
            [footer.append("") for i in range(2)]

        # merge human capital and economic
        category = self.points_detail["category_points"]

        for item, detail in category.items():
            details = [
                detail["item_chinese"] if self.language == Language.CHINESE else item,
                str(detail.get("score", "0")),
            ]  # item and score is default output
            if percentage:
                score = detail.get("score")
                point = detail.get("point")
                the_percentage = float(f"{score/point:.2f}")

                details.append(str(detail.get("point")))
                details.append(the_percentage)
            items.append(details)

        if percentage:
            if order_by_percetage:
                items = self.make_order_by_percentage(title, items)
            # format percentage with %
            for item in items:
                index = title.index(
                    "百分比" if self.language == Language.CHINESE else "Percentage"
                )
                item[index] = f"{item[index]:.1%}"

        items.insert(0, title)
        items.append(footer)
        return items

    def show(
        self,
        percentage=True,
        description=False,
        order_by_percetage=True,
        markdown=False,
    ):
        
        stage_name = get_stage_name_by_string(self.stage_name)+" " if hasattr(self,"stage_name") else ""
        
        item_point = self.item_points(
            percentage=percentage,
            description=description,
            order_by_percetage=order_by_percetage,
        )
        cat_point = self.category_points(
            percentage=percentage, order_by_percetage=order_by_percetage
        )

        item_table = ConsoleTable(title=f"{stage_name}Items Points Detail", table_data=item_point,with_footer=True)
        category_table = ConsoleTable(
            title=f"{stage_name}Category Points Detail", table_data=cat_point,with_footer=True
        )

        if markdown:
            item_table.show(markdown=True)
            category_table.show(markdown=True)
        else:
            item_table.show()
            category_table.show()


""" It seems no one use it.?"""


class Scorings:
    def __init__(self, scores: List[ScoringBase], language="English"):
        self.scores = scores
        self.language = language

    def get_total_point(self, score: ScoringBase):
        return score.total_point

    def get_ordered_scorings(self, reverse=True):
        self.scores.sort(key=self.get_total_point, reverse=reverse)
        return self.scores

    def get_report_data(self):
        num_solutions = len(self.scores)
        if num_solutions == 0:
            raise ValueError("There is no solutions for reporting")

        if self.language.upper() == "CHINESE":
            condition = "项目"
            solution = "方案"
            fact = "事实"
            score = "得分"
            total = "总分"
        else:
            condition = "Item"
            solution = "Solution"
            fact = "Fact"
            score = "Score"
            total = "Total"

    def report(self, language="English"):
        num_solutions = len(self.scores)
        if num_solutions == 0:
            raise ValueError("There is no solutions for reporting")

        if language and language.upper() == "CHINESE":
            condition = "项目"
            solution = "方案"
            fact = "事实"
            score = "得分"
            total = "总分"
        else:
            condition = "Item"
            solution = "Solution"
            fact = "Fact"
            score = "Score"
            total = "Total"

        html_head = """
        <!DOCTYPE html>
        <html>
        <head>
        <link rel="stylesheet" href="bcpnp_score.css">
        </head>
        <body>
        <table>
        """
        html_foot = """
        </table>
        </body>
        </html>
        """
        htmls = [html_head]
        # make head
        thead1 = f"<thead><td rowspan='2'>{condition}</td>"
        thead2 = ""
        tr1 = ""
        for i in range(num_solutions):
            thead2 += f"<td colspan='2'>{solution} {i+1}</td>"
            tr1 += f"<td>{fact}</td><td>{score}</td>"
        thead4 = "</thead>"

        htmls.append(thead1 + thead2 + thead4)
        htmls.append("<tr><td></td>" + tr1 + "</tr>")
        # make every tr
        for item, value in self.scores[0].points_detail["item_points"].items():
            show_item = (
                value["item_chinese"]
                if language and language.upper() == "CHINESE"
                else item
            )
            tr = f"<tr><td>{show_item}</td>"
            for score in self.scores:
                # make td
                tr += f"<td>{value['value']}</td><td>{value['score']}</td>"
            htmls.append(tr)

        # make summary
        tr = f"<tr><td>{total}</td>"
        for score in self.scores:
            # make td
            tr += f"<td></td><td>{score.total_point}</td>"
        htmls.append(tr)

        htmls.append(html_foot)
        return "\n".join(htmls)
