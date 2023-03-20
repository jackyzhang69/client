"""" Register page object model """
from playwright.sync_api import Page
from client.jobpost.careerowl.data_model import CareerOwlDataModel
from client.webform.page import WebPage

""" Page login """


class Login(WebPage):
    data: CareerOwlDataModel
    url: str = "http://www.careerowl.ca/employers/emp_login.aspx"

    # login info
    def login(self):
        self.page.get_by_label("Employer Email:").fill(self.data.email)
        self.page.get_by_label("Password:").fill(self.data.password)

    def make_actions(self):
        self.goto(self.url)
        self.login()

    def previous(self):
        pass

    def next(self):
        self.page.get_by_role("button", name="Log In").click()
        self.page.wait_for_selector("#LinkButton1")


""" Page menu """


class Menu(WebPage):
    def make_actions(self):
        pass

    def previous(self):
        pass

    def next(self):
        self.page.get_by_role("link", name="Create a new job posting").click()
        self.page.wait_for_selector("#txtJobTitle")


""" Post job page """


class Post(WebPage):
    data: CareerOwlDataModel

    def make_actions(self):
        self.page.locator("#txtJobTitle").fill(self.data.job_title)
        self.page.locator("#lbCategories").select_option(label=self.data.category)
        self.page.locator("#txtCity").fill(self.data.city)
        self.page.locator("#txt_postal").fill(self.data.post_code)
        self.page.locator("#ddlRegion").select_option(self.data.province)
        self.page.locator("#txtSalary").fill(self.data.salary)

        self.page.get_by_role(
            "cell", name="Career Casual or Hourly Co-op Internship Volunteer Student"
        ).get_by_role("cell", name=f"{self.data.job_type}").click()
        self.page.get_by_label(self.data.hours).check()
        self.page.get_by_text(self.data.duration).click()
        # education and experience are special since they both have "Not required" option, so below is a safe way to select them
        self.page.query_selector_all(f':text("{self.data.education}")')[0].click()
        experinece=self.page.query_selector_all(f':text("{self.data.experience}")')
        experinece[0].click() if self.data.experience!="Not required" else experinece[1].click()
        self.page.locator("#DateTextbox").fill(self.data.closing_date)
        self.page.locator("#txtDesc").fill(self.data.job_description)
        self.page.locator("#TextWebLink").fill(self.data.web)
        self.page.locator("#TextEmail").fill(self.data.email)
        self.page.locator("#TextContactPerson").fill(self.data.contact_person)

    def previous(self):
        pass

    def next(self):
        self.page.locator("input[name='postmodi']").click()
        self.page.wait_for_selector("input[name='PreJobDetails1$Button_post']")


class Release(WebPage):
    def make_actions(self):
        pass

    def previous(self):
        pass

    def next(self):
        self.page.locator("input[name='PreJobDetails1$Button_post']").click()
        self.page.wait_for_selector("#returnedResults")
