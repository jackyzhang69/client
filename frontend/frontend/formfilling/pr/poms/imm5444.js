const WebPage = require('../../models/page');
const { getActionableElementInRow, inputDate, makeElementVisible } = require('../../libs/playwright');

class Dashboard5444 extends WebPage {
    constructor(page, args) {
        super(page, "applicaton_situation", "Application situation", args.data.application);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        const table = await this.page.locator('table').first();
        const editButton = await getActionableElementInRow(table, 'IMM 5444', 'Edit', 'button');
        await editButton.click();
        await this.page.waitForSelector("h2:has-text('1. Applicant Situation')");

    }
}

class ApplicantSituation extends WebPage {
    constructor(page, args) {
        super(page, "applicant_situation", "Applicant Situation", args.data.application);
        this.person = args.data.personal;
        this.args = args;
    }

    async make_actions() {
        await this.page.locator("#situation").selectOption(this.data.situation);
        await this.page.locator("#uci").fill(this.data.uci);
        await this.page.locator("#language").selectOption({ label: this.data.language });
        await inputDate(this.page, "#date", this.person.dob);
        await this.page.locator("#city").fill(this.data.place_became_pr);
        await this.page.locator("#province").selectOption(this.data.province_became_pr);
    }

    async next() {
        await this.page.click("button:has-text('Save and continue')");
        await this.page.waitForSelector("h2:has-text('2. Personal Details')");
    }
}

class PersonalDetails extends WebPage {
    constructor(page, args) {
        super(page, "personal_details", "Personal Details", args.data.personal);
        this.args = args;
    }

    async residential_address() {
        const add = this.data.residential_address;
        await this.page.locator("#personalDetailsForm-currentPOBox").fill(add.po_box);
        await this.page.locator("#personalDetailsForm-currentApartment").fill(add.unit);
        await this.page.locator("#personalDetailsForm-currentStreetNumber").fill(add.street_number);
        await this.page.locator("#personalDetailsForm-currentStreetName").fill(add.street_name);
        await this.page.locator("#personalDetailsForm-currentCity").fill(add.city);
        await this.page.locator("#personalDetailsForm-currentPostal").fill(add.post_code);
        await this.page.locator("#personalDetailsForm-currentProvince").selectOption(add.province);
    }

    async mailing_address() {
        const add = this.data.mailing_address;
        await this.page.locator("#personalDetailsForm-mailingPOBox").fill(add.po_box);
        await this.page.locator("#personalDetailsForm-mailingApartment").fill(add.unit);
        await this.page.locator("#personalDetailsForm-mailingStreetNumber").fill(add.street_number);
        await this.page.locator("#personalDetailsForm-mailingStreetName").fill(add.street_name);
        await this.page.locator("#personalDetailsForm-mailingCity").fill(add.city);
        await this.page.locator("#personalDetailsForm-mailingPostal").fill(add.post_code);
        await this.page.locator("#personalDetailsForm-mailingProvince").selectOption(add.province);
    }

    async phone() {
        const phone = this.data.phone;
        if (phone.country_code === "1") {
            await this.page.locator("label[for='primaryNA']").check();
            await this.page.locator("#personalDetailsForm-primaryPhoneType").selectOption(phone.type);
            await this.page.locator("#personalDetailsForm-primaryPhoneNumber").fill(phone.number);

        } else {
            await this.page.locator("label[for='primaryOther']").check();
            await this.page.locator("#personalDetailsForm-primaryPhoneType").selectOption(phone.type);
            await this.page.locator("#personalDetailsForm-primaryPhoneCountryCode").fill(phone.country_code);
            await this.page.locator("#personalDetailsForm-primaryPhoneNumber").fill(phone.number);
        }
    }

    async alt_phone() {
        const phone = this.data.alternate_phone;
        if (phone.country_code === "1") {
            await this.page.locator("label[for='secondaryNA']").check();
            await this.page.locator("#personalDetailsForm-secondaryPhoneType").selectOption(phone.type);
            await this.page.locator("#personalDetailsForm-secondaryPhoneNumber").fill(phone.number);

        } else {
            await this.page.locator("label[for='secondaryOther']").check();
            await this.page.locator("#personalDetailsForm-secondaryPhoneType").selectOption(phone.type);
            await this.page.locator("#personalDetailsForm-secondaryPhoneCountryCode").fill(phone.country_code);
            await this.page.locator("#personalDetailsForm-secondaryPhoneNumber").fill(phone.number);
        }
    }

