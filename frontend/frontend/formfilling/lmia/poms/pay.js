/* 
This moduel includes pages:
1. hours_pay: hours and pay

*/

const WebPage = require('../../models/page');

class HoursPay1 extends WebPage {
    constructor(page, previous_obj, args) {
        super(page, "hours_pay1", "Hours and pay: has same position?", args.data.hours_pay);
        this.stream = args.stream;
        this.previous_obj = previous_obj;   // previous information based on the stream
    }

    // the last question for pr page
    async pr_question_actions() {
        // this page has only 3 textareas if previousely_employed else 2
        let no = 0;
        const textareas = await this.page.locator("textarea");
        if (this.previous_obj.previously_employed) {
            await textareas.nth(0).fill(this.previous_obj.how_did_you_determine_the_tfw);
            no++;
        }
        await textareas.nth(no).fill(this.previous_obj.how_did_you_determine_the_tfw);
        await textareas.nth(no + 1).fill(this.previous_obj.how_when_offered);
    }

    // add transition plan
    async add_transition_plan() {
        for (let activity of this.previous_obj.activities) {
            await this.page.click("button:has-text('Add')");

            await this.page.locator("div#activitiesFields>fieldset>input").fill(activity.title);
            await this.page.locator("(//label[text()='Please describe the activity.']/following::textarea)[1]").fill(activity.describe);
            await this.page.locator("(//label[text()='Please describe the expected outcome of the proposed activity.']/following::textarea)[1]").fill(activity.outcome);
            await this.page.locator("//label[text()='Please add any additional employer comments.']/following::textarea").fill(activity.comments);

            await this.page.click("button:has-text('Save')");
        }
    }

    // the last question for hws page about transition plan exemption
    async hws_question_actions() {
        if (this.previous_obj.exempted_from_tp) {
            // check the radio button based on value
            const the_radio_selector = `input[type=radio][value="${this.previous_obj.exempted_crieria}"]`;
            await this.page.check(the_radio_selector)
            // provide details for exemption
            await this.page.fill("textarea", this.previous_obj.exemption_details);

        } else {
            // provide results of previous transition plan activities if it has finished
            if (this.previous_obj.has_finished_tp) await this.page.fill("textarea", this.previous_obj.previous_tp_results);

            // add transition plan
            await this.add_transition_plan();

            // agree to the terms
            await this.page.check("input[type=checkbox]");
        }
    }

    // which exemption for CAP in LWS
    async which_exemption() {
        // check the radio button based on value for which exemption
        await this.page.check(`input[type=radio][value="${this.previous_obj.which_exemption}"]`)
        // provide details for exemption
        await this.page.fill("textarea", this.previous_obj.exemption_details);
    }


    async make_actions() {
        switch (this.stream.name) {
            case "PermRes":
                await this.pr_question_actions();
                break;
            case "Wage":
                if (this.stream.category == "HWS") {
                    await this.hws_question_actions();
                } else {
                    if (this.previous_obj.is_cap_exempted) await this.which_exemption();
                }
                break;
        }
        // if has other workers in same position
        this.data.has_same_position ? await this.page.check("input[type=radio][value=Yes]") : await this.page.check("input[type=radio][value=No]");
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("#HOURS_PER_DAY");
    }
}

class HoursPay2 extends WebPage {
    constructor(page, args) {
        super(page, "hours_pa2", "Hours and pay: work hours, schedule", args.data.hours_pay);
        this.stream = args.stream;
    }

    async has_same_position_actions(inputs) {
        await inputs.nth(0).fill(this.data.lowest);
        await inputs.nth(1).fill(this.data.highest);
    }

    async make_actions() {
        // if has same position, add 2 more questions
        let no = 0;
        const inputs = await this.page.locator("input");
        if (this.data.has_same_position) {
            await this.has_same_position_actions(inputs);
            no = 2;
        }

        await inputs.nth(no).fill(this.data.daily_hours);
        await inputs.nth(no + 1).fill(this.data.weekly_hours);

        // this page has only 2 radio buttons for atypical schedule question
        const radio_buttons = await this.page.locator("input[type=radio]");
        this.data.without_standard_schedule ? await radio_buttons.nth(0).check() : await radio_buttons.nth(1).check();
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Hours and Pay')");
    }
}


