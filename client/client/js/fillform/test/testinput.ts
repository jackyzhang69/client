import { DEV, FAST_DEV, PROD, MIX } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { InputElement, InputElementProperties } from "../src/element"
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

    const iep: InputElementProperties = {
        action_type: Action.Input,
        label: "Your name",
        id: "#developer-name",
        value: "jackyzhang1969@gmail.com",
        length: 32,
        required: true,
        disabled: false
    }

    const ie = new InputElement(iep)
    await ie.act(aa)

}