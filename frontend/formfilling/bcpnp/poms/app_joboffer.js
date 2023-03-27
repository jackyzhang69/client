
const WebPage = require('../../page');
const { inputDate, inputPhone } = require('./common');

class Joboffer extends WebPage {
    constructor(page, args) {
        super(page, "joboffer", "Job offer", args.data.joboffer);
        this.company_details = args.data.company_details;
        this.work_locations = args.data.work_location;
        this.args = args;
    }

    async company_details_section() {
        // company details
        const cd = this.company_details;
        await this.page.locator("#syncA_App_Emp_Comp_LegalName").fill(cd.legal_name);
        await this.page.locator("#syncA_App_Emp_Comp_OperName").fill(cd.operating_name);
        await this.page.locator("#BCPNP_App_Emp_Comp_LegalStructure").selectOption(cd.corporate_structure);
        await this.page.locator("#syncA_App_Emp_IncorpNo").fill(cd.registration_number);
        await this.page.locator("#syncA_App_Emp_EmployeesNo").fill(cd.fulltime_equivalent);
        await this.page.locator("#BCPNP_App_Emp_YearBC").fill(cd.establish_year);
        await this.page.locator("#syncA_App_Emp_Sector").selectOption(cd.economic_sector);
        await this.page.locator("#BCPNP_App_Emp_Website").fill(cd.website);

        // address
        const ad = cd.address;
        await this.page.locator("#BCPNP_App_Emp_CompAddrUnit").fill(ad.unit);
        await this.page.locator("#BCPNP_App_Emp_BusAddr").fill(ad.street_address);
        await this.page.locator("#syncA_App_Emp_BusCity").fill(ad.city);
        await this.page.locator("#BCPNP_App_Emp_BusProvince").fill(ad.province);
        await this.page.locator("#syncA_App_Emp_BusPostal").fill(ad.post_code);
        await this.page.locator("#BCPNP_App_Emp_BusCountry").selectOption(ad.country);

        if (cd.mailing_is_same_as_business) {
            await this.page.locator("label[for='BCPNP_App_MailAddrSame-Yes']").check();
        } else {
            await this.page.locator("label[for='BCPNP_App_MailAddrSame-No']").check();
            const md = cd.mailing_address;
            await this.page.locator("#BCPNP_App_Emp_CompAltAddrUnit").fill(md.unit);
            await this.page.locator("#BCPNP_App_Emp_MailAddr").fill(md.street_mddress);
            await this.page.locator("#syncA_App_Emp_MailCity").fill(md.city);
            await this.page.locator("#BCPNP_App_Emp_MailProvince").fill(md.province);
            await this.page.locator("#BCPNP_App_Emp_MailPostal").fill(md.post_code);
            await this.page.locator("#BCPNP_App_Emp_MailCountry").selectOption(md.country);
        }

        // contact person
        const ec = cd.employer_contact;
        await this.page.locator("#syncA_App_Emp_ContactLname").fill(ec.last_name);
        await this.page.locator("#syncA_App_Emp_ContactFname").fill(ec.first_name);
        await this.page.locator("#syncA_App_Emp_ContactTitle").fill(ec.job_title);
        await inputPhone(this.page, "#syncA_App_Emp_ContactPhone", ec.phone);
        await this.page.locator("#syncA_App_Emp_ContactEmail").fill(ec.email);
    }


    async job_offer_details() {
        const jo = this.data;
        await this.page.locator("#syncA_App_Job_Title").fill(jo.job_title);
        await this.page.locator("#syncA_App_Job_NOC").fill(jo.noc);
        jo.require_license ?
            await this.page.locator("label[for='BCPNP_App_Job_IsRegulated-Yes']").check()
            : await this.page.locator("label[for='BCPNP_App_Job_IsRegulated-No']").check();
        await this.page.locator("#syncA_App_Job_HoursPerWeek").fill(jo.hours);
        await this.page.locator("#syncA_App_Job_HourlyWage").fill(jo.hourly_wage);
        await this.page.locator("#syncA_App_Job_AnnualWage").fill(jo.annual_wage);
    }

    async job_offer_section() {
        const jo = this.data;
        if (jo.has_fulltime_jo) {
            await this.page.locator("label[for='syncA_App_FullTimeEmpOffer-Yes']").check();
            if (jo.is_indeterminate) {
                await this.page.locator("label[for='syncA_App_FullTimeEmpOfferInd-Yes']").check();
                await this.job_offer_details();
            } else {
                await this.page.locator("label[for='syncA_App_FullTimeEmpOfferInd-No']").check();
                await inputDate(this.page, "#syncA_App_Job_OfferEndDate", jo.end_date);
                await this.job_offer_details();
            }
        } else {
            await this.page.locator("label[for='syncA_App_FullTimeEmpOffer-No']").check();
        }
    }

    async work_locations_section() {
        for (let i = 0; i < this.work_locations.length; i++) {
            const wl = this.work_locations[i];
            await this.page.locator(`#syncA_App_Emp_WorkAddrUnit-${i}`).fill(wl.unit);
            await this.page.locator(`#syncA_App_Job_WorkLocationAddr-${i}`).fill(wl.street_address);
            await this.page.locator(`#syncA_App_Job_WorkLocationCity-${i}`).fill(wl.city);
            await inputPhone(this.page, `#syncA_App_Job_WorkLocationPhone-${i}`, wl.phone);

            if (i < this.work_locations.length - 1) {
                await this.page.locator("button:has-text('Add a work location')").click();
            }
        }
    }


    async make_actions() {
        await this.company_details_section();
        await this.job_offer_section();
        await this.work_locations_section();
    }


    async next() {
        await this.page.locator("//button[text()='Save']").click();
        await this.page.locator("li > a:has-text('Attachments')").click();
        await this.page.locator("h3:has-text('Attachments')")
    }
}

module.exports = Joboffer;
