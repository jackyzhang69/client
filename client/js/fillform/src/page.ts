import { DEFAULT_SPEED } from './config';
import {
    ElementProperties,
    InputElement,
    AreatextElement,
    SelectElement,
    CheckboxElement,
    RadioElement,
    ButtonElement,
    UploadElement,
    SecurityElement,
    GotoPageElement,
    FormElement,
} from "./element";

import {
    SelectElementProperties,
    CheckboxElementProperties,
    RadioElementProperties,
    InputElementProperties
} from "./element";

type AnyElment = (
    | Element
    | InputElement
    | AreatextElement
    | CheckboxElement
    | RadioElement
    | ButtonElement
    | SelectElement
    | UploadElement
    | SecurityElement
    | GotoPageElement
);
import { fillForm } from "./engine";
import { ActArgs, Message, Action } from "./definition";
import { showMessage } from './utils'

export interface ScreenShot {
    format: string,
    waitting_for: string
}
export interface WebPageProperties extends ElementProperties {
    page_name: string,
    actions: ElementProperties[],
    next_page_tag?: string,
    screen_shoot?: ScreenShot
}
// export interface TurnPageProperties extends ElementProperties {
//     label: string
// }

export class WebPage {
    props: WebPageProperties

    constructor(arg_props: WebPageProperties) {
        this.props = arg_props
    }

    async act(args: ActArgs) {
        // fill form when actions has action
        this.props.actions.length > 0 && args.verbose && showMessage(
            this,
            Message.LOG,
            `Filling page ${this.props.page_name}"`
        );
        this.props.actions.length > 0 && await fillForm(args.page, this.props.actions, args);
        // turn page when id exists
        this.props.id && args.verbose && showMessage(
            this,
            Message.LOG,
            `Click button "${this.props.page_name} for leaving page ${this.props.page_name}"`
        )
        this.props.id && await this.turnpage(args);

    }

    async turnpage(args: ActArgs) {
        await args.page.waitForSelector(this.props.id as string);
        // check if button is disabled
        const button_disabled = await args.page.evaluate((selector) => {
            return document.querySelector(selector).disabled;
        }, this.props.id as string);
        if (button_disabled) {
            args.verbose &&
                showMessage(
                    this,
                    Message.WARNING,
                    `Repairing some errors on this page...`
                )
            await this.check_fix(args);
            await args.page.waitForTimeout(1000);
        }

        try {
            await Promise.all([
                await args.page.evaluate((selector) => {
                    return document.querySelector(selector).click()
                }, this.props.id as string),
                this.props.next_page_tag ? await args.page.waitForSelector(this.props.next_page_tag) : await args.page.waitForNavigation()
            ]);
            await args.page.waitForTimeout(DEFAULT_SPEED.page);

            // turned page, show info
            const new_title = await args.page.url()
            args.verbose &&
                showMessage(
                    this,
                    Message.SUCCESS,
                    `Successfully turned to page "${new_title}"\nHas waitted for ${DEFAULT_SPEED.page} ms...`
                )

        } catch (err) {
            await this.handleException(args);
        }
    }

    // 有2中方法处理，第一，提示客户有错误以后，输入时间，用手动完成纠正错误，然后等待软件点击继续按钮。或者用户点击继续按钮。 目前的方式是客户仅仅纠正错误，点击继续由系统完成。
    private async handleException(args: ActArgs) {
        var waitting_time = await args.page.evaluate(async (msg) => {
            let time = prompt(`There are something wrong.\nPlease input waitting time(seconds) to resove the problems. `, '30');
            return time;
        });
        await args.page.waitForTimeout(Number(waitting_time) * 1000);

        this.props.id && await args.page.waitForSelector(this.props.id as string);
        this.props.id && await Promise.all([
            args.page.click(this.props.id!),
            this.props.next_page_tag && await args.page.waitForSelector(this.props.next_page_tag),
        ]);
        const new_title = await args.page.url();
        args.verbose &&
            showMessage(
                this,
                Message.SUCCESS,
                `Successfully turned to page "${new_title}"`
            );
    }

    // check a page's actions fullfilled
    async check_fix(args: ActArgs) {
        for (var action of this.props.actions) {
            switch (action.action_type) {
                case Action.Select:
                    const selection = await args.page.evaluate((selector) => {
                        return document.querySelector(selector).value;
                    }, action.id as string);
                    if (!selection.includes((action as SelectElementProperties).value)) {
                        const select = new SelectElement(action as SelectElementProperties);
                        await select.act(args);
                    }
                    break;
                case Action.Radio:
                    const radio_checked = await args.page.evaluate((selector) => {
                        return document.querySelector(selector).checked;
                    }, action.id as string);
                    if (!radio_checked) {
                        const radio = new RadioElement(action as RadioElementProperties);
                        await radio.act(args);
                    }
                    break;
                case Action.Checkbox:
                    const checkbox_checked = await args.page.evaluate((selector) => {
                        return document.querySelector(selector).checked;
                    }, action.id as string);
                    if (!checkbox_checked) {
                        const checkbox = new CheckboxElement(action as CheckboxElementProperties);
                        await checkbox.act(args);
                    }
                    break;
                case Action.Areatext || Action.Input:
                    const text = await args.page.evaluate((selector) => {
                        return document.querySelector(selector).value;
                    }, action.id as string);
                    if (text != (action as InputElementProperties).value) {
                        const select = new InputElement(action as InputElementProperties);
                        await select.act(args);
                    }
                    break;
            }
        }
    }
}



