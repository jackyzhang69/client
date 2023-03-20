/*
This app is used for pick a specific registion or application in bcpnp, if the client has previous expired/invalid registrations or applications
*/

import { WebPageProperties, WebPage } from '../page';
// Used only pr portal only
import { Action, ActArgs } from "../definition";

export interface BcpnpPickProperties {
  action_type: string;
  args: ActArgs
}

export class BcpnpPick {
  constructor(private props: BcpnpPickProperties) { }

  async act(aa: ActArgs) {
    await aa.page.waitForSelector("table");
    return await aa.page.evaluate((email) => {
      const tds = document.getElementsByTagName("td");
      const td = tds[tds.length - 1]; // last td includes the link
      const link = td.getElementsByTagName('a')[0]; // get the a tag element from last td, and first element is the link
      link.click()
    });
  }
}
