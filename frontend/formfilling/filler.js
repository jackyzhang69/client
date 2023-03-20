//This is the master threed for all page forms filling.
//fill_handler: the function to fill the specific pages in any website
//arguments: the arguments for the fill_handler
const { chromium } = require('playwright');
const { print } = require('./libs/output');
const { mergePDFs } = require('./libs/utils');

class Filler {
    constructor(args) {
        this.args = args;
        this.headless = args.headless;
        this.slow_mo = args.slow_mo;
        this.view_port_size = args.view_port_size;
        this.defaultTimeOut = args.defaultTimeOut;
    }

    async fill(pages_builder) {
        const browser = await chromium.launch({ headless: this.headless, slowMo: this.slow_mo });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.setViewportSize(this.view_port_size);
        await page.setDefaultTimeout(this.defaultTimeOut);

        // Start tracing before creating / navigating a page.
        await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

        /* Build pages according to page, and pages_builder_arguments, which includes stream, and data etc. */
        const webpages = await pages_builder(page, this.args);
        await this.handle_pages(webpages.pages);

        // Stop tracing and export it into a zip archive.
        await context.tracing.stop({ path: "/Users/jacky/desktop/trace.zip" });

        await context.close();
        await browser.close();
    }

    async handle_pages(web_pages) {
        /*pages handling
        You can deterine skip pages if it is able to be skipped
        */
        print("\nStart handling pages.\n", "info");
        for (let page_no = 0; page_no < web_pages.length; page_no++) {
            const web_page = web_pages[page_no];
            const skipToPage = this.args.skipToPage;

            if (
                this.args.isCreate || skipToPage == undefined || skipToPage == null
                || page_no < this.args.start_skip_page
                || page_no > skipToPage
            ) {
                print(`Hanlding page #${page_no}: ${web_page.name}    ${web_page.description}`);
                await web_page.make_actions();
            } else {
                print(`Skipping page #${page_no}: ${web_page.name}    ${web_page.description}`);
            }

            if (this.args.pdf) {
                await web_page.save_pdf(`${this.args.screen_snap_folder}/${web_page.name}`);
            }
            if (this.args.png) {
                await web_page.save_img(`${this.args.screen_snap_folder}/${web_page.name}`);
            }
            await web_page.next();
        }

        // combine all pdfs into one pdf
        if (this.args.pdf) {
            await mergePDFs(this.args.screen_snap_folder);
        }
        print("\nAll pages are handled.\n", "success");
    }

    async print_pages(pages_builder) {
        const webpages = await pages_builder(null);
        webpages.print_page_list();
    }
}

module.exports = Filler;
