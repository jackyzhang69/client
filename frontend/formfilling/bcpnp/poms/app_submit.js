const WebPage = require('../../page');
const { inputDate, inputPhone } = require('./common');
const { makeCheckboxVisible } = require("../../libs/playwright")

class Submit extends WebPage {
    constructor(page, args) {
        super(page, "submit", "Submit", args.data.submit);
        this.args = args;
    }

    async make_actions() {
        await this.page.locator("li > a:has-text('Submit')").click(); //  temp
        // const checkboxs = await this.page.$$("input.ng-pristine.ng-untouched.ng-empty.ng-invalid.ng-invalid-required");
        // const checkboxs = await this.page.$$('input[type="checkbox"]');


        const check1 = await this.page.$("input[name='BCPNP_App_ConsentRegNameAgreed']");
        if (!await check1.isChecked()) {
            await makeCheckboxVisible(this.page, check1);
            await check1.click();
        }
        await this.page.locator("#BCPNP_App_ConsentRegName").fill(this.data.pa_name);

        if (this.data.spouse_name) {
            const check2 = await this.page.$("input[name='BCPNP_App_ConsentSpouseNameAgreed']");
            if (!await check2.isChecked()) {
                await makeCheckboxVisible(this.page, check2);
                await check2.click();
            }
            await this.page.locator("#BCPNP_App_ConsentSpouseName").fill(this.data.spouse_name);
        }

        // rep
        if (this.data.rcic_first_name && this.data.rcic_last_name) {
            await this.page.locator("label[for='BCPNP_App_HaspaidRep-Yes1']").check();
            await this.page.locator("#BCPNP_App_RepFamilyName").fill(this.data.rcic_last_name);
            await this.page.locator("#BCPNP_App_RepGivenName").fill(this.data.rcic_first_name);
            await inputPhone(this.page, "#BCPNP_App_RepPhone", this.data.rcic_phone);
        } else {
            await this.page.locator("label[for='BCPNP_App_HaspaidRep-Yes2']").check();
        }

        // payment refund policy
        const payment_checkbox = await this.page.$("input[name='BCPNP_PaymentRefundPolicy']");
        if (!await payment_checkbox.isChecked()) {
            await makeCheckboxVisible(this.page, payment_checkbox);
            await payment_checkbox.click();
        }

    }

    async next() {
        await this.page.locator("//button[text()='Save']").click();
        // await this.page.locator("//button[text()='Validate']").click();

    }
}

module.exports = Submit;

