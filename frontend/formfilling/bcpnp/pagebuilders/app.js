/* Express Entry Stream pages builder. */

const WebPages = require('../../pages');
// const { Profile, Confirm, Home, ProfileUpdate } = require('../poms/app');
const { Login, CaseHistory, Continue } = require('../poms/start');
const Applicant = require("../poms/app_applicant");
const Education = require("../poms/app_edu");
const WorkExperience = require("../poms/app_we");
const Family = require("../poms/app_family");
const JobOffer = require("../poms/app_joboffer");
const attachmnet = require("../poms/app_attach");
const Submit = require("../poms/app_submit");

// application  pages
function buildAppPages(page, args) {

    const loginPages = new Login(page, args);
    const CaseHistoryPages = new CaseHistory(page, args);
    const ContinuePages = new Continue(page, args);
    const applicantPages = new Applicant(page, args);
    const educationPages = new Education(page, args);
    const workExperiencePages = new WorkExperience(page, args);
    const familyPages = new Family(page, args);
    const jobOfferPages = new JobOffer(page, args);
    const attachmentPages = new attachmnet(page, args);
    const submitPages = new Submit(page, args);

    const webpages = new WebPages([
        loginPages,
        CaseHistoryPages,
        ContinuePages,
        applicantPages,
        educationPages,
        workExperiencePages,
        familyPages,
        jobOfferPages,
        attachmentPages,
        submitPages
    ]);

    return webpages;
}

module.exports = { buildAppPages };