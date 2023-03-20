#!/usr/local/bin/ts-node
import { WebPageProperties } from '../src/page';
const { ArgumentParser } = require('argparse');
const puppeteer = require("puppeteer");
import { DEV, PROD, MIX } from "../src/config";
import { ActArgs } from "../src/definition";
import { WebPage } from "../src/page";
const fs = require('fs');

const parser = new ArgumentParser({
  description: 'Unified tool for filling web forms'
});

parser.add_argument('-m', '--mode', { help: 'The mode of running the app. Could be dev, prod. Default is prod' });
parser.add_argument('-v', '--verbose', { help: 'verbose model, display element level information.',action:'store_true' });
parser.add_argument('-e', '--exit', { help: 'exit on error, default is false' });
parser.add_argument('-d', '--delay', { help: 'delay for ms' });
parser.add_argument('-j', '--json', { help: 'json file' });
parser.add_argument('-p', '--pdf', { help: 'snapshot every data page and save as pdf' });

const args=parser.parse_args();

(async () => {
  var json_data;
  // Check data source 
  if (typeof args.json=='undefined'){
    console.log("You did not specify the data source json file. Using -j source_file.json");
    process.exit(1);
  }
  // check and create path if not exists
  if (typeof args.pdf!='undefined' && !fs.existsSync(args.pdf)){
        fs.mkdirSync(args.pdf, { recursive: true })
        console.log('Directory not found, so I created it.');
  }
  // read json data 
  try {
        let rawdata = fs.readFileSync(args.json);
        json_data = JSON.parse(rawdata);
    } catch(err) {
        console.log(`${err}`);
        process.exit(1);
    }
  
  // default mode is for production (PROD), others are development(DEV), or  MIX(MIX)
  var mode;
  if (typeof args.mode!='undefined')
  {
      switch (args.mode.toUpperCase()) {
        case "DEV":
          mode=DEV;
          break;
        case "PROD":
          mode=PROD;
          break;
        case "MIX":
          mode=MIX;
          break;
        default:
          console.log(`args.mode is not one of ['DEV','PROD','MIX']`);
          process.exit(1)
      }
  } else {
    mode=PROD
  }

  const browser = await puppeteer.launch(mode);
  const page = await browser.newPage();
  
  // set page action parameters
  const action_args: ActArgs = {
    page: page,
    mode:mode,
    verbose: typeof args.verbose!='undefined'?true:false,
    exit_on_error: typeof args.exit!='undefined'?true:false,
    delay: typeof args.delay!='undefined'?args.delay:0,
    snapshot:typeof args.pdf!='undefined'?true:false,
    path:typeof args.pdf!='undefined'?args.pdf:'./'
  };
  
  // Process form filling
  // await fillForm(page,json_data,action_args)
  for (const webpage of json_data) {
    const wp=new WebPage(webpage);
    await wp.act(action_args);
  }
  
  // process the ending
  console.log("Forms filled...");
  await page.close();
  await browser.close();
})();