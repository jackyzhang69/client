const { Page } = require('../../libs/playwright');
const WebPage = require('../../models/page');
const { selectRelatedDropdown, getActionableElementInRow } = require('../../libs/playwright');
const { print } = require('../../libs/output');

class Dashboard0008 extends WebPage {
    constructor(page, args) {
        super(page, "dashboard0008", "Dash board enter imm0008", args.data.imm0008);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        const table = await this.page.locator('table').first();
        const editButton = await getActionableElementInRow(table, 'IMM 0008', 'Edit', 'button');
        await editButton.click();
        await this.page.waitForSelector("h1:has-text('Generic application form for Canada (IMM 0008)')");
    }
}

class Imm0008Intro extends WebPage {
    constructor(page, args) {
        super(page, "intro_0008", "Imm0008 introduction", args);
    }

    async make_actions() { }

    async next() {
        await this.page.getByRole('link', { name: 'Continue' }).click();
        await this.page.waitForSelector('h2:has-text("Application details")');
    }
}

class ApplicationDetail extends WebPage {
    constructor(page, data, role, index = 1) {
        super(page, "applicant_details_0008", "Imm0008 application details", data.application_details);
        this.role = role;
    }

    async make_actions() {
        await this.page.getByRole('combobox', { name: 'Correspondence (required)' }).selectOption(this.data.communication_language);
        await this.page.getByRole('combobox', { name: 'Interview (required)' }).selectOption(this.data.interview_language);
        await this.page.getByRole('combobox', { name: 'Interpreter requested (required)' }).selectOption({ label: this.data.need_translator });
        await selectRelatedDropdown(this.page, '#province', '#city', this.data.province, this.data.intended_city);

    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector('h2:has-text("Personal details")');
    }
}

