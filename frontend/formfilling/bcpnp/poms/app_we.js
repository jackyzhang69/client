const WebPage = require('../../page');
const { inputDate, inputPhone } = require('./common');

class WorkExperience extends WebPage {
    constructor(page, args) {
        super(page, "work_experience", "Work experience", args.data.work_experience);
        this.args = args;
    }

    async work_experience() {
        for (let i = 0; i < this.data.work_experience.length; i++) {
            let we = this.data.work_experience[i];

            await this.page.locator(`#BCPNP_App_Work_Title-${i}`).fill(we.job_title);
            await this.page.locator(`#BCPNP_App_Work_NOC-${i}`).fill(we.noc_code);
            await inputDate(this.page, `#BCPNP_App_Work_From-${i}`, we.start_date);
            if (we.end_date) {
                await inputDate(this.page, `#BCPNP_App_Work_To-${i}`, we.end_date)
            } else {
                const checkboxElement = await this.page.$(`input[name="BCPNP_App_Work_To-${i}[Present]"]`);
                // Use JavaScript to modify the element's style to make it visible
                await this.page.evaluate((element) => {
                    element.style.display = 'block';
                    element.style.visibility = 'visible';
                    element.style.opacity = '1';
                }, checkboxElement);

                // Click the checkbox element
                await checkboxElement.click();
            }

            we.job_hours === "Full-time" ? await this.page.locator(`label[for='BCPNP_App_Work_JobHours-${i}-full-time']`).check()
                : await this.page.locator(`label[for='BCPNP_App_Work_JobHours-${i}-part-time']`).check();

            await this.page.locator(`#BCPNP_App_Work_Company-${i}`).fill(we.company);
            await inputPhone(this.page, `#BCPNP_App_Work_CompPhone-${i}`, we.phone);
            await this.page.locator(`#BCPNP_App_Work_CompWebsite-${i}`).fill(we.website);
            await this.page.locator(`#BCPNP_App_Work_CompAddrUnit-${i}`).fill(we.unit);
            await this.page.locator(`#BCPNP_App_Work_CompAddr-${i}`).fill(we.street_address);
            await this.page.locator(`#BCPNP_App_Work_CompCity-${i}`).fill(we.city);
            await this.page.locator(`#BCPNP_App_Work_CompProvince-${i}`).fill(we.province);
            await this.page.locator(`#BCPNP_App_Work_CompCountry-${i}`).selectOption(we.country);
            await this.page.locator(`#BCPNP_App_Work_CompPostal-${i}`).fill(we.postcode);
            await this.page.locator(`#BCPNP_App_Work_Duties-${i}`).fill(we.postcode);

            if (i < this.data.work_experience.length - 1) {
                await this.page.locator('a[title="Add job"]').click();
            }
        }

    }

    async make_actions() {
        await this.page.locator("label[for='BCPNP_App_WorkExp-No']").check(); // make previous dissapear

        if (this.data.has_work_experience) {
            await this.page.locator("label[for='BCPNP_App_WorkExp-Yes']").check();
            await this.work_experience();
        } else {
            await this.page.locator("label[for='BCPNP_App_WorkExp-No']").check();
        }
    }

    async next() {
        await this.page.locator("//button[text()='Save']").click();
        await this.page.locator("li > a:has-text('Family')").click();
        await this.page.locator("h3:has-text('Family Information')")
    }

}

module.exports = WorkExperience;
