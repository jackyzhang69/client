/* This is the common parts of all  programs, starting from login to pick streams. */

const WebPages = require('../../pages');
const { Login, Security, Terms, EmployerPicker } = require('../poms/start');
const { Create, EmployerContact, Representative, RepresentativeType, StreamDetermination } = require('../poms/create');
const { Edit, EnterApplication } = require('../poms/edit');
const { HoursPay2, HoursPay3, HoursPay4, HoursPay_Overtime, HoursPay5 } = require('../poms/pay');
const { JobOffer1, JobOffer2, JobOffer3, JobOffer4, JobOffer5, JobOffer6, JobOffer7, BenefitsDetails } = require('../poms/joboffer');
const { Recruitment, RecruitmentWaivableYes, RecruitmentJobbank, RecruitmentRecruitCanadians, RecruitmentLmiBenefits, RecruitmentFinal, Recruitment2, Recruitment3, Recruitment4, Recruitment5, Recruitment6, Recruitment7 } = require('../poms/recruit');


// page is Playwright page object, and data is the validated stream-specified data to fill the pages
function buildStartPages(page, args) {
    const data = args.data;
    const loginPage = new Login(page, data.login);
    const securityPage = new Security(page, data.security);
    const termsPage = new Terms(page, null);
    const employerPage = new EmployerPicker(page, data.cra_number);
    const createPage = new Create(page, null);
    const editPage = new Edit(page, args.lmiaNumber, null);
    const enterApplicationPage = new EnterApplication(page, args.lmiaNumber, null);
    const employerContactPage = new EmployerContact(page, args);
    const representativePage = new Representative(page, data.representative);
    const representativeTypePage = new RepresentativeType(page, data.representative);
    const streamDeterminationPage = new StreamDetermination(page, data.representative, data.stream);

    // Here we build the page list. The order of the pages is important.
    if (args.lmiaNumber !== null && args.lmiaNumber !== "" && args.lmiaNumber !== "undefined") {
        create_or_edit = [editPage, enterApplicationPage];
    } else {
        create_or_edit = [createPage];
    }

    const common_pages = [
        loginPage,
        securityPage,
        termsPage,
        employerPage,
        ...create_or_edit,
        employerContactPage,
        representativePage,
        representativeTypePage,
        streamDeterminationPage
    ]

    const webPages = new WebPages(common_pages);

    return webPages;
}

/*
Below are the page builders for each stream. They are called by the stream-specific page builders.
Usually, except the first and/or last pages are different, others are the same.
*/


function hoursPayPages(page, args) {
    const hoursPay2Page = new HoursPay2(page, args);
    const hoursPay3Page = new HoursPay3(page, args);
    const hoursPay4Page = new HoursPay4(page, args);
    const hoursPay5Page = new HoursPay5(page, args);
    return { hoursPay5Page, hoursPay2Page, hoursPay3Page, hoursPay4Page };
}



function recruitmentPages2_7(page, args) {
    const recruitment2Page = new Recruitment2(page, args);
    const recruitment3Page = new Recruitment3(page, args);
    const recruitment4Page = new Recruitment4(page, args);
    const recruitment5Page = new Recruitment5(page, args);
    const recruitment6Page = new Recruitment6(page, args);
    const recruitment7Page = new Recruitment7(page, args);
    return { recruitment2Page, recruitment3Page, recruitment4Page, recruitment5Page, recruitment6Page, recruitment7Page };
}

// Recruitment pages
function buildRecruitmentPages(page, args) {
    let temp_recruitmentPage = [new Recruitment(page, args)];
    // if job ad waivable?
    if (args.data.recruitment.job_ad_waivable) {
        temp_recruitmentPage.push(new RecruitmentWaivableYes(page, args))
        // would like to rovide details?
        if (args.data.recruitment.provide_recruitment_details) {
            temp_recruitmentPage.push(new RecruitmentJobbank(page, args))
            temp_recruitmentPage.push(new RecruitmentLmiBenefits(page, args))
        } else {
            temp_recruitmentPage.push(new RecruitmentLmiBenefits(page, args));
        }
    } else {
        temp_recruitmentPage.push(new RecruitmentRecruitCanadians(page, args));
        if (args.data.recruitment.recruited_canadian) {
            temp_recruitmentPage.push(new RecruitmentJobbank(page, args));
            temp_recruitmentPage.push(new RecruitmentLmiBenefits(page, args));
        } else {
            temp_recruitmentPage.push(new RecruitmentLmiBenefits(page, args));
        }
    }

    const { recruitment2Page, recruitment3Page, recruitment4Page, recruitment5Page, recruitment6Page, recruitment7Page } = recruitmentPages2_7(page, args);
    const recruitmentFinalPage = new RecruitmentFinal(page, args);

    return [
        ...temp_recruitmentPage,
        recruitment2Page,
        recruitment3Page,
        recruitment4Page,
        recruitment5Page,
        recruitment6Page,
        recruitment7Page,
        recruitmentFinalPage,
    ]

}


function buildJobofferPages(page, args) {
    const joboffer1Page = new JobOffer1(page, args);
    const joboffer2Page = new JobOffer2(page, args);
    const joboffer3Page = new JobOffer3(page, args);
    const joboffer4Page = new JobOffer4(page, args);
    const joboffer5Page = new JobOffer5(page, args);
    const joboffer6Page = new JobOffer6(page, args);

    let temp_joboffer7Page = []
    if (args.data.job_offer.will_provide_benefits) temp_joboffer7Page.push(new BenefitsDetails(page, args));
    temp_joboffer7Page.push(new JobOffer7(page, args));
    return [
        joboffer1Page,
        joboffer2Page,
        joboffer3Page,
        joboffer4Page,
        joboffer5Page,
        joboffer6Page,
        ...temp_joboffer7Page,
    ]

}



module.exports = {
    buildStartPages,
    hoursPayPages,
    buildJobofferPages,
    buildRecruitmentPages,
}