class HoursPay3 extends WebPage {
    constructor(page, args) {
        super(page, "hours_pay3", "Hours and pay: fulltime", args.data.hours_pay);
        this.stream = args.stream;
    }

    async make_actions() {

        // if the scheudle without standard schedule, add 1 more question
        if (this.data.without_standard_schedule) {
            await this.page.locator("textarea").fill(this.data.schedule_details);
        }

        // Is job offer for full-time position
        const radio_buttons = await this.page.locator("input[type=radio]");
        this.data.not_full_time_position ? await radio_buttons.nth(1).check() : await radio_buttons.nth(0).check();

    }

    async next() {
        await this.page.click("#next");
        // Wait for an element containing the text "Is your job offer for a full-time position"
        await this.page.waitForFunction(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements.some(element => element.textContent.includes('Is there an overtime rate?'));
        });
    }
}


class HoursPay4 extends WebPage {
    constructor(page, args) {
        super(page, "hours_pay4", "Hours and pay: overtime", args.data.hours_pay);
        this.stream = args.stream;
    }

    async make_actions() {

        // if the job offer is not full-time position, add 1 more question
        if (this.data.not_full_time_position) {
            await this.page.locator("textarea").fill(this.data.not_ft_reason);
        }

        // Is there an overtime rate
        const radio_buttons = await this.page.locator("input[type=radio]");
        this.data.has_overtime_rate ? await radio_buttons.nth(0).check() : await radio_buttons.nth(1).check();

    }

    async next() {
        await this.page.click("#next");
        // Wait for an element containing the text "Is your job offer for a full-time position"
        if (this.data.has_overtime_rate) {
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('What is the overtime wage in Canadian dollars'));
            });
        } else {
            await this.page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(element => element.textContent.includes('Will the TFW be paid any contingent wages'));
            });
        }
    }
}

class HoursPay_Overtime extends WebPage {

    constructor(page, args) {
        super(page, "hours_pay_overtime", "Hours and pay: overtime", args.data.hours_pay);
        this.stream = args.stream;
    }

    async make_actions() {

        // What is the overtime wage in Canadian dollars per hour
        await this.page.locator("input[type=number]").fill(this.data.ot_rate);

        // ot determined by 0: hours per day, 1: hours per week 2: both 
        const radio_buttons = await this.page.locator("input[type=radio]");
        await radio_buttons.nth(this.data.ot_determined_by).check()
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForFunction(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements.some(element => element.textContent.includes('Will the TFW be paid any contingent wages'));
        });
    }
}


class HoursPay5 extends WebPage {

    constructor(page, args) {
        super(page, "hours_pay5", "Hours and pay: contingent wages", args.data.hours_pay);
        this.stream = args.stream;
    }

    async make_actions() {

        // if has ot rate, add 1 more question and 1 more radio button
        if (this.data.has_overtime_rate) {
            //  what is overtime begin in hours per day, hours per week, or both
            if (this.data.ot_determined_by === 0) {
                await this.page.locator("input[type=number]").fill("8");
            }
            else if (this.data.ot_determined_by === 1) {
                await this.page.locator("input[type=number]").fill("40");
            }
        }

        // Will the TFW be paid any contingent wages
        this.data.contingent_wage ? await this.page.check('input.nodeAnswer[type=radio][value=Yes]') : await this.page.check('input.nodeAnswer[type=radio][value=No]');
    }

    async next() {
        await this.page.click("#next");
        await this.page.waitForSelector("h2:has-text('Job Offer Details')");
    }
}


module.exports = {
    HoursPay1,
    HoursPay2,
    HoursPay3,
    HoursPay4,
    HoursPay_Overtime,
    HoursPay5

}