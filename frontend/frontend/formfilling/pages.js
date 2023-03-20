const WebPage = require("./page");
const { print } = require("./libs/output");

class WebPages {
    constructor(pages, index = 0) {
        this.pages = pages;
        this.index = index;
    }

    // The class implements the iterator protocol
    [Symbol.iterator]() {
        return this;
    }

    next() {
        if (this.index >= this.pages.length) {
            return { done: true };
        }
        const value = this.pages[this.index];
        this.index++;
        return { value, done: false };
    }

    toString() {
        return this.pages.map((page) => page.name).join(", ");
    }

    get_web_page_by_name(name) {
        return this.pages.find((page) => page.name === name) || null;
    }

    // Skip forward to the page with the given name, ignore all pages' make_actions() methods
    skip_forward_to(name) {
        for (const webPage of this.pages) {
            if (webPage.name === name) {
                return;
            }
            webPage.next();
        }
    }

    // Skip backward to the page with the given name, ignore all pages' make_actions() methods
    skip_backward_to(name) {
        for (const webPage of this.pages) {
            if (webPage.name === name) {
                return;
            }
            webPage.previous();
        }
    }

    // print out all page index, name and description
    print_page_list() {
        print("\nPage list\n", "info");
        for (const index in this.pages) {
            let row = `${index}: ${this.pages[index].name} - ${this.pages[index].description}`;
            print(row);
        }
    }
}

module.exports = WebPages;
