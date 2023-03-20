/* 
In this module,  we will create the following pages:
upload: 

All these pages are common to all the programs.
*/


const WebPage = require('../../page');
const { getFilesInFolder } = require('../../libs/utils');
const { isElementAttachedToDOM } = require('../../libs/playwright');
const path = require('path');
const { print } = require('../../libs/output');
const { expect } = require('@playwright/test');


class Upload extends WebPage {
    constructor(page, args) {
        super(page, "upload", "Upload documents", args);
    }

    // other is for regular documetns upload
    async otherUpload() {

        // Set the files to upload
        const filesToUpload = getFilesInFolder(this.data.upload_folder, ".pdf", true);

        for (const file of filesToUpload) {
            // get only file name without path
            const fileName = path.basename(file);

            // check if the file is already uploaded
            const fileUploaded = await this.page.$(`//a[contains(text(),'${fileName}')]`);
            if (fileUploaded) {
                print(`File ${fileName} already uploaded. Skipped...`, style = "info");
                continue;
            }
            // Get the file input element
            const input = await this.page.$("input[name='Other']");

            // Set the file to upload
            await input.setInputFiles(file);

            // Submit the form
            await this.page.click("#uploadDocument");

            // Wait for the upload to complete

            await this.page.waitForSelector(`//a[contains(text(),'${fileName}')]`); // wait for the file name to appear on the page
            print(`Uploaded ${fileName}...`, style = "success");
        }
    }

    // compensation justification is for wage and permres
    async compensationJustificationUpload() {
        const fileName = path.basename(this.data.compensation_justification_doc);

        // check if the Compensation justification documents choose file is existed (if previous upload is completed, the file chooser will not be there)
        const fileChooser = await this.page.$("input[name='JustificationCompDocs']", { timeout: 1000 });
        if (!fileChooser) {
            print(`Compensation justification documents,${fileName}, have been uploaded previously. Skipped...`, style = "info");
            return;
        }

        await fileChooser.setInputFiles(this.data.compensation_justification_doc, { timeout: this.data.defaultTimeOut });
        await this.page.click("#uploadDocument");

        // Wait for the upload to complete
        await this.page.waitForSelector(`//a[contains(text(),'${fileName}')]`); // wait for the file name to appear on the page
        print(`Uploaded ${fileName}...`, style = "success");
    }

    async make_actions() {
        const stream = this.data.stream;
        switch (stream.name) {
            case "PermRes":
            case "Wage":
                // if the job is in union, compensation justification documents are required. This must be uploaded first if it is required, otherwise the element will cannot be found due to detached to DOM
                if (this.data.data.job_offer.is_part_of_union) this.compensationJustificationUpload();
                break;
        }
        // upload other documents, actually it is the main documents uploader
        await this.otherUpload();
    }

    async next() {
        // print("All documents uploaded, waitting for wraping up...", style = "info")
        // await this.page.locator("#summary").click();
        // await this.page.locator("h1:has-text('Application Summary')")
        print("All forms filled and documents uploaded successfully.", style = "success");
    }
}


// summary page. But actually it is not needed. 
class Summary extends WebPage {
    constructor(page) {
        super(page, "summary", "Application summary", null);
    }

    async make_actions() {
        // check if there is error message
        const requiredDocumentsMissingElement = await this.page.$('.alert.alert-danger');
        if (requiredDocumentsMissingElement) {
            print("All forms filled and documents uploaded, but there are required documents missing. Please go to Application Summary to check", style = "warning");
        } else {
            print("All forms filled and documents uploaded successfully.", style = "success");
        }
    }

    async next() {
        // The end
    }

}

module.exports = {
    Upload,
    Summary
}
