""" This is the main entry point for all page forms filling. """

from fileinput import filename
from playwright.sync_api import Playwright, sync_playwright
from client.webform.pages import WebPages
from client.jobpost.jobspider.poms import Login,Location, Post
from client.jobpost.jobspider.data_model import JobSpiderDataModel
import json, os
from client.system.config import console
from base.utils.client.utils import timing
from base.source.excel import Excel
from client.jobpost.jobpost_model import JobPostModel
from client.jobpost.jobspider.data_model import JobPostModel2JobspiderAdaptor
from client.webform.filler import Filler

""" 
Every program webforms filling should have a build_pages function. 
It build up all pages required to be filled, and return the pages as a list.
Then the build_pages function, together with its required arguments, will be passed to the Filler class to fill the pages.
"""""
def build_pages(page,*,source_excel=None,**args):
    """Build pages according to page, page names, and data"""
    # e=Excel(excel_name=source_excel)
    # jobpost=JobPostModel(**e.dict)
    # careerowl_data=JobPostModel2CareerowlAdaptor(jobpost_data=jobpost).convert()

    careerowl_data = JobSpiderDataModel(
        **json.loads(open("client/jobpost/jobspider/data.json").read())
    )
    login = Login(name="login", page=page, data=careerowl_data)
    location = Location(name="location", page=page, data=careerowl_data)
    post = Post(name="post", page=page, data=careerowl_data)
    web_pages = WebPages(pages=[login,location,post])
    return web_pages.pages


@timing
def main():
    arguments={"source_excel":"/Users/jacky/desktop/output/test.xlsx","pdf":False, "png":True, "folder":"/Users/jacky/desktop/screenshots"}
    Filler(headless=False,slow_mo=0).fill(build_pages,arguments)

if __name__ == "__main__":
    main()
