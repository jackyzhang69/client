// imm5406 page object model

const WebPage = require('../../models/page');
const { getActionableElementInRow, inputDate } = require('../../libs/playwright');
const { remove, get_family_member, get_addresses, get_age } = require("./common");

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
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5406`, `${role} imm5406`, data);
        this.role = role;
        this.create = true;
    }

    async make_actions() {
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
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5406_section_a`, `${role} imm5406 section a`, data);
        this.role = role;
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
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5406_section_b`, `${role} imm5406 section b`, data);
        this.role = role;
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
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5406_section_c`, `${role} imm5406 section c`, data);
        this.role = role;
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
    constructor(page, data, role) {
        super(page, `${role.toLowerCase()}_5406_back_to_dashboard`, `${role} imm5406 back to dashboard`, data);
        this.role = role;
    }

    async make_actions() {
    }

    async next() {
        await this.page.locator("//button[text()=' Complete and return to application ']").click();
        await this.page.waitForSelector("h3:has-text('Application forms')");
    }
}




module.exports = { Dashboard5406, Hub5406, SectionA, SectionB, SectionC, BackToDashboard5406 };
