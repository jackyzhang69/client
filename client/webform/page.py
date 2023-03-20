""" 
WebPage is an abstrct class that represents a page in the web application.
It includes the following methods:
make_actions() - this method is called by the constructor and is used to implement the actions that are specific to the page.
previous()- goto the previous page in the workflow
next()- goto the next page in the workflow
"""

from playwright.sync_api import Page
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class WebPage(ABC):
    name: str
    page: Page
    data: object

    """ goto the url, usually only used by the first page in the workflow """

    def goto(self, url):
        self.page.goto(url)

    """ Make actions execute all the page form actions, except for the navigation actions """

    @abstractmethod
    def make_actions(self):
        pass

    """ got to the previous page in the workflow. If it's the first page, then do nothing. Normally, this method is not used. So here it is not abstract """

    def previous(self):
        pass

    """ got to the next page in the workflow. If it's the last page, then do nothing """

    @abstractmethod
    def next(self):
        pass

    def __str__(self):
        return self.name

    def save_img(self, name):
        self.page.screenshot(path=f"{name}.png")

    def save_pdf(self, name):
        self.page.pdf(path=f"{name}.pdf")
