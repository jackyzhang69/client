/* 
This moduel includes pages:
1. pr: permanent resident information

*/

const WebPage = require('../../page');
const { expect } = require('@playwright/test');


class PR1 extends WebPage {
    constructor(page, args) {
        super(page, "pr1", "Permanent resident: application purpose, joined employer", args.data.pr);
        this.stream = args.stream;
    }

    async make_actions() {
        // support pr or work permit and pr. 
        const pr_only_selector = "input.nodeAnswer[type=radio][value=PROnly]";
        const wp_and_pr_selector = "input.nodeAnswer[type=radio][value=WPAndPR]";

        if (this.data.support_pr_only) {
            await this.page.waitForSelector(pr_only_selector);
            await this.page.waitForTimeout(1000);
            await this.page.check(pr_only_selector);
        } else {
            await this.page.waitForSelector(wp_and_pr_selector);
            await this.page.waitForTimeout(1000);
            await this.page.check(wp_and_pr_selector);
        }

        // joined with another employer?
        const yes_selector = "input.nodeAnswer[type=radio][value=Yes]";
        const no_selector = "input.nodeAnswer[type=radio][value=No]";

        if (this.data.joined_with_another_employer) {
            await this.page.waitForSelector(yes_selector);
            await this.page.waitForTimeout(1000);
            await this.page.check(yes_selector);
        } else {
            await this.page.waitForSelector(no_selector);
            await this.page.waitForTimeout(1000);
            await this.page.check(no_selector);
        }
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("//label[text()='Who is currently filling the duties and responsibilities of the position?']");
    }
}

class PR2 extends WebPage {
    constructor(page, args) {
        super(page, "pr2", "Permanent resident: current situations", args.data.pr);
        this.stream = args.stream;
    }

    async make_actions() {
        // two textarea in this page
        const textareas = await this.page.locator("textarea");
        await textareas.nth(0).fill(this.data.who_currently_filling_the_duties);
        await textareas.nth(1).fill(this.data.how_did_you_find_the_tfw);


        // this page has only 2 radio buttons. 
        const radio_buttons = await this.page.locator("input[type=radio]");
        // have you previously employed
        this.data.previously_employed ? await radio_buttons.nth(0).check() : await radio_buttons.nth(1).check();
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Hours and Pay')");
    }
}


module.exports =
{
    PR1,
    PR2
};