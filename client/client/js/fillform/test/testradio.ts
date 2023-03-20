import { DEV, FAST_DEV, PROD, MIX } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { RadioElement, RadioElementProperties } from "../src/element"
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

    const rep: RadioElementProperties = {
        action_type: Action.Radio,
        id: "#windows",
        label: "Windows"
    }
    const re = new RadioElement(rep)

    await re.act(aa)

}