const { timing } = require('../libs/utils');
const { buildPages } = require('./pagebuilders/pr');
const { getParser, getArgs, getSourceData, getValidatedData } = require('./input');
const { fill } = require('../models/fill');




async function main() {
    // 1. get command line args
    const parser = getParser();
    let args = await getArgs(parser, process.argv.slice(2));

    // 2. get and convert data from excel, get schema and buildPages according to the stream
    let forms_data = await getSourceData(args);

    // 3. validate the data
    args["data"] = {};
    for (const [key, value] of Object.entries(forms_data)) {
        await getValidatedData(value.schema, value.converted_data, `Data of ${key}`);
        args["data"][key] = value.converted_data;
    }

    // 5. fill the form
    await fill(args, buildPages);
}

// run the main function with timing
(async function run() {
    const timedMain = timing(main);
    await timedMain()
})();
