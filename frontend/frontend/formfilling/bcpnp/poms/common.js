
async function inputDate(page, selector, the_date) {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.type(the_date);
    await page.keyboard.press('Enter');
}

async function inputPhone(page, selector, phone) {
    await page.click(selector, { clickCount: 2 });
    await page.keyboard.type(phone);
}

module.exports = {
    inputDate,
    inputPhone
}
