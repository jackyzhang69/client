#!/usr/local/bin/node
const puppeteer = require("puppeteer");
import { getNocOutlookSalary } from "./outlook_salary"
import { PROD, DEV, DEBUG, noc_2021_v1 } from "./config";
const fs = require('fs');
const path = require('path');

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
  const browser = await puppeteer.launch(PROD);
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000)
  const filename = path.join(__dirname, './teers.json')
  const rawdata = fs.readFileSync(filename);
  const nocs_data = JSON.parse(rawdata);

  // get outlook data based on noc code 
  try {
    // const current_noc = getCurrentNoc(); // 暂时作废。
    const current_noc = from_noc; //如果出现断点
    const index = noc_2021_v1.indexOf(current_noc);

    for (var i = index; i < noc_2021_v1.length; i++) {
      const noc_code = noc_2021_v1[i]
      const noc_title = nocs_data[noc_code].title
      console.log(i + ": " + noc_code + " " + noc_title)
      const data = await getNocOutlookSalary(noc_code, noc_title, page);
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




