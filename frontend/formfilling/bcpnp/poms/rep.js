/*
This includes representative page

 */
const WebPage = require('../../page');
const { print } = require('../../libs/output');

class Representative extends WebPage {
    constructor(page, args) {
        super(page, "representative", "Representative", args.data);
        this.args = args;
        this.add = true; // add or edit
    }

    async gotoRep() {
        await this.page.click("a:has-text('My Representative')");
        await this.page.waitForSelector("h1:has-text('MY REPRESENTATIVE')");
    }

    async checkAddOrEdit() {
        const theButton = await this.page.locator('a.btn').first(); // actually, no matter it's add or edit, it's the first button
        const innerText = await theButton.innerText();

        if (innerText === "Add Representative") {
            this.add = true;
        } else {
            this.add = false;
        }

        await theButton.click();
        await this.page.waitForSelector("h1:has-text('EDIT YOUR REPRESENTATIVE INFORMATION')");
    }

    async repInfo() {
        const rep = this.data.rep;
        await this.page.locator("#last_name").fill(rep.last_name);
        await this.page.locator("#first_name").fill(rep.first_name);
        await this.page.locator("#organization").fill(rep.orgnization);
        await this.page.locator("#phone").fill(rep.phone);
        if (rep.phone_secondary) {
            await this.page.locator("#phone_secondary").fill(rep.phone_secondary);
        } else {
            await this.page.locator("#phone_secondary").fill("")
        }

        await this.page.locator("#email").fill(rep.email);

        await this.page.locator("#country").selectOption(rep.country);
        await this.page.locator("#address_line").fill(rep.address_line);
        await this.page.locator("#city").fill(rep.city);
        await this.page.locator("#state").fill(rep.state);
        await this.page.locator("#postal_code").fill(rep.postal_code);
    }

    async repType() {
        // Only setup as: 1. paid 2. rcic
        await this.page.locator("input[value='Yes1']").check();
        await this.page.locator("input[value='Council']").check();
        await this.page.locator("#crc_membership_id").fill(this.data.rep.member_id);
    }

    async repAuth() {
        // Get the file input element
        const input = await this.page.locator('input[type="file"]').first();

        if (input) {
            // Set the file to upload
            await input.setInputFiles(this.args.rep_auth_applicant);
        } else {
            console.error('File input element not found');
        }

        await this.page.locator("input[type=checkbox][name='representative_authorization']").check();
        await this.page.locator("input[type=checkbox][name='rep_info_release_authorization']").check();
    }

    async repAuthEmployer() {
        // Get the file input element
        const input = await this.page.locator('input[type="file"]').last();

        if (input) {
            // Set the file to upload
            await input.setInputFiles(this.args.rep_auth_employer);
        } else {
            console.error('File input element not found');
        }
    }

    async make_actions() {
        await this.gotoRep();
        await this.checkAddOrEdit();
        await this.repInfo();
        await this.repType();
        await this.repAuth();
        await this.repAuthEmployer(); // only for skill immigration
    }

    async next() {
        await this.page.click('input[type=submit][value=Save]');
        const result = await this.page.waitForSelector("div.alert-success", { timeout: 10000 });
        if (result) {
            const done = this.add ? "created" : "updated";
            print(`Representative information has been ${done}.`, "success")
        } else {
            const done = this.add ? "create" : "update";
            print(`Representative information failed to ${done}.`, "error")
        }
    }

}

module.exports = { Representative };