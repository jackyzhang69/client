import { DEV, FAST_DEV, PROD, MIX } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { SelectElement, SelectElementProperties } from "../src/element"
import { ActArgs } from "../src/definition"

(async () => {
    const browser = await puppeteer.launch(FAST_DEV);
    const page = await browser.newPage();
    await test(page);

    console.log("Do something here...")

    // await page.close();
    // await browser.close();

})();



export default async function test(page: Page) {
    await page.goto("https://devexpress.github.io/testcafe/example/");

    const aa: ActArgs = {
        page: page,
        verbose: true,
        exit_on_error: true,
        delay: 10,
        snapshot: false,
        path: './',
        mode: DEV
    }

    const sep: SelectElementProperties = {
        action_type: "select",
        label: "Which TestCafe interface do you use",
        id: "#preferred-interface",
        value: "Both"
    }
    const se = new SelectElement(sep)

    await se.act(aa)

}