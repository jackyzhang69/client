/*
This moduel includes pages:
1. CAP1: Cap exempted?

*/

const WebPage = require('../../models/page');
const { expect } = require('@playwright/test');

// Do you believe CAP is exempted?
class CAP1 extends WebPage {
    constructor(page, args) {
        super(page, "cap1", "CAP: is CAP exempted?", args.data.cap);
        this.stream = args.stream
        this.accommodation = args.data.accommodation
    }

    async make_actions() {
        // if provide accommodation, then provide accommodation details
        if (this.accommodation.provide_accommodation) {
            const number_inputs = await this.page.locator("input[type='number']");
            await number_inputs.nth(0).fill(this.accommodation.bedrooms);
            await number_inputs.nth(1).fill(this.accommodation.occupants);
            await number_inputs.nth(2).fill(this.accommodation.bathrooms);

            await this.page.locator("textarea").fill(this.accommodation.description);
        } else {
            await this.page.locator("textarea").fill(this.accommodation.why_not_provide);
        }
        // is cap exempted?
        this.data.is_cap_exempted ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")
    }

    async next() {
        await this.page.click("#next");
        const is_exempted = await this.page.locator("label.required:has-text('Which exemption do you wish to be considered for?')");
        const not_exempted = await this.page.locator("label.required:has-text('Is the employer operating in a seasonal industry?')")
        this.data.is_cap_exempted ? await expect(is_exempted).toBeVisible() : await expect(not_exempted).toBeVisible();
    }
}

// is not cap exempted, then ask if operating in seasonal industry
class CAP2 extends WebPage {
    constructor(page, args) {
        super(page, "cap2", "CAP: is operating in seasonal industry?", args.data.cap);
        this.stream = args.stream
    }

    async make_actions() {
        this.data.in_seasonal_industry ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")
    }

    async next() {
        await this.page.click("#next");
        const in_seasonal = await this.page.locator("h2:has-text('Seasonal - Determining the Effect on the Cap')");
        const not_in_seasonal = await this.page.locator("h2:has-text('Non-Seasonal - Determining the Effect on the Cap')");
        this.data.in_seasonal_industry ? await expect(in_seasonal).toBeVisible() : await expect(not_in_seasonal).toBeVisible();
    }
}

// in seasonal or non-seasonal industry, giving CAP details and confirm if cap is met, then go or not go to
class CAP3 extends WebPage {
    constructor(page, args) {
        super(page, "cap3", "CAP: is operating in seasonal industry?", args.data.cap);
        this.stream = args.stream
        this.locations = args.data.work_location_duration.locations
    }

    // add cap TODO:
    async add_cap() {
        const location_number = this.locations.length

        for (let i = 0; i < location_number; i++) {
            await this.page.click("button:has-text('Add')");
            // pick location. below code is not working, so use evaluate
            // await this.page.locator("select").selectOption({ label: this.locations[i].business_op_name });
            await this.page.waitForSelector("select.nodeAnswer");

            await this.page.evaluate((opName) => {
                const selectElement = document.querySelector('select.nodeAnswer');
                const options = selectElement.options;
                for (const option of options) {
                    if (option.innerText === opName) {
                        selectElement.selectedIndex = option.index;
                        break;
                    }
                }
            }, this.locations[i].business_op_name);


            // Input dates
            const data_inputs = await this.page.locator("input[type='date']");
            await data_inputs.nth(0).fill(this.data.start_date);
            await data_inputs.nth(1).fill(this.data.end_date);

            // input cap details
            const number_inputs = await this.page.locator("input[type='number']");
            await number_inputs.nth(0).fill(this.data.location_caps[i].A);
            await number_inputs.nth(1).fill(this.data.location_caps[i].B);
            await number_inputs.nth(2).fill(this.data.location_caps[i].C);
            await number_inputs.nth(3).fill(this.data.location_caps[i].D);
            await number_inputs.nth(4).fill(this.data.location_caps[i].E);
            await number_inputs.nth(5).fill(this.data.location_caps[i].F);
            await number_inputs.nth(6).fill(this.data.location_caps[i].G);
            await number_inputs.nth(7).fill(this.data.location_caps[i].H);

            // save
            await this.page.click("button:has-text('Save')");
        }

    }


    async make_actions() {
        await this.add_cap();
        // continue to apply if cap over. This is defenite so do not choose no
        await this.page.check("input[type=radio][value=Yes]");
    }

    async next() {
        await this.page.click("#next");
        await expect(this.page.locator("h2:has-text('Hours and Pay')")).toBeVisible()
    }
}

module.exports = {
    CAP1,
    CAP2,
    CAP3
}