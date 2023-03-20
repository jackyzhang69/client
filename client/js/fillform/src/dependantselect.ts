import { SelectElement, SelectElementProperties } from "./element";
import { Action, ActArgs } from "./definition";

// paremeters: combined dropdown 1 and dropdown 2 select props, Max wait time(default 5000 ms), and frequency(defautl 50)
export interface DependantSelectProperties {
  action_type: string;
  select1: SelectElementProperties;
  select2: SelectElementProperties;
}

export class DependantSelect {
  constructor(private props: DependantSelectProperties) {}

  async act(args: ActArgs) {
    // get dropdown 2's initial content
    // const option2_init_length=await this.getSelect2OptionNumber(args) as number;
    const option2_init_1st_text = (await this.getSelect2Option1Text(
      args
    )) as string;

    // If select1's value !== web page existing selected value, wait for dropdown 2 change
    const exiting_select1_value = await args.page.evaluate((id) => {
      let s1 = document.querySelector(id);
      let index = s1.selectedIndex;
      console.log(index, s1.options);
      return s1.options[index].value;
    }, this.props.select1.id as string);
    const should_wait = this.props.select1.value !== exiting_select1_value;

    // select dropdown 1
    const select1 = new SelectElement(this.props.select1);
    should_wait && (await select1.act(args)); // if select1 is not same as exising selected value, do select; otherwise, keep it as it was.

    should_wait &&
      (await args.page.waitForFunction(
        (init_text: string, id2: string) => {
          const options = (document.querySelector(id2) as HTMLSelectElement)
            .options;
          if (options.length > 0) return options[1].text != init_text;
        },
        {},
        option2_init_1st_text,
        this.props.select2.id as string
      ));

    // select dropdown 2
    // await args.page.waitForTimeout(1000);
    const select2 = new SelectElement(this.props.select2);
    await select2.act(args);
  }

  async getSelect2Option1Text(args: ActArgs) {
    return await args.page.evaluate((id) => {
      const options = document.querySelector(id).options;
      if (options.length > 1) {
        return options[1].text;
      } else {
        return "";
      }
    }, this.props.select2.id as string);
  }
}
