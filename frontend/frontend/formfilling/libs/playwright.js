/* 
This module makes related dropdowns' choice, the second dropdown's choice depends on the first dropdown's choice.
*/

const { bestMatchString } = require('./utils');

class DependantSelect {
    constructor(page, selector1, selector2, value1, value2) {
        this.page = page;
        this.selector1 = selector1;
        this.selector2 = selector2;
        this.value1 = value1;
        this.value2 = value2;
    }

    async act() {
        // get dropdown 2's initial content
        const option2_init_value = await this.getSelect2Option1Text();
        // If select1's value !== web page existing selected value, wait for dropdown 2 change
        const exiting_select1_value = await this.page.evaluate((id) => {
            let s1 = document.querySelector(id);
            let index = s1.selectedIndex;
            console.log(index, s1.options);
            return s1.options[index].value;
        }, this.selector1);
        const should_wait = this.value1 !== exiting_select1_value;
        // select dropdown 1
        await this.page.locator(this.selector1).selectOption(this.value1);
        // if select1 is not same as exising selected value, do select; otherwise, keep it as it was.
        should_wait &&
            (await this.page.waitForFunction(
                function (init_text, id2) {
                    const options = document.querySelector(id2).options;
                    if (options.length > 0) return options[1].text != init_text;
                },
                {},
                option2_init_value,
                this.selector2
            ));

        // select dropdown 2
        await this.page.locator(this.selector2).selectOption(this.value2);
    }

    // get dropdown 2's option 1 text
    async getSelect2Option1Text() {
        return await this.page.evaluate((id) => {
            const options = document.querySelector(id).options;
            if (options.length > 1) {
                return options[1].text;
            } else {
                return "";
            }
        }, this.selector2);
    }

}



/** a function that selects the option if it includes the string,case-insensitive  */
async function selectOptionIncludeText(page, selector, text) {
    await page.waitForSelector(selector);
    const selectElement = await page.$(selector);
    const options = await selectElement.$$('option');

    for (const option of options) {
        let optionText = await option.innerText();
        optionText = optionText.toLowerCase();
        if (optionText.includes(text.toLowerCase())) {
            await selectElement.selectOption({ value: await option.getAttribute('value') });
            break;
        }
    }
}

/** a function that selects the option if it includes similar text in options */
async function selectOptionHasSimilarText(page, selector, text) {
    await page.waitForSelector(selector);
    const selectElement = await page.$(selector);
    const options = await selectElement.$$('option');
    const optionTexts = await Promise.all(options.map((option) => option.innerText()));
    const { maxScore, maxName } = bestMatchString(text, optionTexts);
    if (maxScore > 0.7) await selectElement.selectOption({ label: maxName });
    else throw new Error(`No similar text found for ${text}`);
}

async function waitSelectWithText(page, selector, text) {
    await page.waitForFunction((selector, text) => {
        const selectElement = document.querySelector(selector);
        if (!selectElement) return false;
        const options = selectElement.querySelectorAll('option');
        for (const option of options) {
            if (option.innerText === text) {
                return true;
            }
        }
        return false;
    }, selector, text);
}


async function waitSelectWith1MoreOptions(page, selector) {
    await page.waitForFunction((selector, text) => {
        const selectElement = document.querySelector(selector);
        if (!selectElement) return false;
        const options = selectElement.querySelectorAll('option');
        if (options.length > 1) return true;
        return false;
    }, selector);
}

// make sure an element is attached to DOM
async function isElementAttachedToDOM(page, selector) {
    const elementHandle = await page.$(selector);
    if (elementHandle) {
        const boundingBox = await elementHandle.boundingBox();
        return boundingBox !== null;
    }
    return false;
}

async function makeElementVisible(page, element) {
    await page.evaluate((element) => {
        element.style.display = 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
    }, element);
}

/*
get a type of actionable element with text in a row with text in a table
for example: get a button with text "Edit" in a row with text "John" in a table

*/

async function getActionableElementInRow(tableLocator, rowText, actionableElementText, actionableElementType) {
    const actionableElement = await tableLocator.locator("tbody tr")
        .filter({ hasText: rowText })
        .getByRole(actionableElementType, { name: actionableElementText })
        .first()
    return actionableElement;
}


async function inputDate(page, selector, the_date) {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.type(the_date);
    await page.keyboard.press('Enter');
}

async function inputPhone(page, selector, phone) {
    await page.click(selector, { clickCount: 2 });
    await page.keyboard.type(phone);
}

async function selectRelatedDropdown(page, firstDropdownSelector, secondDropdownSelector, firstValue, secondValue) {
    // Wait for the first dropdown list to load and select the specified value
    await page.waitForSelector(firstDropdownSelector);
    await page.selectOption(firstDropdownSelector, { label: firstValue });

    // Wait for the second dropdown list to load options based on the selected value
    await page.waitForSelector(secondDropdownSelector, { state: 'attached' });

    await page.selectOption(secondDropdownSelector, { label: secondValue });
}




module.exports = {
    DependantSelect,
    selectOptionIncludeText,
    selectOptionHasSimilarText,
    waitSelectWithText,
    waitSelectWith1MoreOptions,
    isElementAttachedToDOM,
    makeElementVisible,
    getActionableElementInRow,
    inputDate,
    inputPhone,
    selectRelatedDropdown
};

