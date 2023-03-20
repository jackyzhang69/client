/* Express Entry Stream pages builder. */

const WebPages = require('../../pages');
const { Representative } = require('../poms/rep');
const { Login } = require('../poms/start');



function buildRepPages(page, args) {
    const loginPage = new Login(page, args);
    const repPage = new Representative(page, args);

    const webpages = new WebPages([loginPage, repPage]);

    return webpages;
}
module.exports = { buildRepPages };

