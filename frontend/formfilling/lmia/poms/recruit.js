/* 
This moduel includes pages:
1. recruitment: Recruitment

*/

const WebPage = require('../../page');
const { expect } = require('@playwright/test');

class Recruitment extends WebPage {
    constructor(page, args) {
        super(page, "recruitment", "Recruitment: is job ad waivable?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        // 1. select the radio button
        this.data.job_ad_waivable ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.job_ad_waivable ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Specify the applicable variation'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Have you attempted to recruit Canadians'));
            });
    }
}

// Yes to job ad waivable
class RecruitmentWaivableYes extends WebPage {
    constructor(page, args) {
        super(page, "recruitment1yes", "Recruitment: job ad waivable, would like to provide recruitment details?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        // 1. provide the rational for meeting waivable requirement
        await this.page.locator("textarea").fill(this.data.waivable_rationale);
        // 2. select the radio button
        this.data.provide_recruitment_details ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.provide_recruitment_details ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Did you advertise using Job Bank?'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('How many employees are employed nationally under your 9-digit CRA'));
            });
    }
}

//  Jobbank
class RecruitmentJobbank extends WebPage {
    constructor(page, args) {
        super(page, "recruitment_jobbank", "Recruitment: job ad waivable-yes->would like to provide recruitment details->Jobbank?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        this.data.using_jobbank ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.using_jobbank ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Please select the job posting number advertised on Job Bank'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('How many employees are employed nationally under your 9-digit CRA'));
            });
    }
}

//  Recruted Canadians
class RecruitmentRecruitCanadians extends WebPage {
    constructor(page, args) {
        super(page, "recruitment_recruit_canadians", "Recruitment: job ad waivable-No->recruited Canadians->Jobbank?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        this.data.recruited_canadian ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.recruited_canadian ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Did you advertise using Job Bank?'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Please explain why you have not attempted to recruit Canadians'));
            });
    }
}


// return to lmi and benefits
class RecruitmentLmiBenefits extends WebPage {
    constructor(page, args) {
        super(page, "recruitment_lmi_benefits", "Recruitment:lmi and benefits", args.data.recruitment);
        this.stream = args.stream;
    }

    async recruitment_summary(input_elements, input_start_no, textareas, textarea_no) {
        await input_elements.nth(input_start_no).fill(this.data.resumes_received);
        await input_elements.nth(input_start_no + 1).fill(this.data.canadians_interviewed);
        await input_elements.nth(input_start_no + 2).fill(this.data.canadians_offered);
        await input_elements.nth(input_start_no + 3).fill(this.data.canadians_hired);
        await input_elements.nth(input_start_no + 4).fill(this.data.canadians_declined_offers);
        await input_elements.nth(input_start_no + 5).fill(this.data.resumes_not_interviewed_offered);
        await textareas.nth(textarea_no).fill(this.data.why_not_recruit_canadians);
    }

    async laboru_market_impacts(input_elements, input_start_no, radio_elements, radio_start_no) {
        await input_elements.nth(input_start_no).fill(this.data.employees_number);
        await radio_elements.nth(radio_start_no).click();
    }

    async page_not_used_jobbank(textareas, inputs, radios) {
        await textareas.nth(0).fill(this.data.why_not_use_jobbank);
        // recruitment summary
        await this.recruitment_summary(inputs, 0, textareas, 1);
        // labour market impacts
        this.data.revenue_more_than_5m ? await this.laboru_market_impacts(inputs, 6, radios, 0) : await this.laboru_market_impacts(inputs, 6, radios, 1);
        // benefits: job creation
        this.data.job_creation ? await radios.nth(2).click() : await radios.nth(3).click();
    }

    async page_used_jobbank(inputs, textareas, radios) {
        await inputs.nth(0).fill(this.data.jobbank_posting_no);
        // recruitment summary
        await this.recruitment_summary(inputs, 1, textareas, 0);
        // labour market impacts
        this.data.revenue_more_than_5m ? await this.laboru_market_impacts(inputs, 7, radios, 0) : await this.laboru_market_impacts(inputs, 7, radios, 1);
        // benefits: job creation
        this.data.job_creation ? await radios.nth(2).click() : await radios.nth(3).click();
    }

    async make_actions() {
        // get all the input elements, radio elements and textareas
        // their index number will be changed according to the different conditions
        const inputs = await this.page.locator("input[type=number]");
        const radios = await this.page.locator("input[type=radio]");
        const textareas = await this.page.locator("textarea");
        /// if job ad waivable?
        if (this.data.job_ad_waivable) {
            // would like to rovide details?
            if (this.data.provide_recruitment_details) {
                this.data.using_jobbank
                    ? await this.page_used_jobbank(inputs, textareas, radios)
                    : await this.page_not_used_jobbank(textareas, inputs, radios);
            } else {
                // labour market impacts
                this.data.revenue_more_than_5m ? await this.laboru_market_impacts(inputs, 0, radios, 0) : await this.laboru_market_impacts(inputs, 0, radios, 1);
                // benefits: job creation
                this.data.job_creation ? await radios.nth(2).click() : await radios.nth(3).click();
            }
        } else {
            if (this.data.recruited_canadian) {
                this.data.using_jobbank
                    ? await this.page_used_jobbank(inputs, textareas, radios)
                    : await this.page_not_used_jobbank(textareas, inputs, radios);
            } else {
                // why not attempt to recruit Canadians
                await textareas.nth(0).fill(this.data.why_not_attempted_to_recruit_canadians);
                this.data.revenue_more_than_5m ? await this.laboru_market_impacts(inputs, 0, radios, 0) : await this.laboru_market_impacts(inputs, 0, radios, 1);
                // benefits: job creation
                this.data.job_creation ? await radios.nth(2).click() : await radios.nth(3).click();
            }
        }
    }



    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.job_creation ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Please provide details to explain why hiring a TFW will result in the direct job creation'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Will hiring a TFW result in the development or transfer of skills'));
            });
    }
}

