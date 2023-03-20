#!/usr/local/bin/node
const puppeteer = require("puppeteer");
import { getNocOutlookSalary } from "./outlook_salary"
import { PROD, DEV, DEBUG, noc_list } from "./config";
const fs = require('fs');

const { ArgumentParser } = require('argparse');
const parser = new ArgumentParser({
  description: 'A tool getting all noc outlook and salary info'
});

parser.add_argument('-f', '--from', { help: 'From which noc code' });
parser.add_argument('-t', '--to', { help: 'Target json filename' });
const args = parser.parse_args();
const from_noc = args.from ? args.from.toString() : "00011"
const filename = args.to ? args.to.toString() : "nocs.json"

var nocs = {};

(async () => {
  console.time("Searching time");
  const browser = await puppeteer.launch(PROD);
  const page = await browser.newPage();
  // get outlook data based on noc code 
  try {
    // const current_noc = getCurrentNoc(); // 暂时作废。
    const current_noc = from_noc; //如果出现断点
    const index = noc_list.indexOf(current_noc);

    for (var i = index; i < noc_list.length; i++) {
      console.log(noc_list[i])
      if (['5124'].includes(noc_list[i])) continue; // no data in jobbank
      const data = await getNocOutlookSalary(noc_list[i], page);
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
    return '0011'
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




