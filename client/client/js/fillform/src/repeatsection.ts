import { ElementHandle } from "puppeteer";
import { Action, ActArgs } from "./definition";
import { fillForm } from "./engine";

import {
  ElementProperties,
  InputElementProperties,
  AreatextElementProperties,
  SelectElementProperties,
  CheckboxElementProperties,
  RadioElementProperties,
  ButtonElementProperties,
  UploadElementProperties,
  LoginElementProperties,
  SecurityElementProperties,
} from "./element";

export type InnerElmentProperties = (
  | ElementProperties
  | InputElementProperties
  | AreatextElementProperties
  | CheckboxElementProperties
  | RadioElementProperties
  | ButtonElementProperties
  | SelectElementProperties
)[];
export interface RepeatElmentProperties {
  action_type: string;
  button_text: string; // Will be used to get button element by the button text
  button_id:string; // use button selector to add 
  value: InnerElmentProperties[];
}

export class RepeatElement {
  constructor(private props: RepeatElmentProperties) {}

  async act(args: ActArgs) {
    // loop the repeat element
    for (const section of this.props.value) {
      const first_id_in_section = (await args.page.$(
        section[0].id as string
      )) as ElementHandle;
      // 如果不存在，点击add_btn，增加section
      if (!first_id_in_section) {
        // if use button text to find button
        if (this.props.button_text){
            await args.page.evaluate((text) => {
            const btns = document.querySelectorAll("button");
            for (var index in btns) {
              if (btns[index].innerText == text) {
                btns[index].click();
              }
            }
          }, this.props.button_text);
        } else {
          await args.page.evaluate(selector => {
                return document.querySelector(selector).click();
            }, this.props.button_id);
        }
      }
      // 如果该section的第一个id如果存在，那么loop section，填表。
      await fillForm(args.page, section as ElementProperties[], args);
    }
  }
}
