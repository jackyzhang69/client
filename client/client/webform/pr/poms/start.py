from playwright.sync_api import Page
from client.webform.page import WebPage

""" Page login """


class Login(WebPage):
    data: object #TODO: CareerOwlDataModel
    url: str = "https://prson-srpel.apps.cic.gc.ca/en/rep/login"

    # login info
    def login(self):
        self.page.get_by_label("Username / Email address").fill("jackyzhang1969@outlook.com")
        self.page.get_by_label("Password", exact=True).fill("Super20220103!")
        

    def make_actions(self):
        self.goto(self.url)
        self.login()

    def next(self):
        self.page.get_by_role("button", name="Sign in").click()
        self.page.wait_for_selector("//button[text()=' Sign out ']")
        
class ViewApplication(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("link", name="View my Permanent Residence applications").click()
        self.page.wait_for_selector("//h1[text()='Your applications dashboard']")
        
class ApplicationPicker(WebPage):
    
    """ Pick the application by email and return the index of the row"""
    def pick(self, page: Page, email: str) -> str:
        page.wait_for_selector("table")
        link = page.evaluate(f'(email) => {{ \
            const table = document.querySelector("table"); \
            for (let i = 0; i < table.rows.length; i++) {{ \
                if (table.rows[i].cells[1].innerText.includes(email)) {{ \
                    const cell = table.rows[i].cells[6]; \
                    const linkElement = cell.querySelector("a"); \
                    return linkElement.href; \
                }} \
            }} \
            return null; \
        }}', email)
        return link


        
    def make_actions(self):
        self.url=self.pick(self.page,"jacky@gmail.com")
    
    def next(self):
        # accept the dialog for leaving
        self.page.on("dialog", lambda dialog: dialog.accept())
        self.goto(self.url)
        self.page.wait_for_selector("//h3[text()='Application forms']")

class FormPicker(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Edit IMM 0008").click()
        self.page.wait_for_selector("//h1[text()='Generic application form for Canada (IMM 0008)']")
        
     