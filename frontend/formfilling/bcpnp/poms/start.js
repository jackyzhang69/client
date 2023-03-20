/*
This includes login 
*/

const WebPage = require('../../page');

class Login extends WebPage {
    constructor(page, args) {
        super(page, "login", "Login", args.data.login);
        this.url = "https://www.pnpapplication.gov.bc.ca/user/sign-in";
        this.args = args;
    }

    async make_actions() {
        await this.page.goto(this.url);
        await this.page.fill("#username", this.data.username);
        await this.page.fill("#pass", this.data.password);
    }

    async next() {
        await this.page.click("input[value='Sign In']");
        await this.page.locator("//a[contains(text(),'Sign Out')]") // make sure loged in

        // after login, check which page is on according to page elements. After checking, set the args vairables isCreate and hasPreviousCase
        /* 
        1. if it is the complete new created profile, after login is "START BY SELECTING YOUR CATEGORY". Then set isCreate to true, hasPreviousCase to false
        2. if it has previous case, after login is "DASHBOARD - CASE HISTORY". Then set  hasPreviousCase to true. Then check is "Start a new case" button is enabled or disabled. If it is enabled, then set isCreate to true. Otherwise, set isCreate to false
        */

        const decisiveElement = await Promise.race([
            this.page.waitForSelector("h1:has-text('START BY SELECTING YOUR CATEGORY')"),
            this.page.waitForSelector("h1:has-text('DASHBOARD - CASE HISTORY')"),
            this.page.waitForSelector("a:has-text('Continue')")
        ]);
        const result_text = await decisiveElement.innerText();

        switch (result_text) {
            case "START BY SELECTING YOUR CATEGORY":
                this.args["isCreate"] = true;
                this.args["hasPreviousCase"] = false;
                break;
            case "DASHBOARD - CASE HISTORY":
                this.args["hasPreviousCase"] = true;
                // Check if the "Start a new case" button is disabled
                const isDisabled = await this.page.$eval('a:has-text("Start a new case")', (element) => element.classList.contains('disabled'));
                this.args["isCreate"] = !isDisabled;
                break;
            case "Continue":
                this.args["isCreate"] = false;
                this.args["hasPreviousCase"] = false;
                break;
        }
    }
}

class CaseHistory extends WebPage {
    constructor(page, args) {
        super(page, "case_history", "Case History", args.data.case_history);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        // if it has no previouse case registration, then ignore this page
        if (!this.args.hasPreviousCase) return;
        if (this.args.isCreate) {
            await this.page.click("text=Start a new case");
            await this.page.waitForSelector("h1:has-text('START BY SELECTING YOUR CATEGORY')")
        } else {
            // await this.page.locator("a.ready-for-click[role=button]").click();
            await this.page.locator("a:has-text('View')").last().click();
            await this.page.locator("a:has-text('Skills Immigration')");
        }
    }
}

class Skills extends WebPage {
    constructor(page, args) {
        super(page, "skills", "Skills Immigration", args);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        if (!this.args.isCreate) return; // if it is not the create, then ignore this page
        // otherwise, click the skills immigration
        await this.page.click("//a[contains(text(),'Skills Immigration')]");
        await this.page.waitForSelector("h1:has-text('SELECT SKILLS IMMIGRATION STREAM')")
    }

}

class Stream extends WebPage {
    constructor(page, args) {
        super(page, "stream", "Select Stream", args.data);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        if (!this.args.isCreate) return; // if it is not the create, then ignore this page

        const stream = this.data.stream;
        // select stream
        await this.page.locator(`//a[contains(text(),"${stream}")]`).click();
        // check to confirm
        // await this.page.locator("input[type=checkbox][name='agreed']").first().check();
        let visibleCheckbox = await getVisibleElement(this.page, 'input[type=checkbox][name="agreed"]');

        if (visibleCheckbox) {
            await visibleCheckbox.check();
        } else {
            console.error('No visible checkbox found');
        }

        // click start
        let visibleStart = await getVisibleElement(this.page, 'input.ready-for-click[type=submit]');
        if (visibleStart) {
            await visibleStart.click();
        } else {
            console.error('No visible start button found');
        }

        // wait for the next page
        await this.page.locator("h1:has-text('PROFILE AND REPRESENTATIVE INFORMATION CONFIRMATION')");
    }
}


class ProfileRepConfirmation extends WebPage {
    constructor(page, args) {
        super(page, "profile_rep_confirmation", "Profile and Representative Information Confirmation", args);
        this.args = args;
    }

    async make_actions() {

    }

    async next() {
        if (!this.args.isCreate) return; // if it is not the create, then ignore this page
        await this.page.locator("//input[@value='Proceed']").click();
        await this.page.locator("h1:has-text('SKILLS IMMIGRATION REGISTRATION')");
    }

}

class Continue extends WebPage {
    constructor(page, args) {
        super(page, "continue", "Continue", args);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        if (this.args.isCreate) return; // if it doesn't have previous case, then ignore this page
        await this.page.locator("a:has-text('Continue')").click();
        await this.page.locator("h3:has-text('Registrant Information')"); // entered the registration page
    }
}

module.exports = {
    Login,
    CaseHistory,
    Skills,
    Stream,
    ProfileRepConfirmation,
    Continue
}

async function getVisibleElement(page, selector) {
    const checkboxesLocator = await page.locator(selector);
    const checkboxes = await checkboxesLocator.elementHandles();
    let visibleElement = null;

    for (const checkbox of checkboxes) {
        const isVisible = await checkbox.isVisible();
        if (isVisible) {
            visibleElement = checkbox;
            break;
        }
    }
    return visibleElement;
}