class PersonalDetails0008 extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`
        super(page, `${role.toLowerCase()}_personal_details_0008`, `${role} imm0008 personal details`, data.personal_details);
        this.role = role;
    }

    // only for dependants
    async dependant_actions() {
        if (this.role === "PA") return;

        const accompany = this.data.accompany_to_canada;
        if (accompany) {
            await this.page.locator("label[for='dependantDetailsForm-accompanyingPA-yes']").check()

        } else {
            await this.page.locator("label[for='dependantDetailsForm-accompanyingPA-no']").check();
            await this.page.locator().fill()
        }

        await this.page.locator("#dependantDetailsForm-relationshipToPA").selectOption({ label: this.data.relationship_to_pa });

        if ([
            "Adopted Child",
            "Child",
            "Grandchild",
            "Step-Child",
            "Step-Grandchild",
        ].includes(this.data.relationship_to_pa)) {
            await this.page.waitForSelector("#dependantDetailsForm-dependantType", { state: 'attached' }); // wait for second dropdown to appear
            await this.page.locator("#dependantDetailsForm-dependantType").selectOption({ label: this.data.dependant_type });
        }

    }
    // name
    async name_actions() {
        await this.page.getByRole('group', { name: 'Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.' }).getByLabel('Family name(s) (required)').fill(this.data.last_name);
        await this.page.getByRole('group', { name: 'Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.' }).getByLabel('Given name(s)').fill(this.data.first_name);
        if (this.data.used_another_name) {
            await this.page.getByRole('group', { name: 'Have you ever used any other name (e.g. nickname, maiden name, alias, etc.)? (required)' }).getByText('Yes').click()
            await this.page.getByRole('group', { name: 'If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)' }).getByLabel('Family name(s) (required)').fill(this.data.used_last_name);
            await this.page.getByRole('group', { name: 'If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)' }).getByLabel('Given name(s)').fill(this.data.used_first_name);
        } else {
            await this.page.getByRole('group', { name: 'Have you ever used any other name (e.g. nickname, maiden name, alias, etc.)? (required)' }).getByText('No').click();
        }

    }
    // physical characteristics
    async physical_characteristics_actions() {
        await this.page.getByRole('combobox', { name: 'Sex (required)' }).selectOption(this.data.sex);
        await this.page.getByRole('combobox', { name: 'Eye colour (required)' }).selectOption(this.data.eye_color);;
        await this.page.getByLabel('Height (in cm) (required)').fill(this.data.height);
    }

    // birth information
    async birth_information_actions() {
        await this.page.locator('#personalDetailsForm-dob').fill(this.data.dob);
        await this.page.getByLabel('Place of birth (required)').fill(this.data.place_of_birth);
        await this.page.getByRole('combobox', { name: 'Country of birth (required)' }).selectOption(this.data.country_of_birth);
    }

    // citizenship
    async citizenship_actions() {
        await this.page.getByRole('group', { name: 'Citizenship(s)' }).getByRole('combobox', { name: 'Country (required)' }).selectOption(this.data.citizen);
        if (this.data.citizen2) {
            await this.page.locator('#personalDetailsForm-citizenship2').selectOption(this.data.citizen2);
        } else {
            await this.page.locator('#personalDetailsForm-citizenship2').selectOption({ label: 'Select' });
        };
    }

    // current country of residence
    async current_country_of_residence_actions() {
        const country_selector = "#personalDetailsForm-currentCountry";
        await this.page.waitForSelector(country_selector, { state: 'attached' });
        await this.page.selectOption(country_selector, { label: this.data.cor.country });
        // Wait for the second dropdown list to load options based on the selected value
        const status_selector = "#personalDetailsForm-immigrationStatus"
        await this.page.waitForSelector(status_selector, { state: 'attached' });
        await this.page.selectOption(status_selector, this.data.cor.status);

        if (["Visitor", "Worker", "Student"].includes(this.data.cor.status_text)) {
            await this.page.locator("#personalDetailsForm-startDateofImmigrationStatus").fill(this.data.cor.start_date);
            await this.page.locator("#personalDetailsForm-endDateOfImmigrationStatus").fill(this.data.cor.end_date);
        }
        if (this.data.cor.country === "Canada") {
            await this.page.fill("#personalDetailsForm-dateOfLastEntry", this.data.cor.entry_date);
            await this.page.fill("#personalDetailsForm-placeOfLastEntry", this.data.cor.entry_place);
        }
    }

    //previous country of residence
    async previous_country_of_residence_actions(pre_countries) {
        const removeButtons = await this.page.locator('button:has-text("Remove")');
        const count = await removeButtons.count();
        if (count === 1) await removeButtons.click(); // remove previously filled data

        for (let i = 0; i < pre_countries.length; i++) {
            const c = pre_countries[i];

            const country_selector = `#personalDetailsForm-prevCountry${i}`;
            await this.page.waitForSelector(country_selector, { state: 'attached' });
            await this.page.selectOption(country_selector, { label: c.country });

            const status_selector = `#personalDetailsForm-prevImmigrationStatus${i}`
            await this.page.waitForSelector(status_selector, { state: 'attached' });
            await this.page.selectOption(status_selector, c.status);

            await this.page.locator(`#personalDetailsForm-prevStartDateOfImmigrationStatus${i}`).fill(c.start_date);
            await this.page.locator(`#personalDetailsForm-prevEndDateOfImmigrationStatus${i}`).fill(c.end_date);

            if (i < pre_countries.length - 1) {
                await this.page.getByRole('button', { name: 'Add another' }).click();
            }
        }
    }

    // marriage information
    async marriage_information_actions() {
        await this.page.locator("#personalDetailsForm-maritalStatus").selectOption(this.data.marital_status_index);

        // current marriage information
        if (["Common-Law", "Married"].includes(this.data.marital_status)) {
            await this.page.locator("#personalDetailsForm-dateOfMarriageOrCommonLaw").fill(this.data.marriage_data.date);
            await this.page.locator("#personalDetailsForm-familyNameOfSpouse").fill(this.data.marriage_data.sp_last_name);
            await this.page.locator("#personalDetailsForm-givenNameOfSpouse").fill(this.data.marriage_data.sp_first_name);
        }
        // previous marriage information
        if (this.data.previous_married) {
            if (this.data.marriage_data.should_check_previous_married) {
                await this.page.locator("label[for='personalDetailsForm-previouslyMarriedOrCommonLaw-yes']").check();
            }

            const psp = this.data.marriage_data.pre_marriage_data;
            await this.page.locator("#previousRelationshipForm-previousSpouseFamilyName").fill(psp.pre_sp_last_name);
            await this.page.locator("#previousRelationshipForm-previousSpouseGivenName").fill(psp.pre_sp_first_name);
            await this.page.locator("#previousRelationshipForm-previousSpouseDob").fill(psp.pre_sp_dob);
            await this.page.locator("#previousRelationshipForm-typeOfRelationship").selectOption(psp.pre_relationship_type);
            await this.page.locator("#previousRelationshipForm-startDateofRelationship").fill(psp.pre_start_date);
            await this.page.locator("#previousRelationshipForm-endDateOfRelationship").fill(psp.pre_end_date);
        } else {
            if (this.data.should_check_previous_married) {
                await this.page.locator("label[for='personalDetailsForm-previouslyMarriedOrCommonLaw-no']").check();
            }
        }
    }

    async make_actions() {
        await this.dependant_actions();
        await this.name_actions();
        this.data.uci && await this.page.getByLabel('UCI').fill(this.data.uci);
        await this.physical_characteristics_actions();
        await this.birth_information_actions();
        await this.citizenship_actions();
        await this.current_country_of_residence_actions();
        if (this.data.has_previous_cor) {
            await this.page.check("label[for='personalDetailsForm-hasPreviousCountries-yes']");
            await this.previous_country_of_residence_actions(this.data.previous_cor);
        } else {
            await this.page.check("label[for='personalDetailsForm-hasPreviousCountries-no']");
        }
        await this.marriage_information_actions();

    }

    async next() {
        if (this.role === "PA") {
            await this.page.getByRole('button', { name: 'Save and continue' }).click()
            await this.page.waitForSelector('//h2[text()="Contact information"]');
        } else {
            await this.page.getByRole('button', { name: 'Continue' }).click()
            await this.page.waitForSelector('h2:has-text("Education/occupation details")');
        }
    }
}

