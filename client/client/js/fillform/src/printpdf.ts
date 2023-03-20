#!/usr/local/bin/node

/*
  Webpage data format

  {
      "action_type": "WebPage",
      "screenshot":{
        format: 'pdf',
        waitting_for:"#xxx"
      }
      "page_name": "Continue for 5562 form",
      "actions": [],
      "id": "body > pra-root > pra-localized-app > main > div > pra-imm5562 > lib-navigation-buttons > div > button.btn.btn-primary"
  }

  #TODO: 
  1. printpdf
  2. Python Prdata, redefine webpage structure, and assign page to be printed
*/
const { ArgumentParser } = require('argparse');
const puppeteer = require("puppeteer");
import { DEV, PROD, MIX } from "./config";
import { ActArgs, Action, Message } from "./definition";
import { ElementProperties } from "./element"
import { PdfElement, PdfElementProperties, ImgElementProperties, ImgElement } from "./element";
import { fillForm } from "./engine";
import { showMessage } from './utils'
import { WebPage } from "./page";

const fs = require('fs');

const parser = new ArgumentParser({
  description: 'Unified tool for printing web forms'
});

parser.add_argument('-j', '--json', { help: 'json file' });
parser.add_argument('-p', '--pdf', { help: 'snapshot every data page and save as pdf' });

const args = parser.parse_args();

(async () => {
  var json_data;
  // Check data source 
  if (typeof args.json == 'undefined') {
    console.log("You did not specify the data source json file. Using -j source_file.json");
    process.exit(1);
  }
  // check and create path if not exists
  if (typeof args.pdf != 'undefined' && !fs.existsSync(args.pdf)) {
    fs.mkdirSync(args.pdf, { recursive: true })
    console.log('Directory not found, so I created it.');
  }
  // read json data 
  try {
    let rawdata = fs.readFileSync(args.json);
    json_data = JSON.parse(rawdata);
  } catch (err) {
    console.log(`${err}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch(PROD);
  const page = await browser.newPage();

  // set page action parameters
  const action_args: ActArgs = {
    page: page,
    mode: PROD,
    verbose: true,
    exit_on_error: true,
    delay: 0,
    snapshot: typeof args.pdf != 'undefined' ? true : false,
    path: typeof args.pdf != 'undefined' ? args.pdf : './'
  };

  // Process printing pdf
  for (const [index, webpage] of json_data.entries()) {
    const wp = new WebPage(webpage);
    if (index == 0 || (webpage.actions.length > 0 && webpage.actions[0].action_type == "PrPortalPick")) {
      await wp.act(action_args);
      continue;
    };

    if (wp.props.screen_shoot) {
      const pdf = new PdfElement({ action_type: "Pdf", waitting_for: wp.props.screen_shoot.waitting_for });
      console.log(`Printing webpage ${webpage.page_name}`);
      // await pdf.act(action_args);
    }

    await wp.turnpage(action_args);

  }

  // process the ending
  console.log("Pdf printed...");
  await page.close();
  await browser.close();
})();
