
const WebPage = require('../../page');
const { inputDate } = require('./common');

class Education extends WebPage {
    constructor(page, args) {
        super(page, "education", "Education", args.data.education);
        this.args = args;
    }

    async high_school() {
        for (let i = 0; i < this.data.high_school.length; i++) {
            let hs = this.data.high_school[i];
            await inputDate(this.page, `#BCPNP_App_EduSec_From-${i}`, hs.from);
            hs.to ?
                await inputDate(this.page, `#BCPNP_App_EduSec_To-${i}`, hs.to)
                : await this.page.locator(`input[name='BCPNP_App_EduSec_To-${i}[Present]']`).check();
            await this.page.locator(`#BCPNP_App_EduSec_School-${i}`).fill(hs.school_name);
            await this.page.locator(`#BCPNP_App_EduSec_City-${i}`).fill(hs.city);
            await this.page.locator(`#BCPNP_App_EduSec_Country-${i}`).selectOption(hs.country);
            hs.completed ?
                await this.page.locator(`label[for='BCPNP_App_EduSec_Completion-${i}-Yes']`).check()
                : await this.page.locator(`label[for='BCPNP_App_EduSec_Completion-${i}-Yes']`).uncheck();
            if (i < this.data.high_school.length - 1) {
                await this.page.locator('a[title="Add secondary education"]').click();
            }
        }
    }

    async bc_post_secondary() {
        for (let i = 0; i < this.data.bc_post_secondary.length; i++) {
            let ps = this.data.bc_post_secondary[i];
            await inputDate(this.page, `#BCPNP_App_EduBC_From-${i}`, ps.from);
            ps.to ?
                await inputDate(this.page, `#syncA_App_EduBC_To-${i}`, ps.to)
                : await this.page.locator(`input[name='syncA_App_EduBC_To-${i}[Present]']`).check();
            await this.page.locator(`#syncA_App_EduBC_Institution-${i}`).fill(ps.school_name);
            await this.page.locator(`#syncA_App_EduBC_City-${i}`).selectOption(ps.city);
            await this.page.locator(`#syncA_App_EduBC_Level-${i}`).selectOption(ps.level);
            await this.page.locator(`#syncA_App_EduBC_Field-${i}`).selectOption(ps.field_of_study);
            if (ps.field_of_study === 'OTH') {
                await this.page.locator(`#BCPNP_App_EduBC_OtherField-${i}`).fill(ps.original_field_of_study);
            }
            if (i < this.data.bc_post_secondary.length - 1) {
                await this.page.locator("//a[@title='Add secondary education']//span[1]").click();
            }
        }
    }

    async canada_post_secondary() {
        for (let i = 0; i < this.data.canada_post_secondary.length; i++) {
            let ps = this.data.canada_post_secondary[i];
            await inputDate(this.page, `#BCPNP_App_EduCAN_From-${i}`, ps.from);
            ps.to ?
                await inputDate(this.page, `#syncA_App_EduCAN_To-${i}`, ps.to)
                : await this.page.locator(`input[name='syncA_App_EduCAN_To-${i}[Present]']`).check();
            await this.page.locator(`#syncA_App_EduCAN_Institution-${i}`).fill(ps.school_name);
            await this.page.locator(`#BCPNP_App_EduCAN_City-${i}`).selectOption(ps.city);
            await this.page.locator(`#BCPNP_App_EduCAN_Province-${i}`).selectOption(ps.province);
            await this.page.locator(`#BCPNP_App_EduCAN_Level-${i}`).selectOption(ps.level);
            await this.page.locator(`#BCPNP_App_EduCAN_Field-${i}`).selectOption(ps.field_of_study);
            if (ps.field_of_study === 'OTH') {
                await this.page.locator(`#BCPNP_App_EduCAN_OtherField-${i}`).fill(ps.original_field_of_study);
            }
            if (i < this.data.canada_post_secondary.length - 1) {
                await this.page.locator("//a[@title='Add post-secondary education within Canada, but outside of B.C.']//span[1]").click();
            }
        }
    }

    async international_post_secondary() {
        for (let i = 0; i < this.data.international_post_secondary.length; i++) {
            let ps = this.data.international_post_secondary[i];
            await inputDate(this.page, `#BCPNP_App_EduPostSec_From-${i}`, ps.from);
            ps.to ?
                await inputDate(this.page, `#BCPNP_App_EduPostSec_To-${i}`, ps.to)
                : await this.page.locator(`input[name='BCPNP_App_EduPostSec_To-${i}[Present]']`).check();
            await this.page.locator(`#BCPNP_App_EduPostSec_Institution-${i}`).fill(ps.school_name);
            await this.page.locator(`#BCPNP_App_EduPostSec_City-${i}`).fill(ps.city);
            await this.page.locator(`#BCPNP_App_EduPostSec_Country-${i}`).selectOption(ps.country);
            await this.page.locator(`#BCPNP_App_EduPostSec_Level-${i}`).selectOption(ps.level);
            await this.page.locator(`#BCPNP_App_EduPostSec_Field-${i}`).selectOption(ps.field_of_study);
            if (ps.field_of_study === 'OTH') {
                await this.page.locator(`#BCPNP_App_EduPostSec_OtherField-${i}`).fill(ps.original_field_of_study);
            }
            if (i < this.data.international_post_secondary.length - 1) {
                await this.page.locator("//a[@title='Add post-secondary education outside of Canada']//span[1]").click();
            }
        }
    }

    async make_actions() {
        await this.high_school();

        if (this.data.has_bc_post_secondary) {
            await this.page.locator("label[for='BCPNP_App_EduBC-No']").check(); // make previous dissapear

            await this.page.locator("label[for='BCPNP_App_EduBC-Yes']").check();
            await this.bc_post_secondary();
        } else {
            await this.page.locator("label[for='BCPNP_App_EduBC-No']").check();
        }

        if (this.data.has_canada_post_secondary) {
            await this.page.locator("label[for='BCPNP_App_EduCAN-No']").check(); // make previous dissapear

            await this.page.locator("label[for='BCPNP_App_EduCAN-Yes']").check();
            await this.canada_post_secondary();
        } else {
            await this.page.locator("label[for='BCPNP_App_EduCAN-No']").check();
        }

        if (this.data.has_international_post_secondary) {
            await this.page.locator("label[for='BCPNP_App_EduNCAN-No']").check(); // make previous dissapear

            await this.page.locator("label[for='BCPNP_App_EduNCAN-Yes']").check();
            await this.international_post_secondary();
        } else {
            await this.page.locator("label[for='BCPNP_App_EduNCAN-No']").check();
        }
    }

    async next() {
        await this.page.locator("//button[text()='Save']").click();
        await this.page.locator("li > a:has-text('Work Experience')").click();
        await this.page.locator("h3:has-text('Work Experience')")
    }
}

module.exports = Education;