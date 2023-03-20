from pydantic import BaseModel
from typing import Literal, List, Union

""" TimeDuration is a class for integrating all format of time unit, and calculate time as user wish"""


class TimeDuration(BaseModel):
    duration: float
    unit: Literal["days", "weeks", "months", "years"]

    def __sub__(self, other):
        """
        Self sub other, and return a new TimeDuration object
        """
        return self.__class__(duration=self.in_days - other.in_days, unit="days")

    def __add__(self, other):
        """
        Self add other, and return a new TimeDuration object
        """
        return self.__class__(duration=self.in_days + other.in_days, unit="days")

    @property
    def in_days(self):
        if self.unit == "days":
            return self.duration
        elif self.unit == "weeks":
            return self.duration * 7
        elif self.unit == "months":
            return self.duration * 30
        elif self.unit == "years":
            return self.duration * 365
        else:
            return None

    @property
    def in_weeks(self):
        if self.unit == "days":
            return self.duration / 7
        elif self.unit == "weeks":
            return self.duration
        elif self.unit == "months":
            return self.duration * 4.34524
        elif self.unit == "years":
            return self.duration * 52
        else:
            return None

    @property
    def in_months(self):
        if self.unit == "days":
            return self.duration / 30
        elif self.unit == "weeks":
            return self.duration * 12 / 52
        elif self.unit == "months":
            return self.duration
        elif self.unit == "years":
            return self.duration * 12
        else:
            return None

    @property
    def in_years(self):
        if self.unit == "days":
            return self.duration / 365
        elif self.unit == "weeks":
            return self.duration / 52
        elif self.unit == "months":
            return self.duration / 12
        elif self.unit == "years":
            return self.duration
        else:
            return None