class ContactInformation extends WebPage {
    constructor(page, data, role, index = 1) {
        super(page, "contact_info_0008", "Imm0008 contact information", data.contact_info);
        this.role = role;
    }

    // mailing address
    async mailing_address_actions() {
        // await this.page.getByLabel('P.O. Box').fill('11');
        const ma = this.data.mail_address;
        await this.page.locator('#MailingAptUnit').fill(ma.unit);
        await this.page.locator('#MailingStreetNum').fill(ma.street_number);
        await this.page.locator('#MailingStreetName').fill(ma.street_name);
        await this.page.locator('#MailingCityTown').fill(ma.city);

        await this.page.locator("#MailingCountry").selectOption({ label: ma.country });
        if (ma.country === "Canada") {
            const province_selector = "#MailingProvinceState";
            await this.page.waitForSelector(province_selector, { state: 'attached' });
            await this.page.selectOption(province_selector, { label: ma.province });
        } else {
            if (ma.district) await this.page.locator('#MailingDistrict').fill(ma.district);
        }

        await this.page.locator('#MailingPostalCode').fill(ma.post_code);
    }
    // residential address
    async residential_address_actions() {
        const ra = this.data.residential_address;
        await this.page.locator('#ResidentialAptUnit').fill(ra.unit);
        await this.page.locator('#ResidentialStreetNum').fill(ra.street_number);
        await this.page.locator('#ResidentialStreetName').fill(ra.street_name);
        await this.page.locator('#ResidentialCityTown').fill(ra.city);

        await this.page.locator("#ResidentialCountry").selectOption({ label: ra.country });
        if (ra.country === "Canada") {
            const province_selector = "#ResidentialProvinceState";
            await this.page.waitForSelector(province_selector, { state: 'attached' });
            await this.page.selectOption(province_selector, { label: ra.province });
        } else {
            if (ra.district) await this.page.locator('#ResidentialDistrict').fill(ra.district);
        }

        await this.page.locator('#ResidentialPostalCode').fill(ra.post_code);

    }

    // primary telephone number
    async primary_telephone_number_actions() {
        const p = this.data.phone.preferredPhone;
        if (p.country_code === "1") {
            await this.page.locator("label[for='primaryNA']").check();
            await this.page.locator("#PrimaryType").selectOption(p.type);
        } else {
            await this.page.locator("label[for='primaryOther']").check();
            await this.page.locator("#PrimaryType").selectOption(p.type);
            await this.page.locator("#PrimaryCountryCode").fill(p.country_code);
        }
        await this.page.locator("#PrimaryNumber").fill(p.number);
        p.ext && await this.page.locator("#PrimaryExtension").fill(p.ext);
    }

