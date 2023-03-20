#!/opt/homebrew/bin/node
const { ArgumentParser } = require('argparse');
const puppeteer = require("puppeteer");
import { DEV, PROD, MIX, FAST_DEV } from "./config";
import { ActArgs } from "./definition";
import { WebPage } from "./page";
import { append_ext } from "./utils";
require('dotenv').config({ path: '~/.immenv' })

const fs = require('fs');

const parser = new ArgumentParser({
  description: 'Unified tool for filling web forms'
});

parser.add_argument('json', { help: 'json file, with or without ".json" extension' });

parser.add_argument('-r', '--rcic', { help: 'Which RCIC portal' });
parser.add_argument('-m', '--mode', { help: 'The mode of running the app. Could be dev, prod. Default is prod' });
parser.add_argument('-v', '--verbose', { help: 'verbose model, display element level information.', action: 'store_true' });
parser.add_argument('-e', '--exit', { help: 'exit on error, default is false' });
parser.add_argument('-d', '--delay', { help: 'delay for ms' });
parser.add_argument('-i', '--interception', { help: 'intercept image and font.', action: 'store_true' });


const args = parser.parse_args();

if (args.pdf) {
  args.pdf = append_ext(args.pdf, ".pdf")
}
if (args.json) {
  args.json = append_ext(args.json, ".json")
}

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

  // default mode is for production (PROD), others are development(DEV), or  MIX(MIX)
  var mode;
  if (typeof args.mode != 'undefined') {
    switch (args.mode.toUpperCase()) {
      case "FAST_DEV":
        mode = FAST_DEV
        break;
      case "DEV":
        mode = DEV;
        break;
      case "PROD":
        mode = PROD;
        break;
      case "MIX":
        mode = MIX;
        break;
      default:
        console.log(`args.mode is not one of ['DEV','FAST_DEV','PROD','MIX']`);
        process.exit(1)
    }
  } else {
    mode = FAST_DEV
  }

  const browser = await puppeteer.launch(mode);
  const page = await browser.newPage();

  // done't load image ['image', 'stylesheet', 'font']
  if (args.interception) {
    var not_load = ['image', 'font']
    await page.setRequestInterception(true)
    page.on('request', async (request: any) => {
      if (not_load.includes(request.resourceType())) {
        await request.abort()
      } else {
        await request.continue()
      }
    })
  }


  // set page action parameters
  const action_args: ActArgs = {
    rcic: args.rcic ? args.rcic : process.env['rcic'],
    page: page,
    mode: mode,
    verbose: typeof args.verbose != 'undefined' ? true : false,
    exit_on_error: typeof args.exit != 'undefined' ? true : false,
    delay: typeof args.delay != 'undefined' ? args.delay : 0,
    snapshot: typeof args.pdf != 'undefined' ? true : false,
    path: typeof args.pdf != 'undefined' ? args.pdf : './'
  };

  console.time("Form filled with time");
  // Process form filling
  var total_page = 0
  for (const [index, webpage] of json_data.entries()) {
    const wp = new WebPage(webpage);
    console.log(`Page ${index}: ${webpage.page_name}`)
    await wp.act(action_args);
    total_page = index + 1;
  }

  // process the ending
  const answer = await page.evaluate(async () => {
    let inside_confrim = confirm("Task done! Leave?");
    return inside_confrim;
  });

  console.log(`Forms filled (${total_page} pages)`);
  console.timeEnd("Form filled with time");
  if (answer) {
    await page.close();
    await browser.close();
  }

})();
