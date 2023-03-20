/*
This module is just used for deleting applications, it is not used in the main filling process.
*/

const WebPage = require('../../page');

class DeleteApplication extends WebPage {
    constructor(page, data) {
        super(page, "delete", "Delete applications created by software developing and testing period", data);
    }

    async delete() {
        // locator is "//table[@id='wb-auto-11']/tbody[1]/tr[3]/td[7]/a[1]", in which tr[3] is the the row of the table
        let i = 0;
        while (true) {
            // everytime, delete the first row. Because after deleting the first row, the second row will become the first row.
            await this.page.waitForSelector("//table[@id='wb-auto-11']/tbody[1]/tr[1]/td[7]/a[1]");
            await this.page.waitForTimeout(1000);
            const link = await this.page.locator(`//table[@id='wb-auto-11']/tbody[1]/tr[1]/td[7]/a[1]`);
            const linkLabel = await link.innerText();
            if (linkLabel === "Delete") {
                await link.click();
                await this.page.locator("(//input[@type='checkbox'])[1]").click(); // check to confim deletion
                await this.page.locator("(//button[@class='btn btn-primary'])[1]").click(); // click delete button
                console.log(`Delete application ${i} successfully`);
                i++;
            }
            else {
                console.log("No more applications to delete");
                break;
            }
        }
    }

    async make_actions() {
        await this.delete();
    }

    async next() {
    }
}


module.exports = {
    DeleteApplication
};