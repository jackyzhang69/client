
const remove = async (page) => {
    // wait for Add another button, if it exists, the remove button will also exist
    await page.waitForSelector('button:has-text("Add another")');
    const removeButtons = await page.locator('button:has-text("Remove")');
    if (removeButtons.count() === 0) return;
    const count = await removeButtons.count();
    for (let i = count - 1; i >= 0; i--) {
        await removeButtons.nth(i).click();
    }
}

module.exports = { remove }