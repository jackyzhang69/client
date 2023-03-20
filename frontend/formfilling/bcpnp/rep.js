const { timing } = require('../libs/utils');
const { fill } = require('./fill');
// const { buildProfilePages, updateProfilePages } = require('./pagebuilders/profile');
const { buildRepPages } = require('./pagebuilders/rep');

async function main() {
    // // 1. get command line args
    // let cli_arguments = await getArgs();

    // //2. get login data
    // const login_data = await getLoginData(cli_arguments.rcic)

    // // 3. get and convert data from excel, get schema and buildPages according to the stream
    // let { converted_data, schema, buildPages } = getSourceData(cli_arguments.source_excel);

    // // 4 merge the login data and converted data
    // const lmia_data = { ...login_data, ...converted_data }

    // // 5. validate the form data by using the schema
    // await getValidatedData(schema, lmia_data);

    // // 6 convert command line args part to args
    // let args = cli_arguments.args;


    // // 7. add validated data to args
    // args["stream"] = lmia_data.stream;
    // args["data"] = lmia_data;
    // args["start_skip_page"] = 5; // if skip, must be starting from at least page 5. before that, everytime we have to handle it.
    // args["is_part_of_union"] = lmia_data.job_offer.is_part_of_union;

    // // 8. validate the args
    // const argsSchema = require('./validators/args');
    // await getValidatedArgs(argsSchema, args);

    args = require("./rep.json")

    // 9. fill the form
    // await fill(args, buildProfilePages);
    // await fill(args, updateProfilePages);
    await fill(args, buildRepPages);

}


// run the main function with timing
(async function run() {
    const timedMain = timing(main);
    await timedMain()
})();