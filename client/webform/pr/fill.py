""" This is the main entry point for all page forms filling. """

from fileinput import filename
from playwright.sync_api import Playwright, sync_playwright
from client.webform.pages import WebPages
import json, os
from typing import Union
from client.system.config import console
from base.utils.client.utils import timing
from base.source.excel import Excel
from client.webform.filler import Filler
from client.webform.pr.poms.start import Login,ViewApplication,ApplicationPicker,FormPicker
from client.webform.pr.poms.imm0008 import Imm0008Intro,ApplicationDetail,PersonalDetail,ContactInformation,Passport,NationalID,EducationOccupation

def build_pages(page,*,source_excel=None,**args):
    """Build pages according to page, page names, and data"""

    login_page = Login(name="login", page=page, data=None)
    view_page = ViewApplication(name="view_application", page=page, data=None)
    picker=ApplicationPicker(name="picker",page=page,data=None)
    form_picker=FormPicker(name="form_picker",page=page,data=None)
    imm0008_intro=Imm0008Intro(name="imm0008_intro",page=page,data=None)
    application_detail=ApplicationDetail(name="application_detail",page=page,data=None)
    personal_detail=PersonalDetail(name="personal_detail",page=page,data=None)
    contact_information=ContactInformation(name="contact_information",page=page,data=None)
    passport=Passport(name="passport",page=page,data=None)
    nation_id=NationalID(name="national_id",page=page,data=None)
    education_occupation=EducationOccupation(name="education_occupation",page=page,data=None)
    
    web_pages = WebPages(pages=[login_page, view_page,picker,form_picker,imm0008_intro,application_detail,personal_detail,contact_information,passport,nation_id,education_occupation])
    return web_pages.pages


@timing
def main():
    arguments={
        "source_excel":"/Users/jacky/desktop/output/test.xlsx",
        "pdf":False, 
        "png":False, 
        "folder":"/Users/jacky/desktop/screenshots",
        "skip_pages_range":[4,8]
    }
    Filler(headless=False).fill(build_pages,arguments)


if __name__ == "__main__":
    main()