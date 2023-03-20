/* 
In this module,  we will create the following pages:
login: login page
security: security question page
terms: terms and conditions page
employer_picker: employer picker page

All these pages are common to all the programs.
*/


const WebPage = require('../../page');

class Login extends WebPage {
    constructor(page, login_data) {
        super(page, "login", "Log in", login_data);
        this.url = "https://tfwp-jb.lmia.esdc.gc.ca/employer/";
    }

    // login info
    async login() {
        await this.page.getByPlaceholder('Email (required)').fill(this.data.email);
        await this.page.getByPlaceholder('Password (required)').fill(this.data.password);
    }

    async make_actions() {
        await this.goto(this.url);
        await this.login();
    }

    async next() {
        await this.page.getByRole('button', { name: 'Sign in' }).click();
        await this.page.waitForSelector("h1[property='name']");
    }
}

class Security extends WebPage {
    constructor(page, securityQA) {
        super(page, "security", "Security question", securityQA);
    }

    // Get security question and answer
    async get_pass_security_check() {
        const questionElement = await this.page.locator('span.field-name').first();
        const question = await questionElement.innerText();

        for (const [key, answer] of Object.entries(this.data)) {
            if (question.includes(key)) {
                await this.page.locator("css=#securityForm\\:input-security-answer").fill(answer);
                return;
            }
        }
        throw new Error(
            "It seems your question-answer pairs are not correct. Please check .immenv to correct it"
        );
    }


    async make_actions() {
        await this.get_pass_security_check();
    }

    async next() {
        await this.page.locator("#continueButton").click();
        await this.page.waitForSelector("button[title='Agree']");
    }
}

class Terms extends WebPage {
    constructor(page, data) {
        super(page, "terms", "Important message", data);
    }

    async make_actions() {
    }

    async next() {
        await this.page.locator("#modal-accept").click();
        await this.page.waitForSelector("h1[property='name']");
    }
}

class EmployerPicker extends WebPage {

    constructor(page, craNumber) {
        super(page, "pick_employer", "Pick employer", craNumber);
    }

    async pickEmployer() {
        // Find and click the "Filter items" button
        await this.page.locator('text=Filter items').click();

        // Fill the CRA number in the input field
        await this.page.locator('text=Filter items').fill(this.data);

        // Since there will be only one row in the table, so just go the cells
        const cells = await this.page.locator('css=table tr td');

        try {
            if (await cells.nth(1).innerText() === this.data) {
                // Select the link in column 0
                const linkElement = await cells.nth(0).locator('css=a');
                // Get link href
                await linkElement.click();
            }
        } catch (error) {
            throw new Error(`Please check the employer's CRA number (${this.data}). It doesn't exist in the system.`);
        }
    }

    async make_actions() {

    }

    async next() {
        await this.pickEmployer();
        await this.page.waitForSelector("//a[contains(text(),'Create LMIA Application')]");
    }
}
module.exports = {
    Login,
    Security,
    Terms,
    EmployerPicker
}