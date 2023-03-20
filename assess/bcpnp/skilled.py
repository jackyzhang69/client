from pydantic import validator
from typing import List
from assess.model.solution import Solutions
from base.namespace import Language, get_stage_name_by_string
from rich.markdown import Markdown
from assess.nocs.noccodes import noc_2021_v1
from assess.bcpnp.chance import ITAs, ITA
from assess.bcpnp import skilled_data as sw
from datetime import date, timedelta
from base.utils.client.show import ConsoleTable
from base.utils.utils import transpose_list
from assess.model.stage import Stage
from assess.bcpnp.bc_scoring import BCScoring


class BCPNP_Skill(Stage, BCScoring):
    noc_code: str

    @validator("noc_code")
    def validate_noc_code(cls, v):
        if v not in noc_2021_v1:
            raise ValueError(f"{v} is not a valid NOC 2021 code")
        return v

    @property
    def target(self):
        if self.noc_code in sw.CHILDCARE_OCCUPATIONS:
            return "Childcare"
        elif self.noc_code in sw.HEALTHCARE_OCCUPATIONS and self.noc_code != "33102":
            return "Healthcare"
        elif self.noc_code in sw.CHILDCARE_OCCUPATIONS and self.noc_code == "33102":
            return "Healthcare Assistants"
        elif self.noc_code in sw.OTHER_OCCUPATIONS:
            return "Other Priority"
        elif self.noc_code in sw.TECH_OCCUPATIONS:
            return "Tech"
        else:
            return "General"

    def get_possibility(
        self, start_date=date.today() - timedelta(days=365), end_date=date.today()
    ):
        possibility = ITAs(
            "bcpnp", start_date=start_date, end_date=end_date
        ).get_chance(
            self.total_point,
            self.stage_name,
            self.target,
        )
        return possibility

    # Get specific ITA data list for a period of time
    def get_itas(
        self,
        language="English",
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
    ):
        return ITAs("bcpnp", start_date=start_date, end_date=end_date).get_itas(
            self.stage_name, self.target
        )

    @staticmethod
    def info():
        with open("assess/bcpnp/info.txt", "r") as f:
            info_markdown = f.read()

        return Markdown(info_markdown)

    # def documents(self,is_working_in_the_position=False):
    #     return get_docs(self.name,is_working_in_the_position=is_working_in_the_position)

    # @property
    # def applicant_qualification(self):
    #     """
    #     Applicant's qualification requirements
    #     """
    #     return self.get_qualification("applicant_requirement",language=Language.ENGLISH)

    # @property
    # def employer_qualification(self):
    #     """
    #     Applicant's qualification requirements
    #     """
    #     return self.get_qualification("employer_requirement",language=Language.ENGLISH)


class BCPNP_Skills(Solutions):
    """
    List of BCPNP_Skill objects. Can output tables for seriers of data combination
    """

    solutions: List[BCPNP_Skill]

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
        stream_name = get_stage_name_by_string(first_solution.stage_name)
        title = f"Solutions List for stream {stream_name} on target {first_solution.target}. \nPossibility analysis data from {start_date.isoformat()} to {end_date.isoformat()}\n ITA rounds:{rate.rounds} Min: {rate.min_score} Median: {rate.median_score} Max: {rate.max_score}"
        head_data = (
            ["Solution"]
            + ["Point", "ITA Rate"]
            + [item for item in self.solutions[0].points_detail["item_points"].keys()]
        )
        table_data = []
        for solution in self.solutions:
            item_points = solution.points_detail["item_points"]
            ita_rate = solution.get_possibility(
                    start_date=start_date, end_date=end_date
                ).percentage
            row_data = [
                solution.total_point,
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
