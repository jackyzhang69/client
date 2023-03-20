from base.models.commonmodel import FormBuilderBase
from base.utils.jsonmaker import JsonMaker
from base.models.rcic import Rcics
from datetime import date


class FormBuilder5476(FormBuilderBase):
    def __init__(self, d5476: object, rcic_id_name: str, appoint: bool = True):
        self.d5476 = d5476
        self.form = JsonMaker()
        self.appoint = appoint
        self.rcic_id_name = rcic_id_name
        self.rcic = self.get_rcic(rcic_id_name)

    def state_form(self):
        self.form.add_form("5476")

    def get_rcic(self, rcic_id_name):
        return Rcics(self.d5476.rciclist).getRcicByIdName(rcic_id_name)

    def start(self):
        self.form.add_skip(5)

    def pick_rep_purpose(self):
        if self.appoint:
            self.form.add_checkbox(True)
            self.form.add_skip(1)
        else:
            self.form.add_skip(1)
            self.form.add_checkbox(True)

    def add_applicant(self):
        self.form.add_text(self.d5476.personal.last_name)
        self.form.add_text(self.d5476.personal.first_name)
        self.form.add_date(self.d5476.personal.dob)
        # currently ignore the application number
        self.form.add_skip(2)
        self.form.add_text(
            self.d5476.personal.uci
        ) if self.d5476.personal.uci else self.form.add_skip(1)

    # following adding applicant, there are add rep or cancel rep
    def add_rep(self):
        if not self.rcic:
            raise ValueError(f"RCIC with id_name {self.rcic_id_name} is not existed.")
        self.form.add_text(self.rcic.last_name)
        self.form.add_text(self.rcic.first_name)
        # skip to organization
        self.form.add_skip(4)
        self.form.add_checkbox(True)
        self.form.add_text(self.rcic.rcic_number)
        # employer name
        self.form.add_text(self.rcic.employer_legal_name)
        # skip to mailing address
        self.form.add_skip(2)
        # mailing address
        self.form.add_text(self.rcic.unit)
        self.form.add_text(self.rcic.street_number)
        self.form.add_text(self.rcic.street_name)
        self.form.add_text(self.rcic.city)
        self.form.add_text(self.rcic.province)
        self.form.add_text(self.rcic.country)
        self.form.add_text(self.rcic.post_code)
        self.form.add_text(self.rcic.country_code)
        self.form.add_text(self.rcic.phone)
        # skip to email
        self.form.add_skip(2)
        self.form.add_text(self.rcic.email)

        self.form.add_skip(1)
        self.form.add_text(date.today().strftime("%Y-%m-%d"))
        # self.form.add_skip(1)

        # skip to applicant date
        self.form.add_skip(7)
        self.form.add_text(date.today().strftime("%Y-%m-%d"))

    def cancel_rep(self):
        # skip from applicant to cancel rep
        self.form.add_skip(24)
        self.form.add_text(self.rcic.last_name)
        self.form.add_text(self.rcic.first_name)
        self.form.add_text(self.rcic.employer_legal_name)

        # skip to applicant date
        self.form.add_skip(4)
        self.form.add_text(date.today().strftime("%Y-%m-%d"))

    def get_form(self):
        self.state_form()
        self.start()
        self.pick_rep_purpose()
        self.add_applicant()
        if self.appoint:
            self.add_rep()
        else:
            self.cancel_rep()
        return self.form