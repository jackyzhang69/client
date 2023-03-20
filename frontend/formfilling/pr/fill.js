/* This is the main entry point for all page forms filling. */
// const { Playwright } = require('playwright'); \
//TODO:  the model page /pages may be changed, so all the pages need to be updated

const WebPages = require('../pages');
const { Login, ViewApplication, ApplicationPicker, FormPicker } = require('./poms/start');
const { Imm0008Intro, ApplicationDetail, PersonalDetail, ContactInformation, Passport, NationalID, EducationOccupation, LanguageDetail } = require('./poms/imm0008');
// const { timing } = require('../../utils/utils/timing');
const Filler = require('../filler');
const path = require('path');

async function buildPages(page, args) {
    /** Build pages according to page, page names, and data */

    const loginPage = new Login(page, 'login', "Log in", null);
    const viewPage = new ViewApplication(page, 'view_application', "Start new application or view my PR application", null);
    const picker = new ApplicationPicker(page, 'picker', "Pick one's application by email", null);
    const formPicker = new FormPicker(page, 'form_picker', "Pick a form to be filled", null);
    const imm0008Intro = new Imm0008Intro(page, 'imm0008_intro', "Imm0008 form filling introduction", null);
    const applicationDetail = new ApplicationDetail(page, 'application_detail', "Application details", null);
    const personalDetail = new PersonalDetail(page, 'personal_detail', "Personal details", null);
    const contactInformation = new ContactInformation(page, 'contact_information', "Contact information", null);
    const passport = new Passport(page, 'passport', "Passport details", null);
    const nationalId = new NationalID(page, 'national_id', "National Id details", null);
    const educationOccupation = new EducationOccupation(page, 'education_occupation', "Educations and occupations", null);
    const languageDetail = new LanguageDetail(page, 'language_detail', "Language details", null);

    const webPages = new WebPages(
        [
            loginPage,
            viewPage,
            picker,
            formPicker,
            imm0008Intro,
            applicationDetail,
            personalDetail,
            contactInformation,
            passport,
            nationalId,
            educationOccupation,
            languageDetail
        ]
    );

    return webPages.pages;
}

async function main() {
    const sourceExcel = path.join(__dirname, '/output/test.xlsx');
    const skipPagesRange = null;

    const args = {
        sourceExcel,
        pdf: false,
        png: false,
        folder: path.join(__dirname, '/screenshots'),
        skipPagesRange
    };
    filler = new Filler(headless = false, slow_mo = 0);
    await filler.fill(buildPages, args);
}

// timing(main);
main()