//  job creation details and skill transfer question
class Recruitment2 extends WebPage {
    constructor(page, args) {
        super(page, "recruitment2", "Recruitment: Skill transfer?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        if (this.data.job_creation) {
            await this.page.locator("textarea").fill(this.data.job_creation_details);
        }
        this.data.transfer_skills ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.transfer_skills ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Please provide details to explain why hiring a TFW will result in the development or transfer of skills'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Will hiring a TFW fill a labour shortage'));
            });
    }
}

//  skill transfer details and fill labour shortatge quesiton
class Recruitment3 extends WebPage {
    constructor(page, args) {
        super(page, "recruitment3", "Recruitment: Fill labour shortage?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        if (this.data.transfer_skills) {
            await this.page.locator("textarea").fill(this.data.transfer_skills_details);
        }
        this.data.fill_labour_shortage ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.fill_labour_shortage ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Please provide details to explain why hiring a TFW will result in the development or transfer of skills'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Will hiring a TFW fill a labour shortage'));
            });
    }
}


//   fill labour shortatge details and lay off question
class Recruitment4 extends WebPage {
    constructor(page, args) {
        super(page, "recruitment4", "Recruitment: Laid off?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        const textareas = await this.page.locator("textarea")
        let textarea_no = 0;
        if (this.data.fill_labour_shortage) {
            await textareas.nth(0).fill(this.data.fill_labour_shortage_details);
            textarea_no = 1;
        }
        await textareas.nth(textarea_no).fill(this.data.other_benefits);
        this.data.laid_off ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.laid_off ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('How many Canadians/permanent residents did you lay off'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Will the hiring of TFWs requested in this application lead to job losses'));
            });
    }
}

//   lay off details and lead to job loss question
class Recruitment5 extends WebPage {
    constructor(page, args) {
        super(page, "recruitment5", "Recruitment: Lead to job loss?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        if (this.data.laid_off) {
            const inputs = await this.page.locator("input[type='number']")
            await inputs.nth(0).fill(this.data.laid_off_canadians);
            await inputs.nth(1).fill(this.data.laid_off_tfw);
            await this.page.locator("textarea").fill(this.data.laid_off_reason);
        }
        this.data.lead_to_job_losss ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.lead_to_job_losss ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Provide details on the impact of hiring the TFW(s) on your workforce'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Does the business receive support through Employment'));
            });
    }
}

//   lead to job loss details and receive support question
class Recruitment6 extends WebPage {
    constructor(page, args) {
        super(page, "recruitment6", "Recruitment: Reseived support from esdc?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        if (this.data.lead_to_job_losss) {
            await this.page.locator("textarea").fill(this.data.lead_to_job_losss_details);
        }
        this.data.receive_support_from_esdc ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.receive_support_from_esdc ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Provide details regarding the support'));
            })
            :
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Is there a labour dispute in progress'));
            });
    }
}

//   receive support details and labour dispute question
class Recruitment7 extends WebPage {
    constructor(page, args) {
        super(page, "recruitment7", "Recruitment: Is there a labour dispute in progress?", args.data.recruitment);
        this.stream = args.stream;
    }

    async make_actions() {
        if (this.data.receive_support_from_esdc) {
            await this.page.locator("textarea").fill(this.data.receive_support_from_esdc_details);
        }
        this.data.labour_dispute ? await this.page.locator("input[type='radio'][value='Yes']").click() : await this.page.locator("input[type='radio'][value='No']").click();
    }

    async next() {
        await this.page.click("#next");
        // wait for the next page to load
        this.data.labour_dispute ?
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Please provide details regarding the labour dispute'));
            })
            :
            await this.page.waitForSelector('h2:has-text("Finalize Application")');
    }
}


//    labour dispute details 
class RecruitmentFinal extends WebPage {
    constructor(page, args) {
        super(page, "recruitment_final", "Recruitment: Finalize application?", args.data.recruitment);
        this.stream = args.stream;
        this.upload_file = args.upload_file;
        this.upload_folder = args.upload_file_path;
    }

    async make_actions() {
        if (this.data.labour_dispute) {
            await this.page.locator("textarea").fill(this.data.labour_dispute_details);
        }
    }

    async next() {
        await this.page.locator("#documents").click();
        await this.page.waitForSelector("#uploadDocument");
    }
}


module.exports = {
    Recruitment,
    RecruitmentWaivableYes,
    RecruitmentJobbank,
    RecruitmentRecruitCanadians,
    RecruitmentLmiBenefits,
    Recruitment2,
    Recruitment3,
    Recruitment4,
    Recruitment5,
    Recruitment6,
    Recruitment7,
    RecruitmentFinal

}