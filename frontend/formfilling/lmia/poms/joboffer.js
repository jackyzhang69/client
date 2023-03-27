/* 
This moduel includes pages:
1. job_offer: Job offer

*/

const WebPage = require('../../page');
const { expect } = require('@playwright/test');

class JobOffer1 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer1", "Job offer start: is the job offer fulltime?", args.data.job_offer);
        this.stream = args.stream;
        this.hours_pay = args.data.hours_pay;
    }

    async make_actions() {
        // There are 3 textareas in this page if contingent wage is true else 2
        let textarea_no = 0;
        const textareas = await this.page.locator('textarea');
        // if has contingent wage, fill the details
        if (this.hours_pay.contingent_wage) {
            await textareas.nth(textarea_no).fill(this.hours_pay.contingent_wage_details);
            textarea_no++;
        }

        // fill the job title
        await this.page.locator("input[type=text]").fill(this.data.job_title);

        // fill the main duties
        await textareas.nth(textarea_no).fill(this.data.main_duties);
        textarea_no++;

        // fill the position requested retional
        await textareas.nth(textarea_no).fill(this.data.position_requested_retional);

        // fill the job start date
        await this.page.locator("input[type=date]").fill(this.data.job_start_date);

        // require a special language? 0 yes, 1 exempt, 2 no
        await this.page.locator("input[type=radio]").nth(this.data.require_special_language).check();

    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        const other_lang_element = await this.page.locator("fieldset[data-screen-item-name=OTHER_LANG_YN]")
        const minimum_edu = await this.page.locator("(//label[text()='Does this job have any minimum education requirements?']/following::input)[1]");
        if (this.data.require_special_language === 0) {
            await expect(other_lang_element).toBeVisible();
        }
        else {
            await expect(minimum_edu).toBeVisible();
        }
    }
}


class JobOffer2 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer2", "Job offer: language?", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {
        // if require special language, fill the details
        //  English:0, French:1, English and French:2. 
        if (this.data.require_special_language === 0) {
            const radios = this.page.locator(`input.nodeAnswer[type=radio][value=${this.data.oral_language}]`)
            await radios.nth(0).click();
            await radios.nth(1).click();

            // if require other language
            this.data.require_other_language ? await this.page.locator("input[type=radio][value=Yes]").click() : await this.page.locator("input[type=radio][value=No]").click();
        }

    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        await this.page.waitForSelector("h2:has-text('Job Offer Details')");
    }
}

class JobOffer3 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer3", "Job offer: education", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {
        // if not require special language
        if (this.data.require_special_language === 2) await this.page.locator("textarea").fill(this.data.reason_for_no);

        // if require special language, fill the details
        if (this.data.require_special_language === 0 && this.data.require_other_language) this.page.locator("textarea").fill(this.data.other_language)

        // has any minimum education requirements?
        this.data.has_minimum_education_req ? await this.page.locator("input[type=radio][value=Yes]").click() : await this.page.locator("input[type=radio][value=No]").click();
    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        await this.page.waitForFunction(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements.some(element => element.textContent.includes('Is the occupation regulated at a federal'));
        });
    }
}


class JobOffer4 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer4", "Job offer: education detail and license", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {
        // there are 2 textareas in this page if has minimum education requirements else 1
        let textarea_no = 0;
        const textareas = await this.page.locator('textarea');
        // if require minimum eudcation ,check the education level, refer to the page job offer details: progress 58%
        if (this.data.has_minimum_education_req) {
            // await this.page.check(`(//input[@type='checkbox'])[${this.data.minimum_education_level}]`)
            await this.page.check(`input[type="checkbox"][value="${this.data.minimum_education_level}"]`)
            await textareas.nth(textarea_no).fill(this.data.minimum_education_details);
            textarea_no++;
        }

        // miniumum skills and experience
        await textareas.nth(textarea_no).fill(this.data.minimum_skills_and_experience);

        // has any licsense requirements?
        this.data.has_license_req ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]");
    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        await this.page.waitForSelector("h2:has-text('Employment Benefits')");
    }
}


class JobOffer5 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer5", "Job offer: employment benefits", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {

        // if require license, fill the details
        if (this.data.has_license_req) {
            await this.page.locator('textarea').fill(this.data.license_req_details);
        }

        // is part of union?
        this.data.is_part_of_union ? await this.page.locator("input[type=radio][value=Yes]").click() : await this.page.locator("input[type=radio][value=No]").click();
    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        await this.page.waitForFunction(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements.some(element => element.textContent.includes('Will you be providing any benefits to the TFW?'));
        });
    }
}

class JobOffer6 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer6", "Job offer: will provide any benefits?", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {
        // will you provide any benefits?
        this.data.will_provide_benefits ? await this.page.locator("input[type=radio][value=Yes]").click() : await this.page.locator("input[type=radio][value=No]").click();
    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        this.data.will_provide_benefits ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Will you be providing disability insurance?'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Enter the number of paid vacation days provided:'));
            });
    }
}

class BenefitsDetails extends WebPage {
    constructor(page, args) {
        super(page, "benefits_details", "Job offer: benefits details", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {
        // there are 5 yes radio buttons and 5 no radio buttons
        const yes_radios = await this.page.locator("input[type=radio][value=Yes]");
        const no_radios = await this.page.locator("input[type=radio][value=No]");

        // will you provide disability insurance?
        this.data.has_disability_insurance ? await yes_radios.nth(0).click() : await no_radios.nth(0).click();

        // will you provide dental insurance?
        this.data.has_dental_insurance ? await yes_radios.nth(1).click() : await no_radios.nth(1).click();

        // will you enrol the TFW in an employer-provided pension?
        this.data.has_pension ? await yes_radios.nth(2).click() : await no_radios.nth(2).click();

        // Will you be providing extended medical insurance? (e.g. prescription drugs, paramedical services, medical services and equipment)
        this.data.has_extended_medical_insurance ? await yes_radios.nth(3).click() : await no_radios.nth(3).click();

        // Will you be providing any other benefits?
        this.data.has_other_benefits ? await yes_radios.nth(4).click() : await no_radios.nth(4).click();

    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        await this.page.waitForFunction(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements.some(element => element.textContent.includes('Enter the number of paid vacation days provided:'));
        });
    }
}

class JobOffer7 extends WebPage {
    constructor(page, args) {
        super(page, "job_offer7", "Job offer: vacation days", args.data.job_offer);
        this.stream = args.stream;
    }

    async make_actions() {
        // will you provide any other benefits?
        if (this.data.will_provide_benefits && this.data.has_other_benefits) {
            await this.page.locator('textarea').fill(this.data.other_benefits_details);
        }

        // below has two input fields with type =number
        // enter the number of paid vacation days provided
        const number_inputs = await this.page.locator('input[type="number"]')
        await number_inputs.nth(0).fill(this.data.vacation_days);
        // Enter the vacation pay percentage
        await number_inputs.nth(1).fill(this.data.vacation_pay_percentage);

    }

    async next() {
        // click next button
        await this.page.click("#next");

        // wait for the next page to load
        await this.page.waitForSelector("h2:has-text('Recruitment')")
    }
}


module.exports = {
    JobOffer1,
    JobOffer2,
    JobOffer3,
    JobOffer4,
    JobOffer5,
    JobOffer6,
    BenefitsDetails,
    JobOffer7
};