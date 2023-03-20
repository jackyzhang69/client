#!/usr/local/bin/node
import { getNocOutlookSalary } from "./outlook_salary";
import { noc_list } from "./config";
const { ArgumentParser } = require('argparse');
const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');
import { Noc, Nocs, Area } from "./nocclass"

const parser = new ArgumentParser({
    description: 'A tool for get noc information'
});

//Get noc codes by searching keywords
parser.add_argument("-k", "--keywords", { help: "input key words", nargs: '+' })
parser.add_argument('-n', '--noc', { help: 'noc code' });
// about details for -d, or about search scope for -k
parser.add_argument("-md", "--main_duties", { help: "input if includes main duties", action: "store_true" })
parser.add_argument("-te", "--title_examples", { help: "input if includes title examples", action: "store_true" })

// about noc related special programs
parser.add_argument("-sp", "--special_programs", { help: "get related special programs", action: "store_true" })
parser.add_argument("-ws", "--with_source", { help: "get related special programs, show source link", action: "store_true" })
parser.add_argument("-wd", "--with_description", { help: "get related special programs, show program description", action: "store_true" })
// about region
parser.add_argument('-p', '--province', { help: 'provide province data' });
parser.add_argument('-a', '--area', { help: 'provide area data' });
parser.add_argument('-c', '--canada', { help: 'provide canada data', action: 'store_true' });
// about outlook 
parser.add_argument("-s", "--starts_with", { help: "noc starts with" })
parser.add_argument("-o", "--outlook", { help: "input outlook star number" })
// utils
parser.add_argument("-d", "--details", { help: "looking for noc details. tt: title, te: title example, er: employment requirement, md: main duties,gd:general description,ai: additional information,ec: exclucsion " })
parser.add_argument("-i", "--information", { help: "display information", action: 'store_true' })
parser.add_argument("-r", "--remote", { help: "get single noc info remotely(from website)", action: 'store_true' })
// batch processing
parser.add_argument('-ns', '--nocs', { help: 'noc code', nargs: "+" });

const args = parser.parse_args();

var nocs;
if (args.noc && !noc_list.includes(args.noc)) {
    console.log(`${args.noc} is not a valid noc code.`)
    process.exit(1);
} else if (args.noc === '5124') {
    console.log(`${args.noc} has no data in jobbank.`)
    process.exit(1);
}
const area_index = args.area && args.area >= 0 && args.area <= 72 ? args.area : 66; // default is Vancouver
const prov_index = args.province && args.province >= 0 && args.province <= 12 ? args.province : 9; // default is BC

(async () => {
    console.time("Searching time")
    // get online noc info 
    if (args.remote && args.noc) {
        await getNocOnline(args.noc);
    } else {
        // read json data 
        nocs = getNocs();
        // handle tasks
        handleTasks()
    }
    console.timeEnd("Searching time")
})();

// get noc info through web searching
async function getNocOnline(noc) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log(`I am searching the database online for ${noc}'s information..., be patient.`)
    const noc_data = await getNocOutlookSalary(noc, page);
    console.table(noc_data[noc].region[area_index]);
    await page.close();
    await browser.close();
}

// get all noc info
function getNocs() {
    try {
        const filename = path.join(__dirname, './nocs.json')
        const rawdata = fs.readFileSync(filename);
        return JSON.parse(rawdata);
    } catch (err) {
        console.log(`${err}`);
        process.exit(1);
    }
}

function handleTasks() {

    if (args.information) {

        if (args.province) {
            const areas = Area.provinces[args.province];
            var area_container = []
            for (var i = areas[0]; i < areas[1] + 1; i++) {
                i >= 0 && area_container.push({ area_index: i, region: nocs['1111'].region[i].region });
            }
            area_container.length > 0 ? console.table(area_container) : console.log("\n", Area.province_names[args.province], "\n")
        } else {
            const provs = nocs['1111'].province.map(prov => prov.region);
            const areas = nocs['1111'].region.map(area => area.region);
            console.table(provs);
            console.table(areas);
        }
        return;
    }

    if (args.keywords) {
        const nocs = new Nocs();
        console.table(nocs.getNocCodes(args.keywords, args.main_duties, args.title_examples));
        return;
    }

    if (args.noc && args.details) {
        const noc_obj = new Noc(args.noc);
        const details = noc_obj.getDetails(args.details);
        console.log(`\n${details.label} of NOC ${details.noc}\n`);
        console.log(details.content + "\n");
        return;
    }
    if (args.noc && args.special_programs) {
        const noc = args.noc;
        const noc_obj = new Noc(noc);
        const programs = noc_obj.getRelatedPrograms();
        var with_source = args.with_source ? true : false;
        var with_description = args.with_description ? true : false;
        noc_obj.showRelatedPrograms(programs, with_source, with_description = with_description);
        return;
    }

    if (args.nocs) {
        if (args.province) {
            const the_nocs = args.nocs.map(noc => {
                const noc_obj = new Noc(noc);
                return {
                    noc: noc_obj.noc_code,
                    ...noc_obj.get_prov_outlook_wages(prov_index)
                }
            })
            console.table(the_nocs);
            return;
        } else if (args.canada) {
            const the_nocs = args.nocs.map(noc => {
                const noc_obj = new Noc(noc);
                return {
                    noc: noc_obj.noc_code,
                    ...noc_obj.get_canada_outlook_wages()
                }
            })
            console.table(the_nocs);
            return;
        } else if (args.area) {
            const the_nocs = args.nocs.map(noc => {
                const noc_obj = new Noc(noc);
                return {
                    noc: noc_obj.noc_code,
                    ...noc_obj.get_area_outlook_wages(area_index)
                }
            })
            console.table(the_nocs);
            return;
        } else {
            const the_nocs = args.nocs.map(noc => {
                const noc_obj = new Noc(noc);
                return {
                    noc: noc_obj.noc_code,
                    ...noc_obj.get_area_outlook_wages(66)
                }
            })
            console.table(the_nocs);
            return;
        }

    }

    if (args.starts_with && args.outlook) {
        const nocs = new Nocs();
        console.table(nocs.qualifiedNocs(args.starts_with, args.outlook, area_index));
        return;
    }

    // fina a noc's job opportunity outlook in Canada scope
    if (args.noc && args.outlook) {
        const nocs = new Nocs();
        console.table(nocs.qualifiedPlaces(args.noc, args.outlook));
        return;
    }

    // process single noc info
    if (args.noc) {
        const noc_obj = new Noc(args.noc);
        if (args.province) {
            console.table(noc_obj.get_prov_outlook_wages(prov_index));
            return;
        } else if (args.canada) {
            console.table(noc_obj.get_canada_outlook_wages());
            return;
        }
        console.table(noc_obj.get_area_outlook_wages(area_index));
        return;
    }
}

