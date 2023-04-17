/*
This is the main entry point for the formfilling frontend. It choose related modules based on the first parameter. and then invoke the module with the rest of the parameters.
*/
const { timing } = require('./libs/utils');
const argparse = require('argparse');
const { fill } = require('./models/fill');


async function main() {
    const program = process.argv[2];
    const arguments = process.argv.slice(3);

    let input;
    let final_buildPages;
    switch (program) {
        case 'pr_renew':
            input = require('./pr/renew_input');
            break;
        case 'pr':
            input = require('./pr/input');
            break;
        case "bcpnp":
            input = require('./bcpnp/input');
            break;
        case "lmia":
            input = require('./lmia/input');
            break;
        default:
            console.log("invalid");
            process.exit(1);
    }

    const { getParser, getArgs, getSourceData, getValidatedData } = input;
    // 1. get command line args
    const parser = getParser();
    let args = await getArgs(parser, arguments);

    if (program !== "pr") {
        // 2. get and convert data from excel, get schema and buildPages according to the stream
        const { converted_data, schema, buildPages } = await getSourceData(args);
        final_buildPages = buildPages;
        // 3. add validated data to args
        args["data"] = converted_data;
        // 4. validate the args
        if (program === "lmia") { // lmia has two data to validate due to it was developed at early stage
            await getValidatedData(schema, converted_data, "Data");
            const argsSchema = require('./lmia/validators/args');
            await getValidatedData(argsSchema, args, "Args");
        } else {
            await getValidatedData(schema, args, "Args");
        }
    } else {
        const { buildPages } = require('./pr/pagebuilders/pr');
        final_buildPages = buildPages;
        // 2. get and convert data from excel, get schema and buildPages according to the stream
        converted_data = await getSourceData(args);
        args["client_account"] = converted_data.client_account;
        delete converted_data.client_account;

        // 3. add validated data to args
        args["data"] = {};
        for (const [key, value] of Object.entries(converted_data)) {
            // 4 validate the data
            await getValidatedData(value.schema, value.converted_data, `Data of ${key}`);
            args["data"][key] = value.converted_data;
        }
    }

    // 5. fill the form
    await fill(args, final_buildPages);

}

// run the main function with timing
(async function run() {
    const timedMain = timing(main);
    await timedMain()
})();