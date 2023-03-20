from datetime import datetime, timedelta, date
from base.namespace import Language
from pydantic import BaseModel, root_validator
from assess.model.assess import Project, AssessModel
from base.models.educationbase import EducationBase, EducationHistory
from base.models.employmentbase import EmploymentBase
from base.utils.client.show import ConsoleTable, markdown_table, console
from base.utils.language import IELTS, CELPIP, TEF, TCF
from assess.model.assess import Language as Language_Score
from typing import List

""" Get a project's consultation report"""


class Report(BaseModel):
    args: object  # Namespace?
    project: Project
    markdown: bool = True
    language: Language = Language.ENGLISH
    start_date: date = date.today() - timedelta(days=365)
    end_date: date = date.today()

    @root_validator
    def post_init_(cls, values):
        """setup language based on args.chinese"""
        args = values.get("args")

        if args.start_date:
            values["start_date"] = args.start_date

        if args.end_date:
            values["end_date"] = args.end_date

        values["language"] = Language.CHINESE if args.chinese else Language.ENGLISH
        return values

    def start_date_string(self, obj: object):
        return f"{obj.start_date.isoformat()}"

    def end_date_string(self, obj: object):
        return (
            f"{'当前' if not obj.end_date else obj.end_date.isoformat()}"
            if self.language == Language.CHINESE
            else f"{'Present' if not obj.end_date else obj.end_date.isoformat()}"
        )

    def get_title(self, pa):
        """Title"""
        return (
            f"# {pa.personal.salution(language=self.language)} Immigration Solution\n"
            if self.language == Language.ENGLISH
            else f"# {pa.personal.salution(language=self.language)}移民方案\n"
        )

    def get_education(self, educations: List[EducationBase]):
        """1. Get post secondary educations 2. if no post secondary one, choose high school education"""
        educations_obj = EducationHistory(edu_list=educations)
        emps = (
            educations_obj.post_secondary
            if len(educations_obj.post_secondary) > 0
            else educations_obj.high_school
        )

        if len(emps) == 0:
            return ""
        elif len(emps) == 1:
            edu = emps[0]
            return (
                "教育背景："
                + f"{self.start_date_string(edu)} - {self.end_date_string(edu)} | {edu.field_of_study} | {edu.education_level} | {edu.lengthOfYears}年\n"
                if self.language == Language.CHINESE
                else "Education Background: "
                + f"{self.start_date_string(edu)} - {self.end_date_string(edu)} | {edu.field_of_study} | {edu.education_level} | {edu.lengthOfYears}Y\n"
            )
        else:
            table_data = (
                [["开始", "结束", "专业", "学历", "年数"]]
                if self.language == Language.CHINESE
                else [["From", "To", "Field of Study", "Education Level", "Years"]]
            )
            for edu in emps:
                table_data.append(
                    [
                        edu.start_date.isoformat(),
                        edu.end_date.isoformat()
                        if edu.end_date
                        else "当前"
                        if self.language == Language.CHINESE
                        else "Present",
                        edu.field_of_study,
                        edu.education_level,
                        edu.lengthOfYears,
                    ]
                )
            title = (
                "教育背景： \n"
                if self.language == Language.CHINESE
                else "Education Background: \n"
            )
            return ConsoleTable(table_data=table_data, title=title)

    def get_employment(
        self, employments: List[EmploymentBase], for_past_10_years_only: bool = True
    ):
        """1. Get employment experience within past 10 years"""

        emps = [
            emp
            for emp in employments
            if emp.end_date
            or datetime.today() > datetime.today() - timedelta(days=365 * 10)
        ]

        if len(emps) == 0:
            return ""
        elif len(emps) == 1:
            emp = emps[0]
            return (
                "工作经历："
                + f"{self.start_date_string(emp)} - {self.end_date_string(emp)} | {emp.job_title} | {emp.noc_code} | {emp.lengthOfYears}年 | {emp.country}"
                if self.language == Language.CHINESE
                else "Employment Experience: "
                + f"{self.start_date_string(emp)} - {self.end_date_string(emp)} | {emp.job_title} | {emp.noc_code} | {emp.lengthOfYears}Y | {emp.country}"
            )
        else:
            table_data = (
                [["开始", "结束", "公司", "职位", "NOC", "年数", "国家"]]
                if self.language == Language.CHINESE
                else [["From", "To", "Employer", "Title", "NOC", "Years", "Country"]]
            )
            for emp in emps:
                table_data.append(
                    [
                        emp.start_date.isoformat(),
                        emp.end_date.isoformat()
                        if emp.end_date
                        else "当前"
                        if self.language == Language.CHINESE
                        else "Present",
                        emp.company,
                        emp.job_title,
                        emp.noc_code,
                        emp.lengthOfYears,
                        emp.country,
                    ]
                )
            title = (
                "工作经历： \n"
                if self.language == Language.CHINESE
                else "Employment Experience: \n"
            )
            return ConsoleTable(table_data=table_data, title=title)

    def get_language(self, languages: List[Language_Score]):
        """1. Get languages"""

        def get_clb(lang: Language_Score):
            if lang.test_type == "IELTS":
                return IELTS(**lang.dict())
            elif lang.test_type == "CELPIP":
                return CELPIP(**lang.dict())
            elif lang.test_type == "TEF":
                return TEF(**lang.dict())
            elif lang.test_type == "TCF":
                return TCF(**lang.dict())
            else:
                raise ValueError(f"Invalid tets type...")

        if len(languages) == 0:
            return ""
        elif len(languages) >= 1:
            output = (
                "- 语言水平：\n"
                if self.language == Language.CHINESE
                else "- Language Proficiency: \n"
            )

            lang_table_data = [
                ["类别", "读", "写", "听", "说"]
                if self.language == Language.CHINESE
                else ["Type", "Reading", "Writting", "Listening", "Speaking"]
            ]
            clbs = []
            for i, language in enumerate(languages):
                lang = language
                lang_clb = get_clb(lang)
                line2 = [
                    lang.test_type,
                    lang.reading,
                    lang.writting,
                    lang.listening,
                    lang.speaking,
                ]
                line3 = [
                    "CLB",
                    lang_clb.clb_r,
                    lang_clb.clb_w,
                    lang_clb.clb_l,
                    lang_clb.clb_s,
                ]
                [lang_table_data.append(l) for l in [line2, line3]]
                clbs.append(lang_clb.clb)

            if len(clbs) == 1:
                clb_string = f"CLB {lang_clb.clb}"
            else:
                clb_string = " | ".join([f"CLB {i}:{c}" for i, c in enumerate(clbs)])

            title = (
                "语言水平: " + clb_string
                if self.language == Language.CHINESE
                else "Language Proficiency: " + clb_string
            )
            return ConsoleTable(table_data=lang_table_data, title=title)

    def get_client_background(self, role: AssessModel):
        whom_cn = " - 主申请\n" if role == self.project.pa else "## 客户背景" + " - 配偶\n"
        whom_en = (
            " - Principle Applicant\n" if role == self.project.pa else " - Spouse\n"
        )
        sub_report = (
            "## 客户背景" + whom_cn
            if self.language == Language.CHINESE
            else "## Client Background" + whom_en
        )
        sub_report += (
            f"- 出生日期：{role.personal.dob.isoformat()} (年龄:{role.personal.age})\n"
            if self.language == Language.CHINESE
            else f"- DOB: {role.personal.dob.isoformat()} (Age: {role.personal.age})\n"
        )
        console.print(sub_report, style="white")
        education=self.get_education(role.education)
        if education:
            if type(education) == ConsoleTable:
                education.show(
                    markdown=self.args.markdown, markdown_title_style="-"
                )
            else:
                console.print(education,style="white")
                
        employment = self.get_employment(role.employment, for_past_10_years_only=False)
        if employment:
            if type(employment) == ConsoleTable:
                employment.show(
                    markdown=self.args.markdown, markdown_title_style="-"
                )
            else:
                console.print(employment,style="white")
        language=self.get_language(role.language)
        if language:
            language.show(
            markdown=self.args.markdown, markdown_title_style="-"
        )

    def get_solutions(self):
        for solution in self.project.solutions:
            if hasattr(solution, "show"):
                solution.show(markdown=self.args.markdown)
            else:
                solution.scoring.show(markdown=self.args.markdown)
                
            if type(solution) != ConsoleTable:
                solution.get_possibility().show_ita_chance(markdown=self.args.markdown)
                solution.get_possibility().show_count_summary(
                    markdown=self.args.markdown
                )

    def get_report(self):
        pa = self.project.pa
        sp = self.project.sp

        console.print(self.get_title(pa)) if pa else ""
        self.get_client_background(pa) if pa else ""
        self.get_client_background(sp) if sp else ""
        self.get_solutions()
