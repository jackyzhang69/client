// imm5406 page object model

const WebPage = require('../../models/page');
const { getActionableElementInRow, inputDate } = require('../../libs/playwright');
const { remove, get_family_member, get_addresses, get_age } = require("./common");
const { print } = require("../../libs/output");


const get_role_data = (args, role, index = 1) => {
    switch (role) {
        case "PA":
            return args.data.imm5406.pa;
        case "SP":
            return args.data.imm5406.sp;
        case "DP":
            return args.data.imm5406.dp[index - 1];
    }
}


class Dashboard5406 extends WebPage {
    constructor(page, args) {
        super(page, "dashboard5406", "Dash board enter imm5406", args.data.imm5406);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        const table = await this.page.locator('table').first();
        const editButton = await getActionableElementInRow(table, 'IMM 5406', 'Edit', 'button');
        await editButton.click();
        await this.page.waitForSelector("h1:has-text('Additional family information')");
    }
}

// Here is sub dashboard for imm5406, I call it hub5406
class Hub5406 extends WebPage {
    constructor(page, args, role, index = 1) {
        const role1 = role === "DP" ? `${role}${index}` : role;
        super(page, `${role1.toLowerCase()}_5406`, `${role1} imm5406`, get_role_data(args, role, index));
        this.role = role;
        this.args = args;
        this.create = true;
    }

    async make_actions() {
        try {
            await this.page.waitForSelector(alertSelector, { timeout: 5000 });
            if (await this.page.$(alertSelector)) {
                // Extract the alert message text
                const alertMessage = await this.page.$eval(`${alertSelector} p.alert-text`, (element) => element.textContent);
                if (alertMessage.includes("There was a technical error when handling your request. Please try again later.")) {
                    print(`Alert message:${alertMessage}`, "error");
                    print(`How to fix it: The current slow motion speed is too fast (${this.args.slow_mo}ms), please try slower speed(exp: ${this.args.slow_mo === 0 ? 300 : this.args.slow_mo * 1.5}ms), check your argument slow_mo`, "info");
                    process.exit(1);
                }
                await this.page.click(alertCloseButtonSelector);
            }
        } catch (error) {
            // do nothing, means no alert
        }

        // check if previously filled
        await this.page.waitForSelector('button:has-text("Add new family member")');
        // delete uncompleted family member
        await this.remove_not_provided_person();

        // loop through family members
        await this.edit_or_create(this.data, this.role);

    }

    async edit_or_create(data, role) {
        // check if this person is already in the table
        const has_this_person = await this.page.locator("table tr")
            .filter({ hasText: this.data.full_name })
            .count() > 0;
        //if not add new member
        this.create = has_this_person ? false : true;
    }

    async remove_not_provided_person() {
        while (true) {
            const has_not_provided = await this.page.locator("table tr")
                .filter({ hasText: "Not provided" })
                .count() > 0;
            if (!has_not_provided)
                break;
            const table = await this.page.locator('table').first();
            const deleteButton = await getActionableElementInRow(table, "Not provided", 'Delete', 'button');
            await deleteButton.click();
            await this.page.locator("button.btn-primary:has-text('Delete')").click();

            // after delete all not provided person, maybe a technical error banner will show up
            // Check if the custom alert is present
            const alertSelector = 'lib-alert div[role="alertdialog"].alert-card';
            const alertCloseButtonSelector = 'lib-alert button.alert-close-button';

            await this.page.waitForSelector(alertSelector, { timeout: 5000 });
            if (await this.page.$(alertSelector)) {
                // Extract the alert message text
                const alertMessage = await this.page.$eval(`${alertSelector} p.alert-text`, (element) => element.textContent);
                if (!alertMessage.includes("The family member was successfully deleted.")) {
                    print(`Incompeted previous member was successfully deleted.`, "warning");
                    break;
                }
                print(`Alert message:${alertMessage}`, "success");
                // Click the close button to dismiss the custom alert
                await this.page.click(alertCloseButtonSelector);
            }

        }
    }

    async next() {
        if (this.create) {
            await this.page.locator('button:has-text("Add new family member")').click()
        } else {
            const table = await this.page.locator('table').first();
            const editButton = await getActionableElementInRow(table, this.data.full_name, 'Edit', 'button');
            await editButton.click();
        }
        await this.page.waitForSelector("h2:has-text('Section A')");

    }
}


class SectionA extends WebPage {
    constructor(page, args, role, index = 1) {
        const role1 = role === "DP" ? `${role}${index}` : role;
        super(page, `${role1.toLowerCase()}_5406_section_a`, `${role1} imm5406 section a`, get_role_data(args, role, index));
        this.role = role;
        this.args = args;
    }

