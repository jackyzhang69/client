from playwright.sync_api import Page
from client.jobpost.jobspider.data_model import JobSpiderDataModel
from client.webform.page import WebPage
from client.system.config import console

""" Page create """


class Create(WebPage):
    data: JobSpiderDataModel
    url: str = "https://www.jobspider.com/job/CreateEmpAccount.asp"

    def make_actions(self):
        self.goto(self.url)
        self.create()

    def create(self):
        self.page.locator("input[name=\"username\"]").fill(self.data.username)
        self.page.locator("input[name=\"password1\"]").fill(self.data.password)
        self.page.locator("input[name=\"password2\"]").fill(self.data.password)
        self.page.locator("input[name=\"firstname\"]").fill(self.data.contact_first_name)
        self.page.locator("input[name=\"lastname\"]").fill(self.data.contact_last_name)
        self.page.locator("input[name=\"email\"]").fill(self.data.email)
        self.page.locator("input[name=\"street\"]").fill(self.data.street_address)
        self.page.locator("#CityText1").fill(self.data.city)
        self.page.locator("#StateList1").select_option(self.data.province)
        self.page.locator("input[name=\"zip\"]").fill(self.data.post_code)
        self.page.locator("input[name=\"phone\"]").fill(self.data.phone)
        self.page.locator("input[name=\"url\"]").fill(self.data.web)

    
    def previous(self):
        pass

    def next(self):
        self.page.get_by_role("button", name="Submit Information").click()
        text=self.page.locator("h1").inner_text()
        
        if text=="Account Created":
            console.print(f"Account created: {self.data.username}", style="green")
        if text=="UserName is Unavailable":
            console.print(f"The username {self.data.username} is not available, try to change one", style="red")
            
class Login(WebPage):
    data: JobSpiderDataModel
    url:str="https://www.jobspider.com/job/UserLogin.asp"
    
    def make_actions(self):
        self.goto(self.url)
        # login 
        self.page.locator("input[name=\"username\"]").fill("john_doe3")
        self.page.locator("input[name=\"password\"]").fill("password123")
        
    def previous(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Logon To The System").click()
        self.page.wait_for_selector("//a[contains(text(),'Log Off')]")

class Location(WebPage):
    data: JobSpiderDataModel
    
    def make_actions(self):
        # prepare to post
        self.page.get_by_role("link", name="Post a Job").click()
        # self.page.frame_locator("iframe[name=\"aswift_3\"]").frame_locator("iframe[name=\"ad_iframe\"]").get_by_role("button", name="Close ad").click()
        self.page.locator("#StateList1").select_option("CO")
        self.page.locator("#CityText1").fill("kl;kj")
        
    def previous(self):
        pass
    
    def next(self):
        self.page.get_by_role("button", name="Next...").click()
        self.page.wait_for_selector("input[name='ContactName']")

class Post(WebPage):
    data: JobSpiderDataModel

    def make_actions(self):
        self.page.locator("input[name=\"CompanyName\"]").fill("start here")
        self.page.locator("select[name=\"CompanyType\"]").select_option("Employer")
        self.page.locator("textarea[name=\"CompanyProfile\"]").fill("company brief")
        self.page.locator("input[name=\"Email\"]").fill("jacky@gmail.com")
        self.page.locator("select[name=\"MethodOfContact\"]").select_option("E-mail")
        self.page.locator("input[name=\"EmployerName\"]").fill("guangson ")
        self.page.locator("input[name=\"JobTitle\"]").fill("marketing ")
        self.page.locator("#Listbox2").select_option("8")
        self.page.locator("input[name=\"NumberOfOpenings\"]").fill("1")
        self.page.locator("input[name=\"Salary\"]").fill("24324234")
        self.page.locator("input[name=\"StartDate\"]").fill("2023-03-04")
        self.page.locator("textarea[name=\"JobDescription\"]").fill("job description")
        self.page.locator("textarea[name=\"JobRequirements\"]").fill("skills")
        self.page.get_by_role("button", name="Preview My Job").click()
        
        """ manually input captcha code """
        # wait for captcha code appear
        self.page.wait_for_selector("#imgCaptcha")
        
        # Register the prompt dialog response handler
        self.page.on('dialog', lambda dialog: print(dialog.message) if dialog.type == 'prompt' else dialog.dismiss())

        # Call the window.prompt() function
        code = self.page.evaluate('prompt("Please input the captcha code seen on the page(below Security Check):")')
        
        self.page.locator("#captchacode").fill(code)
        self.page.get_by_role("button", name="Post My Job").click()
        # self.page.expect('heading', to_be_visible=True, text='Job Added')
        if self.page.get_by_role("heading", name="Job Added").is_visible():
            console.print("Job added successfully", style="green")
        else:
            console.print("Job added failed", style="red")

    def previous(self):
        pass

    def next(self):
        pass