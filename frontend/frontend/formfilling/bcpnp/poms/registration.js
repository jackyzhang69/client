/*
This includes registrant
*/

const WebPage = require('../../page');
const { print } = require('../../libs/output');


class Registrant extends WebPage {
    constructor(page, args) {
        super(page, "registrant", "Registrant", args.data.registrant);
        this.args = args;
    }

    async addEEInfo() {
        const ee = this.args.data.ee;
        await this.page.locator("#syncA_App_EE_ProfileNumber").fill(ee.profile_number);
        await this.page.locator("#syncA_App_EE_ExpiryDate").fill(ee.expiry_date);
        await this.page.locator("#syncA_App_EE_ValidCode").fill(ee.validation_code);
        await this.page.locator("#syncA_App_EE_CRS").fill(ee.score);
        await this.page.locator("#syncA_App_Job_NOC_EE").fill(ee.noc_code);
        await this.page.locator("#syncA_App_Job_Title_EE").fill(ee.job_title);
    }

    async checkStream() {
        const stream_on_page = await this.page.locator("h1 > small").innerText();
        if (stream_on_page !== this.args.data.stream.toUpperCase()) {
            print(`Stream on page is ${stream_on_page} but expected ${this.args.data.stream}`, "error");
            throw new Error("Stream on page is not the same as expected");
        }
    }


    async make_actions() {
        // check if the stream is same as you plan to apply
        await this.checkStream();

        await this.page.locator('label').filter({ hasText: 'I confirm the contact information, including the email and residential address a' }).check();
        this.data.have_active_registration ?
            await this.page.locator('uf-radio').filter({ hasText: '1. Do you currently have any other active registrations or applications with the' }).locator('label').nth(1).click()
            :
            await this.page.locator('uf-radio').filter({ hasText: '1. Do you currently have any other active registrations or applications with the' }).locator('label').nth(2).click();

        if (this.data.applied_before) {
            await this.page.locator('uf-radio').filter({ hasText: '2. Have you applied to the BC Provincial Nominee Program in the past? Required Y' }).locator('label').nth(1).click();
            await this.page
                .getByLabel("Previous file number")
                .fill(this.data.previous_file_number.toString());
        } else {
            await this.page.locator('uf-radio').filter({ hasText: '2. Have you applied to the BC Provincial Nominee Program in the past? Required Y' }).locator('label').nth(2).click();
        }

        const ee = [
            "Express Entry BC – Skilled Worker",
            "Express Entry BC – International Graduate"
        ];
        if (ee.includes(this.args.data.stream)) {
            await this.addEEInfo();
        }
    }

    async next() {
        await this.page.locator("li > a:has-text('Education')").click();
        await this.page.locator("h3:has-text('Education')")
    }
}

class Education extends WebPage {
    constructor(page, args) {
        super(page, "education", "Education", args.data.education);
    }