    async make_actions() {
        await this.page.locator("#personalDetailsForm-familyName").fill(this.data.last_name_on_landing_paper);
        await this.page.locator("#personalDetailsForm-givenName").fill(this.data.first_name_on_landing_paper);
        await this.page.locator("#personalDetailsForm-currentFamilyName").fill(this.data.name_changed ? this.data.current_last_name : "");
        await this.page.locator("#personalDetailsForm-currentGivenName").fill(this.data.name_changed ? this.data.current_first_name : "");

        await this.page.locator("#personalDetailsForm-gender").selectOption({ label: this.data.gender })
        await this.page.locator("#personalDetailsForm-eyeColour").selectOption({ label: this.data.eye_color })
        await this.page.locator("#personalDetailsForm-heightInCM").fill(this.data.height)
        await inputDate(this.page, "#personalDetailsForm-dob", this.data.dob);
        await this.page.locator("#personalDetailsForm-primaryCountryCitizenship").selectOption({ label: this.data.country_of_birth });
        if (this.data.more_than_one_citizenship) {
            await this.page.locator("more_than_one_citizenship").fill({ label: this.data.other_citizenships });
        }

        await this.residential_address();
        if (!this.data.mailing_address_is_same) {
            await this.mailing_address();
        } else {
            await this.page.locator("(//div[@class='personal-details-form__row-data-container']/following-sibling::button)[2]").click();
        }

        await this.phone();
        if (this.data.has_alternate_phone) {
            await this.alt_phone();
        } else {
            await this.page.locator("button:has-text('Clear section')").nth(3).click();
        }

        // no choice for this
        await this.page.locator("label[for='contactYes']").check();

        await this.page.locator("#personalDetailsForm-maritalStatus").selectOption({ label: this.data.marital_status })

        const married_list = ["Married", "Common-law"];
        if (married_list.includes(this.data.marital_status)) {
            await inputDate(this.page, "#personalDetailsForm-marriageDate", this.data.married_date);
        }
    }

    async next() {
        await this.page.click("button:has-text('Save and continue')");
        await this.page.waitForSelector("h2:has-text('3. Immigration History')");
    }
}

class ImmigrationHistory extends WebPage {
    constructor(page, args) {
        super(page, "immigration_history", "Immigration history", args.data.immigration_history);
        this.args = args;
    }
    async make_actions() {
        this.data.had_removal_order ?
            await this.page.locator("label[for='oneYes']").check()
            : await this.page.locator("label[for='oneNo']").check();

        this.data.had_inadmissibility_report ?
            await this.page.locator("label[for='twoYes']").check()
            : await this.page.locator("label[for='twoNo']").check();

        this.data.had_lost_pr_status ?
            await this.page.locator("label[for='threeYes']").check()
            : await this.page.locator("label[for='threeNo']").check();

        this.data.submitted_appeal ?
            await this.page.locator("label[for='fourYes']").check()
            : await this.page.locator("label[for='fourNo']").check();

        if (this.data.has_PRTD) {
            if (this.data.PRTD === "Travel document") {
                await this.page.locator("#travelDocumentIssued").check();
                await this.page.locator("#prTravelDocumentIssued").uncheck();
            }
            if (this.data.PRTD === "PR travel document") {
                await this.page.locator("#prTravelDocumentIssued").check();
                await this.page.locator("#travelDocumentIssued").uncheck();
            }
        } else {
            await this.page.locator("#travelDocumentIssued").uncheck();
            await this.page.locator("#prTravelDocumentIssued").uncheck();
        }

        if ([
            this.data.had_removal_order,
            this.data.had_inadmissibility_report,
            this.data.had_lost_pr_status,
            this.data.submitted_appeal,
            this.data.has_PRTD
        ].some(e => e === true)) {
            await this.page.locator("#additionalDetails").fill(this.data.explaination);
        }

    }

    async next() {
        await this.page.click("button:has-text('Save and continue')");
        await this.page.waitForSelector("h2:has-text('4. Personal History')");

    }
}

class PersonalHistory extends WebPage {
    constructor(page, args) {
        super(page, "personal_history", "Personal history", args.data.personal_history);
        this.args = args;
    }

