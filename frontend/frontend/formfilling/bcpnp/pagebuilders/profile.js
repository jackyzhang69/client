/* Express Entry Stream pages builder. */

const WebPages = require('../../pages');
const { Profile, Confirm, Home, ProfileUpdate } = require('../poms/profile');
const { Login } = require('../poms/start');

// profile  pages
function buildProfilePages(page, args) {

    const profilePage = new Profile(page, args);
    const confirmPage = new Confirm(page, args);

    const webpages = new WebPages([profilePage, confirmPage]);

    return webpages;
}

// update the profile

function updateProfilePages(page, args) {
    // get profile user_id and password and make the Login required login object and inject it into the args.data
    const login = {
        "username": args.data.user_id,
        "password": args.data.password
    }
    args.data.login = login;
    const loginPage = new Login(page, args);
    const homePage = new Home(page, args);
    const profileUpdatePage = new ProfileUpdate(page, args);

    const webpages = new WebPages([loginPage, homePage, profileUpdatePage]);

    return webpages;
}
module.exports = { buildProfilePages, updateProfilePages };

