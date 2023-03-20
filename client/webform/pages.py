from client.webform.page import WebPage
from dataclasses import dataclass

""" Webpages actually represents a program's web forms filling workflow """


@dataclass
class WebPages:
    pages: list[WebPage]
    index: int = 0

    """ The class implements the iterator protocol"""

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.pages):
            raise StopIteration
        value = self.pages[self.index]
        self.index += 1
        return value

    def __str__(self):
        return ", ".join([page.name for page in self.pages])

    def get_web_page_by_name(self, name):
        for web_page in self.pages:
            if web_page.name == name:
                return web_page
        return None

    """ Skip forward to the page with the given name, ignore all pages' make_actions() methods "" """ ""

    def skip_forward_to(self, name):
        for web_page in self.pages:
            if web_page.name == name:
                return
            web_page.next()

    """ Skip backward to the page with the given name, ignore all pages' make_actions() methods "" """ ""

    def skip_backward_to(self, name):
        for web_page in self.pages:
            if web_page.name == name:
                return
            web_page.previous()
