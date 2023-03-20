/* 
This moduel includes pages:
1. transition_plan : High wage transition plan

*/

const WebPage = require('../../page');
const { expect } = require('@playwright/test');

class TransitionPlan extends WebPage {
    constructor(page, args) {
        super(page, "traisition_plan", "Transition plan: is this application for seasonal occupation?", args.data.transition_plan);
        this.stream = args.stream
        this.seasonal_info = args.data.seasonal_info
    }

    async make_actions() {
        this.seasonal_info.is_seasonal ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")
    }

    async next() {
        await this.page.click("#next");
        const is_seasonal_page = await this.page.locator("h2:has-text('Seasonal Positions')")
        const not_seasonal_page = await this.page.locator("h2:has-text('High-wage Transition Plan')")
        this.seasonal_info.is_seasonal ? await expect(is_seasonal_page).toBeVisible() : await expect(not_seasonal_page).toBeVisible();
    }
}


class TransitionPlan1 extends WebPage {
    constructor(page, args) {
        super(page, "traisition_plan1", "Transition plan: seasonal info and high wage transitiion plan?", args.data.transition_plan);
        this.stream = args.stream
        this.seasonal_info = args.data.seasonal_info
    }

    async fill_seasonal_info() {
        const selects = await this.page.locator("select");
        const number_inputs = await this.page.locator("input[type=number]");

        await selects.nth(0).selectOption({ value: this.seasonal_info.start });
        await selects.nth(1).selectOption({ value: this.seasonal_info.end });
        await number_inputs.nth(0).fill(this.seasonal_info.canadian_workers);
        await number_inputs.nth(1).fill(this.seasonal_info.foreign_workers);
    }

    async high_wage_transition_plan() {
        const number_inputs = await this.page.locator("input[type=number]");
        // if the occupation is seasonal, the index of the number input is 2, otherwise 0
        const index = this.seasonal_info.is_seasonal ? 2 : 0;
        await number_inputs.nth(index).fill(this.data.current_number_of_canadian_workers);
        await number_inputs.nth(index + 1).fill(this.data.current_number_of_foreign_workers);

        // exmpted from tp?
        this.data.exempted_from_tp ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")

    }


    async make_actions() {
        if (this.seasonal_info.is_seasonal) await this.fill_seasonal_info();
        await this.high_wage_transition_plan();
    }

    async next() {
        await this.page.click("#next");
        this.data.exempted_from_tp ? await this.page.waitForSelector("h2:has-text('Exemption')") : await this.page.waitForSelector("label.required:has-text('Have you completed a Transition Plan for this occupation at this work location before?')");
    }
}

// if transition plan is not exempted

class TransitionPlan2 extends WebPage {
    constructor(page, args) {
        super(page, "traisition_plan2", "Transition plan: completed a transition plan?", args.data.transition_plan);
        this.stream = args.stream
    }

    async make_actions() {
        this.data.have_completed_tp ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")
    }

    async next() {
        await this.page.click("#next");
        const is_completed_page = await this.page.locator("h2:has-text('Previous Transition Plan Updates')")
        const not_completed_page = await this.page.locator("h2:has-text('Understanding the transition plan requirements')")
        this.data.have_completed_tp ? await expect(is_completed_page).toBeVisible() : await expect(not_completed_page).toBeVisible();
    }
}

module.exports = { TransitionPlan, TransitionPlan1, TransitionPlan2 };