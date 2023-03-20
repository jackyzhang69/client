const { Page } = require('playwright');
const WebPage = require('../../page');
const DependantSelect = require('../../tools');


class Imm0008Intro extends WebPage {
    constructor(page, name, description, data) {
        super(page, name, description, data);
        this.url = "";
    }

    async make_actions() { }

    async next() {
        await this.page.getByRole('link', { name: 'Continue' }).click();
        await this.page.waitForSelector('//legend[text()="Where do you plan to live in Canada?"]');
    }
}

class ApplicationDetail extends WebPage {
    constructor(page, name, description, data) {
        super(page, name, description, data);
        this.url = "";
    }

    async make_actions() {
        await this.page.getByRole('combobox', { name: 'Correspondence (required)' }).selectOption('2: 02');
        await this.page.getByRole('combobox', { name: 'Interview (required)' }).selectOption('111: 559');
        await this.page.getByRole('combobox', { name: 'Interpreter requested (required)' }).selectOption('2: false');
        let select = new DependantSelect(this.page, '#province', '#city', '6: 03', '243: 0421');
        await select.act()

    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector('//h2[text()="Personal details"]');
    }
}

class PersonalDetail extends WebPage {
    constructor(name, page, data) {
        super(name, page, data);
        this.url = "";
    }

    // name
    async name_actions() {
        await this.page.getByRole('group', { name: 'Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.' }).getByLabel('Family name(s) (required)').fill('Ma');
        await this.page.getByRole('group', { name: 'Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.' }).getByLabel('Given name(s)').fill('Yun');
        await this.page.getByRole('group', { name: 'Have you ever used any other name (e.g. nickname, maiden name, alias, etc.)? (required)' }).getByText('No').click();
        await this.page.getByRole('group', { name: 'Have you ever used any other name (e.g. nickname, maiden name, alias, etc.)? (required)' }).getByText('Yes').click();
        await this.page.getByRole('group', { name: 'If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)' }).getByLabel('Family name(s) (required)').fill('Ma');
        await this.page.getByRole('group', { name: 'If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)' }).getByLabel('Given name(s)').fill('Chun');
    }
    // physical characteristics
    async physical_characteristics_actions() {
        await this.page.getByRole('combobox', { name: 'Sex (required)' }).selectOption('1: Female');
        await this.page.getByRole('combobox', { name: 'Eye colour (required)' }).selectOption('4: 04');
        await this.page.getByLabel('Height (in cm) (required)').fill('178');
    }

    // birth information
    async birth_information_actions() {
        await this.page.locator('#personalDetailsForm-dob').fill('1999/01/01');
        await this.page.getByLabel('Place of birth (required)').fill('suzhou');
        await this.page.getByRole('combobox', { name: 'Country of birth (required)' }).selectOption('49: 202');
    }

    // citizenship
    async citizenship_actions() {
        await this.page.getByRole('group', { name: 'Citizenship(s)' }).getByRole('combobox', { name: 'Country (required)' }).selectOption('37: 202');
        await this.page.locator('#personalDetailsForm-citizenship2').selectOption('98: 260');
    }

    // current country of residence
    async current_country_of_residence_actions() {
        await this.page.getByRole('group', { name: 'Current country of residence' }).filter({ hasText: 'Current country of residenceCountry (required) Select Afghanistan Albania Algeri' }).getByRole('combobox', { name: 'Country (required)' }).selectOption('232: 823');
        await this.page.getByRole('group', { name: 'Current country of residence' }).filter({ hasText: 'Current country of residenceCountry (required) Select Afghanistan Albania Algeri' }).getByRole('combobox', { name: 'Status (required)' }).selectOption('4: 04');
        await this.page.getByLabel('From (YYYY/MM/DD) (required)').fill('2020/11/12');
        await this.page.getByLabel('To (YYYY/MM/DD) (required)').fill('2024/01/11');
    }

    //previous country of residence
    async previous_country_of_residence_actions(pre_countries) {
        if (pre_countries.length > 0) {
            // click No for clear out the possible previous records
            await this.page.getByRole('group', { name: 'Previous countries of residence: during the past five years, have you lived in any country other than your country of citizenship or your current country of residence (indicated above) for more than six months? (required)' }).getByText('No').click();
            await this.page.getByRole('group', { name: 'Previous countries of residence: during the past five years, have you lived in any country other than your country of citizenship or your current country of residence (indicated above) for more than six months? (required)' }).getByText('Yes').click();
        } else {
            await this.page.getByRole('group', { name: 'Previous countries of residence: during the past five years, have you lived in any country other than your country of citizenship or your current country of residence (indicated above) for more than six months? (required)' }).getByText('No').click();
            return
        }

        let count = pre_countries.length >= 2 ? 2 : pre_countries.length; // only allow maximum 2 previous countries of residence
        for (let i = 1; i < count + 1; i++) {
            await this.page.getByRole('group', { name: `Previous country of residence #${i}` }).getByRole('combobox', { name: 'Country (required)' }).selectOption('26: 048');
            await this.page.getByRole('group', { name: `Previous country of residence #${i}` }).getByRole('combobox', { name: 'Immigration status (required)' }).selectOption('8: 08');
            await this.page.getByRole('group', { name: `Previous country of residence #${i}` }).getByLabel('Start date of imigration status (YYYY/MM/DD) (required)').fill('2020/02/03');
            await this.page.getByRole('group', { name: `Previous country of residence #${i}` }).getByLabel('End date of immigration status (YYYY/MM/DD) (required)').fill('2020/06/01');
            if (i != count) {
                await this.page.getByRole('button', { name: 'Add another' }).click();
            }
        }
    }

