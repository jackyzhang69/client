/* Express Entry Stream pages builder. */

const WebPages = require('../../pages');
const { buildStartPages, hoursPayPages, buildJobofferPages, buildRecruitmentPages } = require('./common');
const Wage = require('../poms/wage');
const Work = require('../poms/work');
const { ForeignWorker, ForeignWorkerDetails } = require('../poms/fw');
const { PR1, PR2 } = require('../poms/pr');
const { HoursPay1, HoursPay_Overtime, } = require('../poms/pay');

const { Upload, Summary } = require('../poms/upload');

// page is Playwright page object, and data is the validated stream-specified data to fill the pages
function buildEEPages(page, args) {
    // Starts from common pages, and then add GTS specific pages
    const common_pages = buildStartPages(page, args);

    // start to fill wage page
    const wagePage = new Wage(page, args);

    // start to fill work page
    const workPage = new Work(page, args);

    // start to fill EE page
    // ------------------------------------
    const foreignWorkerPage = new ForeignWorker(page);
    const foreignWorkerDetailsPage = new ForeignWorkerDetails(page, args);

    const pr1Page = new PR1(page, args);
    const pr2Page = new PR2(page, args);

    // start to fill hours pay page
    const hoursPay1Page = new HoursPay1(page, args.data.pr, args);  // need a previous one data
    const { hoursPay5Page, hoursPay2Page, hoursPay3Page, hoursPay4Page } = hoursPayPages(page, args);

    // hours pay page 5 is different based on if have overtime rate
    let temp_hoursPayPage5 = []
    if (args.data.hours_pay.has_overtime_rate) temp_hoursPayPage5.push(new HoursPay_Overtime(page, args));
    temp_hoursPayPage5.push(hoursPay5Page)

    const finalHoursPayPages = [hoursPay1Page, hoursPay2Page, hoursPay3Page, hoursPay4Page, ...temp_hoursPayPage5];
    // ------------------------------------

    // job offer pages
    const jobofferPages = buildJobofferPages(page, args);

    // recruitment pages
    const recruitmentPages = buildRecruitmentPages(page, args);

    // Upload page
    const uploadPage = new Upload(page, args);


    // Some common but with stream specific elements pages
    const eePages = [
        foreignWorkerPage,
        foreignWorkerDetailsPage,
        pr1Page,
        pr2Page,
        ...finalHoursPayPages,
    ]
    const pages = [
        ...common_pages, wagePage,
        workPage,
        ...eePages,
        ...jobofferPages,
        ...recruitmentPages,
        uploadPage
    ];

    const webPages = new WebPages(pages);

    return webPages;
}

module.exports = buildEEPages
