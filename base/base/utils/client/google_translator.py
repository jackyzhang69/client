import time
from argparse import ArgumentParser
from prompt_toolkit import PromptSession
import pyperclip
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()


def translate(text, source_language="zh-CN", target_language="en"):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        url = f"https://translate.google.ca/?sl={source_language}&tl={target_language}&op=translate"

        # Go to the Google Translate website
        page.goto(url)
        translated_text = get_translation(page, text)
        browser.close()
        return translated_text


def get_translation(page, text):
    # Find the source text box and enter the text to be translated
    source_text_box = page.locator(
        "#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.rm1UF.UnxENd > span > span > div > textarea"
    )
    if type(text) == str:
        translated_text = get_content(page, text, source_text_box)
        return translated_text
    elif type(text) == list:
        translated_text = [get_content(page, t, source_text_box) for t in text]
        return translated_text


def get_content(page, text, source_text_box):
    output_text_box_selector = "#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.sciAJc > div > div.usGWQd > div > div.lRu31 > span.HwtZe > span > span"

    # """ clear the text in the source text box, and wait until the output text box is 'Translation'"""
    source_text_box.click()
    page.keyboard.down("Shift")
    page.keyboard.press("End")
    page.keyboard.press("Home")
    page.keyboard.up("Shift")
    page.keyboard.press("Backspace")

    page.locator(
        "#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.sciAJc > div > div.FqSPb"
    ).wait_for(timeout=3000)

    source_text_box.fill(text)
    # source_text_box.press("Enter")

    output_text_box = page.query_selector(output_text_box_selector)

    """ Wait until the output text box is not empty """
    for i in range(30):
        if i > 30:
            raise Exception("Cannot get the translated text")
        if not output_text_box:
            output_text_box = page.query_selector(output_text_box_selector)
            time.sleep(0.3)
        else:
            break

    """ Click the copy button to copy the translated text to the clipboard"""
    copy_button = "#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.sciAJc > div > div.usGWQd > div > div.VO9ucd > div.YJGJsb > span:nth-child(2) > button > div.VfPpkd-Bz112c-RLmnJb"
    page.click(copy_button)

    """ Get the translated text from the clipboard"""
    translated_text = pyperclip.paste()
    return translated_text


def main():
    # parser = ArgumentParser()
    # parser.add_argument("-s", "--source", dest="source", help="Source language", default="en")
    # parser.add_argument("-t", "--target", dest="target", help="Target language", default="zh-CN")
    # args=parser.parse_args()
    # session = PromptSession()
    # text =session.prompt("Text to translate: ")
    # tranlated_text=translate(args.source, args.target, text)
    # print(tranlated_text)
    print(translate(["Hello world", "hello friends", "hello, everyone"]))


if __name__ == "__main__":
    main()
