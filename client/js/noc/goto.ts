import { Page } from 'puppeteer';

export interface GoProperty {
    noc: string
    page: Page
    url: string
    input_box: string
    search_button: string
    // search_by_noc: string
    // version: string
}

export class Go {
    noc: string
    page: Page
    url: string
    input_box: string
    search_button: string
    // search_by_noc: string
    // version: string

    constructor(args: GoProperty) {
        this.noc = args.noc
        this.page = args.page
        this.url = args.url
        this.input_box = args.input_box
        this.search_button = args.search_button
        // this.search_by_noc = args.search_by_noc
        // this.version = args.version
    }

    async go() {
        await this.page.goto(this.url)
        // await this.page.click(this.search_by_noc);
        // choose 2021
        // await this.page.evaluate((id, value) => {
        //     document.querySelector(id).value = value;
        // }, this.version, "2021.0");

        await this.page.click(this.input_box, { clickCount: 3 });
        await this.page.type(this.input_box, this.noc);
        await this.page.waitForTimeout(500);
        await Promise.all(
            [
                this.page.click(this.search_button),
                this.page.waitForNavigation()
            ]
        )
    }
}


