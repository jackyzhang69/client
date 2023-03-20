from re import L
from pydantic import BaseModel
from typing import List, Optional, Union
from base.utils.client.show import ConsoleTable
from base.utils.utils import is_in_tags
from enum import Enum
from base.namespace import Language, get_stage_name_by_string

""" Document is one piece of documents"""


class Document(BaseModel):
    document_name: str  # name of the document
    document: list[str]  # document content in different languages
    remark: Optional[list[str]]  # remark of the document in different languages
    doc_type: str
    tag: List[str]
    # language: Enum = Language.ENGLISH


"""" Documents is a list of documents required in a certain stage"""


class Documents:
    def __init__(
        self,
        documents: List[Document],
        stage_name: str,
        language: Enum = Language.ENGLISH,
    ):
        self.documents = documents
        self.stage_name = stage_name
        self.language = language

    @property
    def tags(self):
        all_tages = []
        for doc in self.documents:
            all_tages += doc.tag
        return list(set(all_tages))

    """ get a printable table from an assigned list of documents. The docs could be a subset of self.documents. """

    def get_doc_table(self, with_sorted=True, with_title=True, docs=None):
        the_documents = self.documents if docs == None else docs
        if len(the_documents) == 0:
            # raise ValueError("There is no document in the document list")
            return []

        if with_sorted:
            the_documents = sorted(
                the_documents, key=lambda x: x.doc_type, reverse=True
            )

        titles = [
            key.title()
            for key in the_documents[0].dict().keys()
            if key not in ["document_name", "doc_type", "tag", "language"]
        ]
        titles = ["No", *titles]
        values = [titles] if with_title else []

        for index, doc in enumerate(the_documents):
            doc_content = [
                v
                if k not in ["document", "remark"]
                else v[self.language.value]  # get value based on language
                for k, v in doc.dict().items()
                if k
                not in [
                    "name",
                    "doc_type",
                    "tag",
                    "language",
                ]  # ignore name, type, tag and language
            ]
            doc_content = [
                index + 1,
                *doc_content[1:],
            ]  # ignore the document name variable
            values.append(doc_content)

        """ Assemelbe data into a table."""
        title = f"Document list for {get_stage_name_by_string(self.stage_name)}"
        table = ConsoleTable(title=title, table_data=values)
        return table

    """ Get a table of documents based on the tag."""

    def get_taged_doc_table(
        self, tag: Union[str, list[str]], with_sorted=True, with_title=True
    ):
        documents = [doc for doc in self.documents if is_in_tags(tag, doc.tag)]
        return self.get_doc_table(
            docs=documents, with_sorted=with_sorted, with_title=with_title
        )
