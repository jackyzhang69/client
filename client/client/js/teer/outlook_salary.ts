import { Page } from 'puppeteer';
import { PageOperator } from "./elements"

export class Outlook {
    noc_code: string
    noc_title: string
    page: Page

    constructor(noc_code, noc_title: string, page: Page) {
        this.noc_code = noc_code
        this.noc_title = noc_title
        this.page = page
    }
    // ".prov-container" ".details"
    async fetch(prov_area_class: string) {
        return await this.page.evaluate((prov_area_class) => {
            const provs_areas = document.querySelectorAll(prov_area_class);
            var prov_area_outlooks = []
            const outlook_map = {
                "Undetermined": 0,
                "Very Limited": 1,
                "Lmited": 2,
                "Moderate": 3,
                "Good": 4,
                "Very good": 5
            }
            for (const [index, prov_area] of provs_areas.entries()) {
                if (index == 0) continue;
                var province = prov_area.querySelector(".pull-left").textContent;
                var outlook = prov_area.querySelector(".outlooknote").textContent;
                prov_area_outlooks.push({
                    region: province,
                    outlook: outlook_map[outlook]
                })
            }
            return prov_area_outlooks
        }, prov_area_class)
    }

    async get_index(p_list, noc_code) {
        for (var i = 0; i < p_list.length; i++) {
            if (p_list[i].includes(noc_code)) { return i } else { return null }
        }
    }
    async get() {
        await this.page.goto("https://www.jobbank.gc.ca/trend-analysis/search-job-outlooks")

        await this.page.click("#ec-outlook\\:occupationInput", { clickCount: 3 });
        await this.page.type("#ec-outlook\\:occupationInput", this.noc_code);
        await this.page.waitForTimeout(500);
        const po = new PageOperator(this.page);
        // wait for pop up select box
        // await this.page.waitForSelector("#outlook-occ-input > div > div > span.twitter-typeahead > div > div")
        await this.page.keyboard.press("ArrowDown")
        await this.page.keyboard.press("Enter")
        await Promise.all(
            [
                this.page.keyboard.press("Enter"),
                this.page.waitForSelector("#outlook-container", { timeout: 60000 })
            ]
        )
        const prov = await this.fetch(".prov-container")
        const area = await this.fetch(".details")
        return {
            province: prov,
            area: area
        };
    }
}

// Salary class
export class Salary {
    noc_code: string
    noc_title: string
    page: Page

    constructor(noc_code, noc_title: string, page: Page) {
        this.noc_code = noc_code
        this.noc_title = noc_title
        this.page = page
    }

    async fetch() {
        const data = await this.page.$$eval('table tr', rows => rows.map((row: HTMLTableRowElement, index) => {
            if (index != 0 && index != 1) {
                return {
                    region: row.cells[0].innerText,
                    lowest: row.cells[1].innerText,
                    median: row.cells[2].innerText,
                    highest: row.cells[3].innerText,
                }
            }
        }));
        return data;
    }

    async get() {

        await this.page.goto("https://www.jobbank.gc.ca/trend-analysis/search-wages")

        await this.page.click("#ec-wages\\:wagesInput", { clickCount: 3 });
        await this.page.type("#ec-wages\\:wagesInput", this.noc_code);
        await this.page.waitForTimeout(500);
        const po = new PageOperator(this.page);
        // const matched_identity_string = "#wages-occ-input > div > span.twitter-typeahead > div > div > p:nth-child(1)"
        // const result = await po.get_text(matched_identity_string)
        await this.page.keyboard.press("ArrowDown")
        await this.page.keyboard.press("Enter")
        await Promise.all(
            [
                this.page.keyboard.press("Enter"),
                this.page.waitForSelector("#wage-occ-report", { timeout: 60000 })
            ]
        )
        var all_salaries = await this.fetch();
        all_salaries = all_salaries.filter(element => element != null);

        const canada_salaries = all_salaries.shift(); // pop up the first one, which is Canada
        const provincial_salaries = all_salaries.filter((element, index) => {
            return [0, 5, 6, 12, 18, 36, 48, 57, 64, 73, 82, 83, 84].includes(Number(index));
        });
        const regional_salaries = all_salaries.filter((element, index) => {
            return ![0, 5, 6, 12, 18, 36, 48, 57, 64, 73, 82, 83, 84].includes(Number(index));
        });
        return {
            canada: canada_salaries,
            province: provincial_salaries,
            area: regional_salaries
        };
    }
}

// Merge outlook and salary 
export function mergeOutlookSalary(outlooks, salaries) {
    var outlook_salary_list = []
    for (var i = 0; i < outlooks.length; i++) {
        outlook_salary_list.push({ ...outlooks[i], ...salaries[i] });
    }
    return outlook_salary_list;
}

// get a noc's combined outlook and salary data
export async function getNocOutlookSalary(noc_code, noc_title, page) {
    const ol = new Outlook(noc_code, noc_title, page);
    const outlooks = await ol.get()
    // get salary data based on noc code
    const sl = new Salary(noc_code, noc_title, page);
    const salaries = await sl.get()

    // const prov_outlook_salary = mergeOutlookSalary(outlooks.province, salaries.province);
    // const regional_outlook_salary = mergeOutlookSalary(outlooks.area, salaries.area);
    return {
        [noc_code]: {
            outlook: {
                province: outlooks.province,
                area: outlooks.area
            },
            salary: {
                canada: salaries.canada,
                province: salaries.province,
                area: salaries.area
            }
        }
    };
}
