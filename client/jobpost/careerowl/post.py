""" This is the main entry point for all page forms filling. """

from fileinput import filename
from playwright.sync_api import Playwright, sync_playwright
from client.webform.pages import WebPages
from client.jobpost.careerowl.poms import Login, Menu, Post, Release
from client.jobpost.careerowl.data_model import CareerOwlDataModel
import json, os
from typing import Union
from client.system.config import console
from base.utils.client.utils import timing
from base.source.excel import Excel
from client.jobpost.jobpost_model import JobPostModel
from client.jobpost.careerowl.data_model import JobPostModel2CareerowlAdaptor
from client.webform.filler import Filler


def build_pages(page,*,source_excel=None,**args):
    """Build pages according to page, page names, and data"""
    e=Excel(excel_name=source_excel)
    jobpost=JobPostModel(**e.dict)
    careerowl_data=JobPostModel2CareerowlAdaptor(jobpost_data=jobpost).convert()

    login_page = Login(name="login", page=page, data=careerowl_data)
    menu_page = Menu(name="menu", page=page, data=careerowl_data)
    post_page = Post(name="post", page=page, data=careerowl_data)
    release_page = Release(name="release", page=page, data=careerowl_data)
    web_pages = WebPages(pages=[login_page, menu_page, post_page, release_page])
    return web_pages.pages


@timing
def main():
    arguments={
        "source_excel":"/Users/jacky/desktop/output/test.xlsx",
        "pdf":False, 
        "png":False, 
        "folder":"/Users/jacky/desktop/screenshots"
    }
    Filler(headless=True).fill(build_pages,arguments)


if __name__ == "__main__":
    main()
