const WebPage = require('../../page');


class Attachment extends WebPage {
    constructor(page, args) {
        super(page, "attachments", "Attachments", args.upload_folder);
        this.args = args;
    }

    async make_actions() {
    }

    async next() {
        await this.page.locator("//button[text()='Save']").click();
        await this.page.locator("li > a:has-text('Submit')").click();
        await this.page.locator("h3:has-text('Declare and Submit')")
    }
}

module.exports = Attachment;