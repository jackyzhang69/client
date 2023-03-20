const { timing } = require('../libs/utils');
const { getArgs, getSourceData, getValidatedData } = require('./input');
const { fill } = require('./fill');



async function main() {
    // 1. get command line args
    let args = await getArgs();

    // 2. get and convert data from excel, get schema and buildPages according to the stream
    let { converted_data, schema, buildPages } = getSourceData(args);

    // 3. add validated data to args
    args["data"] = converted_data;

    // 4. validate the args
    console.log(JSON.stringify(args, null, 2));
    await getValidatedData(schema, args, "Args");

    // 5. fill the form
    await fill(args, buildPages);

}


// run the main function with timing
(async function run() {
    const timedMain = timing(main);
    await timedMain()
})();