    async address_history() {
        // check if clear table is enabled, if does, clear it (clear previous data)
        const btn_clear_table = await this.page.locator("button:has-text('Clear Table')").first();
        if (btn_clear_table) {
            await btn_clear_table.click();
        }

        for (const add of this.data.address) {
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
            await inputDate(this.page, `#personalHistoryForm-from0`, add.from);
            await inputDate(this.page, `#personalHistoryForm-to0`, add.to ? add.to : today);

            await this.page.locator(`#personalHistoryForm-address0`).fill(add.address);
            await this.page.locator(`#personalHistoryForm-city0`).fill(add.city);
            await this.page.locator(`#personalHistoryForm-province0`).fill(add.province);
            await this.page.locator(`#personalHistoryForm-country0`).selectOption({ label: add.country });

            const addRowButton = await this.page.locator("img[role=button][alt='Add Row']").first();
            if (addRowButton.isEnabled) await addRowButton.click();

        }

        // save table
        await this.page.locator("button:has-text('Save Table')").first().click();
    }

    async work_edu_history() {
        // check if clear table is enabled, if does, clear it (clear previous data)
        const btn_clear_table = await this.page.locator("button:has-text('Clear Table')").last();
        if (btn_clear_table) {
            await btn_clear_table.click();
        }

        for (const edu_emp of this.data.work_education) {
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
            await inputDate(this.page, `#experienceForm-from0`, edu_emp.from);
            await inputDate(this.page, `#experienceForm-to0`, edu_emp.to ? edu_emp.to : today);

            await this.page.locator(`#experienceForm-address0`).fill(edu_emp.name);
            await this.page.locator(`#experienceForm-city0`).fill(edu_emp.activity);
            await this.page.locator(`#experienceForm-province0`).fill(edu_emp.city);
            await this.page.locator(`#experienceForm-country0`).selectOption({ label: edu_emp.country });

            const addRowButton = await this.page.locator("img[role=button][alt='Add Row']").last();
            if (addRowButton.isEnabled) await addRowButton.click();

        }

        // save table
        await this.page.locator("button:has-text('Save Table')").last().click();


    }

    async make_actions() {
        await this.address_history();
        await this.work_edu_history();
    }

    async next() {
        await this.page.click("button:has-text('Save and continue')");
        await this.page.waitForSelector("h2:has-text('5. Residency Obligation - Time Spent Outside Canada')");

    }
}

class ResidencyObligation extends WebPage {

    constructor(page, args) {
        super(page, "residency_obligation", "Residency obligation", args.data.residency_obligation);
        this.args = args;
    }

    async answer_quesitions() {
        this.data.employed_outside_canada ?
            await this.page.locator("label[for='twoYes']").check()
            : await this.page.locator("label[for='twoNo']").check();

        this.data.accompanied_canadian_citizen ?
            await this.page.locator("label[for='threeYes']").check()
            : await this.page.locator("label[for='threeNo']").check();

        this.data.accompanied_pr ?
            await this.page.locator("label[for='fourYes']").check()
            : await this.page.locator("label[for='fourNo']").check();
    }

    async absence() {
        // check if clear table is enabled, if does, clear it (clear previous data)
        const btn_clear_table = await this.page.locator("button:has-text('Clear Table')").first();
        if (btn_clear_table) {
            await btn_clear_table.click();
        }

        for (const absence of this.data.absences) {
            await inputDate(this.page, `#absenceForm-from0`, absence.from);
            await inputDate(this.page, `#absenceForm-to0`, absence.to);
            await this.page.locator(`#absenceForm-location0`).fill(absence.city_country);
            await this.page.locator("#absenceForm-reason0").selectOption(absence.reason);
            if (absence.reason === "4: Other") await this.page.locator("#absenceForm-other0").fill(absence.other_explaination);

            const addRowButton = await this.page.locator("img[alt='Add Row']").first();
            if (addRowButton.isEnabled) await addRowButton.click();
        }

        // save table
        await this.page.locator("button:has-text('Save Table')").last().click();

    }

    async make_actions() {
        if (this.data.traveled_outside_canada) {
            await this.page.locator("label[for='oneYes']").check();
            await this.answer_quesitions();
            await this.absence()
            if (this.data.has_humanitarian_reason) await this.page.locator("#humanitarian").fill(this.data.humanitarian_reason);
        } else {
            await this.page.locator("label[for='oneNo']").check();
        }
    }

    async next() {
        await this.page.locator("a:has-text('Complete and return to application')").click();
        await this.page.waitForSelector("h1:has-text('Application to get your first Permanent Resident card, to renew or to replace a Permanent Resident card')");
    }
}


class UploadDocuments extends WebPage {


}

module.exports = {
    Dashboard5444,
    ApplicantSituation,
    PersonalDetails,
    ImmigrationHistory,
    PersonalHistory,
    ResidencyObligation
};