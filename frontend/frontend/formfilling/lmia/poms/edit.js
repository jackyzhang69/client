/* 
In this module,  we will create the following pages:
edit: edit application
All these pages are common to all the programs.
*/


const WebPage = require('../../page');
const { selectOptionIncludeText } = require('../../libs/playwright');
const { print } = require('../../libs/output');

class Edit extends WebPage {
    constructor(page, lmiaNumber, data) {
        super(page, "edit", `Edit LMIA application ${lmiaNumber}`, data);
        this.lmiaNumber = lmiaNumber;
    }

    async make_actions() {
    }

    async next() {
        print("Clicking the file numbe. This action usually takes long time...", style = "info");
        await this.page.locator(`//a[contains(text(),'${this.lmiaNumber}')]`).click().then(() => { print("Clicked the file number to edit the application", style = "info"); }, (err) => { print(err, style = "error") });
        await this.page.waitForSelector("h1:has-text('Application Summary')",).then(() => { print("Turned page to application summary", style = "info"); }, (err) => { print(err, style = "error") });
    }
}

class EnterApplication extends WebPage {
    constructor(page, lmiaNumber, data) {
        super(page, "enter_application", `Enter LMIA application ${lmiaNumber}`, data);
    }

    async make_actions() {

    }

    async next() {
        // explicitly wait for the page to load
        await this.page.waitForSelector("//summary[text()='Employer Contact Information for this LMIA application']");
        // click the Employer Contact Informaton for this LMIA application
        await this.page.locator("//summary[text()='Employer Contact Information for this LMIA application']").click();
        // click the edit link
        await this.page.locator("//summary[text()='Employer Contact Information for this LMIA application']/following-sibling::a").click().then(() => { print("Clicked the edit link", style = "info"); }, (err) => { print(err, style = "error") })
        // wait for the page Employer Contact Information to load
        await this.page.waitForSelector("h2:has-text('Employer Contact Information for this LMIA application')").then(() => { print("Entered the application", style = "info"); }, (err) => { print(err, style = "error") })

    }
}

module.exports = {
    Edit,
    EnterApplication
}