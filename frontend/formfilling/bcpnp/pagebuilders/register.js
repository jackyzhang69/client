/* Express Entry Stream pages builder. */

const WebPages = require('../../models/pages');
const { Login, CaseHistory, Skills, Stream, ProfileRepConfirmation, Continue } = require('../poms/start');
const { Registrant, Education, WorkExperience, JobOffer, Language, Submit } = require('../poms/registration');

// skill worker pages
function buildRegisterPages(page, args) {

    const loginPages = new Login(page, args);
    const CaseHistoryPages = new CaseHistory(page, args);
    const SkillsPages = new Skills(page, args);
    const StreamPages = new Stream(page, args);
    const ProfileRepConfirmationPages = new ProfileRepConfirmation(page, args);
    const ContinuePages = new Continue(page, args);

    // registrant pages
    const registrantPages = new Registrant(page, args);
    const educationPages = new Education(page, args);
    const workExperiencePages = new WorkExperience(page, args);
    const jobOfferPages = new JobOffer(page, args);
    const languagePages = new Language(page, args);
    const submitPages = new Submit(page, args);


    const startPages = [loginPages, CaseHistoryPages, SkillsPages, StreamPages, ProfileRepConfirmationPages, ContinuePages];
    const registrationPages = [registrantPages, educationPages, workExperiencePages, jobOfferPages, languagePages, submitPages];


    const webpages = new WebPages([...startPages, ...registrationPages]);

    return webpages;
}

module.exports = { buildRegisterPages };