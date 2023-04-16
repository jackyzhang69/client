// imm5669 page object model

const WebPage = require('../../models/page');
const { getActionableElementInRow, inputDate } = require('../../libs/playwright');
const { remove } = require('./common');
const { print } = require('../../libs/output');


async function clickSaveAndContinueButton(page) {
    await page.waitForSelector("button:has-text('Save and continue'):enabled", { timeout: 5000 });
    await page.locator("button:has-text('Save and continue')").click();
}

class Dashboard5669 extends WebPage {
    constructor(page, args) {
        super(page, "dashboard5669", "Dash board enter imm5669", args.data.imm5669);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        const table = await this.page.locator('table').first();
        const editButton = await getActionableElementInRow(table, 'IMM 5669', 'Edit', 'button');
        await editButton.click();
        await this.page.waitForSelector("h1:has-text('Schedule A (Background/Declaration)')");
    }
}

// Here is sub dashboard for imm5669, I call it hub5669
class Hub5669 extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_hub_5669`, `${role} hub imm5669`, data);
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
            .filter({ hasText: this.data.personal_details.full_name })
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
            await this.page.waitForSelector("button.btn-primary:has-text('Delete')");
            await this.page.locator("button.btn-primary:has-text('Delete')").click();

            // after delete all not provided person, maybe a technical error banner will show up
            // Check if the custom alert is present
            const alertSelector = 'lib-alert div[role="alertdialog"].alert-card';
            const alertCloseButtonSelector = 'lib-alert button.alert-close-button';

            if (await this.page.$(alertSelector)) {
                console.log('Custom alert detected');

                // Extract the alert message text
                const alertMessage = await this.page.$eval(`${alertSelector} p.alert-text`, (element) => element.textContent);
                console.log('Alert message:', alertMessage);

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
            const editButton = await getActionableElementInRow(table, this.data.personal_details.full_name, 'Edit', 'button');
            await editButton.click();
        }
        await this.page.waitForSelector("h2:has-text('Section A: Personal details')");

    }
}

class PersonalDetails extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_personal_details`, `${role} imm5669 personal details`, data);
        this.role = role;
    }

    async make_actions() {
        this.role === "PA" ? await this.page.locator("label[for='principalApplicant']").check() : await this.page.locator("label[for='principalOther']").check();

        // applicant
        const app = this.data.personal_details;
        await this.page.locator("#familyName").fill(app.last_name);
        await this.page.locator("#givenName").fill(app.first_name);
        await this.page.locator("#nativeFullName").fill(app.full_name_in_native);
        await inputDate(this.page, "#dob", app.dob);

        // father
        const father = this.data.personal_details.father;
        await this.page.locator("#familyNameFather").fill(father.family_name);
        await this.page.locator("#givenNameFather").fill(father.given_name);
        await inputDate(this.page, "#sectionAFormFatherDOB", father.dob);
        if (father.date_of_death) await inputDate(this.page, "#sectionAFormFatherDeceasedDate", father.date_of_death);
        await this.page.locator("#sectionAFormFatherCityOfBirth").fill(father.place_of_birth);
        await this.page.locator("#sectionAFormFatherCountryOfBirth").fill(father.birth_country);

        // mother
        const mother = this.data.personal_details.mother;
        await this.page.locator("#familyNameMother").fill(mother.family_name);
        await this.page.locator("#givenNameMother").fill(mother.given_name);
        await inputDate(this.page, "#sectionAFormMotherDOB", mother.dob);
        if (mother.date_of_death) await inputDate(this.page, "#sectionAFormMotherDeceasedDate", mother.date_of_death);
        await this.page.locator("#sectionAFormMotherCityOfBirth").fill(mother.place_of_birth);
        await this.page.locator("#sectionAFormMotherCountryOfBirth").fill(mother.birth_country);
    }

    async next() {
        // await this.page.locator("button:has-text('Save and continue')").click();
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section B: Questionnaire')");
    }
}