    // marriage information
    async marriage_information_actions() {
        await this.page.getByRole('combobox', { name: 'Current marital status (required)' }).selectOption('4: 01');
        await this.page.getByLabel('Date (YYYY/MM/DD) (required)').fill('2023/01/01');
        await this.page.getByRole('group', { name: 'Provide the name of your current/spouse/common-law partner.' }).getByLabel('Family name(s) (required)').fill('asdf');
        await this.page.getByRole('group', { name: 'Provide the name of your current/spouse/common-law partner.' }).getByLabel('Given name(s)').fill('asdf');
        await this.page.getByRole('group', { name: 'Have you previously been married or in a common-law relationship? (required)' }).getByText('No').click();
        await this.page.getByRole('group', { name: 'Have you previously been married or in a common-law relationship? (required)' }).getByText('Yes').click();
        await this.page.getByRole('group', { name: 'If yes, please provide the details for your previous spouse/common-law partner:' }).getByLabel('Family name(s) (required)').fill('asdf');
        await this.page.getByRole('group', { name: 'If yes, please provide the details for your previous spouse/common-law partner:' }).getByLabel('Given name(s)').fill('asdf');
        await this.page.getByRole('group', { name: 'If yes, please provide the details for your previous spouse/common-law partner:' }).locator('#previousRelationshipForm-previousSpouseDob').fill('1999/01/03');
        await this.page.getByRole('combobox', { name: 'Type of relationship (required)' }).selectOption('2: 01');
        await this.page.getByLabel('Start date of relationship (YYYY/MM/DD) (required)').fill('2021/01/01');
        await this.page.getByLabel('End date of relationship (YYYY/MM/DD) (required)').fill('2022/02/02');
    }

    async make_actions() {
        // fake data
        let pre_countries = [1, 2, 3];
        await this.name_actions();
        await this.page.getByLabel('UCI').fill('1223123');
        await this.physical_characteristics_actions();
        await this.birth_information_actions();
        await this.citizenship_actions();
        await this.current_country_of_residence_actions();
        await this.previous_country_of_residence_actions(pre_countries);
        await this.marriage_information_actions();

    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector('//h2[text()="Contact information"]');
    }
}

class ContactInformation extends WebPage {
    constructor(name, page, data) {
        super(name, page, data);
        this.url = "";
    }

    // mailing address
    async mailing_address_actions() {
        // await this.page.getByLabel('P.O. Box').fill('11');
        await this.page.locator('#MailingAptUnit').fill('11112');
        await this.page.locator('#MailingStreetNum').fill('888922');
        await this.page.locator('#MailingStreetName').fill('Lay rd12312');
        await this.page.locator('#MailingCityTown').fill('Richmondasf');
        let select = new DependantSelect(this.page, '#MailingCountry', '#MailingProvinceState', '42: 511', '2: 11');
        await select.act()
        await this.page.locator('#MailingPostalCode').fill('V3E 2S6');
    }
    // residential address
    async residential_address_actions() {
        await this.page.getByRole('group', { name: 'Residential address same as mailing address? (required)' }).getByText('Yes').click();
        await this.page.getByRole('group', { name: 'Residential address same as mailing address? (required)' }).getByText('No').click();
        await this.page.locator('#ResidentialAptUnit').fill('123');
        await this.page.locator('#ResidentialStreetNum').fill('ASFDASD');
        await this.page.locator('#ResidentialStreetName').fill('ASDF');
        await this.page.locator('#ResidentialCityTown').fill('ASDF');
        // dependant select, only if country is  Canada TODO:
        await this.page.locator('#ResidentialCountry').selectOption('15: 622');
        // await this.page.locator('#ResidentialProvinceState' ).selectOption('15: 622');
        await this.page.locator('#ResidentialPostalCode').fill('123123');
        // await this.page.locator('#ResidentialDistrict').fill('ASFDAS');

    }

    // primary telephone number
    async primary_telephone_number_actions() {
        await this.page.getByRole('group', { name: 'Primary Telephone Number (required)' }).getByText('Other').click();
        await this.page.getByRole('group', { name: 'Primary Telephone Number (required)' }).getByText('Canada/US').click();
        await this.page.locator("#PrimaryType").selectOption('2: 02');
        // await this.page.locator("#PrimaryCountryCode").fill('121-212'); //TODO: Canada/US not required
        await this.page.locator("#PrimaryNumber").fill('604-558-9878');
        await this.page.locator("#PrimaryExtension").fill('1212');
    }