    // alternate telephone number
    async alternate_telephone_number_actions() {
        const p = this.data.phone.alternatePhone;
        if (p.country_code === "1") {
            await this.page.locator("label[for='primaryNA']").check();
            await this.page.locator("#PrimaryType").selectOption(p.type);
        } else {
            await this.page.locator("label[for='primaryOther']").check();
            await this.page.locator("#PrimaryType").selectOption(p.type);
            await this.page.locator("#PrimaryCountryCode").fill(p.country_code);
        }
        await this.page.locator("#PrimaryNumber").fill(p.number);
        await this.page.locator("#PrimaryExtension").fill(p.ext);

    }

    // ignore fax number, since no one use fax anymore

    // contact email address
    async contact_email_address_actions() {
        this.data.use_account_email ? await this.page.locator("label[for='contactYes']").check("label[for='contactNo']") : await this.page.locator().check();
    }

    async make_actions() {
        await this.mailing_address_actions();
        if (this.same_address) {
            await this.page.locator("label[for='yes']").check();
        } else {
            await this.page.locator("label[for='no']").check();
            await this.residential_address_actions();
        }

        await this.primary_telephone_number_actions();
        this.data.phone.alternatePhone ?
            await this.alternate_telephone_number_actions()
            : await this.page.locator("button:has-text('Clear section')").nth(1).click(); // if no, clear just in case previously filled

        await this.contact_email_address_actions();
    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector('h2:has-text("Passport")');
    }
}

class Passport extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`
        super(page, `${role.toLowerCase()}_passport_0008`, `${role} imm0008 passport`, data.passport);
        this.role = role;
    }

    async make_actions() {
        if (this.data) {
            await this.page.locator("label[for= 'validPassportYes']").check()

            await this.page.locator("#passportNumber").fill(this.data.number);
            await this.page.locator("#countryOfIssue").selectOption(this.data.country);
            await this.page.locator("#issueDate").fill(this.data.issued);
            await this.page.locator("#expiryDate").fill(this.data.expiry);
        } else {
            await this.page.locator("label[for= 'validPassportNo']").check();
        }
    }

    async next() {
        if (this.role === "PA") {
            await this.page.getByRole('button', { name: 'Save and continue' }).click();
            await this.page.waitForSelector('h2:has-text("National identity document")');
        } else {
            await this.page.getByRole('button', { name: 'Continue' }).click()
            await this.page.waitForSelector('h2:has-text("National Identity Document")');
        }

    }
}

class Id extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`
        super(page, `${role.toLowerCase()}_national_id_0008`, `${role} imm0008 National Id`, data.passport);
        this.role = role;
    }

    async make_actions() {
        if (this.data) {
            await this.page.locator("label[for='NICYes']").check()

            await this.page.locator("#nationalIdentityNumber").fill(this.data.number);
            await this.page.locator("#countryOfIssue").selectOption(this.data.country);
            await this.page.locator("#issueDate").fill(this.data.issued);
            await this.page.locator("#expiryDate").fill(this.data.expiry);
        } else {
            await this.page.locator("label[for='NICNo']").check();
        }
    }

    async next() {
        try {
            if (this.role === "PA") {
                await this.page.getByRole('button', { name: 'Save and continue' }).click();
                await this.page.waitForSelector('h2:has-text("Education/occupation detail")', { timeout: 10000 });
            } else {
                await this.page.getByRole('button', { name: 'Save and continue' }).click()
                await this.page.waitForSelector('h2:has-text("Dependants")', { timeout: 10000 });
            }
        } catch {
            print('National ID section failed due to the website technical issue. So I checked "No" for the section. Please correct it manually', "error");
            await this.page.locator('label[for="NICNo"]').click();
            await this.page.getByRole('button', { name: 'Save and continue' }).click();
            if (this.role === "PA") {
                await this.page.waitForSelector('h2:has-text("Education/occupation detail")');
            } else {
                await this.page.waitForSelector('h2:has-text("Dependants")');
            }
        }
    }
}

