"""
This is a tool set for pydantic validation shared by all models
"""
from datetime import datetime, date
from typing import List, Union
from pydantic import BaseModel


def normalize(name: str):
    if name:
        return " ".join((word.capitalize()) for word in name.split(" "))
    return ""


def makeList(name: str):
    if name and not isinstance(name, list):
        return name.split("\n")
    return name if isinstance(name, list) else []


def trimString(text: str):
    return "" if text == None else text.strip()


def parse(date_string):
    return datetime.strptime(date_string, "%Y-%m-%d")


class Duration:
    def __init__(self, start_date, end_date):
        self.start_date = start_date
        self.end_date = end_date or datetime.today()

    @property
    def years(self):
        return (
            self.end_date.year
            - self.start_date.year
            - (
                (self.end_date.month, self.end_date.day)
                < (self.start_date.month, self.start_date.day)
            )
        )

    @property
    def months(self):
        years2months = (self.end_date.year - self.start_date.year) * 12
        months2months = self.end_date.month - self.start_date.month
        return years2months + months2months

    # get years on a specific date
    def yearsOnDate(self, end_date=date.today()):
        if not isinstance(end_date, date):
            try:
                end_date = parse(end_date)
                return (
                    end_date.year
                    - self.start_date.year
                    - (
                        (end_date.month, end_date.day)
                        < (self.start_date.month, self.start_date.day)
                    )
                )
            except ParserError as err:
                raise ParserError(f'{err.args[0]}," in file ",{__file__}')
        return (
            end_date.year
            - self.start_date.year
            - (
                (end_date.month, end_date.day)
                < (self.start_date.month, self.start_date.day)
            )
        )

    # get months on a specific date
    def monthsOnDate(self, end_date=date.today()):
        try:
            end_date = end_date if isinstance(end_date, date) else parse(end_date)
        except ParserError as err:
            raise ParserError(f'{err.args[0]}," in file ",{__file__}')

        years2months = (end_date.year - self.start_date.year) * 12
        months2months = end_date.month - self.start_date.month
        return years2months + months2months

    # get days
    @property
    def days(self):
        return (self.end_date - self.start_date).days

    def daysOnDate(self, end_date=date.today()):
        if not isinstance(end_date, date):
            try:
                end_date = parse(end_date).date()
                return (end_date - self.start_date).days
            except ParserError as err:
                raise ParserError(f'{err.args[0]}," in file ",{__file__}')
        return (end_date - self.start_date).days


class DurationClass(BaseModel):
    start_date: datetime
    end_date: datetime = datetime.today()

    def get_date(self, end_date: Union[datetime, str]):
        if type(end_date) == str:
            try:
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
            except ValueError as e:
                raise ValueError(f"Error parsing date in Duration clas: {e}")
            else:
                return end_date
        else:
            return end_date

    @property
    def years(self) -> int:
        """Return the duration in years."""
        return self.end_date.year - self.start_date.year

    @property
    def months(self) -> int:
        """Return the duration in months."""
        months = (self.end_date.year - self.start_date.year) * 12
        months += self.end_date.month - self.start_date.month
        return months

    @property
    def days(self) -> int:
        """Return the duration in days."""
        return (self.end_date - self.start_date).days

    def yearsOnDate(self, end_date: Union[datetime, str]) -> int:
        """Return the remaining years in a given day."""
        end_date = self.get_date(end_date)
        return end_date.year - self.start_date.year

    def monthsOnDate(self, end_date: Union[datetime, str]) -> int:
        """Return the remaining months in a given day."""
        end_date = self.get_date(end_date)
        months = (end_date.year - self.end_date.year) * 12
        months += end_date.month - self.start_date.month
        return months

    def daysOnDate(self, end_date: Union[datetime, str]) -> int:
        """Return the remaining days in a given day."""
        end_date = self.get_date(end_date)
        return (end_date - self.start_date).days


# Used in pydantic class to check if a row has input but missed some fields, values is root_validator values
def checkRow(values: dict, all_fields: List[str], required_fields: List[str]):
    all_fields_values = [values.get(field, None) for field in all_fields]
    required_values = [values.get(field, None) for field in required_fields]
    if any(all_fields_values) and not all(required_values):
        missed_fields = [
            field for field in required_fields if values.get(field) == None
        ]
        raise ValueError(f"Required fileds are missed ({', '.join(missed_fields)}).")


"""
This class is for code and name convert. Usually used for country, province,city, etc... to convert between name and code
"""


class NameCodeConvert(object):
    # initialize with a dict including name and code
    def __init__(self, d: dict):
        self.d = d

    def getName(self, code):
        c = {v: k for k, v in self.d.items()}
        return c.get(str(code))

    def getCode(self, name):
        # remove additional space and trim left and right
        name = " ".join(name.split()).strip()
        for item_name, code in self.d.items():
            if name in item_name.lower():
                return code


# only used for making excel file path based on language
def excel_language_path(language):
    return (
        "excel/"
        if language == None or language.lower() == "english"
        else f"excel/{language}"
    )
