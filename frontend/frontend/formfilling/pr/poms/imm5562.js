// imm5562 page object model

const WebPage = require('../../models/page');
const { getActionableElementInRow, inputDate } = require('../../libs/playwright');
const { remove, truncateString, inRange } = require("./common");
class Dashboard5562 extends WebPage {
    constructor(page, args) {
        super(page, "dashboard5562", "Dash board enter imm5562", args.data.imm5562);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        const table = await this.page.locator('table').first();
        const editButton = await getActionableElementInRow(table, 'IMM 5562', 'Edit', 'button');
        await editButton.click();
        await this.page.waitForSelector("h1:has-text('Supplementary information - Your travels')");

    }
}

class Brief5562 extends WebPage {
    constructor(page, args) {
        super(page, "brief5562", "Brief imm5562", args.data.imm5562);
        this.args = args;
    }

    async make_actions() {

    }

    async next() {
        await this.page.getByRole("button", { name: "Continue" }).click();

    }
}

const travels = async (page, person, section, has_travel) => {
    if (!has_travel) {
        await page.locator("#haveNotTravelled").check();
        return;
    } else {
        await page.locator("#haveNotTravelled").uncheck();
    }
    switch (section) {
        case "A":
            destination_id = `#trip-destination-`;
            break;
        case "B":
            destination_id = `#sectionB-destination-`;
            break;
        case "C":
            destination_id = `#sectionC-destination-`;
            break;

    }
    const travels = person.travels;
    if (!travels || travels.length === 0) return; // for dps, there may have some person has travel but some not
    for (let i = 0; i < travels.length; i++) {
        if (section === "C") {
            await page.locator(`#trip-givenName-${i}`).fill(travels[i].given_name);
        }
        await page.locator(`#trip-length-${i}`).fill(travels[i].length);
        await inputDate(page, `#trip-from-${i}`, travels[i].start_date);
        await inputDate(page, `#trip-to-${i}`, travels[i].end_date);
        await page.locator(destination_id + `${i}`).fill(travels[i].destination);
        await page.locator(`#trip-purpose-${i}`).fill(travels[i].purpose);

        if (i < travels.length - 1) {
            await page.locator('button:has-text("Add another")').click();
        }
    }
}

class Pa5562 extends WebPage {
    constructor(page, args) {
        super(page, "pa5562", "Principle Applicant imm5562", args.data.imm5562.pa);
        this.args = args;
    }

    async make_actions() {
        // frist remove all previous filled travels
        await remove(this.page);
        await this.page.locator("#familyName").fill(this.data.family_name);
        await this.page.locator("#givenName").fill(this.data.given_name);
        await travels(this.page, this.data, "A", this.data.has_travel);
    }

    async next() {
        await this.page.getByRole("button", { name: "Save and Continue" }).click();
        await this.page.waitForSelector("h2:has-text('Section B: Your spouse or common-law partne')");
    }
}

class Sp5562 extends WebPage {
    constructor(page, args) {
        super(page, "sp5562", "Spouse imm5562", args.data.imm5562.sp);
        this.args = args;
    }

    async make_actions() {
        // if no spouse, write "Not Applicable", and return
        if (!this.data) {
            await this.page.locator("#trip-purpose-0").fill("Not Applicable");
            return;
        }
        // frist remove all previous filled travels
        await remove(this.page);
        await travels(this.page, this.data, "B", this.data.has_travel);
    }

    async next() {
        await this.page.getByRole("button", { name: "Save and Continue" }).click();
        await this.page.waitForSelector("h2:has-text('Section C: Your dependant children 18 years or older')");
    }
}

class Dp5562 extends WebPage {
    constructor(page, args) {
        super(page, "dp5562", "Dependent imm5562", args.data.imm5562.dp);
        this.args = args;
    }

    async make_actions() {
        // if no dependent, write "Not Applicable", and return
        if (!this.data) {
            await this.page.locator("#trip-purpose-0").fill("Not Applicable");
            return;
        }
        // frist remove all previous filled travels
        await remove(this.page);
        const dps = this.data.dps;
        for (let i = 0; i < dps.length; i++) {
            await travels(this.page, dps[i], "C", this.data.has_travel);
        }
    }

    async next() {
        await this.page.getByRole("button", { name: " Complete and return to application" }).click();
        await this.page.waitForSelector("h1:has-text('Permanent residence application')");
    }

}


module.exports = { Dashboard5562, Brief5562, Pa5562, Sp5562, Dp5562 };

