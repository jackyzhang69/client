#!/usr/local/bin/node
const puppeteer = require("puppeteer");
import { getTeerContents } from "./teercontents"
import { PROD, DEV, DEBUG, noc_2021_v1 } from "./config";
const fs = require('fs');

const { ArgumentParser } = require('argparse');
const parser = new ArgumentParser({
  description: 'A tool getting all noc outlook and salary info'
});

parser.add_argument('-f', '--from', { help: 'From which noc code' });
parser.add_argument('-t', '--to', { help: 'Target json filename' });
const args = parser.parse_args();
const from_noc = args.from ? args.from.toString() : "00010"
const filename = args.to ? args.to.toString() : "nocs.json"

var nocs = {};

(async () => {
  console.time("Searching time");
  const browser = await puppeteer.launch(DEV);
  const page = await browser.newPage();
  // get outlook data based on noc code 
  try {
    // const current_noc = getCurrentNoc(); // 暂时作废。
    const current_noc = from_noc; //如果出现断点
    const index = noc_2021_v1.indexOf(current_noc);

    for (var i = index; i < noc_2021_v1.length; i++) {
      console.log(i + ": " + noc_2021_v1[i])
      const data = await getTeerContents(noc_2021_v1[i], page);
      nocs = { ...nocs, ...data }
    }
    save()
  } catch (err) {
    save();
    console.log(`Catch error: ${err}`)
  }

  await page.close();
  await browser.close();
  console.timeEnd("Searching time")
})();

// read json data from saved file, and find the last noc 
// 放弃： 用的机会不多。 不懂脑子了。
function getCurrentNoc() {
  try {
    let rawdata = fs.readFileSync(filename);
    var json_data = JSON.parse(rawdata);
    const keys = Object.keys(json_data).map(x => Number(x));
    var max_key = Math.max(...keys) //需要展开才能求最大值
    const last_noc = '0'.repeat(4 - max_key.toString().length) + max_key;
    return last_noc
  } catch (err) {
    return '00010'
  }
}


function save() {
  // write JSON string to a file
  const nocs_json = JSON.stringify(nocs);
  fs.writeFileSync('nocs.json', nocs_json, (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved.");
  });
}




