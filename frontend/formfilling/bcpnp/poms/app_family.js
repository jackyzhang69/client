const WebPage = require('../../page');
const { inputDate, inputPhone } = require('./common');

class Family extends WebPage {
    constructor(page, args) {
        super(page, "family", "Family", args.data.family);
        this.args = args;
    }
    async spouse_working(sp) {
        if (sp.is_working) {
            await this.page.locator("label[for='BCPNP_App_spousePartnerWorking-Yes']").check();
            await this.page.locator("#BCPNP_App_Spouse_Occupation").fill(sp.sp_canada_occupation);
            await this.page.locator("#BCPNP_App_Spouse_Employer").fill(sp.sp_canada_employer);
        } else {
            await this.page.locator("label[for='BCPNP_App_spousePartnerWorking-No']").check();
        }
    }
    async decease_or_not(who, check_button, address_input) {
        if (who.deceased) {
            await this.page.locator(check_button).check();
        } else {
            // if previously checked, uncheck it
            if (await this.page.locator(check_button).isChecked()) {
                await this.page.locator(check_button).click();
            }

            await this.page.locator(address_input).fill(who.address);
        }
    }

    async spouse() {
        const sp = this.data.spouse;
        await this.page.locator("#syncA_App_Spouse_Lname").fill(sp.last_name);
        await this.page.locator("#syncA_App_Spouse_Fname").fill(sp.first_name);
        await this.page.locator("#syncA_App_Spouse_Sex").selectOption(sp.gender);
        await inputDate(this.page, "#syncA_App_Spouse_DOB", sp.date_of_birth);
        await this.page.locator("#syncA_App_Spouse_BirthPlace").selectOption(sp.country_of_birth);
        await this.page.locator("#syncA_App_Spouse_Citizenship").selectOption(sp.country_of_citizenship);
        await this.page.locator("#BCPNP_App_Spouse_Addr").fill(sp.address);
        await inputDate(this.page, "#BCPNP_App_Spouse_MarriageDate", sp.date_of_marriage);


        if (sp.sp_in_canada) {
            await this.page.locator("label[for='BCPNP_App_spouse_InCanada-Yes']").check();
            await this.page.locator("#BCPNP_App_Spouse_InCanada_Status").selectOption(sp.sp_canada_status)
            switch (sp.sp_canada_status) {
                case "Citizen":
                    await this.spouse_working(sp);
                    break;
                case "Visitor":
                case "Student":
                case "Worker":
                    await inputDate(this.page, "#BCPNP_syncA_App_Spouse_Status_Expires", sp.sp_canada_status_end_date);
                    await this.spouse_working(sp);
                    break;
                case "Other":
                    await this.page.locator("#BCPNP_App_Spouse_InCanada_Status_Other").fill("Refer to my application");
                    await inputDate(this.page, "#BCPNP_syncA_App_Spouse_Status_Expires", sp.sp_canada_status_end_date);
                    await this.spouse_working(sp);
                    break;
            }
        } else {
            await this.page.locator("label[for='BCPNP_App_spouse_InCanada-No']").check();
        }
    }

    async children() {
        for (let i = 0; i < this.data.children.length; i++) {
            const child = this.data.children[i];
            await this.page.locator(`#BCPNP_App_Child_Lname-${i}`).fill(child.last_name);
            await this.page.locator(`#BCPNP_App_Child_Fname-${i}`).fill(child.first_name);
            await inputDate(this.page, `#BCPNP_App_Child_DOB-${i}`, child.date_of_birth);
            await this.page.locator(`#BCPNP_App_Child_BirthPlace-${i}`).selectOption(child.country_of_birth)
            await this.page.locator(`#BCPNP_App_Child_Citizenship-${i}`).selectOption(child.country_of_citizenship);
            await this.page.locator(`#BCPNP_App_Child_Addr-${i}`).fill(child.address);

            if (i < this.data.children.length - 1) {
                await this.page.locator("a:has-text('Add a dependent child')").click();
            }
        }
    }

