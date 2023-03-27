/*
This includes profile page: create client profile

 */

const WebPage = require('../../page');
const { print } = require('../../libs/output');
const { inputDate } = require('./common');

class Profile extends WebPage {
    constructor(page, args) {
        super(page, "register", "Register", args.data);
        this.url = "https://www.pnpapplication.gov.bc.ca/user/register";
    }

    async make_actions() {
        await this.page.goto(this.url);
        await this.login(this.data.email, this.data.password, this.data.user_id);
        await this.security(this.data.question_answers);
        await this.personal(this.data.person);
        await this.passport(this.data.passport);
        await this.contact(this.data.contact);
        await this.residential_address(this.data.address);
        await this.additional(this.data.additional);
    }

    async navigate() {
        await this.page.goto("https://www.pnpapplication.gov.bc.ca/user/register");
    }

    async login(email, password, user_id) {
        await this.page.locator("#email").fill(email);
        await this.page.getByLabel("Confirm email address").fill(email);
        await this.page.getByLabel("User ID").fill(user_id);
        await this.page.locator("#pass").fill(password);
        await this.page.getByLabel("Confirm password").fill(password);
    }

    async security(question_answers) {
        await this.page.locator("#question0").selectOption("_other");
        await this.page.getByRole("textbox", { name: "Enter your own question" }).fill(question_answers[0]["question"]);
        await this.page.locator("#answer0").fill(question_answers[0]["answer"]);
        await this.page.getByRole("combobox", { name: "Select 2nd Question" }).selectOption("_other");
        await this.page.locator("#question_other1").fill(question_answers[1]["question"]);
        await this.page.locator("#answer1").fill(question_answers[1]["answer"]);
        await this.page.getByRole("combobox", { name: "Select 3rd Question" }).selectOption("_other");
        await this.page.locator("#question_other2").fill(question_answers[2]["question"]);
        await this.page.locator("#answer2").fill(question_answers[2]["answer"]);
    }

    async personal(person, create_model = true) {
        await this.page.locator("#last_name").fill(person.last_name);
        await this.page.locator("#first_name").fill(person.first_name);

        // have used name
        if (person.has_used_name) {
            await this.page.getByLabel("Yes").check();
            await this.page.locator("#other_first_names").fill(person.used_first_name);
            await this.page.locator("#other_last_names").fill(person.used_last_name);
        } else {
            await this.page.getByLabel("No").check();
        }

        if (create_model) await inputDate(this.page, "#birth_date", person.dob);
        await this.page.getByRole("combobox", { name: "Country of birth" }).selectOption(person.country_of_birth);
        await this.page.getByLabel("City of birth").fill(person.place_of_birth);
        await this.page.getByRole("combobox", { name: "Gender" }).selectOption(person.sex);
    }

    async passport(passport_info) {
        await this.page.getByLabel("Passport number").fill(passport_info.number);
        await this.page.getByRole("combobox", { name: "Passport country" }).selectOption(passport_info.country);
        await inputDate(this.page, "#passport_issue_date", passport_info.issue_date);
        await inputDate(this.page, "#passport_expiry_date", passport_info.expiry_date);
    }

    async contact(phones) {
        await this.page.locator("#phone").fill(phones.PreferredPhone.country_code + "-" + phones.PreferredPhone.number);
        await this.page.getByLabel("Secondary phone number").fill("");
        if (phones.business.country_code && phones.business.number) await this.page.getByLabel("Business phone number").fill(phones.business.country_code + "-" + phones.business.number);
    }

    async residential_address(address) {
        await this.page.getByRole("group", { name: "Residential Address" }).getByRole("combobox", { name: "Country" }).selectOption(address.country);
        await this.page.getByLabel("Address line").fill(address.street);
        await this.page.getByLabel("City/Town").fill(address.city);
        await this.page.getByLabel("Province/State").fill(address.province);
        await this.page.getByLabel("Postal/ZIP code").fill(address.postal_code);
    }

    async additional(how_did_you_know = "CIC") {
        await this.page.getByRole("combobox", { name: "How did you learn about BC PNP?" }).selectOption(how_did_you_know);
    }

    async next() {
        await this.page.getByRole("button", { name: "Register" }).click();
        // Check if success or failed
        try {
            const result = await Promise.race([
                this.page.waitForSelector("h1:has-text('Confirm Your Profile')"),
                this.page.waitForSelector("li:text('This email address is already linked to an account in our system.')"),
                this.page.waitForSelector("li:text('User ID already exists in our system.')")
            ]);

            const result_text = await result.innerText();
            if (result_text !== "CONFIRM YOUR PROFILE") {
                print(`${result_text}`, "error");
                process.exit(1);
            }
        } catch (error) {
            print("There are something wrong after input the information. Please check", "error");
            print(error, "error");
            process.exit(1);
        }
    }
}

class Confirm extends WebPage {
    constructor(page, args) {
        super(page, "confirm", "Confirm", args.data);
    }

    async make_actions() {
        await this.page.locator("input[type=checkbox][name=confirmation]").check();
    }

    async next() {
        await this.page.locator("input[type=submit][value=Confirm]").click();

        const confirm = await this.page.waitForSelector("h1:has-text('CONFIRM YOUR EMAIL ADDRESS')");
        if (confirm) {
            print("The profile has been created. Please go confirm your email address", "success");
        } else {
            print("There are something wrong. Please check...", "error");
        }
    }
}


// profile update page. This page is used to update the profile in dashboard
// 1. On home page, click "My Profile" link
class Home extends WebPage {
    constructor(page, args) {
        super(page, "home", "Home", args.data);
    }

    async make_actions() {

    }

    async next() {
        await this.page.click("a:has-text('My Profile')");
        await this.page.waitForSelector("h1:has-text('MY PROFILE')");
        await this.page.click("a:has-text('Edit My Profile')");
        await this.page.waitForSelector("h1:has-text('EDIT YOUR PROFILE')");
    }
}

// 2. edit the profile
class ProfileUpdate extends Profile {
    constructor(page, args) {
        super(page, args);
    }

    async login(email, password, user_id) {
        await this.page.locator("#email").fill(email);
        await this.page.locator("#current_pass").fill(password);
        await this.page.locator("#new_pass").fill(password);
        await this.page.locator("#new_pass_confirmation").fill(password);
    }

    async make_actions() {
        await this.login(this.data.email, this.data.password);
        await this.personal(this.data.person, false);
        await this.passport(this.data.passport);
        await this.contact(this.data.contact);
        await this.residential_address(this.data.address);
        await this.additional(this.data.additional);
    }

    async next() {
        await this.page.locator("input[type=submit][value=Save]").click();
        const confirm = await this.page.waitForSelector("div.alert.alert-success");
        if (confirm) {
            print("The profile has been updated", "success");
        } else {
            print("There are something wrong. Please check...", "error");
        }
    }
}


module.exports = {
    Profile,
    Confirm,
    Home,
    ProfileUpdate
}