import { WebPageProperties, WebPage } from '../page';
// Used only pr portal only
import { Action, ActArgs } from "../definition";

export interface PrPortalPickerProperties {
  action_type: string;
  email: string;
  args: ActArgs
}

export class PrPortalPicker {
  constructor(private props: PrPortalPickerProperties) { }

  // Based on unique identifier: email, to pick a client, and return the index in the table
  async pick(aa: ActArgs) {
    await aa.page.waitForSelector("table");
    return await aa.page.evaluate((email) => {
      const table = document.querySelector("table") as HTMLTableElement;
      for (var i = 0; i < table.rows.length; i++) {
        if (table.rows[i].cells[1].innerText.includes(email)) {
          return i;
        }
      }
    }, this.props.email);
  }

  // based on the index, get the button id selector
  async act(aa: ActArgs) {
    const index = await this.pick(aa);
    const id = `body > pra-root > pra-localized-app > main > div > pra-rep-dashboard > div > table > tbody > tr:nth-child(${index}) > td.mat-cell.cdk-cell.view-my-applications__table-action.cdk-column-action.mat-column-action.ng-star-inserted > a`
    await Promise.all([
      await aa.page.evaluate((selector) => {
        return document.querySelector(selector).click()
      }, id as string),
      await aa.page.waitForSelector("body > pra-root > pra-localized-app > main > div > pra-intake-landing-page > div.intake-landing-page_submit-application.ng-star-inserted > button")
    ]

    )

  }
}
