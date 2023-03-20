import { Page } from "puppeteer";
import { FormElement } from "./element";
import { Message } from "./definition";

const colors = {
  red: "\x1b[31m%s\x1b[0m",
  green: "\x1b[32m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
  blue: "\x1b[34m%s\x1b[0m",
  magenta: "\x1b[35m%s\x1b[0m",
  cyan: "\x1b[36m%s\x1b[0m",
};
export function showMessage(obj: object, msg_type: number, msg: string | null) {
  let tabs = "";
  let color = colors.blue;
  if (obj instanceof FormElement) {
    tabs = "\t";
  }

  switch (msg_type) {
    case Message.SUCCESS:
      color = colors.green;
      console.error(color, tabs + msg);
      break;
    case Message.ERROR:
      color = colors.red;
      console.error(color, tabs + msg);
      break;
    case Message.WARNING:
      color = colors.yellow;
      console.warn(color, tabs + msg);
      break;
    case Message.INFO:
      color = colors.blue;
      console.log(color, tabs + msg);
      break;
    case Message.LOG:
      console.log(tabs + msg);
      break;
  }
}

// Find a button with specific text (innerText)
export async function getButton(page: Page, text: string) {
  return await page.evaluate((text) => {
    const btns = document.querySelectorAll("button");
    for (var index in btns) {
      if (btns[index].innerText == text) {
        return btns[index];
      }
    }
  }, text);
}

// Base64 decoder

export function decode(encoded_text: string) {
  var decoded_text = Buffer.from(encoded_text, 'base64')
  return decoded_text.toString();
}

export function convert(fn: string, ext: string) {
  const names = fn.split(".")
  if (names.length == 2) {
    return fn
  }
  else if (names.length == 1) {
    return names[0] + ext
  }
  else {
    throw fn + " is invalid filename"
  }

}


export function append_ext(filename: string | Array<string>, ext: string) {
  if (typeof filename !== "string") {
    return filename.map(fn => {
      return convert(fn, ext)
    })
  }
  else {
    return convert(filename, ext)
  }

}



