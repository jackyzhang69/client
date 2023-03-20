/*
This app is used for pick a specific registion or application in bcpnp, if the client has previous expired/invalid registrations or applications
*/

import { WebPageProperties, WebPage } from '../page';
// Used only pr portal only
import { Action, ActArgs } from "../definition";

export interface LmiaEmployerPickProperties {
  action_type: string;
  business_number: string;
  // args: ActArgs
}

export class LmiaEmployerPick {
  constructor(private props: LmiaEmployerPickProperties) { }

  async act(aa: ActArgs) {
    // Input business number and press enter
    await aa.page.type("#wb-auto-6_filter > label > input[type=search]", this.props.business_number)
    await aa.page.keyboard.press('Enter');
    // select the first employer
    await aa.page.waitForSelector("table");
    return await aa.page.evaluate(() => {
      const tds = document.getElementsByTagName("td");
      const td = tds[0]; // first td includes the link
      const link = td.getElementsByTagName('a')[0]; // get the a tag element from first td, and first element is the link
      link.click()
    });
  }
}
