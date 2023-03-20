""" 
FSW point calculate the threshold of being able to register in EE as Federal Skilled Worker
"""
from pydantic import BaseModel
from typing import Union, Optional
from assess.model.scoringengine import getKeyValuePoint, getRangePoint
from assess.model.scoringbase import ScoringBase
from rich.markdown import Markdown

clb_level_points = {9: 6, 8: 5, 7: 4}
edu_level_points = {
    0: 25,
    1: 23,
    2: 23,
    3: 21,
    4: 19,
    5: 22,
    6: 21,
    7: 19,
    8: 15,
    9: 5,
    10: 0,
}
edu_level_table = {
    0: "Doctor",
    1: "Master",
    2: "Professional",
    3: "Bachelor",
    4: "Associate Degree",
    5: "Two more post-secondary",
    6: "3-year post-secondary",
    7: "2-year post-secondary",
    8: "1-year post-seconary",
    9: "Secondary",
    10: "Under Secondary",
}

work_experience_points = {1: 9, 2: 11, 3: 11, 4: 13, 5: 13, 6: 15}
age_points = {
    # under 18 and above 47, return 0 directly in function
    # 18-35 return 12 directly in function
    36: 11,
    37: 10,
    38: 9,
    39: 8,
    40: 7,
    41: 6,
    42: 5,
    43: 4,
    44: 3,
    45: 2,
    46: 1,
}


class FSW(ScoringBase):
    age: int
    education: int
    clbs: list[int]
    second_clbs: Optional[list[int]]
    spouse_clbs: Optional[list[int]]
    studied: bool
    spouse_studied: bool
    worked: bool
    spouse_worked: bool
    work_experience: int
    aeo: bool
    relative: bool

    @property
    def first_language_point(self):
        if min(self.clbs) < 7:  # general level
            raise ValueError(
                "the client is not eligible, since the language level is less than CLB 7"
            )
        points = []
        for clb in self.clbs:
            if clb > 9:
                clb = 9
            sub_points = getKeyValuePoint(clb_level_points, clb)
            points.append(sub_points)
        return points[0] + points[1] + points[2] + points[3]

    @property
    def second_language_point(self):
        if self.second_clbs:
            return 4 if min(self.second_clbs) >= 5 else 0  # second language CLB 5+
        return 0

    @property
    def education_point(self):
        return getKeyValuePoint(edu_level_points, self.education)

    @property
    def work_experience_point(self):
        if not isinstance(self.work_experience, int):
            print("Years must be integer")
            return 0
        if self.work_experience > 6:
            self.work_experience = 6
        if self.work_experience < 1:
            return 0
        return getKeyValuePoint(work_experience_points, self.work_experience)

    @property
    def age_point(self):
        if self.age < 18 or self.age >= 47:
            return 0
        elif self.age in range(18, 36):
            return 12
        else:
            return getKeyValuePoint(age_points, self.age)

    @property
    def aeo_point(self):
        return 10 if self.aeo else 0

    @property
    def adaptability_point(self):
        points = 0
        if self.spouse_clbs:
            points = points + 5 if min(self.spouse_clbs) >= 4 else points
        if self.studied:
            points += 5
        if self.spouse_studied:
            points += 5
        if self.worked:
            points += 5
        if self.spouse_worked:
            points += 5
        if self.aeo:
            points += 5
        if self.relative:
            points += 5
        return 10 if points > 10 else points

    @property
    def total_point(self):
        return (
            self.first_language_point
            + self.second_language_point
            + self.education_point
            + self.work_experience_point
            + self.age_point
            + self.aeo_point
            + self.adaptability_point
        )

    @property
    def is_qualified(self):
        return True if self.total_point >= 76 else False

    @property
    def points_detail(self):
        return {
            "item_points": {
                "First language": {
                    "item_chinese": "第一官方语言",
                    "description": "Primary official language",
                    "point": 6,  # maximum point for this item
                    "value": self.clbs,
                    "score": self.first_language_point,
                },
                "Second language": {
                    "item_chinese": "第二官方语言",
                    "description": "Secondary official language",
                    "point": 4,
                    "value": self.second_clbs,
                    "score": self.second_language_point,
                },
                "Education ": {
                    "item_chinese": "教育",
                    "description": "Education",
                    "point": 25,
                    "value": edu_level_table.get(self.education, "Wrong education"),
                    "score": self.education,
                },
                "Work experience": {
                    "item_chinese": "工作经验",
                    "description": "Work experience",
                    "point": 15,
                    "value": self.work_experience,
                    "score": self.work_experience_point,
                },
                "Age": {
                    "item_chinese": "年龄",
                    "description": "Age",
                    "point": 12,
                    "value": self.age,
                    "score": self.age_point,
                },
                "AEO": {
                    "item_chinese": "合法的工作offer",
                    "description": "Arranged employment opporutnity",
                    "point": 10,
                    "value": "Yes" if self.aeo else "No",
                    "score": self.aeo_point,
                },
                "Adapatablity": {
                    "item_chinese": "适应性",
                    "description": "Adapatability",
                    "point": 10,
                    "value": f"spouse clbs: {self.spouse_clbs}\nstudied in Canada: {self.studied}\nspouse studied in Canada: {self.spouse_studied}\nworked in Canada: {self.worked}\nspouse worked in Canada: {self.spouse_worked}\naeo: {self.aeo}\nrelative: {self.relative}",
                    "score": self.adaptability_point,
                },
            },
            "category_points": {
                "Language": {
                    "item_chinese": "语言",
                    "point": 28,
                    "score": self.first_language_point + self.second_language_point,
                },
                "Education": {
                    "item_chinese": "教育",
                    "point": 25,
                    "score": self.education_point,
                },
                "Work experience": {
                    "item_chinese": "工作经验",
                    "point": 15,
                    "score": self.work_experience_point,
                },
                "Age": {"item_chinese": "年龄", "point": 12, "score": self.age_point},
                "AEO": {"item_chinese": "安排好的工作机会", "point": 10, "score": self.aeo_point},
                "Adapatablity": {
                    "item_chinese": "适应性",
                    "point": 10,
                    "score": self.adaptability_point,
                },
            },
        }

    @staticmethod
    def info():
        info_markdown = """
**Info Education**

0. Doctor
1. Master
2. Professional
3. Bachelor
4. Associate Degree
5. Two more post-secondary
6. 3-year post-secondary
7. 2-year post-secondary
8. 1-year post-seconary
9. Secondary
1.: Under Secondary
        """
        return Markdown(info_markdown)