    async make_actions() {
        await this.page.getByRole('combobox', { name: 'Highest level of education completed? ' }).selectOption(this.data.highest_level);
        // input the date
        await inputDate(this.page, "#BCPNP_App_Edu_HighestLevel_Loc", this.data.graduate_date);

        // obtained in Canada?
        if (this.data.obtained_in_canada) {
            await this.page.locator('uf-radio').filter({ hasText: 'Did you obtain this education in Canada?' }).locator('label').nth(1).check();
            this.data.obtained_in_bc ?
                await this.page.locator('uf-radio').filter({ hasText: 'Did you obtain this education in British Columbia? Required Yes No Yes No' }).locator('label').nth(1).check()
                : await this.page.locator('uf-radio').filter({ hasText: 'Did you obtain this education in British Columbia? Required Yes No Yes No' }).locator('label').nth(2).check();
        } else {
            await this.page.locator('uf-radio').filter({ hasText: 'Did you obtain this education in Canada?' }).locator('label').nth(2).check();
        }
        // have eca?
        if (this.data.have_eca) {
            await this.page.locator('uf-radio').filter({ hasText: 'Do you have an Education Credential Assessment? Required Yes No Yes No' }).locator('label').nth(1).check();
            await this.page.getByRole('combobox', { name: 'Qualified suppliers' }).selectOption(this.data.qualified_supplier);
            await this.page.getByLabel('Certificate number').fill(this.data.certificate_number);

        } else {
            await this.page.locator('uf-radio').filter({ hasText: 'Do you have an Education Credential Assessment? Required Yes No Yes No' }).locator('label').nth(2).check();
        }
        // meet the professional designation requirement?
        if (this.data.meet_professional_designation_requirement) {
            await this.page.locator('uf-radio').filter({ hasText: 'Do you meet the requirements for a BC PNP eligible professional designation? Req' }).locator('label').nth(1).check();
            await this.page.getByLabel('Which eligible professional designation?').fill(this.data.professional_designation);
        } else {
            await this.page.locator('uf-radio').filter({ hasText: 'Do you meet the requirements for a BC PNP eligible professional designation? Req' }).locator('label').nth(2).check();
        }
    }

    async next() {
        await this.page.locator("li > a:has-text('Work Experience')").click();
        await this.page.locator("h3:has-text('Work Experience')")
    }
}

class WorkExperience extends WebPage {
    constructor(page, args) {
        super(page, "work_experience", "Work Experience", args.data.work_experience);
    }

    async make_actions() {
        // initially, we clear all previous records by clicking the No radio button
        await this.page.locator('uf-radio').filter({ hasText: 'Do you have directly related work experience at the same or higher NOC TEER cate' }).locator('label').nth(2).check();

        const jobs = this.data.length;
        if (jobs == 0) {
            await this.page.locator('uf-radio').filter({ hasText: 'Do you have directly related work experience at the same or higher NOC TEER cate' }).locator('label').nth(2).check();
        } else {
            await this.page.locator('uf-radio').filter({ hasText: 'Do you have directly related work experience at the same or higher NOC TEER cate' }).locator('label').nth(1).click();

            for (let i = 0; i < jobs; i++) {
                await this.page.locator(`#BCPNP_App_Work_Title-${i}`).fill(this.data[i].job_title);
                await this.page.locator(`#BCPNP_App_Work_NOC-${i}`).fill(this.data[i].noc_code);
                this.data.job_hours == 'Full-time'
                    ?
                    await this.page.locator(`//label[text()='Full-time']`).nth(i).check()
                    :
                    await this.page.locator(`//label[text()='Part-time']`).nth(i).check()

                await inputDate(this.page, `#BCPNP_App_Work_From-${i}`, this.data[i].start_date);
                if (this.data[i].end_date) {
                    await inputDate(this.page, `#BCPNP_App_Work_To-${i}`, this.data[i].end_date)
                } else {
                    const boxLocator = "//label[text()[normalize-space()='Present']]";
                    await this.page.locator(boxLocator).nth(i).check();
                }

                await this.page.locator(`#BCPNP_App_Work_Company-${i}`).fill(this.data[i].company_name);
                // was in canada?
                if (this.data[i].was_in_canada) {
                    await this.page.locator(`//label[@for='BCPNP_App_WorkExp_InCan-${i}-Yes']`).check();
                } else {
                    await this.page.locator(`//label[@for='BCPNP_App_WorkExp_InCan-${i}-No']`).check();
                }
                // add another job?
                if (i !== jobs - 1) await this.page.getByRole('link', { name: ' Add job' }).click();
            }
        }
    }



    async next() {
        await this.page.locator("li > a:has-text('Job Offer')").click();
        await this.page.locator("h3:has-text('Job Offer')")
    }

}


class JobOffer extends WebPage {
    constructor(page, args) {
        super(page, "job_offer", "Job Offer", args.data.job_offer);
    }

