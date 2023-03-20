from base.models.timeduration import TimeDuration
from assess.model.fee import Fee, Fees
from pydantic import BaseModel
from typing import List, Union

from base.utils.db import Collection
from base.namespace import Language, stage_validator, get_stage_name_by_string
from enum import Enum
from assess.model.processingtime import ProcessingTime, ProcessingTimes
from assess.model.document import Document, Documents
from base.namespace import PRProgram
from base.utils.client.show import ConsoleTable,console

""" Stage is one of steps in Immigration process"""


class Stage(BaseModel):
    stage_name: str  # name of the stage, also the key of the stage in the database
    language: Enum = Language.ENGLISH

    @property
    def processing_time(self):
        """ In the collection of EE processing time in database, the stage name is EE Stream name."""
        stage_name=self.stream if hasattr(self,"stream") else self.stage_name
        pt = Collection("processing_time").find_one({"stage_name": stage_name})
        if not pt:
            raise ValueError(
                f"The database has no record of processing time for stage {self.stage_name}"
            )
        time_duration = TimeDuration(duration=pt.get("duration"), unit=pt.get("unit"))
        return ProcessingTime(
            stage_name=self.stage_name,
            description=pt.get("description",""),
            duration=time_duration,
        )

    def __handle_special_stage_name(self, stage_name: str):
        if stage_name in [
            PRProgram.PR_EE_ALL.value,
            PRProgram.PR_EE_CEC.value,
            PRProgram.PR_EE_PNP.value,
            PRProgram.PR_EE_FSW.value,
            PRProgram.PR_EE_FST.value,
        ]:
            return PRProgram.PR_EE.value
        else:
            return stage_name

    @property
    def fees(self):
        """Get the fee for a stage. The fee is a list of Fee object."""
        stage_name = self.__handle_special_stage_name(self.stage_name)
        fee = Collection("fee").find_one(
            {"stage_name": {"$elemMatch": {"$eq": stage_name}}}
        )
        if not fee:
            raise ValueError(
                f"The database has no record of fee for stage {self.stage_name}"
            )

        the_fees = [Fee(**f) for f in fee["fees"]]
        f=Fees(fees=the_fees, stage_name=self.stage_name, language=self.language)
        return f
    
    @property
    def fees_table(self):
        fees=self.fees
        return fees.get_fee_table()

    @property
    def applicant_qualification(self):
        return self.__get_qualification("applicant_requirement")

    @property
    def employer_qualification(self):
        return self.__get_qualification("employer_requirement")

    def __get_qualification(self, for_whom: str):
        # 1. find a stage requirements
        doc = Collection("requirement").find_one({"stage_name": self.stage_name})
        if not doc:
            return (
                f"The stage {self.stage_name} does not have {for_whom.replace('_',' ')}"
            )
        requirement = doc["data"][for_whom]
        return requirement[self.language.value]

    @property
    def documents(self):
        # 1. find a stage specific document requirement table
        doc = Collection("stage_doc").find_one({"name": self.stage_name})
        if not doc:
            raise ValueError(
                f"The database has no record of document for stage {self.stage_name}"
            )

        req_doc_list = doc["document_list"]
        special_remark_list = doc["special_remark"]
        # 2. fetch the final document list from document base  based on the request list
        req_docs = []
        for req_doc in req_doc_list:
            doc = Collection("document").find_one({"document_name": req_doc})
            if not doc:
                raise ValueError(
                    f"The database has no record of document for  {req_doc}"
                )
            # 3. if has specific remark, replace the standard one here
            if req_doc in special_remark_list:
                doc["remark"] = special_remark_list.get(req_doc)
            req_docs.append(doc)

        docs = [Document(**d) for d in req_docs]
        return Documents(
            documents=docs, stage_name=self.stage_name, language=self.language
        )

    @property
    def docs_table(self):
        return self.documents.get_doc_table()


class Stages:
    def __init__(self, stages: List[Stage], language=Language.ENGLISH):
        self.stages = stages
        self.language = language

    def print_all_stage_processing_time(
        self,
        language=Language.ENGLISH,
        markdown=False,
        markdown_titile_style="###",
        total_unit="months",
    ):

        pts = ProcessingTimes(
            processing_times=[stage.processing_time for stage in self.stages],
            language=self.language,
        )
        pts.get_processing_time_table(total_unit=total_unit).show(
            markdown=markdown, markdown_title_style=markdown_titile_style
        )

    def print_all_stage_docs(self, markdown=False, markdown_titile_style="###"):
        """Print out all the documents required for all the stages"""
        for stage in self.stages:
            stage.docs_table.show(
                markdown=markdown, markdown_title_style=markdown_titile_style
            )

    def print_all_stage_fees(self, markdown=False, markdown_titile_style="###"):
        """Print out all the fees required for all the stages"""
        for stage in self.stages:
            if stage.fees.total == 0:
                continue
            stage.fees_table.show(
                markdown=markdown, markdown_title_style=markdown_titile_style
            )

    def print_all_stage_qualification(self):
        """Print out all the qualification required for all the stages"""
        for stage in self.stages:
            stage_name = get_stage_name_by_string(stage.stage_name)
            console.print(
                f"Applicant qualification requirement for {stage_name}",
                style="bold green",
            )
            console.print(stage.applicant_qualification, style="white")

            console.print(
                f"Employer qualification requirement for {stage_name}",
                style="bold green",
            )
            console.print(stage.employer_qualification, style="white")
