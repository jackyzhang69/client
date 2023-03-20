/* low wage  Stream pages builder. */

const WebPages = require('../../pages');
const { buildStartPages, hoursPayPages, buildJobofferPages, buildRecruitmentPages } = require('./common');
const { WageCategory } = require('../poms/create');
const Wage = require('../poms/wage');
const Work = require('../poms/work');
const { ForeignWorkerProvideName, ForeignWorker, ForeignWorkerDetails } = require('../poms/fw');
const { Accommodation1, Accommodation2 } = require('../poms/accomodation');
const { CAP1, CAP2, CAP3 } = require('../poms/cap');
const { HoursPay1, HoursPay_Overtime } = require('../poms/pay');
const { Upload } = require('../poms/upload');


// page is Playwright page object, and data is the validated stream-specified data to fill the pages
function buildLWSPages(page, args) {
    // Starts from common pages, and then add GTS specific pages
    const common_pages = buildStartPages(page, args);
    const wageCaterogyPage = new WageCategory(page, args);
    // // start to fill wage page
    const wagePage = new Wage(page, args);
    const workPage = new Work(page, args);

    // check if provide foreign worker name
    let temp_foreignWorkerPage = [new ForeignWorkerProvideName(page, args)]
    if (args.data.foreign_worker.provide_name) {
        temp_foreignWorkerPage.push(new ForeignWorker(page));
        temp_foreignWorkerPage.push(new ForeignWorkerDetails(page, args));
    }

    // accommdation: for only low wage stream
    const accomodationPages = [new Accommodation1(page, args)];
    if (args.data.accommodation.provide_accommodation) {
        accomodationPages.push(new Accommodation2(page, args));
    }

    // CAp: for only low wage stream
    const capPages = [new CAP1(page, args)];
    if (!args.data.cap.is_cap_exempted) {
        capPages.push(new CAP2(page, args));
        capPages.push(new CAP3(page, args));
    }

    // hours pay
    const hoursPay1Page = new HoursPay1(page, args.data.cap, args); // 3rd param is always different, here is cap
    const { hoursPay5Page, hoursPay2Page, hoursPay3Page, hoursPay4Page } = hoursPayPages(page, args);
    // hours pay page 5 is different based on if have overtime rate
    let temp_hoursPayPage5 = []
    if (args.data.hours_pay.has_overtime_rate) temp_hoursPayPage5.push(new HoursPay_Overtime(page, args));
    temp_hoursPayPage5.push(hoursPay5Page)
    const finalHoursPayPages = [hoursPay1Page, hoursPay2Page, hoursPay3Page, hoursPay4Page, ...temp_hoursPayPage5];

    // job offer pages
    const jobofferPages = buildJobofferPages(page, args);

    // recruitment pages
    const recruitmentPages = buildRecruitmentPages(page, args);

    // Upload page
    const uploadPage = new Upload(page, args);


    // Some common but with stream specific elements pages
    const lswPages = [
        wageCaterogyPage,
        wagePage,
        workPage,
        ...temp_foreignWorkerPage,
        ...accomodationPages,
        ...capPages,
        ...finalHoursPayPages
    ]
    const pages = [
        ...common_pages,
        ...lswPages,
        ...jobofferPages,
        ...recruitmentPages,
        uploadPage
    ];

    const webPages = new WebPages(pages);

    return webPages;
}

module.exports = buildLWSPages

