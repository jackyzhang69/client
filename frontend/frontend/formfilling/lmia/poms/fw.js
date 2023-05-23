/* 
This moduel includes pages:
1. foreign_national: foreign national information

*/

const WebPage = require('../../models/page');
const { expect } = require('@playwright/test');

// Provide the names of TFW 
class ForeignWorkerProvideName extends WebPage {
    constructor(page, args) {
        super(page, "foreign_worker_provide_name", "Foreign worker: Provide the names of TFW", args.data.foreign_worker);
        this.stream = args.stream
    }

    async make_actions() {
        this.data.provide_name ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]")
    }

    async next() {
        await this.page.click("#next");
        if (this.stream.category == "HWS") this.data.provide_name ?
            await this.page.waitForSelector("label.required:has-text('The LMIA Online includes a feature allowing you to add')")
            : await this.page.waitForSelector("h2:has-text('High-wage Transition Plan')")

        if (this.stream.category == "LWS") this.data.provide_name ?
            await this.page.waitForSelector("input[type=radio][value=Yes]")
            : await this.page.waitForSelector("h3:has-text('Accommodation')");

    }
}

/* The LMIA Online includes a feature allowing you to add Foreign National(s) information at one time.
Do you wish to proceed with this feature? */

class ForeignWorker extends WebPage {
    constructor(page) {
        super(page, "foreign_worker", "Foreign National Information", null);
    }

    async make_actions() {
        // just ignore the first one, since we never use it.
        await this.page.getByRole('radio').nth(1).check();
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Foreign National Details')");
    }
}

class ForeignWorkerDetails extends WebPage {
    constructor(page, args) {
        super(page, "foreign_worker_details", "Foreign National Details", args.data.foreign_worker);
        this.stream = args.stream
        this.work_location_duration = args.data.work_location_duration
    }

    async add_foreign_worker() {
        // Make sure if HWS/LWS, will the application provide the foreign worker name now 
        if (this.data.names.length == 0) return null; // no foreign worker name provided

        for (let i = 0; i < parseInt(this.work_location_duration.number_of_workers); i++) {
            const worker = this.data.names[i];

            // check if foreign worker is already existed. If yes, skip it. used only for edit mode
            const elementHandle = await this.page.$('td[data-screen-item-name="TFW_FIRST_NAME"]');
            if (elementHandle) {
                const textContent = await elementHandle.textContent();
                if (worker.first_name.includes(textContent)) continue
            }


            await this.page.getByRole('button', { name: 'Add' }).click();
            const name_elements = await this.page.locator("input[type=text]")
            await name_elements.nth(0).fill(worker.first_name);
            await name_elements.nth(1).fill(worker.last_name);
            await this.page.locator("input[type='date']").fill(worker.dob);
            await this.page.locator("select").selectOption(worker.current_country);
            await this.page.locator("#saveWorkers").click();
            // await the first name appeas in the table
            await this.page.waitForSelector(`td:has-text('${worker.first_name}')`);
        }
    }

    async make_actions() {
        await this.add_foreign_worker();
    }

    async next() {
        await this.page.click("#next");
        switch (this.stream.name) {
            case "Wage":
                this.stream.category == "HWS" ? await this.page.waitForSelector("h2:has-text('High-wage Transition Plan')") : await this.page.waitForSelector("h2:has-text('Accommodation')");
                break;
            case "PermRes":
                await this.page.waitForSelector("h2:has-text('Permanent Resident')");
                break;
        }
    }
}

module.exports = {
    ForeignWorkerProvideName,
    ForeignWorker,
    ForeignWorkerDetails
}