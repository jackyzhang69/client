/* PR Renew pages builder. */

const WebPages = require('../../models/pages');
const { Login, ViewApplication, RenewApplicationPicker, DashBoard } = require('../poms/start');
const { Dashboard5444, ApplicantSituation, PersonalDetails, ImmigrationHistory, PersonalHistory, ResidencyObligation } = require('../poms/imm5444');

// renewakl application  pages
function buildRenewPages(page, args) {

    const loginPages = new Login(page, args);
    const viewApplication = new ViewApplication(page, args);
    const renewApplicationPicker = new RenewApplicationPicker(page, args);
    const dashBoard = new DashBoard(page, args);
    const dashboard5444 = new Dashboard5444(page, args);
    const applicantSituation = new ApplicantSituation(page, args);
    const personalDetails = new PersonalDetails(page, args);
    const immigrationHistory = new ImmigrationHistory(page, args);
    const personalHistory = new PersonalHistory(page, args);
    const residencyObligation = new ResidencyObligation(page, args);

    const webpages = new WebPages([
        loginPages,
        viewApplication,
        renewApplicationPicker,
        dashBoard,
        dashboard5444,
        applicantSituation,
        personalDetails,
        immigrationHistory,
        personalHistory,
        residencyObligation
    ]);

    return webpages;
}

module.exports = { buildRenewPages };