    async parents() {
        const mm = this.data.mother;
        const dd = this.data.father;
        // mother
        await this.page.locator("#BCPNP_App_Mother_Lname").fill(mm.last_name);
        await this.page.locator("#BCPNP_App_Mother_Fname").fill(mm.first_name);
        await inputDate(this.page, "#BCPNP_App_Mother_DOB", mm.date_of_birth);
        await this.page.locator("#BCPNP_App_Mother_BirthPlace").selectOption(mm.country_of_birth);
        await this.decease_or_not(mm, "label[for='BCPNP_App_Mother_Deceased']", "#BCPNP_App_Mother_Addr");

        // father
        await this.page.locator("#BCPNP_App_Father_Lname").fill(dd.last_name);
        await this.page.locator("#BCPNP_App_Father_Fname").fill(dd.first_name);
        await inputDate(this.page, "#BCPNP_App_Father_DOB", dd.date_of_birth);
        await this.page.locator("#BCPNP_App_Father_BirthPlace").selectOption(dd.country_of_birth);
        await this.decease_or_not(dd, "label[for='BCPNP_App_Father_Deceased']", "#BCPNP_App_Father_Addr");
    }

    async siblings() {
        for (let i = 0; i < this.data.siblings.length; i++) {
            const sib = this.data.siblings[i];
            await this.page.locator(`#BCPNP_App_Sibling_Lname-${i}`).fill(sib.last_name);
            await this.page.locator(`#BCPNP_App_Sibling_Fname-${i}`).fill(sib.first_name);
            await inputDate(this.page, `#BCPNP_App_Sibling_DOB-${i}`, sib.date_of_birth);
            await this.page.locator(`#BCPNP_App_Sibling_BirthPlace-${i}`).selectOption(sib.country_of_birth);
            await this.page.locator("BCPNP_App_Sibling_MaritalStatus-${i}").selectOption(sib.marital_status);
            await this.decease_or_not(sib, "label[for='BCPNP_App_Sibling_Deceased']", "#BCPNP_App_Sibling_Addr");

            if (i < this.data.children.length - 1) {
                await this.page.locator("a:has-text('Add a brother or sister')").click();
            }

        }
    }

    async otherFamilyInCanada() {
        for (let i = 0; i < this.data.other_family_in_canada.length; i++) {
            const fam = this.data.other_family_in_canada[i];
            await this.page.locator(`#BCPNP_App_CANFam_Lname-${i}`).fill(fam.last_name);
            await this.page.locator(`#BCPNP_App_CANFam_Fname-${i}`).fill(fam.first_name);
            await this.page.locator(`BCPNP_App_CANFam_Sex-${i}`).selectOption(fam.gender)
            await this.page.locator("#BCPNP_App_CANFam_RelType-${i}").selectOption(fam.relationship);
            await this.page.locator(`#BCPNP_App_CANFam_City-${i}`).fill(fam.city);
            await this.page.locator("#BCPNP_App_CANFam_Province-${i}").selectOption(fam.province);
            await this.page.locator("##BCPNP_App_CANFam_Status-${i}").selectOption(fam.status);
            await this.page.locator(`#BCPNP_App_CANFam_CANYears-${i}`).fill(fam.years_in_canada);

            if (i < this.data.other_family_in_canada.length - 1) {
                await this.page.locator("a:has-text('Add a family member')").click();
            }
        }

    }


    async make_actions() {

        if (this.data.has_spouse) {
            await this.page.locator("label[for='syncA_App_MaritalStatus-No']").check(); // make previous dissapear
            await this.page.locator("label[for='syncA_App_MaritalStatus-Yes']").check();
            await this.spouse();
        } else {
            await this.page.locator("label[for='syncA_App_MaritalStatus-No']").check();
        }

        if (this.data.has_children) {
            await this.page.locator("label[for='BCPNP_App_HaveDepChildren-No']").check(); // make previous dissapear
            await this.page.locator(" label[for='BCPNP_App_HaveDepChildren-Yes']").check();
            await this.children();
        } else {
            await this.page.locator("label[for='syncA_App_HasChildren-No']").check();
        }

        await this.parents();

        if (this.data.has_sibling) {
            await this.page.locator("label[for='BCPNP_App_HaveSiblings-No']").check(); // make previous dissapear
            await this.page.locator("label[for='BCPNP_App_HaveSiblings-Yes']").check();
            await this.siblings();
        } else {
            await this.page.locator("label[for='BCPNP_App_HaveSiblings-No']").check();
        }

        if (this.data.has_other_family_in_canada) {
            await this.page.locator("label[for='BCPNP_App_HaveCANFam-No']").check();
            await this.page.locator("label[for='BCPNP_App_HaveCANFam-Yes']").check();
            await this.otherFamilyInCanada();
        } else {
            await this.page.locator("label[for='BCPNP_App_HaveCANFam-No']").check();
        }
    }

    async next() {
        await this.page.locator("//button[text()='Save']").click();
        await this.page.locator("li > a:has-text('Job Offer')").click();
        await this.page.locator("h3:has-text('Job Offer')")
    }
}

module.exports = Family;
