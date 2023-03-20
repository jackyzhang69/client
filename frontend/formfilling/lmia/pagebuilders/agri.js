/* Agriculture  Stream pages builder. */

const WebPages = require('../../pages');
const buildStartPages = require('./common');
const Wage = require('../poms/wage');

// page is Playwright page object, and data is the validated stream-specified data to fill the pages
function buildAgriPages(page, args) {
    // Starts from common pages, and then add GTS specific pages
    const common_pages = buildStartPages(page, args);

    // start to fill wage page
    const wagePage = new Wage(page, args.stream, args.data.wage);

    // Some common but with stream specific elements pages
    const agriPages = [
        wagePage
    ]
    const pages = [...common_pages, ...agriPages];

    const webPages = new WebPages(pages);

    return webPages;
}

module.exports = buildAgriPages
