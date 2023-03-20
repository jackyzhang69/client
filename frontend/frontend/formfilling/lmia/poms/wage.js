/* 
In this module,  we will create the following pages:
wage: wage information

*/


const WebPage = require('../../page');

class Wage extends WebPage {
    constructor(page, args) {
        super(page, "wage", "Wage information", args.data.wage);
        this.stream = args.stream
    }

    // Based on diffferent streams, we will have different actions before Wage itself.
    async special_actions() {
        if (this.stream.name == "GTSFull") {
            // if cat A, we need to select the partner;if cat B, we need to select the occupation, which seems noc code 2016.
            // Anyway, A or B, here is just select an option. Which option will depended on Adaptor 
            await this.page.getByRole('combobox').selectOption(this.stream.option);
        }
    }


    async make_actions() {
        await this.special_actions();
        await this.page.locator("input[type='number']").fill(this.data.amount)
        // Check if the wage is converted from a non-hourly rate wage
        const nth_radio = this.data.isConverted ? 0 : 1
        await this.page.getByRole('radio').nth(nth_radio).check();

    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Work Location')"); // please select a contact element
    }
}

module.exports = Wage
