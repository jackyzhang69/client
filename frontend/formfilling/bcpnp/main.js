const { timing } = require('../libs/utils');
const { getParser, getArgs, getSourceData, getValidatedData } = require('./input');
const { fill } = require('../models/fill');



async function main() {
    // 1. get command line args
    const parser = getParser();
    let args = await getArgs(parser, process.argv.slice(2));

    // 2. get and convert data from excel, get schema and buildPages according to the stream
    let { converted_data, schema, buildPages } = await getSourceData(args);

    // 3. add validated data to args
    args["data"] = converted_data;

    // 4. validate the args
    await getValidatedData(schema, args, "Args");

    // 5. fill the form
    await fill(args, buildPages);

}


// run the main function with timing
(async function run() {
    const timedMain = timing(main);
    await timedMain()
})();
