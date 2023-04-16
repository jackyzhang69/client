const { Page } = require("playwright");

class WebPage {
    constructor(page, name, description, data) {
        this.page = page; // the playwright page
        this.name = name;
        this.description = description;
        this.data = data;
    }

    // goto the url, usually only used by the first page in the workflow
    async goto(url) {
        await this.page.goto(url);
    }

    // Make actions execute all the page form actions, except for the navigation actions
    async make_actions() {
        throw new Error("make_actions method must be implemented");
    }

    // got to the previous page in the workflow. If it's the first page, then do nothing.
    // Normally, this method is not used. So here it is not abstract
    async previous() {}

    // got to the next page in the workflow. If it's the last page, then do nothing
    async next() {
        throw new Error("next method must be implemented");
    }

    toString() {
        return this.name;
    }

    async save_img(name) {
        await this.page.screenshot({ path: `${name}.png` });
    }

    async save_pdf(name) {
        await this.page.pdf({ path: `${name}.pdf` });
    }
}

module.exports = WebPage;