class Education0008 extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`
        super(page, `${role.toLowerCase()}_education_0008`, `${role} imm0008 education`, data.education);
        this.role = role;
    }

    async make_actions() {
        await this.page.getByRole('combobox', { name: 'Highest level of education (required)' }).selectOption(this.data.highest_education);
        await this.page.getByLabel('Number of years of education in total (required)').fill(this.data.number_of_years);
        await this.page.getByLabel('Current occupation (required)').fill(this.data.current_occupation);
        await this.page.getByLabel('Intended occupation (required)').fill(this.data.intended_occupation);
    }

    async next() {

        if (this.role === "PA") {
            await this.page.getByRole('button', { name: 'Save and continue' }).click();
            await this.page.waitForSelector("h2:has-text('Language detail')");
        } else {
            await this.page.getByRole('button', { name: 'Continue' }).click()
            await this.page.waitForSelector('h2:has-text("Language Details")');
        }
    }
}

class Language extends WebPage {
    constructor(page, data, role, index = 1) {
        if (role === "DP") role = `${role}${index}`
        super(page, `${role.toLowerCase()}_language_0008`, `${role} imm0008 language`, data.language);
        this.role = role;
    }

    async make_actions() {
        await this.page.locator("#nativeLanguage").selectOption({ label: this.data.native_language });
        await this.page.locator("#language").selectOption({ label: this.data.english_french });
        if (this.data.english_french === 'Both') {
            await this.page.locator("#preferredLanguage").selectOption({ label: this.data.preferred_language });
        }
        this.data.language_test ?
            await this.page.locator("label[for='testing-yes']").check()
            : await this.page.locator("label[for='testing-no']").check();
    }
    async next() {
        if (this.role === "PA") {
            await this.page.getByRole('button', { name: 'Save and continue' }).click();
            await this.page.waitForSelector("button:has-text(' Add dependants ')");
        } else {
            await this.page.getByRole('button', { name: 'Continue' }).click()
            await this.page.waitForSelector('h2:has-text("Passport Details")');
        }
    }
}

class Hub0008 extends WebPage {
    constructor(page, data, role) {
        super(page, `${role.toLowerCase()}_0008`, `${role} imm0008`, data);
        this.role = role;
        this.create = true;
    }

    async make_actions() {
        // check if previously filled
        await this.page.waitForSelector('button:has-text("Add dependants")');
        // delete uncompleted family member
        await this.remove_not_provided_person();

        // loop through family members
        await this.edit_or_create(this.data, this.role);

    }

    async edit_or_create(data, role) {
        // check if this person is already in the table
        const has_this_person = await this.page.locator("table tr")
            .filter({ hasText: this.data.personal_details.first_name })
            .count() > 0;
        //if not add new member
        this.create = has_this_person ? false : true;
    }

    async remove_not_provided_person() {
        while (true) {
            const has_not_provided = await this.page.locator("table tr")
                .filter({ hasText: "Missing Information" })
                .count() > 0;

            if (!has_not_provided)
                break;
            const table = await this.page.locator('table').first();
            const deleteButton = await getActionableElementInRow(table, "Missing Information", 'Delete', 'button');
            await deleteButton.click();
            await this.page.locator("button.btn-primary:has-text('Delete')").click();
        }
    }

    async next() {
        if (this.create) {
            await this.page.locator('button:has-text("Add dependants")').click()
        } else {
            const table = await this.page.locator('table').first();
            const deleteButton = await getActionableElementInRow(table, this.data.personal_details.first_name, 'Edit', 'link');
            await deleteButton.click();
        }
        await this.page.waitForSelector("h2:has-text('Personal Details')");

    }
}

class BackToDashboard0008 extends WebPage {
    constructor(page, data, role, index = 1) {
        super(page, `${role.toLowerCase()}_0008_back_to_dashboard`, `${role} imm0008 back to dashboard`, data);
        this.role = role;
    }

    async make_actions() {
    }

    async next() {
        // await this.page.waitForSelector("button:has-text('Complete and return to application')");
        await this.page.locator("//button[text()=' Complete and return to application ']").click();
        await this.page.waitForSelector("h3:has-text('Application forms')");
        // if (await button.isEnabled()) {
        //     await button.click();
        //     await this.page.waitForSelector("h3:has-text('Application forms')");
        // } else {
        //     console.log("Button is disabled");
        // }

    }
}

module.exports = {
    Dashboard0008,
    Imm0008Intro,
    ApplicationDetail,
    ContactInformation,
    PersonalDetails0008,
    Education0008,
    Language,
    Passport,
    Id,
    Hub0008,
    BackToDashboard0008
}