class Questionanaire extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_questionnaire`, `${role} imm5669 questionnaire`, data);
        this.role = role;
    }

    async make_actions() {
        const q = this.data.questionanaire;
        q.q1 ? await this.page.locator("label[for='isConvictedInCanada_yes']").check() : await this.page.locator("label[for='isConvictedInCanada_no']").check();
        q.q2 ? await this.page.locator("label[for='isConvictedOutsideCanada_yes']").check() : await this.page.locator("label[for='isConvictedOutsideCanada_no']").check();
        q.q3 ? await this.page.locator("label[for='isClaimedRefugeeProtection_yes']").check() : await this.page.locator("label[for='isClaimedRefugeeProtection_no']").check();
        q.q4 ? await this.page.locator("label[for='isRefusedRefugeeOrVisa_yes']").check() : await this.page.locator("label[for='isRefusedRefugeeOrVisa_yes']").check();
        q.q5 ? await this.page.locator("label[for='isOrderedToLeaveCountry_yes']").check() : await this.page.locator("label[for='isOrderedToLeaveCountry_no']").check();
        q.q6 ? await this.page.locator("label[for='isWarCriminal_yes']").check() : await this.page.locator("label[for='isWarCriminal_no']").check();
        q.q7 ? await this.page.locator("label[for='isCommittedActOfViolence_yes']").check() : await this.page.locator("label[for='isCommittedActOfViolence_no']").check();
        q.q8 ? await this.page.locator("label[for='isAssociatedWithViolentGroup_yes']").check() : await this.page.locator("label[for='isAssociatedWithViolentGroup_no']").check();
        q.q9 ? await this.page.locator("label[for='isMemberOfCriminalOrg_yes']").check() : await this.page.locator("label[for='isMemberOfCriminalOrg_no']").check();
        q.q10 ? await this.page.locator("label[for='isDetainedOrJailed_yes']").check() : await this.page.locator("label[for='isDetainedOrJailed_no']").check();
        q.q11 ? await this.page.locator("label[for='isPhysicalOrMentalDisorder_yes']").check() : await this.page.locator("label[for='isPhysicalOrMentalDisorder_no']").check();
        if (q.has_details) await this.page.locator("#additionalDetails").fill(q.details);
    }


    async next() {
        // await this.page.locator("button:has-text('Save and continue')").click();
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section C: Education')");
    }
}


class Education extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_education`, `${role} imm5669 education`, data);
        this.role = role;
    }

    async make_actions() {
        // years of education
        const edu = this.data.education;
        await this.page.locator("#elementarySchoolYears").fill(edu.primary_school_years);
        await this.page.locator("#secondarySchoolYears").fill(edu.secondary_school_years);
        await this.page.locator("#universityAndCollegeYears").fill(edu.post_secondary_school_years);
        await this.page.locator("#otherSchoolYears").fill(edu.other_school_years);

        // remove prevoious education details
        await remove(this.page);
        // education details
        const edus = edu.educations;
        if (edus.length == 0) {
            await this.page.locator("#from0").fill("none");
            return;
        }

        for (let i = 0; i < edus.length; i++) {
            const edu = edus[i];
            await inputDate(this.page, `#from${i}`, edu.start_date);
            await inputDate(this.page, `#to${i}`, edu.end_date);
            await this.page.locator(`#nameOfInstitution${i}`).fill(edu.school_name);
            await this.page.locator(`#cityAndCountry${i}`).fill(edu.city_country);
            await this.page.locator(`#typeOfDiploma${i}`).fill(edu.education_level);
            await this.page.locator(`#fieldOfStudy${i}`).fill(edu.field_of_study);

            if (i < edus.length - 1) await this.page.locator("button:has-text('Add another')").click();
        }
    }

    async next() {
        // await this.page.locator("button:has-text('Save and continue')").click();
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section D: Personal history')");
    }
}


class PersonalHistory extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_personal_history`, `${role} imm5669 personal history`, data);
        this.role = role;
    }

    async make_actions() {
        await remove(this.page);

        const phs = this.data.personal_history;

        for (let i = 0; i < phs.length; i++) {
            const ph = phs[i];
            await inputDate(this.page, `#from${i}`, ph.start_date);
            await inputDate(this.page, `#to${i}`, ph.end_date);
            await this.page.locator(`#activity${i}`).fill(ph.activity);
            await this.page.locator(`#cityAndCountry${i}`).fill(ph.city_and_country);
            await this.page.locator(`#status${i}`).fill(ph.status);
            await this.page.locator(`#nameOfEmployerOrSchool${i}`).fill(ph.name_of_company_or_school);

            if (i < phs.length - 1) await this.page.locator("button:has-text('Add another')").click();
        }
    }

    async next() {
        // await this.page.locator("button:has-text('Save and continue')").click();
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section E: Membership')");
    }
}

class Membership extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_membership`, `${role} imm5669 membership`, data);
        this.role = role;
    }

    async make_actions() {
        await remove(this.page);

        const ms = this.data.membership;
        if (ms.length == 0) {
            await this.page.locator("#from0").fill("none");
            await this.page.locator("#to0").fill("");
            await this.page.locator(`#nameOfOrganization0`).fill("");
            await this.page.locator(`#typeOfOrganization0`).fill("");
            await this.page.locator(`#activities0`).fill("");
            await this.page.locator(`#cityAndCountry0`).fill("");
            return;
        }

        for (let i = 0; i < ms.length; i++) {
            const m = ms[i];
            await inputDate(this.page, `#from${i}`, m.start_date);
            await inputDate(this.page, `#to${i}`, m.end_date);
            await this.page.locator(`#nameOfOrganization${i}`).fill(m.organization_name);
            await this.page.locator(`#typeOfOrganization${i}`).fill(m.organization_type);
            await this.page.locator(`#activities${i}`).fill(m.position);
            await this.page.locator(`#cityAndCountry${i}`).fill(m.city_country);

            if (i < ms.length - 1) await this.page.locator("button:has-text('Add another')").click();
        }
    }

    async next() {
        // await this.page.locator("button:has-text('Save and continue')").click();
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section F: Government positions')");
    }
}

