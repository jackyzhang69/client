/*
    1. get data from excel
    2. convert data to pr data by using the adaptor
    3. validate the data by using the schema, which based on the stream

*/

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const argparse = require('argparse');
const { Excel } = require('../libs/source');
const { print } = require('../libs/output')

// get args from command line
function getArgs(parser, arguments) {
    const args = parser.parse_args(arguments);

    // if pdf or pnp is provided, screen_snap_folder must be provided
    if ((args.pdf || args.png) && !args.screen_snap_folder) {
        print("screen_snap_folder must be provided if pdf or png is provided. ", "error");
        print("Exp: use -sf ./screenshots to specify the folder to save screenshots. ", "info");
        process.exit(1);
    }

    // check folder,file is valide and exists
    if (!fs.existsSync(args.pa_excel)) {
        print(`${args.source_excel} file does not exist`, "error");
        process.exit(1);
    }

    if ((args.pdf || args.png) && !fs.existsSync(args.screen_snap_folder)) {
        print(`${args.screen_snap_folder} does not exist`, "error");
        process.exit(1);
    }

    if (args.upload_folder && !fs.existsSync(args.upload_folder)) {
        print(`${args.upload_folder} does not exist`, "error");
        process.exit(1);
    }

    dotenv.config({ path: path.join(process.env.HOME, '.immenv') });
    const rcic = args.rcic || process.env.rcic;

    const config = {
        pa_excel: args.pa_excel,
        sp_excel: args.sp_excel,
        dp_excel: args.dp_excel,
        forms: args.forms || ["5562", "5669", "5406", "0008"],
        skipToPage: args.skipToPage,
        start_skip_page: 5,
        renew: false,
        account: process.env[`${rcic}_prportal_account`],
        password: process.env[`${rcic}_prportal_password`],
        update: args.update,
        pdf: args.pdf,
        png: args.png,
        screen_snap_folder: args.screen_snap_folder,
        upload_folder: args.upload_folder,
        headless: args.headless,
        slow_mo: args.slow_mo || 300, // default 300ms for fast network
        view_port_size: {
            width: args.view_port_size[0],
            height: args.view_port_size[1]
        },
        defaultTimeOut: args.defaultTimeOut
    };

    return config;
}


function getParser() {
    const parser = new argparse.ArgumentParser({
        description: 'Get args for PR portal web form filler'
    });


    parser.add_argument('pa_excel', {
        help: 'Path to the principle applicant Excel file'
    });

    parser.add_argument('-sp', '--sp_excel', {
        help: 'Path to the spouse applicant Excel file'
    });

    parser.add_argument('-dp', '--dp_excel', {
        nargs: '+',
        help: 'Path to the dependant applicant(s) Excel file(s)'
    });

    parser.add_argument('-f', '--forms', {
        nargs: '+',
        help: 'Which forms to fill(0008,5669,5406,5662)'
    });

    parser.add_argument('-s', '--skipToPage', {
        type: 'int',
        default: null,
        help: 'The page number to be skiped to'
    });

    parser.add_argument('--rcic', {
        help: 'RCIC name'
    });

    parser.add_argument('-pdf', '--pdf', {
        action: 'store_true',
        default: false,
        help: 'Save output as PDF'
    });

    parser.add_argument('-png', '--png', {
        action: 'store_true',
        default: false,
        help: 'Save output as PNG'
    });


    parser.add_argument('-sf', '--screen_snap_folder', {
        default: path.join(process.cwd(), 'screenshots'),
        help: 'Folder to save screenshots'
    });


    parser.add_argument('-uf', '--upload_folder', {
        default: path.join(process.cwd(), 'upload'),
        help: 'Folder to upload files'
    });

    parser.add_argument('-hl', '--headless', {
        action: 'store_true',
        default: false,
        help: 'Run in headless mode'
    });

    parser.add_argument('-sm', '--slow_mo', {
        type: 'int',
        default: 0,
        help: 'Delay in milliseconds'
    });

    parser.add_argument('-vp', '--view_port_size', {
        nargs: 2,
        type: 'int',
        default: [1000, 1440],
        help: 'Size of the viewport'
    });

    parser.add_argument('-dt', '--defaultTimeOut', {
        type: 'int',
        default: 240000,
        help: 'Default timeout in milliseconds'
    });
    return parser;
}

async function getSourceData(args) {
    const excel = new Excel(args.pa_excel);
    let paData = excel.json();

    let spData = null;
    if (args.sp_excel) {
        const excel = new Excel(args.sp_excel);
        spData = excel.json();
    }

    let dpData = [];
    if (args.dp_excel) {
        for (let i = 0; i < args.dp_excel.length; i++) {
            const excel = new Excel(args.dp_excel[i]);
            dpData.push(excel.json());
        }
    }

    sourceData = {
        pa: paData,
        sp: spData,
        dp: dpData
    }

    // convert data to ee lmia data by using the adaptor according to the stream
    let converted_data = {};
    let return_data = {};

    if (args.forms.includes('5562')) {
        const { imm5562Adaptor } = require("./adaptors/imm5562")
        const { imm5562Schema } = require('./validators/imm5562');

        converted_data = imm5562Adaptor(sourceData);
        // console.log(JSON.stringify(converted_data, null, 2));
        const imm5562 = { converted_data, schema: imm5562Schema };
        return_data = { ...return_data, imm5562 };
    }
    if (args.forms.includes('5669')) {
        const { imm5669Adaptor } = require("./adaptors/imm5669")
        const { imm5669Schema } = require('./validators/imm5669');
        converted_data = imm5669Adaptor(sourceData);
        // console.log(JSON.stringify(converted_data, null, 2));
        const imm5669 = { converted_data, schema: imm5669Schema };
        return_data = { ...return_data, imm5669 };
    }
    if (args.forms.includes('5406')) {
        const { imm5406Adaptor } = require("./adaptors/imm5406")
        const { imm5406Schema } = require('./validators/imm5406');
        converted_data = imm5406Adaptor(sourceData);
        console.log(JSON.stringify(converted_data, null, 2));
        const imm5406 = { converted_data, schema: imm5406Schema };
        return_data = { ...return_data, imm5406 };
    }
    if (args.forms.includes('0008')) {
        const { imm0008Adaptor } = require("./adaptors/imm0008")
        const { imm0008Schema } = require('./validators/imm0008');
        converted_data = imm0008Adaptor(sourceData);
        // console.log(JSON.stringify(converted_data, null, 2));
        const imm0008 = { converted_data, schema: imm0008Schema };
        return_data = { ...return_data, imm0008 };
    }

    return return_data;
}

// get validatetion
async function getValidatedData(schema, data, dataName) {
    schema.validate(data)
        .then(() => {
            print(`\n${dataName} validated.\n`, style = "success");;
        }).catch((error) => {
            print(`${error}`, style = "error");
            process.exit(1);
        });
}


module.exports = {
    getParser,
    getArgs,
    getSourceData,
    getValidatedData,
}

