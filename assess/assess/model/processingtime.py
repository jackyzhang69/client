from pydantic import BaseModel
from typing import Literal, List, Union
from enum import Enum
from base.namespace import Language
from base.models.timeduration import TimeDuration
from dataclasses import dataclass
from base.utils.client.show import ConsoleTable,console
from functools import reduce


@dataclass
class ProcessingTime:
    stage_name: str
    description: List[str]
    duration: TimeDuration

    def show(self, language: Enum = Language.ENGLISH):
        title = self.description[language.value]
        time = self.duration.duration
        unit = self.duration.unit
        console.print(f"{title}: {time} {unit}",style="green")


class ProcessingTimes:
    def __init__(
        self,
        processing_times: List[ProcessingTime],
        language: Enum = Language.ENGLISH,
    ):
        self.language = language
        self.processing_times = processing_times

    @property
    def total_time(self):
        times = [processing_time.duration for processing_time in self.processing_times]
        return reduce(lambda x, y: x + y, times)

    def get_processing_time_table(
        self, with_title=True, with_total=True, total_unit="months"
    ):
        titles = [["Stage", "Duration", "Unit"], ["阶段", "时长", "单位"]]
        values = [titles[self.language.value]] if with_title else []
        for p in self.processing_times:
            values.append(
                [
                    p.description[self.language.value],
                    p.duration.duration,
                    p.duration.unit,
                ]
            )

        if with_total:
            time_in_unit = {
                "days": self.total_time.in_days,
                "weeks": self.total_time.in_weeks,
                "months": self.total_time.in_months,
                "years": self.total_time.in_years,
            }
            values.append(
                [
                    "总计" if self.language == Language.CHINESE else "Total",
                    f"{time_in_unit.get(total_unit):.1f}",
                    total_unit,
                ]
            )

        """ Asseemble the table of processing time """
        title = "Processing Time for all stages"
        table = ConsoleTable(title, table_data=values, with_footer=True)
        return table