    async make_actions() {
        // company name

        await this.page.locator("#syncA_App_Emp_Comp_LegalName").fill(this.data.legal_name);
        if (this.data.operating_name) await this.page.locator("#syncA_App_Emp_Comp_OperName").fill(this.data.operating_name);
        // address
        await this.page.locator("#BCPNP_App_Job_WorkLocationAddrUnit").fill(this.data.unit_number);
        await this.page.locator("#BCPNP_App_Job_WorkLocationAddr").fill(this.data.street_address);
        await this.page.locator("#syncA_App_Job_WorkLocationCity").selectOption(this.data.city);
        await this.page.locator("#syncA_App_Job_WorkLocationPostal").fill(this.data.post_code);
        await inputPhone(this.page, "#BCPNP_App_Job_WorkLocationPhone", this.data.phone);
        // jof offer details
        await this.page.locator("#syncA_App_Job_Title").fill(this.data.job_title);
        await this.page.locator("#syncA_App_Job_NOC").fill(this.data.noc_code);

        await this.page.locator("#syncA_App_Job_HoursPerWeek").click({ count: 2 });
        await this.page.locator("#syncA_App_Job_HoursPerWeek").fill(this.data.hours_per_week);

        await this.page.locator("#syncA_App_Job_HourlyWage").click({ count: 2 });
        await this.page.locator("#syncA_App_Job_HourlyWage").fill(this.data.hourly_rate);

        await this.page.locator("#syncA_App_Job_AnnualWage").click({ count: 2 });
        await this.page.locator("#syncA_App_Job_AnnualWage").fill(this.data.annual_wage);

        // current working for the employer?
        if (this.data.current_working_for_employer) {
            // this.page.locator("#BCPNP_App_Job_Work_AtOfferedJob-Yes").check();
            await this.page.locator('uf-radio').filter({ hasText: 'Are you currently working for the employer in the job being offered? Required Ye' }).locator('label').nth(1).check();
            // working full time?
            this.data.working_full_time
                ? await this.page.locator('uf-radio').filter({ hasText: 'Are you working full-time in B.C. in the job being offered? Required Yes No Yes ' }).locator('label').nth(1).check()
                : await this.page.locator('uf-radio').filter({ hasText: 'Are you working full-time in B.C. in the job being offered? Required Yes No Yes ' }).locator('label').nth(2).check();
        } else {
            await this.page.locator('uf-radio').filter({ hasText: 'Are you currently working for the employer in the job being offered? Required Ye' }).locator('label').nth(2).check();
        }
        // meet any regional requirements?
        this.page.locator("#BCPNP_App_Requirements_RegionalExperienceAlumni").selectOption(this.data.meet_regional_requirements);
    }

    async next() {
        await this.page.locator("li > a:has-text('Language')").click();
        await this.page.locator("h3:has-text('Language')")
    }
}


class Language extends WebPage {
    constructor(page, args) {
        super(page, "language", "Language", args.data.language);
    }

    async inputEnglish() {
        const english = this.data.english;
        await this.page.locator("#syncA_App_LangTest_Type").selectOption(english.test_type);
        await inputDate(this.page, "#BCPNP_App_LangTest_Date", english.date_sign);
        await this.page.locator("#BCPNP_App_LangTest_ResListening").fill(english.listening);
        await this.page.locator("#BCPNP_App_LangTest_ResReading").fill(english.reading);
        await this.page.locator("#BCPNP_App_LangTest_ResWriting").fill(english.writting);
        await this.page.locator("#BCPNP_App_LangTest_ResSpeaking").fill(english.speaking);
        if (english.test_type === "IELTS") {
            await this.page.locator("#BCPNP_App_LangTest_CertNo").fill(english.test_report_number);
        } else if (english.test_type === "CELPIP") {
            await this.page.locator("#BCPNP_App_LangTest_CertNo").fill(english.registration_number);
            await this.page.locator("#BCPNP_App_LangTest_PIN").fill(english.pin);
        }
    }