class Government extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_government`, `${role} imm5669 government`, data);
        this.role = role;
    }

    async make_actions() {
        await remove(this.page);

        const gs = this.data.government_posotion;
        if (gs.length == 0) {
            await this.page.locator("#dateFrom0").fill("none");
            await this.page.locator("#to0").fill("");
            await this.page.locator("#cityAndCountry0").fill("");
            await this.page.locator("#department0").fill("");
            await this.page.locator("#activities0").fill("");
            return;
        }
        for (let i = 0; i < gs.length; i++) {
            const g = gs[i];
            await inputDate(this.page, `#dateFrom${i}`, g.start_date);
            await inputDate(this.page, `#to${i}`, g.end_date);
            await this.page.locator(`#cityAndCountry${i}`).fill(g.country);
            await this.page.locator(`#department${i}`).fill(g.department);
            await this.page.locator(`#activities${i}`).fill(g.position);

            if (i < gs.length - 1) await this.page.locator("button:has-text('Add another')").click();
        }
    }

    async next() {
        // await this.page.locator("button:has-text('Save and continue')").click();
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section G: Military and paramilitary service')");
    }
}

class Military extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_military`, `${role} imm5669 military`, data);
        this.role = role;
    }

    async make_actions() {
        await remove(this.page);

        const ms = this.data.military_service;
        if (ms.length == 0) {
            await this.page.locator("#country0").fill("none");
            await this.page.locator(`#from0`).fill("");
            await this.page.locator(`#to0`).fill("");
            await this.page.locator(`#rank0`).fill("");
            await this.page.locator(`#reasonsEndService0`).fill("");
            await this.page.locator(`#combatDetails0`).fill("");
            return;
        }

        for (let i = 0; i < ms.length; i++) {
            const m = ms[i];
            await this.page.locator(`#country${i}`).fill(m.country);
            await this.page.locator(`#branchOfService${i}`).fill(m.service_detail);
            await inputDate(this.page, `#from${i}`, m.start_date);
            await inputDate(this.page, `#to${i}`, m.end_date);
            await this.page.locator(`#rank${i}`).fill(m.rank);
            await this.page.locator(`#reasonsEndService${i}`).fill(m.reason_for_end);
            await this.page.locator(`#combatDetails${i}`).fill(m.combat_detail);

            if (i < ms.length - 1) await this.page.locator("button:has-text('Add another')").click();
        }
    }

    async next() {
        await clickSaveAndContinueButton(this.page);
        await this.page.waitForSelector("h2:has-text('Section H: Address')");
    }

}

class Address extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`;
        super(page, `${role.toLowerCase()}_5669_address`, `${role} imm5669 address`, data);
        this.role = role;
    }


    async make_actions() {
        await remove(this.page);
        const a = this.data.addresses;

        if (a.length == 0) {
            await this.page.locator("#from0").fill("none");
            await this.page.locator("#to0").fill("");
            await this.page.locator(`#street0`).fill("");
            await this.page.locator(`#city0`).fill("");
            await this.page.locator(`#provinceOrState0`).fill("");
            await this.page.locator(`#country0`).fill("");
            await this.page.locator(`#postalCode0`).fill("");
            return;
        }

        for (let i = 0; i < a.length; i++) {
            const address = a[i];
            await inputDate(this.page, `#from${i}`, address.start_date);
            await inputDate(this.page, `#to${i}`, address.end_date);
            await this.page.locator(`#street${i}`).fill(address.street_and_number);
            await this.page.locator(`#city${i}`).fill(address.city);
            await this.page.locator(`#provinceOrState${i}`).fill(address.province);
            await this.page.locator(`#country${i}`).fill(address.country);
            await this.page.locator(`#postalCode${i}`).fill(address.post_code);

            if (i < a.length - 1) await this.page.locator("button:has-text('Add another')").click();
        }

    }

    async next() {
        await clickSaveAndContinueButton(this.page);
        try {
            await this.page.waitForSelector("h1:has-text('Schedule A (Background/Declaration)')");
        } catch (e) {
            print("failed to wait for schedule A", "warning");
            await clickSaveAndContinueButton(this.page);
            await this.page.waitForSelector("h1:has-text('Schedule A (Background/Declaration)')");
        }

    }

}

class BackToDashboard5669 extends WebPage {
    constructor(page, data, role) {
        super(page, `${role.toLowerCase()}_5669_back_to_dashboard`, `${role} imm5669 back to dashboard`, data);
        this.role = role;
    }

    async make_actions() {
    }

    async next() {
        await this.page.locator("//button[text()=' Go back ']").click();

        // sometimes, the page will ask if you want to leave the page, so we have to handle that
        const result = await Promise.race([
            this.page.waitForSelector("h3:has-text('Application forms')"),
            this.page.waitForSelector("#goBackModalId__body")
        ])
        const result_text = await result.innerText();

        if (result_text.includes("Are you sure you want to leave this page?")) {
            await this.page.locator("button.btn.btn-secondary").last().click();
        }
        await this.page.waitForSelector("h3:has-text('Application forms')");
    }
}


module.exports = { Dashboard5669, Hub5669, PersonalDetails, Questionanaire, Education, PersonalHistory, Membership, Government, Military, Address, BackToDashboard5669 };




