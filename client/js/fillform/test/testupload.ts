import { DEV, PROD, MIX } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { UploadElement, UploadElementProperties } from "../src/element"
import { ActArgs, Action } from "../src/definition"

(async () => {
    const browser = await puppeteer.launch(DEV);
    const page = await browser.newPage();
    await test(page);

    console.log("Do something here...")

    //   await page.close();
    //   await browser.close();

})();



export default async function test(page: Page) {
    await page.goto("https://uppy.io/examples/xhrupload/");

    const aa: ActArgs = {
        page: page,
        verbose: true,
        exit_on_error: true,
        delay: 10,
        snapshot: false,
        path: './',
        mode: DEV
    }

    const iep: UploadElementProperties = {
        action_type: Action.Upload,
        label: "Choose files",
        id: "#main > div.Content.js-Content.examples.with-sidebar > div.Uppy > div > div > button",
        filename: "/Users/jacky/desktop/lmia/5593.xlsx"
    }

    const ie = new UploadElement(iep)
    await ie.act(aa)

}