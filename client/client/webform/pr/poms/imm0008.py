from playwright.sync_api import Page
from client.webform.page import WebPage
from client.system.config import console

class Imm0008Intro(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("link", name="Continue").click()
        self.page.wait_for_selector("//legend[text()='Where do you plan to live in Canada?']")
        
class ApplicationDetail(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Save and continue").click()
        self.page.wait_for_selector("//h2[text()='Personal details']")
        
class PersonalDetail(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Save and continue").click()
        self.page.wait_for_selector("//h2[text()='Contact information']")

class ContactInformation(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Save and continue").click()
        self.page.wait_for_selector("//h2[text()='Passport']")


class Passport(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Save and continue").click()
        self.page.wait_for_selector("//h2[text()='National identity document']")
        
class NationalID(WebPage):
    def make_actions(self):
        self.page.get_by_text("Yes").click()
        self.page.get_by_label("National identity document number (required)").fill("23423423")
        self.page.get_by_role("combobox", name="Country of Issue (required)").select_option("2: 151")
        self.page.get_by_label("Issue date (YYYY/MM/DD) (required)").fill("2020/01/01")
        self.page.get_by_label("Expiry date (YYYY/MM/DD) (required)").fill("2025/09/02")
    
    def next(self):
        try:
            self.page.get_by_role("button", name="Save and continue").click()
            self.page.wait_for_selector("//h2[text()='Education/occupation detail']")
        except:
            console.print("National ID section failed due to the website technical issue. So I checked 'No' for the section. Please correct it manually",style="red")
            self.page.locator("label[for='NICNo']").click()
            self.page.get_by_role("button", name="Save and continue").click()
            self.page.wait_for_selector("//h2[text()='Education/occupation detail']")
            
            
class EducationOccupation(WebPage):
    def make_actions(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Save and continue").click()
        self.page.wait_for_selector("//h2[text()[normalize-space()='Language detail']]")