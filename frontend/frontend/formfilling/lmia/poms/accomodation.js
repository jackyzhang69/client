/*
This moduel includes pages:
1. accomcodation: if provide accomodation?

*/

const WebPage = require('../../page');
const { expect } = require('@playwright/test');

// Will you provide the TFW with suitable and affordable accommodations?
class Accommodation1 extends WebPage {
    constructor(page, args) {
        super(page, "accommodation1", "Accommodation: will you provide accommodation?", args.data.accommodation);
        this.stream = args.stream
    }

    async make_actions() {
        this.data.provide_accommodation ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")
    }

    async next() {
        await this.page.click("#next");
        const provide_accommodation = await this.page.locator("label.required:has-text('Please indicate the type of accommodation you will provide:')");
        const not_provide_accommodation = await this.page.locator("h2:has-text('Low-wage')")
        this.data.provide_accommodation ? await expect(provide_accommodation).toBeVisible() : await expect(not_provide_accommodation).toBeVisible();
    }
}

// Please indicate the type of accommodation you will provide:
class Accommodation2 extends WebPage {
    constructor(page, args) {
        super(page, "accommodation2", "Accommodation: please indicate the rate and type of accommodation you will provide", args.data.accommodation);
        this.stream = args.stream
    }

    async make_actions() {
        // rent amount and unit
        await this.page.locator("input[type='number']").fill(this.data.rate);
        await this.page.locator("select").selectOption({ label: this.data.unit });
        // type of accommodation
        await this.page.check(`input[type=radio][value=${this.data.type}]`);

    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Low-wage')"); // please select a contact element
    }

}

module.exports = {
    Accommodation1,
    Accommodation2
}
