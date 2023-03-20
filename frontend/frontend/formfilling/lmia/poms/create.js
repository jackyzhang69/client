/* 
In this module,  we will create the following pages:
create: create application
employer_contact: employer contact information

All these pages are common to all the programs.
*/


const WebPage = require('../../page');
const { selectOptionIncludeText, selectOptionHasSimilarText } = require('../../libs/playwright');
const { print } = require('../../libs/output');

class Create extends WebPage {
    constructor(page, data) {
        super(page, "create", "Creae LMIA application", data);
    }

    async make_actions() {
    }

    async next() {
        await this.page.locator("//a[contains(text(),'Create LMIA Application')]").click();
        await this.page.waitForSelector("select.nodeAnswer.form-control"); // please select a contact element
    }
}

/*
Employer contact information is a list, The first item is the principal contact, after clicking add button, we will click confirm button too. 
If there are more than one item, it will click add button to add more contacts, but not needed to click comfim button.
*/
class EmployerContact extends WebPage {
    constructor(page, args) {
        super(page, "employer_contact", "Employer contact information", args.data.employer_contacts);
        this.edit_model = args.lmiaNumber ? true : false;
    }

    async get_file_number() {
        const lmiaPanel = await this.page.$('#lmia-panel');
        const lmiaText = await lmiaPanel.$eval('div:nth-child(2)', el => el.textContent);
        const lmiaNumber = lmiaText.match(/LMIA:\s*(\d+)/)[1];

        if (this.edit_model) {
            print(`Entered the existing LMIA application with file number: ${lmiaNumber}`, style = "success");
        } else {
            print(`A new LMIA application has been created with file number: ${lmiaNumber}`, style = "success");
        }
    }


    async make_actions() {

        let contact_num = this.data.length > 2 ? 2 : this.data.length
        for (let i = 0; i < contact_num; i++) {
            const name = this.data[i];;
            // check if contact is already existed. If yes, skip it. used only for edit mode
            if (this.edit_model) {
                await this.page.waitForSelector('#contactTable', { timeout: 5000 });
                const tableElement = await this.page.$('#contactTable');
                if (!tableElement) continue;

                const tdElements = await tableElement.$$('td');
                let contactExists = false;
                for (const tdElement of tdElements) {
                    const textContent = await tdElement.textContent();
                    if (textContent.includes(name)) {
                        contactExists = true;
                        break;
                    }
                }
                if (contactExists) continue;
            }

            try {
                // below is normal create model
                await this.page.waitForSelector("select.nodeAnswer.form-control");
                // select contact 
                // await this.page.selectOption("select.nodeAnswer.form-control", { label: name });
                await selectOptionHasSimilarText(this.page, "select.nodeAnswer.form-control", name);

            } catch (err) {
                print(`The contact ${name} is not found in the Contact dropdown list. Please make sure the employer has entered the correct contact in their Jobbank account.`, style = "error");
                throw err;
            }
            // If it is the first one, click checkbox to confirm selection is principal contact
            if (i == 0) {
                await this.page.click("input[type='checkbox']")
            }
            // click add button
            await this.page.click("#addContact")

            // wait until the contact is added, which means the principal shows Yes
            await this.page.waitForFunction(() => {
                const element = document.querySelector('td[data-answer-value="on"]');
                return element && element.innerText === 'Yes';
            });

        }
    }

    async next() {
        await this.get_file_number();
        await this.page.waitForSelector("select.nodeAnswer.form-control") // only used for skipping situation. If not, click next will not work
        await this.page.click("#next");
        await this.page.waitForSelector('h2:has-text("Third Party Representative Information")');
    }
}


class Representative extends WebPage {
    constructor(page, representative) {
        super(page, "representative", "Third Party Representative Information", representative);
    }

    async make_actions() {
        try {
            await this.page.waitForSelector("select.nodeAnswer.form-control")
            // select rep based on rep name, which is part of the option label
            await selectOptionIncludeText(this.page, "select.nodeAnswer.form-control", this.data.name)
        } catch (err) {
            print(`The representative ${this.data.name} is not found in the Representative dropdown list. Please make sure the correct representative in their Jobbank account.`, style = "error");
            throw err;
        }


        // if rep is paid, then click Yes, otherwise, click No
        const radio_button = this.data.paid ? "input[value='Yes']" : "input[value='No']"
        await this.page.locator(radio_button).click()
    }

    async next() {
        await this.page.waitForSelector("select.nodeAnswer.form-control") // This line only used for skipping situation. If not, click next will not work
        await this.page.click("#next");
        await this.page.waitForSelector("input[value='ICCRC']"); // please select a contact element

    }
}

class RepresentativeType extends WebPage {
    constructor(page, representative) {
        super(page, "representative_type", "Third Party Representative Information-rep type", representative);
    }

    async make_actions() {
        // type =0: rcic, type=1: lawyer,type =2: quebec lawyer 3. other
        await this.page.getByRole('radio').nth(this.data.type).check();
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Stream Determination')"); // please select a contact element
    }
}

class StreamDetermination extends WebPage {
    constructor(page, representative, stream) {
        super(page, "stream_determination", "Stream Determination", stream);
        this.representative = representative;
    }

    async repLastInfo() {
        if (this.representative.type == 0 || this.representative.type == 2) {
            // rcic or quebec lawyer
            await this.page.getByRole('textbox').fill(this.representative.member_id);
        }
        else if (this.representative.type == 1) {
            // lawyer other than in quebec
            await page.getByRole('combobox').selectOption(this.representative.province);
            await page.getByRole('textbox').fill(this.representative.member_id);
        }
        else if (this.representative.type == 3) {
            // other
            await this.page.getByRole('textbox').fill(this.representative.explaination);
        }
    }

    async make_actions() {
        // Complete the representative information
        await this.repLastInfo();
        const selector = `input[value='${this.data.name}']`;
        await this.page.check(selector);
    }

    async next() {
        await this.page.click("#next");
        // Will go different page based on stream
        switch (this.data.stream) {
            case "GTSFull":
                await this.page.waitForSelector("//label[text()='Category A']"); // go to category select page
            case "Wage":
                await this.page.waitForSelector("h2:has-text('Stream Determination')"); // go to high or low select page
            case "Caregiver":
            case "Academs":
            case "Agri":
            case "SAWPFull":
            case "PermRes":
                await this.page.waitForSelector("h2:has-text('Wage')");
        }
    }
}

// Select category for GTS stream. Additional step before wage page
class GTSCategory extends WebPage {
    constructor(page, args) {
        super(page, "gts_category", "GTS Category", args.stream.category);
    }

    async make_actions() {
        const selector = `input[value='${this.data}']`
        await this.page.locator(selector).click();
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Wage')");
    }
}


// Select high or low wage for wage stream. Additional step before wage page
class WageCategory extends WebPage {
    constructor(page, args) {
        super(page, "wage_category", "Wage Category", args.stream.category);
    }

    async make_actions() {
        const selector = this.data == "HWS" ? "input[value='Yes']" : "input[value='No']";
        await this.page.check(selector);
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Wage')");
    }
}


module.exports = {
    Create,
    EmployerContact,
    Representative,
    RepresentativeType,
    StreamDetermination,
    GTSCategory,
    WageCategory
}