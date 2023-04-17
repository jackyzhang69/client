/* 
In this module,  we will create the following pages:
work location: including last wage question, and work location repeatable questions, and number of  employment duration, and workers

*/


const WebPage = require('../../models/page');
const { selectOptionHasSimilarText } = require('../../libs/playwright');
const { print } = require('../../libs/output');

class Work extends WebPage {
    constructor(page, args) {
        super(page, "work", "Create work location,duration, and number of workers", args.data.work_location_duration);
        this.stream = args.stream
        this.wage = args.data.wage
    }

    // Based on if the wage is converted, there are one text input  before work location and duration  itself.
    async special_actions() {
        if (this.wage.isConverted) await this.page.locator('[id="\\39 160"]').getByRole('textbox').fill(this.wage.explaination)
    }

    async work_location_duration_actions() {
        for (let i = 0; i < this.data.locations.length; i++) {
            const location = this.data.locations[i];
            // check if address is already existed. If yes, skip it. used only for edit mode
            const elementHandle = await this.page.$('td[data-screen-item-name="WAGE_WORK_LOCATION_LINE1"]');
            if (elementHandle) {
                const textContent = await elementHandle.textContent();
                if (location.address.includes(textContent)) continue
            }


            await this.page.getByRole('button', { name: 'Add' }).click();

            await this.page.locator("(//label[text()='What is the business operating name of this location?']/following::input)[1]").fill(location.business_op_name);

            await this.page.locator("(//label[text()='Describe, in your own words and in as much detail as possible, the principal business activity at this work location.']/following::textarea)[1]").fill(location.business_activity);

            await this.page.locator("(//label[text()='Describe, in your own words and in as much detail as possible, any safety concerns or hazards associated with the principal business activity or site.']/following::textarea)[1]").fill(location.safety_concerns);

            try {
                await selectOptionHasSimilarText(this.page, "//label[text()='Select the work location as identified in your Job Bank for Employers file']/following-sibling::select", location.address);
            } catch (error) {
                print(`The address ${location.address} is not found in the dropdown list, please check it.`, style = "error")
                throw error
            }

            await this.page.locator("//fieldset[@data-screen-item-name='WAGE_WORK_LOCATION_PROVINCE']//select[1]").selectOption(location.province)

            if (location.is_primary) await this.page.check("//input[@type='checkbox']");

            await this.page.getByRole('button', { name: 'Save' }).click();
        }
    }

    async duration_number_of_workers_actions() {
        await this.page.locator("input[min='0']").fill(this.data.duration.amount)
        // id is not secured cause it'll be changed due to different streams, but the 3 selects are always be there.
        await this.page.locator("select").nth(2).selectOption(this.data.duration.unit);

        // number of workers areatext is the 3rd one if no wage converted, or 4th one if wage converted.
        const nth_textarea = this.wage.isConverted ? 3 : 2
        await this.page.locator("textarea").nth(nth_textarea).fill(this.data.duration.justification)

        await this.page.locator("(//label[text()='How many TFWs are you applying for in this application?']/following::input)[1]").fill(this.data.number_of_workers)
    }


    async make_actions() {
        await this.special_actions();
        await this.work_location_duration_actions();
        await this.duration_number_of_workers_actions();
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Foreign National Information')");
    }
}

module.exports = Work



