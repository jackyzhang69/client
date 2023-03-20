import { DEV, FAST_DEV, PROD, MIX } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { CheckboxElement, CheckboxElementProperties, AreatextElement, AreatextElementProperties } from "../src/element"
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
        label: "I have tried TestCafe",
        id: "#tried-test-cafe",
        value: true
    }
    const cb = new CheckboxElement(cbp)

    await cb.act(aa)

    const iep: AreatextElementProperties = {
        action_type: Action.Areatext,
        label: "Please let us know what you think:",
        id: "#comments",
        value: "Generally speaking an input field is a one-line field ",
        length: 300,
        required: true,
        disabled: true
    }

    const ie = new AreatextElement(iep)

    await ie.act(aa)

}