from datetime import date, timedelta, datetime
from . import skilled_data as bd
import statistics
from assess.model.chancebase import Possibilty as PossibilityBase, ITABase
from base.utils.db import Collection
from base.namespace import Language
from base.utils.client.show import ConsoleTable
from base.namespace import Language


class Possibilty(PossibilityBase):
    target: str

    def __init__(self, **args):
        super().__init__(**args)

    def show_ita_chance(self, language=Language.ENGLISH, markdown=False):
        table_title = (
            f"从{self.start_date}到{self.end_date}期间，{self.target}目标邀请的{self.stream}类别获邀概率"
            if language == Language.CHINESE
            else f"Invitation Chance from {self.start_date} to {self.end_date} in stream {self.stream} on target  {self.target}"
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
        is_Chinese = language and language == Language.CHINESE
        titles = titles_cn if is_Chinese else titles_en
        values = [
            self.min_score,
            self.median_score,
            self.max_score,
            self.qualified_rounds,
            self.rounds,
            self.percentage,
        ]
        ConsoleTable(title=table_title, table_data=[titles, values]).show(
            markdown=markdown
        )

    def descibe(self, language=Language.ENGLISH):
        if language and language == Language.CHINESE:
            ita = f"从{self.start_date}到{self.end_date}历史记录显示，针对{self.stream}项目的{self.target}目标邀请一共进行了{self.rounds}轮。其中，最低分数是{self.min_score},最高分数是{self.max_score},中位数为{self.median_score}. 当前方案获得邀请的次数为{self.qualified_rounds},百分比为{self.percentage:.1%}.\n"
            counts = [f"{month}月:{count} 次" for month, count in self.count.items()]
            return ita + "这些邀请发生的月份和次数统计为: " + ", ".join(counts)

        ita = f"Based on the history record started from {self.start_date} to {self.end_date},The {self.target} targets on  stream {self.stream} had invited {self.rounds} rounds, in which, The lowest is {self.min_score:.0f},highest is {self.max_score:.0f}, and the median score is {self.median_score:.1f}. The current solution would have {self.qualified_rounds} rounds to be invited. The percentage is {self.percentage:.1%}"
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


class ITA(ITABase):
    target: str


class ITAs:
    def __init__(
        self,
        name: str,
        start_date=date.today() - timedelta(days=365),
        end_date=date.today(),
        language=Language.ENGLISH,
    ):
        self.start_date = (
            start_date
            if type(start_date) == date
            else datetime.strptime(start_date, "%Y-%m-%d").date()
        )
        self.end_date = (
            end_date
            if type(end_date) == date
            else datetime.strptime(end_date, "%Y-%m-%d").date()
        )
        self.language = language
        data_set = Collection("ita").find_many(
            {
                "name": name,
                "ita_date": {
                    "$gte": self.start_date.isoformat(),
                    "$lte": self.end_date.isoformat(),
                },
            }
        )
        self.itas = [ITA(**ita) for ita in data_set]

    def get_chance(
        self,
        score,
        stream,
        target,
    ):
        rounds = len(
            [ita for ita in self.itas if stream in ita.stream and target in ita.target]
        )
        qualified_rounds = len(
            [
                ita
                for ita in self.itas
                if stream in ita.stream and target in ita.target and ita.score <= score
            ]
        )
        qualified_months = [
            ita.ita_date.month
            for ita in self.itas
            if stream in ita.stream and target in ita.target and ita.score <= score
        ]
        scores = [
            ita.score
            for ita in self.itas
            if stream in ita.stream and target in ita.target
        ]
        if scores:
            (min_score, median_score, max_score) = (
                min(scores),
                statistics.median(scores),
                max(scores),
            )
        else:
            raise ValueError(
                f"No record matches for stream {stream} on target {target}..."
            )
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
                "target": target,
                "months": qualified_months,
            }
        )

    def get_itas(
        self,
        stream,
        target,
    ):
        itas = [
            ita for ita in self.itas if stream in ita.stream and target in ita.target
        ]
        if len(itas) == 0:
            return None
        reports = [["No", "Date", "Score"]]
        for i, ita in enumerate(itas):
            reports.append([str(i), ita.ita_date.isoformat(), str(ita.score)])
        return reports
