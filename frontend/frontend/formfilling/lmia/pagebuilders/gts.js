/* Global Talent Stream pages builder */

const WebPages = require('../../models/pages');
const buildStartPages = require('./common');
const { GTSCategory } = require('../poms/create');
const Wage = require('../poms/wage');

// page is Playwright page object, and data is the validated stream-specified data to fill the pages
function buildGTSPages(page, args) {
    // Starts from common pages, and then add GTS specific pages
    const common_pages = buildStartPages(page, args);
    // determin GTS category A or B
    const gtsCategoryPage = new GTSCategory(page, args.data.stream.category);
    // start to fill wage page
    const wagePage = new Wage(page, args.stream, args.data.wage);

    // Some common but with stream specific elements pages
    const gtsPages = [
        wagePage
    ]
    const pages = [...common_pages, gtsCategoryPage, ...gtsPages];

    const webPages = new WebPages(pages);

    return webPages;
}

module.exports = buildGTSPages
