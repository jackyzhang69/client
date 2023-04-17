/* Page login */
const WebPage = require('../../models/page');
const { getActionableElementInRow, inputDate, makeElementVisible } = require('../../libs/playwright');
const { print } = require('../../libs/output')


class Login extends WebPage {
    constructor(page, args) {
        super(page, "login", "Login", args.data);
        this.args = args;
        this.url = "https://prson-srpel.apps.cic.gc.ca/en/rep/login";
    }

    // login info
    async login() {
        await this.page.locator("#username").fill(this.args.account);
        await this.page.locator("#password").fill(this.args.password);
    }

    async make_actions() {
        await this.goto(this.url);
        await this.login();
    }

    async next() {
        await this.page.getByRole("button", { name: "Sign in" }).click();
        await this.page.waitForSelector("//button[text()=' Sign out ']");
    }
}

class ViewApplication extends WebPage {
    constructor(page, args) {
        super(page, "view_application", "View application", args.data);
        this.args = args;
    }

    async make_actions() { }

    async next() {
        if (this.args.renew) {
            await this.page.locator("//a[contains(text(),'View my Permanent Residence card / Permanent Resident Travel Document application')]").click();
            await this.page.waitForSelector("h2:has-text('View my Permanent Resident card / Permanent Resident Travel Document application(s)')");
        } else {
            await this.page.getByRole("link", { name: "View my Permanent Residence applications" }).click();
            await this.page.waitForSelector("h1:has-text('Your applications dashboard')");
        }
    }
}


class ApplicationPicker extends WebPage {
    constructor(page, args) {
        super(page, "choose_applicant", "Choose applicant", args.data);
        this.args = args;
        // this.applicant = args.data.pa.personal.first_name + " " + args.data.pa.personal.last_name;
    }

    /* Pick the application by email and return the index of the row*/
    async pick(page, email) {
        await page.waitForSelector("table");
        const link = await page.evaluate((email) => {
            const table = document.querySelector("table");
            for (let i = 0; i < table.rows.length; i++) {
                if (table.rows[i].cells[1].innerText.includes(email)) {
                    const cell = table.rows[i].cells[6];
                    const linkElement = cell.querySelector("a");
                    return linkElement.href;
                }
            }
            return null;
        }, email);
        return link;
    }

    async make_actions() {

    }

    async next() {
        const table = await this.page.locator('table').first();
        const editButton = await getActionableElementInRow(table, this.args.client_account, 'View', 'link');
        if (await editButton.count() === 1) {
            await editButton.click();
        } else {
            print("No application found, please check principle applicant's email address", "error");
            process.exit(1);
        }
        await this.page.waitForSelector("h1:has-text('Permanent residence application')");
    }
}

class FormPicker extends WebPage {
    async make_actions() { }

    async next() {
        await this.page.getByRole("button", { name: "Edit IMM 0008" }).click();
        await this.page.waitForSelector("//h1[text()='Generic application form for Canada (IMM 0008)']");
    }
}

class RenewApplicationPicker extends WebPage {
    constructor(page, args) {
        super(page, "renew_app_picker", "Picking application", args.data);
        this.args = args;
    }

    /* Pick the application by email and return the index of the row*/
    async pick(email) {
        // select the initiated one and search by email
        await this.page.locator("#statusFilter").selectOption("Initiated");
        await this.page.locator("#search").fill(email);
        await this.page.locator("button[type='submit']").click();


    }

    async make_actions() {
        this.url = await this.pick(this.data.personal.email);
    }

    async next() {
        await this.page.waitForSelector("table");
        await this.page.locator('button:has-text("View")').first().click();
        await this.page.waitForSelector("h1:has-text('Application to get your first Permanent Resident card, to renew or to replace a Permanent Resident card')");
    }
}

class DashBoard extends WebPage {
    constructor(page, args) {
        super(page, "dashboard", "Dashboard", args.data);
        this.args = args;
    }

    // TODO: 
    async choose_why_and_upload() {
        // choose the reason and upload the related document. The data structure is a list of dict 
    }

    async make_actions() {
        if (this.args.renew) {
            if (this.data.application.is_urgent) {
                await this.page.locator("label[for='prc-is-urgent-yes']").check();
                await this.choose_why_and_upload();
            } else {
                await this.page.locator("label[for='prc-is-urgent-no']").check();
            }
        }

    }
    async next() {
        // here is the end of all forms and documents operations. 
        // All these ops will starts here and ends here
    }

}
module.exports = {
    Login,
    ViewApplication,
    ApplicationPicker,
    RenewApplicationPicker,
    DashBoard,
    FormPicker
}