import { DEV, FAST_DEV, PROD, DEFAULT_SPEED } from "../src/config"
const puppeteer = require("puppeteer");
import { Page } from 'puppeteer';
import { InputElement, InputElementProperties, CheckboxElement, CheckboxElementProperties, AreatextElement, AreatextElementProperties, ButtonElement, ButtonElementProperties, RadioElementProperties, RadioElement, SelectElement, SelectElementProperties } from "../src/element"
import { ActArgs, Action } from "../src/definition"

(async () => {
    const browser = await puppeteer.launch(FAST_DEV);
    const page = await browser.newPage();
    await page.setDefaultTimeout(DEFAULT_SPEED.other);
    await page.setDefaultNavigationTimeout(DEFAULT_SPEED.navigation)
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
    const iep: InputElementProperties = {
        action_type: Action.Input,
        label: "Your name",
        id: "#developer-name",
        value: "jackyzhang1969",
        length: 32,
        required: true,
        disabled: false,
        // delay: 500
    }
    const ie = new InputElement(iep)
    await ie.act(aa)
    console.log("input done")

    const cbp0: CheckboxElementProperties = {
        action_type: Action.Checkbox,
        label: "Support for testing on remote devices",
        id: "#remote-testing",
        value: true,
        // delay: 2000
    }
    const cb0 = new CheckboxElement(cbp0)

    await cb0.act(aa)

    const rep: RadioElementProperties = {
        action_type: Action.Radio,
        id: "#windows",
        label: "Windows",
        // delay: 2000
    }
    const re = new RadioElement(rep)

    await re.act(aa)

    const sep: SelectElementProperties = {
        action_type: "select",
        label: "Which TestCafe interface do you use",
        id: "#preferred-interface",
        value: "Both",
        // delay: 3000
    }
    const se = new SelectElement(sep)

    await se.act(aa)

    const cbp: CheckboxElementProperties = {
        action_type: Action.Checkbox,
        label: "I have tried TestCafe",
        id: "#tried-test-cafe",
        value: true,
        // delay: 3000
    }
    const cb = new CheckboxElement(cbp)
    await cb.act(aa)
    console.log("check done")

    const aep: AreatextElementProperties = {
        action_type: Action.Areatext,
        label: "Please let us know what you think:",
        id: "#comments",
        value: "Generally speaking an input field is a one-line field",
        length: 300,
        required: true,
        disabled: true,
        // delay: 10
    }

    const ae = new AreatextElement(aep)

    await ae.act(aa)
    console.log("areatext done")

    const bep: ButtonElementProperties = {
        action_type: Action.Button,
        label: "Submit",
        id: "#submit-button",
        // delay: 3000
    }
    const be = new ButtonElement(bep)


    await Promise.all([
        be.act(aa),
        // page.waitForNavigation(),
        page.waitForSelector('h1')
    ]);
    console.log("page turned...")
    console.log("h1 appeared...")
}