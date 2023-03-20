from dataclasses import dataclass
from client.jobpost.jobpost_model import JobPostModel,ErAddresses
from base.models.mediaaccount import MediaAccounts
from base.models.address import Addresses
from base.ai.ai import get_ai_answer
from datetime import timedelta,datetime

""" 
1. Define target model: CareerOwlDataModel
2. Define pydantic model: get data from existing model(excel / database)
3. Define adaptor: convert pydantic model to target model
4. Repeat 1-3 for other target models, then get a integrated pydantic model for job posting
"""


@dataclass
class JobPostModel2JobspiderAdaptor:
    jobpost_data: JobPostModel

    
    def convert(self):
        # convert jobpost_model to CareerOwlDataModel
        
        media_accounts=MediaAccounts(media_accounts=self.jobpost_data.mediaaccount) 
        careerowl_account=media_accounts.get_media_by_name('careerowl')
        if not careerowl_account:
            raise ValueError('No careerowl account found')

        # Using AI to get category
        
        addresses=ErAddresses(address_list=self.jobpost_data.eraddress)
        working_address=addresses.working
        
        careerowl_data=CareerOwlDataModel(
            email=careerowl_account.account,
            password=careerowl_account.password,
            job_title=self.jobpost_data.joboffer.job_title,
            category=self.get_category(),
            city=working_address.city,
            province=working_address.province,
            post_code=working_address.post_code,
            salary=f"{self.jobpost_data.joboffer.wage_rate} / {self.jobpost_data.joboffer.wage_unit}",
            job_type="Career",
            hours="Full time only",
            duration=self.get_duration(self.jobpost_data.joboffer.permanent),
            education=self.get_education(),
            experience=self.get_experience(),
            closing_date=(datetime.today()+timedelta(days=365)).date().isoformat(),
            job_description="\n".join(self.jobpost_data.joboffer.duties),
            web=self.jobpost_data.general.website or "",
            contact_person=""
        )
        
        return careerowl_data


    # Using AI to get category
    def get_category(self):
        category=get_ai_answer(self.get_category_prompt(self.jobpost_data.joboffer.job_title),answer_is_json=False)
        return category
    
    def get_category_prompt(self, job_title):
        categories=[
            "Adm/Office Support",
            "Biotech/Pharmacy",
            "Education",
            "Engineer/Applied Sci",
            "Finance",
            "Health Care",
            "Hospitality/Tourism",
            "Human Resources",
            "Insurance",
            "IT and e-Commerce",
            "Legal",
            "Manager/Admin",
            "Marketing",
            "Mfg and Processing",
            "Natural Sciences",
            "Other",
            "Primary Industry",
            "Production Mgmt",
            "Public Service",
            "Recreation/Culture",
            "Retail",
            "Sales and Service",
            "Social Science",
            "Student Jobs",
            "Technology",
            "Trades and Transp",
        ]
        
        prompt=f""" 
            I have a categories list: {categories},tell me which category should the {job_title} belongs to? Give me the result only the category you picked word in the list.Nothing more.
        """
        return prompt
    
    # There are types as :Career,Casual or Hourly,Co-op,Internship,Volunteer,Student. In our case, we only need to consider Career

    def get_duration(self,permanent):
        return "Permanent" if permanent else "Temporary"
    
    def get_experience(self):
        experience=[
            "Not required",
            "1 year or less",
            "2-4 years",
            "5 years or above"
        ]
        prompt=self.get_experience_prompt(experience)
        required_experience=get_ai_answer(prompt,answer_is_json=False)
        
        return required_experience
    
    def get_experience_prompt(self,experience):
        prompt=f""" 
            I have a experience list: {experience},tell me which experience should the {self.jobpost_data.joboffer.skill_experience_requirement} belongs to? Give me the result only the experience you picked word in the list.Nothing more.
        """
        return prompt
    
    def get_education(self):
        prompt=self.get_education_prompt()
        required_education=get_ai_answer(prompt,answer_is_json=False)
        
        return required_education
    def get_education_prompt(self):
        education=[
            " Not required",
            "Hgh school",
            "College/Technical school",
            "University or above"
        ]
        prompt=f""" 
            I have a education list: {education},tell me which education should the {self.jobpost_data.joboffer.specific_edu_requirement} belongs to? Give me the result only the education you picked word in the list.Nothing more.
        """
        return prompt


@dataclass
class JobSpiderDataModel:
    username:str
    email: str
    password: str
    contact_first_name: str
    contact_last_name: str
    street_address: str
    city: str
    province: str   #TODO: Full name of province + ' - Canada'
    post_code: str
    phone: str
    web: str

    # salary: str
    # job_type: str
    # hours: str
    # duration: str
    # experience: str
    # education: str
    # closing_date: str
    # job_description: str
    # job_title: str
    # category: str