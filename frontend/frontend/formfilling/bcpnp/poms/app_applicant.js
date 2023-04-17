/*
This includes application pages of BCPNP
*/

const WebPage = require('../../models/page');
const { inputDate } = require('./common');

class Applicant extends WebPage {
    constructor(page, args) {
        super(page, "applicant", "Applicant", args.data.applicant);
        this.args = args;
    }

    async pre_applications() {
        const q = this.data.about_application;
        if (q.q1) {
            await this.page.locator("label[for='BCPNP_App_ActiveApplication-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq1").fill(q.q1_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_ActiveApplication-No']").check();
        }

        if (q.q2) {
            await this.page.locator("label[for='BCPNP_App_RejectedPrevPNP-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq2").fill(q.q2_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_RejectedPrevPNP-No']").check();
        }

        if (q.q3) {
            await this.page.locator("label[for='BCPNP_App_ActivePNPAppReg-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq3").fill(q.q3_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_ActivePNPAppReg-No']").check();
        }

        if (q.q4) {
            await this.page.locator("label[for='BCPNP_App_RejectedApplication-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq4").fill(q.q4_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_RejectedApplication-No']").check();
        }

        if (q.q5) {
            await this.page.locator("label[for='BCPNP_App_RejectedVisaPermit-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq5").fill(q.q5_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_RejectedVisaPermit-No']").check();
        }

        if (q.q6) {
            await this.page.locator("label[for='BCPNP_App_RefusedRefugee-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq6").fill(q.q6_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_RefusedRefugee-No']").check();
        }

        if (q.q7) {
            await this.page.locator("label[for='BCPNP_App_RemovalOrder-Yes']").check()
            await this.page.locator("#BCPNP_App_CurPrevApplicationsDetailsq7").fill(q.q7_explaination);
        } else {
            await this.page.locator("label[for='BCPNP_App_RemovalOrder-No']").check();
        }


    }

    async ee() {
        await this.page.locator("#syncA_App_EE_ProfileNumber").fill(this.data.ee.ee_profile_no);
        await inputDate(this.page, "#syncA_App_EE_ExpiryDate", this.data.ee.ee_expiry_date);
        await this.page.locator("#syncA_App_EE_ValidCode").fill(this.data.ee.ee_jsvc);
        await this.page.locator("#syncA_App_EE_CRS").fill(this.data.ee.ee_score);
        await this.page.locator("#BCPNP_App_NOC").fill(this.data.ee.ee_noc);
        await this.page.locator("#BCPNP_Job_Title").fill(this.data.ee.ee_job_title);

    }

    async current_status() {
        const status = this.data.status;
        if (status.in_canada) {
            await this.page.locator("label[for='syncA_App_InCanada-Yes']").check();
            await this.page.locator("#syncA_App_InCanada_Status").selectOption({ label: status.current_country_status });
            switch (status.current_country_status) {
                case "Student":
                    await this.page.locator("#syncA_App_StudyPermit_ClientID").fill(status.uci);
                    await this.inputDate(this.page, "#BCPNP_App_StudyPermit_DateSigned", status.current_status_start_date);
                    await this.inputDate(this.page, "#syncA_App_StudyPermit_ValidUntil", status.current_status_end_date);
                    break;
                case "Worker":
                    await this.page.locator("#BCPNP_App_WorkPermit_Info").selectOption(status.current_workpermit_type);
                    await this.page.locator("#syncA_App_WorkPermit_ClientID").fill(status.uci);
                    await inputDate(this.page, "#BCPNP_App_WorkPermit_DateSigned", status.current_status_end_date);
                    await inputDate(this.page, "#syncA_App_WorkPermit_ValidUntil", status.current_status_end_date);
                    break;
                case "Visitor":
                    if (status.has_vr) {
                        await this.page.locator("label[for='BCPNP_App_VisitorRecord-Yes']").check();
                        // fill details
                        await this.page.locator("#BCPNP_App_Visitor_ClientID").fill(status.uci);
                        await this.inputDate(this.page, "#BCPNP_App_Visitor_EnteredCanada", status.last_entry_date);
                        await this.inputDate(this.page, "#BCPNP_App_Visitor_DateSigned", status.current_status_start_date);
                        await this.inputDate(this.page, "#BCPNP_App_Visitor_ValidUntil", status.current_status_end_date);

                    } else {
                        await this.page.locator("label[for='BCPNP_App_VisitorRecord-No']").check();
                    }
                    break;
                case "Other":
                    await this.page.locator("#BCPNP_App_InCanada_Status_Other").fill(status.other_status_explaination);
                    break;
                default:
                    break;
            }
        } else {
            await this.page.locator("label[for='syncA_App_InCanada-No']").check();
            await this.page.locator("#BCPNP_App_CurResidence_Country").fill(status.current_country);
        }

    }


    async make_actions() {
        // confirm information
        const checkbox = await this.page.waitForSelector("label[for='BCPNP_App_Confirm_Information']");
        if (!await checkbox.isChecked()) {
            await checkbox.click();
        }
        // await this.page.locator("#BCPNP_App_Confirm_Information").check();
        // intended place to residence
        await this.page.waitForSelector("#syncA_App_IntendedResidence");
        await this.page.locator("#syncA_App_IntendedResidence").selectOption(this.data.intended_city);
        // current/previous applications
        await this.pre_applications();
        // if ee, then fill ee
        if (["Express Entry BC – Skilled Worker", "Express Entry BC – International Graduate"].includes(this.args.data.stream)) await this.ee();
        // current status in Canada
        await this.current_status();
    }

    async next() {
        await this.page.locator("//button[text()='Save']").click();
        await this.page.locator("li > a:has-text('Education')").click();
        await this.page.locator("h3:has-text('Education')")
    }
}


module.exports = Applicant

