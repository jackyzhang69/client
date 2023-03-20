/* Page login */
const WebPage = require('../../page');

class Login extends WebPage {
    constructor(page, name, description, data) {
        super(page, name, description, data);
        this.url = "https://prson-srpel.apps.cic.gc.ca/en/rep/login";
        this.data = null; //TODO: CareerOwlDataModel
    }

    // login info
    async login() {
        await this.page.getByLabel("Username / Email address").fill("jackyzhang1969@outlook.com");
        await this.page.locator("#password").fill("Super20220103!");
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
    async make_actions() { }

    async next() {
        await this.page.getByRole("link", { name: "View my Permanent Residence applications" }).click();
        await this.page.waitForSelector("//h1[text()='Your applications dashboard']");
    }
}

class ApplicationPicker extends WebPage {
    constructor(page, name, description, data) {
        super(page, name, description, data);
        this.url = "";
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
        this.url = await this.pick(this.page, "jacky@gmail.com");
    }

    async next() {
        // accept the dialog for leaving
        await this.page.on("dialog", (dialog) => dialog.accept());
        await this.goto(this.url);
        await this.page.waitForSelector("//h3[text()='Application forms']");
    }
}

class FormPicker extends WebPage {
    async make_actions() { }

    async next() {
        await this.page.getByRole("button", { name: "Edit IMM 0008" }).click();
        await this.page.waitForSelector("//h1[text()='Generic application form for Canada (IMM 0008)']");
    }
}

module.exports = {
    Login,
    ViewApplication,
    ApplicationPicker,
    FormPicker
}