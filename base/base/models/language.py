from pydantic import BaseModel
from typing import Optional, List, Union,Literal,Set,Dict
from collections import namedtuple
from base.utils.language import IELTS,CELPIP,TEF,TCF

class LanguageBase(BaseModel):
    reading: Optional[float]
    writting: Optional[float]
    listening: Optional[float]
    speaking: Optional[float]
    test_type: Optional[Literal["IELTS","CELPIP",'TEF','TCF']]

    def __str__(self):
        return (
            str(self.test_type)
            + f"(R:{self.reading} W:{self.writting} L: {self.listening} S: {self.speaking})"
        )
    
    @property
    def ielts(self):
        if self.test_type=="IELTS":
            return IELTS(**self.dict())
    
    @property
    def celpip(self):
        if self.test_type=="CELPIP":
            return CELPIP(**self.dict())
    
    @property
    def tef(self):
        if self.test_type=="TEF":
            return TEF(**self.dict())
    
    @property
    def tcf(self):
        if self.test_type=="TCF":
            return TCF(**self.dict())


class Languages(object):
    def __init__(self, language_list: List[LanguageBase]) -> None:
        self.languages = language_list

    def getSpecifiedLanguage(self, test_type):
        language = [
            language for language in self.languages if language.test_type.upper() == test_type.upper()
        ]
        return language[0] if language else None

    @property
    def PreferredLanguage(self):
        for language_type in ["IELTS", "CELPIP", "TEF", "TCF"]:
            language = self.getSpecifiedLanguage(language_type)
            if language:
                return language

    @property
    def english(self):
        for language_type in ["IELTS", "CELPIP"]:
            language = self.getSpecifiedLanguage(language_type)
            if language:
                return language

    @property
    def french(self):
        for language_type in ["TEF", "TCF"]:
            language = self.getSpecifiedLanguage(language_type)
            if language:
                return language
