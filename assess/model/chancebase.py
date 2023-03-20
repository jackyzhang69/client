from pydantic import BaseModel
from datetime import date, datetime, timedelta, time
from typing import List
import statistics
from collections import Counter
from base.namespace import Language
from base.utils.client.show import ConsoleTable
from base.utils.db import Collection
import plotly
import plotly.express as px
import pandas as pd
from datetime import timedelta
from base.namespace import Language


class Possibilty(BaseModel):
    start_date: date
    end_date: date
    min_score: float
    median_score: float
    max_score: float
    percentage: float
    qualified_rounds: int
    rounds: int
    stream: str
    months: list[str]

    @property
    def count(self):
        return dict(Counter(self.months))

    """ Main function to show the possibility of invitation"""

    def show_ita_chance(self, language=Language.ENGLISH, markdown=False):
        is_Chinese = language and language == Language.CHINESE
        table_title = (
            f"从{self.start_date}到{self.end_date}期间，{self.stream}类别获邀概率"
            if is_Chinese
            else f"Invitation Chance from {self.start_date} to {self.end_date} on stream {self.stream} "
        )
        titles_en = [
            "Min",
            "Median",
            "Max",
            "Q rounds",
            "T rounds",
            "Percentage",
        ]
        titles_cn = [
            "最低分",
            "中位数",
            "最高分",
            "获邀次数",
            "总轮数",
            "百分比",
        ]

        titles = titles_cn if is_Chinese else titles_en
        values = [
            self.min_score,
            self.median_score,
            self.max_score,
            self.qualified_rounds,
            self.rounds,
            f"{self.percentage:.1%}",
        ]
        ConsoleTable(title=table_title, table_data=[titles, values]).show(
            markdown=markdown
        )

    """ Calculate how many times the invitation happened on each month"""

    def show_count_summary(self, language=Language.ENGLISH, markdown=False):
        # Count
        is_Chinese = language and language == Language.CHINESE
        count_months = ["月份" if is_Chinese else "Month"]
        count_times = ["次数" if is_Chinese else "Times"]
        for month, times in self.count.items():
            count_months.append(month)
            count_times.append(str(times))

        ConsoleTable(
            title="Invitation Counted on month", table_data=[count_months, count_times]
        ).show(markdown=markdown)

    """ describe the possibility of invitation"""

    def descibe(self, language="English"):
        if language and language.upper() == "CHINESE":
            ita = f"从{self.start_date}到{self.end_date}历史记录显示，针对{self.stream}项目一共进行了{self.rounds}轮邀请。其中，最低分数是{self.min_score},最高分数是{self.max_score},中位数为{self.median_score}. 当前方案获得邀请的次数为{self.qualified_rounds},百分比为{self.percentage:.1%}.\n"
            counts = [f"{month}月:{count} 次" for month, count in self.count.items()]
            return ita + "这些邀请发生的月份和次数统计为: " + ", ".join(counts)

        ita = f"Based on the history record started from {self.start_date} to {self.end_date},The stream {self.stream} had invited {self.rounds} rounds, in which, The lowest is {self.min_score:.0f},highest is {self.max_score:.0f}, and the median score is {self.median_score:.1f}. The current solution would have {self.qualified_rounds} rounds to be invited. The percentage is {self.percentage:.1%}.\n"
        counts = [f"Month {month}:{count}" for month, count in self.count.items()]
        return (
            (
                ita
                + "The invitations occurred based on monthly summary is: "
                + ", ".join(counts)
            )
            if len(counts) > 0
            else ita
        )


class ITABase(BaseModel):
    """name is stage name, while stream is program stream. For example, name is "bcpnp", stream is "bc_sw" """

    name: str
    ita_date: date
    stream: list[str]
    score: int


class ITABases:
    def __init__(
        self,
        name: str,
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
        language="English",
    ):
        self.name = name
        self.start_date = start_date
        self.end_date = end_date
        self.language = language

        documents = Collection("ita").find_many(
            {
                "name": name,
                "ita_date": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat(),
                },
            }
        )
        self.itas = [ITABase(**ita) for ita in documents]

    def get_chance(self, score, stream):
        """ ee_all is a special term, so has to be proceeeded separately"""
        rounds = len([ita for ita in self.itas if stream in ita.stream or "ee_all" in ita.stream])
        qualified_rounds = len(
            [ita for ita in self.itas if (stream in ita.stream or "ee_all" in ita.stream) and ita.score <= score]
        )
        qualified_months = [
            ita.ita_date.month
            for ita in self.itas
            if (stream in ita.stream or "ee_all" in ita.stream) and ita.score <= score
        ]
        scores = [ita.score for ita in self.itas if (stream in ita.stream or "ee_all" in ita.stream)]
        if scores:
            (min_score, median_score, max_score) = (
                min(scores),
                statistics.median(scores),
                max(scores),
            )
        else:
            return None
        percentage = qualified_rounds / rounds
        return Possibilty(
            **{
                "start_date": self.start_date,
                "end_date": self.end_date,
                "percentage": percentage,
                "qualified_rounds": qualified_rounds,
                "rounds": rounds,
                "min_score": min_score,
                "median_score": median_score,
                "max_score": max_score,
                "stream": stream,
                "months": qualified_months,
            }
        )

    """ get the ITA report for a specific stream during a  given period"""

    def get_ita_report(
        self,
        stream,
    ):
        itas = [ita for ita in self.itas if (stream in ita.stream or "ee_all" in ita.stream)]
        if len(itas) == 0:
            return None
        reports = (
            [["No", "日期", "分数"]]
            if self.language == Language.CHINESE
            else [["No", "Date", "Score"]]
        )
        for i, ita in enumerate(itas):
            reports.append([i, ita.ita_date, ita.score])
        return reports

    def chart(self, stream, score=None):
        #  score is client's score. with input, we use median score
        if score == None:
            score = statistics.median(
                [ita.score for ita in self.itas if stream in ita.stream]
            )
            score_owner = "Median Score"
        else:
            score_owner = "Client Score"

        # Extract the date and score data from the documents
        dates = []
        scores = []
        for doc in self.itas:
            if stream in doc.stream:
                dates.append(doc.ita_date)
                scores.append(doc.score)

        # Create a DataFrame with the dates and scores
        df = pd.DataFrame({"date": dates, "score": scores})

        # Create a line chart with plotly
        fig = px.line(
            df,
            x="date",
            y="score",
            title=f"Invitation To Apply Scores for Program {self.name} Stream {stream}\n Period: {self.start_date.isoformat()} to {self.end_date.isoformat()} {score_owner}:{score}",
        )

        fig.update_layout(
            xaxis={"title": "Date", "range": [df["date"].min(), df["date"].max()]},
            yaxis={"title": "Score"},
            font={"family": "Arial, sans-serif", "size": 14, "color": "#333333"},
            # color_discrete_sequence=["#0072B2"],
            # template="plotly_dark"
            margin={"t": 50, "r": 50, "b": 50, "l": 50},
            legend={"x": 0, "y": 1},
        )
        # Add a line for the given score
        fig.add_shape(
            type="line",
            x0=self.start_date.isoformat(),
            x1=self.end_date.isoformat(),
            y0=score,
            y1=score,
            yref="y",
            name="Score {}".format(score),
        )

        # Save the plot as an HTML file
        plotly.offline.plot(fig, filename="plot.html")