    // alternate telephone number
    async alternate_telephone_number_actions() {
        await this.page.locator("(//label[text()=' Canada/US '])[2]").click();
        await this.page.locator("#AlternateType").selectOption('2: 02');
        // await this.page.locator("#AlternateCountryCode").click(); //TODO: Canada/US not required
        await this.page.locator("#AlternateNumber").fill('565-664-6666');
        await this.page.locator("#AlternateExtension").fill('111');

    }

    // ignore fax number, since no one use fax anymore

    // contact email address
    async contact_email_address_actions() {
        await this.page.getByRole('group', { name: 'Do you want us to contact you using the email address used for this account? (required)' }).getByText('Yes').click();
        await this.page.getByRole('group', { name: 'Do you want us to contact you using the email address used for this account? (required)' }).getByText('No').click();
        await this.page.getByLabel('Email (required)').fill('ASDF@GMAIL.COM');
    }

    async make_actions() {
        await this.mailing_address_actions();
        await this.residential_address_actions();
        await this.primary_telephone_number_actions();
        await this.alternate_telephone_number_actions();
        await this.contact_email_address_actions();
    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector('//h2[text()="Passport"]');
    }
}

class Passport extends WebPage {
    constructor(name, page, data) {
        super(name, page, data);
        this.url = "";
    }

    async make_actions() {
        await this.page.getByRole('group', { name: 'Do you have a valid passport/travel document? (required)' }).getByText('No').click();
        await this.page.getByText('Yes').click();
        await this.page.getByLabel('Passport/Travel document number (required)').fill('3242342342');
        await this.page.getByRole('combobox', { name: 'Country of issue (required)' }).selectOption('18: 083');
        await this.page.getByLabel('Issue date (YYYY/MM/DD) (required)').fill('2020/01/01');
        await this.page.getByLabel('Expiry date (YYYY/MM/DD) (required)').fill('2026/01/01');
    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector('//h2[text()="National identity document"]');
    }
}

class NationalID extends WebPage {
    constructor(name, page, data) {
        super(name, page, data);
        this.url = "";
    }

    async make_actions() {
        await this.page.getByText('Yes').click();
        await this.page.getByLabel('National identity document number (required)').fill('23423423');
        await this.page.getByRole('combobox', { name: 'Country of Issue (required)' }).selectOption('2: 151');
        await this.page.getByLabel('Issue date (YYYY/MM/DD) (required)').fill('2020/01/01');
        await this.page.getByLabel('Expiry date (YYYY/MM/DD) (required)').fill('2025/09/02');
    }

    async next() {
        try {
            await this.page.getByRole('button', { name: 'Save and continue' }).click();
            await this.page.waitForSelector('//h2[text()="Education/occupation detail"]');
        } catch {
            console.log('National ID section failed due to the website technical issue. So I checked "No" for the section. Please correct it manually');
            await this.page.locator('label[for="NICNo"]').click();
            await this.page.getByRole('button', { name: 'Save and continue' }).click();
            await this.page.waitForSelector('//h2[text()="Education/occupation detail"]');
        }
    }
}

class EducationOccupation extends WebPage {
    constructor(name, page, data) {
        super(name, page, data);
        this.url = "";
    }

    async make_actions() {
        await this.page.getByRole('combobox', { name: 'Highest level of education (required)' }).selectOption('2: 01');
        await this.page.getByLabel('Number of years of education in total (required)').fill('12');
        await this.page.getByLabel('Current occupation (required)').fill('Marketing Specialistasdf');
        await this.page.getByLabel('Intended occupation (required)').fill('Marketing Specialistasdf');
    }

    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector("//h2[text()[normalize-space()='Language detail']]");
    }
}

class LanguageDetail extends WebPage {
    constructor(name, page, data) {
        super(name, page, data);
        this.url = "";
    }

    async make_actions() {
        await this.page.getByRole('combobox', { name: 'Native language/mother tongue (required)' }).selectOption('36: 255');
        await this.page.getByRole('group', { name: 'Are you able to communicate in English and/or French?' }).getByRole('combobox', { name: 'Language (required)' }).selectOption('2: 01');
        await this.page.getByRole('group', { name: 'Have you taken a test from a designated testing agency to assess your English or French skills? (required)' }).getByText('No').click();
    }
    async next() {
        await this.page.getByRole('button', { name: 'Save and continue' }).click();
        await this.page.waitForSelector("//button[text()=' Add dependants ']");
    }
}

module.exports = {
    Imm0008Intro,
    ApplicationDetail,
    PersonalDetail,
    ContactInformation,
    Passport,
    NationalID,
    EducationOccupation,
    LanguageDetail

}