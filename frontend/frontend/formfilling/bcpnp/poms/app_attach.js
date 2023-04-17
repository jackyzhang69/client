const WebPage = require('../../models/page');
const path = require('path');
const { print } = require("../../libs/output");

class Attachment extends WebPage {
    constructor(page, args) {
        super(page, "attachments", "Attachments", args.data.attachments);
        this.applicant = args.data.applicant;
        this.args = args;
    }

    async check_all() {
        this.applicant.status.current_country === "Canada" ?
            await this.page.locator("label[for='BCPNP_App_CurrentlyLivingInCanada-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_CurrentlyLivingInCanada-No']").check();

        this.applicant.has_bc_drivers_license ?
            await this.page.locator("label[for='BCPNP_App_Require_BC_DriverLicence-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_Require_BC_DriverLicence-No']").check();

        this.applicant.has_lmia ?
            await this.page.locator("label[for='BCPNP_App_PositiveLMIA-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_PositiveLMIA-No']").check();

        this.applicant.has_second_language ?
            await this.page.locator("label[for='BCPNP_App_ClaimPoints_LanguageProficiency-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_ClaimPoints_LanguageProficiency-No']").check();

        this.applicant.did_eca ?
            await this.page.locator("label[for='BCPNP_App_ClaimPointsECA-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_ClaimPointsECA-No']").check();

        this.applicant.require_license ?
            await this.page.locator("label[for='BCPNP_App_ClaimPoints_BCPNP_Registration-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_ClaimPoints_BCPNP_Registration-No']").check();

        this.args.data.education.has_bc_post_secondary || this.args.data.education.has_canada_post_secondary || this.args.data.education.has_international_post_secondary ?
            await this.page.locator("label[for='BCPNP_App_RequireCertifications-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_RequireCertifications-No']").check();

        this.applicant.regional_exp_alumni ?
            await this.page.locator("label[for='BCPNP_App_ClaimPoints_RegionalExperienceAlumni-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_ClaimPoints_RegionalExperienceAlumni-No']").check();

        this.args.data.family.has_spouse && this.args.data.family.spouse.sp_canada_status === "Worker" && this.args.data.family.spouse.is_working ?
            await this.page.locator("label[for='BCPNP_App_HaveSpouse-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_HaveSpouse-No']").check();
    }

    async upload(filePath, upload_slot_text) {
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        await this.page
            .locator("uf-file")
            .filter({
                hasText: upload_slot_text,
            })
            .getByRole("button", { name: "Browse" })
            .click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
    }

    get_filename(filePath) {
        const { name: filename, ext: extension } = path.parse(filePath);
        return filename + extension;
    }

    async has_file(file_name) {
        const textLocator = this.page.locator(`text=${file_name}`);
        const hasText = await textLocator.count() > 0;
        return hasText;
    }

    async make_actions() {
        // check all necessay places
        await this.check_all();

        for (const [upload_slot_text, filePath] of Object.entries(this.data)) {
            if (filePath) {
                const file_name = this.get_filename(filePath);
                if (await this.has_file(file_name)) {
                    print(`File ${file_name} already uploaded, skipped...`, "info");
                } else {
                    await this.upload(filePath, upload_slot_text);
                    print(`File ${file_name} uploaded`, "success");
                }
            }
        }

    }



    async next() {
        await Promise.all([
            this.page.locator("//button[text()='Save']").click(),
            this.page.locator("li > a:has-text('Submit')").click(),
            this.page.locator("h3:has-text('Declare and Submit')"),
        ]);

    }
}

module.exports = Attachment;
