import { Page } from 'puppeteer';

// Puppeteer page operations
export class PageOperator {
    page: Page

    constructor(page: Page) {
        this.page = page
    }
    async get_li(li_str: string) {
        if (await this.page.$(li_str) !== null) {
            const data = await this.page.$$eval(li_str, rows => rows.map((row: HTMLUListElement, index) => {
                return row.innerText
            }))
            return data
        }
        else return []

    }

    async get_p_list(p_list_str: string) {
        const data = await this.page.evaluate((id) => {
            const element_list = document.querySelectorAll(id);
            return Array.from(element_list).map((row) => row.innerText)
        }, p_list_str)
        // console.log(data)
        return data
        // }
    }

    async get_text(id_str: string) {
        const element = await this.page.waitForSelector(id_str);
        const value = await element.evaluate(el => el.textContent);
        return value
    }
}


