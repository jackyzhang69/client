#!/usr/local/bin/node
const fs = require('fs');
const { ArgumentParser } = require('argparse');
const parser = new ArgumentParser({
    description: 'Merge json objects'
});

parser.add_argument('-j', '--json', { help: 'Json files', nargs: "+" });
parser.add_argument('-t', '--to', { help: 'Target json files' });

const args = parser.parse_args();
const target_file = args.to ? args.to : "nocs.json"

function mergeJSON(json_files) {
    var targetJSON = {}
    // read json files
    for (var json_file of json_files) {
        let rawdata = fs.readFileSync(json_file);
        var json_data = JSON.parse(rawdata);
        targetJSON = { ...targetJSON, ...json_data }
    }

    // write JSON string to a file
    const target_json = JSON.stringify(targetJSON);
    fs.writeFileSync('nocs.json', target_json, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}


(async () => {
    console.time("Searching time")

    mergeJSON(args.json)

    console.timeEnd("Searching time")
})();