    async make_actions() {
        this.role === "PA" ? await this.page.locator("label[for='principalAppYes']").check() : await this.page.locator("label[for='principalAppNo']").check();
        // applicant
        let p = this.data
        await this.page.locator("#applicantFullName").fill(p.full_name);
        await inputDate(this.page, "#applicantDOB", p.dob);
        await this.page.locator("#applicantBirthplace").fill(p.country_of_birth);
        await this.page.locator("#applicantMaritalStatus").selectOption(p.marital_status);
        await this.page.locator("#applicantEmail").fill(p.email);
        await this.page.locator("#applicantAddress").fill(p.address);

        // spouse
        p = this.data.spouse;
        if (p) {
            await this.page.locator("#partnerFullName").fill(p.full_name);
            await inputDate(this.page, "#partnerDOB", p.dob);
            await this.page.locator("#partnerBirthplace").fill(p.country_of_birth);
            await this.page.locator("#partnerMaritalStatus").selectOption(p.marital_status);
            await this.page.locator("#partnerEmail").fill(p.email);
            await this.page.locator("#partnerAddress").fill(p.address);
        } else {
            await this.page.locator("#partnerFullName").fill("none");
        }

        // mother
        p = this.data.mother;
        if (p) {
            await this.page.locator("#motherFullName").fill(p.full_name);
            await inputDate(this.page, "#motherDOB", p.dob);
            await this.page.locator("#motherBirthplace").fill(p.country_of_birth);
            await this.page.locator("#motherMaritalStatus").selectOption(p.marital_status);
            await this.page.locator("#motherEmail").fill(p.email);
            await this.page.locator("#motherAddress").fill(p.address);
        } else {
            await this.page.locator("#motherFullName").fill("none");
        }

        // father
        p = this.data.father;
        if (p) {
            await this.page.locator("#fatherFullName").fill(p.full_name);
            await inputDate(this.page, "#fatherDOB", p.dob);
            await this.page.locator("#fatherBirthplace").fill(p.country_of_birth);
            await this.page.locator("#fatherMaritalStatus").selectOption(p.marital_status);
            await this.page.locator("#fatherEmail").fill(p.email);
            await this.page.locator("#fatherAddress").fill(p.address);
        } else {
            await this.page.locator("#fatherFullName").fill("none");
        }

    }

    async next() {
        await this.page.locator("button:has-text('Save and continue')").click();
        await this.page.waitForSelector("h2:has-text('Section B: Children')");
    }
}


class SectionB extends WebPage {
    constructor(page, args, role, index = 1) {
        const role1 = role === "DP" ? `${role}${index}` : role;
        super(page, `${role1.toLowerCase()}_5406_section_b`, `${role1} imm5406 section b`, get_role_data(args, role, index));
        this.role = role;
        this.args = args;
    }

    async make_actions() {
        const children = this.data.children;
        if (children.length === 0) {
            await this.page.locator("#relationship0").fill("Not Applicable");
            return;
        }

        await remove(this.page); // remove previously filled  children

        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            await this.page.locator(`#relationship${i}`).fill(child.relationship);
            await this.page.locator(`#fullName${i}`).fill(child.full_name);
            await inputDate(this.page, `#dob${i}`, child.dob);
            await this.page.locator(`#countryOfBirth${i}`).fill(child.country_of_birth);
            await this.page.locator(`#maritalStatus${i}`).selectOption(child.marital_status);
            await this.page.locator(`#emailAddress${i}`).fill(child.email);
            await this.page.locator(`#address${i}`).fill(child.address);

            if (i < children.length - 1)
                await this.page.locator("button:has-text('Add another')").click();
        }

    }

    async next() {
        await this.page.locator("button:has-text('Save and continue')").click();
        await this.page.waitForSelector("h2:has-text('Section C: Siblings')");
    }
}

class SectionC extends WebPage {
    constructor(page, args, role, index = 1) {
        const role1 = role === "DP" ? `${role}${index}` : role;
        super(page, `${role1.toLowerCase()}_5406_section_c`, `${role1} imm5406 section c`, get_role_data(args, role, index));
        this.role = role;
        this.args = args;
    }

    async make_actions() {
        const siblings = this.data.siblings;
        if (siblings.length === 0) {
            await this.page.locator("#relationship0").fill("Not Applicable");
            return;
        }

        await remove(this.page); // remove previously filled  children

        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];

            await this.page.locator(`#relationship${i}`).fill(sibling.relationship);
            await this.page.locator(`#fullName${i}`).fill(sibling.full_name);
            await inputDate(this.page, `#dob${i}`, sibling.dob);
            await this.page.locator(`#countryOfBirth${i}`).fill(sibling.country_of_birth);
            await this.page.locator(`#maritalStatus${i}`).selectOption(sibling.marital_status);
            await this.page.locator(`#emailAddress${i}`).fill(sibling.email);
            await this.page.locator(`#address${i}`).fill(sibling.address);

            if (i < siblings.length - 1)
                await this.page.locator("button:has-text('Add another')").click();
        }

    }

    async next() {
        await this.page.locator("button:has-text('Save and continue')").click();
        await this.page.waitForSelector("h1:has-text('Additional family information')");
    }
}

class BackToDashboard5406 extends WebPage {
    constructor(page, args, role) {
        super(page, `${role.toLowerCase()}_5406_back_to_dashboard`, `${role} imm5406 back to dashboard`, get_role_data(args, role));
        this.role = role;
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        await this.page.locator("//button[text()=' Complete and return to application ']").click();
        await this.page.waitForSelector("h3:has-text('Application forms')");
    }
}




module.exports = { Dashboard5406, Hub5406, SectionA, SectionB, SectionC, BackToDashboard5406 };