    async inputFrench() {
        const french = this.data.french;
        await this.page.locator("#syncA_App_FrenchLangTest_Type").selectOption(french.test_type);
        await inputDate(this.page, "#BCPNP_App_FrenchLangTest_Date", french.date_session);
        await this.page.locator("#BCPNP_App_FrenchLangTest_ResListening").fill(french.listening);
        await this.page.locator("#BCPNP_App_FrenchLangTest_ResReading").fill(french.reading);
        await this.page.locator("#BCPNP_App_FrenchLangTest_ResWriting").fill(french.writting);
        await this.page.locator("#BCPNP_App_FrenchLangTest_ResSpeaking").fill(french.speaking);
        await this.page.locator("#BCPNP_App_FrenchLangTest_CertNo").fill(french.attestation_number);
    }

    async make_actions() {
        // 1. If have English
        if (this.data.english) {
            await this.page.locator("label[for='BCPNP_App_LangTest_Completed-No']").check(); // clear previoius data
            await this.page.locator("label[for='BCPNP_App_LangTest_Completed-Yes']").check();
            await this.inputEnglish();
        } else {
            await this.page.locator("label[for='BCPNP_App_LangTest_Completed-No']").check();
        }

        // 2. If have French
        if (this.data.french) {
            await this.page.locator("label[for='BCPNP_App_FrenchLangTest_Completed-No']").check();
            await this.page.locator("label[for='BCPNP_App_FrenchLangTest_Completed-Yes']").check();
            await this.inputFrench();
        } else {
            await this.page.locator("label[for='BCPNP_App_FrenchLangTest_Completed-No']").check();
        }
    }

    async next() {
        await this.page.locator("li > a:has-text('Submit')").click();
        await this.page.locator("h3:has-text('Declare and Submit')")
    }
}

class Submit extends WebPage {
    constructor(page, args) {
        super(page, "submit", "Declare and Submit", args.data.submit);
    }

    async make_actions() {
        await this.page.locator("uf-agreement label").check();
        await this.page.getByPlaceholder('Registrant\'s Full Name (required)').fill(this.data.pa_name);
        if (this.data.has_rep) {
            await this.page.locator('uf-radio').filter({ hasText: 'Did you hire a paid representative to help with filling out this form? Required ' }).locator('label').nth(1).check();
            const rep = this.data.rep;
            await this.page.getByLabel('Representative Family Name(s)').fill(rep.last_name);
            await this.page.getByLabel('Representative Given Name(s)').fill(rep.first_name);
            await inputPhone(this.page, "#BCPNP_App_RepPhone", rep.phone);
        } else {
            await this.page.locator('uf-radio').filter({ hasText: 'Did you hire a paid representative to help with filling out this form? Required ' }).locator('label').nth(2).check()
        }

    }

    async next() {
        await this.page.getByRole('button', { name: 'Save' }).click();
        await this.page.getByRole('button', { name: 'Validate' }).click();

        // check if passed validation
        const element = await Promise.race([
            this.page.waitForSelector("h4:has-text('There are some problems with the form data')"),
            this.page.waitForSelector("#uf-modal-label")
        ]);
        const result_text = await element.innerText();
        switch (result_text) {

            case "There are some problems with the form data":
                print("All forms are filled, but validation failed. Please check", "error");
                break;
            case "Success":
                await this.page.locator('div.modal-footer').locator('button:has-text("Close")').first().click();
                print("\nCongratulations! All forms are filled and validated.", "success");
                break;
        }
    }
}

async function inputDate(page, selector, the_date) {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.type(the_date);
    await page.keyboard.press('Enter');
}

async function inputPhone(page, selector, phone) {
    await page.click(selector, { clickCount: 2 });
    await page.keyboard.type(phone);
}


module.exports = { Registrant, Education, WorkExperience, JobOffer, Language, Submit };