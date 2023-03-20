/* high wage  Stream pages builder. */

const WebPages = require('../../pages');
const { buildStartPages, hoursPayPages, buildJobofferPages, buildRecruitmentPages } = require('./common');
const { WageCategory } = require('../poms/create');
const Wage = require('../poms/wage');
const Work = require('../poms/work');
const { ForeignWorkerProvideName, ForeignWorker, ForeignWorkerDetails } = require('../poms/fw');
const { TransitionPlan, TransitionPlan1, TransitionPlan2 } = require('../poms/transitionplan');
const { HoursPay1, HoursPay_Overtime } = require('../poms/pay');
const { Upload } = require('../poms/upload');


// page is Playwright page object, and data is the validated stream-specified data to fill the pages
function buildHWSPages(page, args) {
    // Starts from common pages, and then add GTS specific pages
    const common_pages = buildStartPages(page, args);

    const wageCaterogyPage = new WageCategory(page, args);

    // start to fill wage page
    const wagePage = new Wage(page, args);

    // start to fill work page
    const workPage = new Work(page, args);

    // check if provide foreign worker name
    args.data.foreign_worker["provide_name"] = args.data.willProvideTFWName
    let temp_foreignWorkerPage = [new ForeignWorkerProvideName(page, args)]
    if (args.data.foreign_worker.provide_name) {
        temp_foreignWorkerPage.push(new ForeignWorker(page));
        temp_foreignWorkerPage.push(new ForeignWorkerDetails(page, args));
    }

    // start to fill transition plan page

    const transitionPlanPage = new TransitionPlan(page, args);

    // check if transition plan is exempted
    let temp_transitionPlanPage1 = [new TransitionPlan1(page, args)]
    if (!args.data.transition_plan.exempted_from_tp) {
        temp_transitionPlanPage1.push(new TransitionPlan2(page, args))
    }
    const finalTransitionPlanPages = [transitionPlanPage, ...temp_transitionPlanPage1];

    // start to fill hours pay page
    const hoursPay1Page = new HoursPay1(page, args.data.transition_plan, args);
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
    // const summaryPage = new Summary(page);

    // Some common but with stream specific elements pages
    const hswPages = [
        wageCaterogyPage,
        wagePage,
        workPage,
        ...temp_foreignWorkerPage,
        ...finalTransitionPlanPages,
        ...finalHoursPayPages,
    ]
    const pages = [
        ...common_pages,
        ...hswPages,
        ...jobofferPages,
        ...recruitmentPages,
        uploadPage
    ];

    const webPages = new WebPages(pages);

    return webPages;
}

module.exports = buildHWSPages






