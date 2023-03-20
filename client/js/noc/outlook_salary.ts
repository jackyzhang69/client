import { Page } from 'puppeteer';
import { Go, GoProperty } from './goto';

export class Outlook {
    noc: string
    page: Page

    constructor(noc: string, page: Page) {
        this.noc = noc
        this.page = page
    }
    // ".prov-container" ".details"
    async fetch(prov_area_class: string) {
        return await this.page.evaluate((prov_area_class) => {
            const provs_areas = document.querySelectorAll(prov_area_class);
            var prov_area_outlooks = []
            const outlook_map = {
                "Undetermined": 0,
                "Limited": 1,
                "Fair": 2,
                "Good": 3
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

    async get() {
        const outlook_args: GoProperty = {
            page: this.page,
            url: "https://www.jobbank.gc.ca/trend-analysis/search-job-outlooks",
            input_box: "#ec-outlook\\:occupationInput",
            search_button: "#searchOutlookOccupationSubmit",
            noc: this.noc
        };
        const go = new Go(outlook_args);
        await go.go();

        return {
            province: await this.fetch(".prov-container"),
            area: await this.fetch(".details")
        };

    }
}

// Salary class
export class Salary {
    noc: string
    page: Page

    constructor(noc: string, page: Page) {
        this.noc = noc
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
        const wage_args: GoProperty = {
            page: this.page,
            url: "https://www.jobbank.gc.ca/trend-analysis/search-wages",
            input_box: "#ec-wages\\:wagesInput",
            search_button: "#searchWagesOccupationSubmit",
            noc: this.noc
        }
        const go = new Go(wage_args);
        await go.go();

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
export async function getNocOutlookSalary(noc, page) {
    const ol = new Outlook(noc, page);
    const outlooks = await ol.get()
    // get salary data based on noc code
    const sl = new Salary(noc, page);
    const salaries = await sl.get()

    const prov_outlook_salary = mergeOutlookSalary(outlooks.province, salaries.province);
    const regional_outlook_salary = mergeOutlookSalary(outlooks.area, salaries.area);
    return {
        [noc]: {
            canada: salaries.canada,
            province: prov_outlook_salary,
            region: regional_outlook_salary
        }
    };
}
