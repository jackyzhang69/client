/* This is the main entry point for all page forms filling. */

const WebPages = require('../pages');
const { Login, Security, Terms, EmployerPicker } = require('./poms/start');
const { DeleteApplication } = require('./poms/delete');
const Filler = require('../filler');
const path = require('path');

function buildPages(page, args) {
    // simulate data
    const data = {
        "login": {
            "email": "jackyzhang1969@outlook.com",
            "password": "Super20220103!"
        },
        "security": {
            "significant other": "Shanghai",
            "childhood best": "dongfang",
            "first trip": "China"
        },
        "cra_number": "826098626RP0001",
        "employer_contacts": [
            "Hang Xu",
            "Rudolf Buena"
        ],
        "representative": {
            "name": "Yanfei Xing",
            "paid": true,
            "type": 0,
            "member_id": "R511623",
            "province": "BC",
            "explaination": ""
        }
    };

    const loginPage = new Login(page, data.login);
    const securityPage = new Security(page, data.security);
    const termsPage = new Terms(page, null);
    const employerPage = new EmployerPicker(page, data.cra_number);
    const deleteApplicationPage = new DeleteApplication(page, null);

    const webPages = new WebPages(
        [
            loginPage,
            securityPage,
            termsPage,
            employerPage,
            deleteApplicationPage
        ]
    );

    return webPages;
}

async function main() {
    const sourceExcel = path.join(__dirname, '/output/test.xlsx');
    const args = {
        sourceExcel,
        lmiaNumber: "",
        skipPagesRange: [6, 38],
        pdf: false,
        png: false,
        screen_snap_folder: path.join(__dirname, '/screenshots'),
        upload_folder: "/Users/jacky/Desktop/trv",
        headless: true,
        slow_mo: 0,
        view_port_size: { width: 1000, height: 1440 },
        defaultTimeOut: 30000
    };
    filler = new Filler(args);

    // goto the employer dashboard, and delete all the temp applications
    await filler.fill(buildPages);

}

main()
