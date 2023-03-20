import { Page } from 'puppeteer';
import { Go, GoProperty } from './goto';
import { PageOperator } from "./elements"
// Teer content class
export class TeerContent {
    noc: string
    page: Page
    page_operator: PageOperator

    constructor(noc: string, page: Page) {
        this.noc = noc
        this.page = page
        this.page_operator = new PageOperator(this.page)
    }

    async get_title_examples() {
        await this.page.click("#IndexButton");
        const te = await this.page_operator.get_li('#IndexTitles ul li')
        return te
    }

    async get_title() {
        const tt = await this.page_operator.get_text("body > main > h2")
        return tt.slice(8) // remove noc code and -
    }

    async get() {
        const wage_args: GoProperty = {
            page: this.page,
            url: "https://noc.esdc.gc.ca/?GoCTemplateCulture=en-CA",
            search_by_noc: "#details-panel1-lnk",
            version: "#ddlVersions",
            input_box: "#txtQuickSearch",
            search_button: "#btn-submitSearchNOC",
            noc: this.noc
        }
        const go = new Go(wage_args);
        await go.go();
        const tt = await this.get_title()
        const te = await this.get_title_examples()
        const md = await this.page_operator.get_li("body > main > div.row > div.col-sm-8 > section > div > div > div > section:nth-child(2) > div ul li")
        const er = await this.page_operator.get_li("body > main > div.row > div.col-sm-8 > section > div > div > div > section:nth-child(3) > div ul li")
        const ai = await this.page_operator.get_li("body > main > div.row > div.col-sm-8 > section > div > div > div > section:nth-child(4) > div ul li")
        const ex = await this.page_operator.get_li("body > main > div.row > div.col-sm-8 > section > div > div > div > section:nth-child(5) > div ul li")
        return {
            "title": tt,
            "title_examples": te,
            "main_duties": md,
            "employment_requirement": er,
            "additional_information": ai,
            "exclusion": ex
        };
    }

}



// get a noc's combined outlook and salary data
export async function getTeerContents(noc, page) {
    const ol = new TeerContent(noc, page);
    const contents = await ol.get()

    return {
        [noc]: contents
    };
}
