import { DEV, FAST_DEV, PROD, MIX } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { CheckboxElement, CheckboxElementProperties } from "../src/element"
import { ActArgs, Action } from "../src/definition"
(async () => {
    const browser = await puppeteer.launch(FAST_DEV);
    const page = await browser.newPage();
    await test(page);

    console.log("Do something here...")

    //   await page.close();
    //   await browser.close();

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

    const cbp: CheckboxElementProperties = {
        action_type: Action.Checkbox,
        label: "Support for testing on remote devices",
        id: "#remote-testing",
        value: true
    }
    const cb = new CheckboxElement(cbp)

    await cb.act(aa)

    const cbp1: CheckboxElementProperties = {
        action_type: Action.Checkbox,
        label: "Advanced traffic and markup analysis",
        id: "#traffic-markup-analysis",
        value: true
    }
    const cb1 = new CheckboxElement(cbp1)

    await cb1.act(aa)


}

