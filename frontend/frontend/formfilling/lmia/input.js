/*
    1. get data from excel
    2. convert data to ee lmia data by using the adaptor
    3. validate the data by using the schema
*/

const fs = require('fs');
const os = require('os');
const path = require('path');
const argparse = require('argparse');
const { Excel } = require('../libs/source');
const { print } = require('../libs/output')

// get args from command line
function getArgs() {
    const parser = new argparse.ArgumentParser({
        description: 'Get args for LMIA web form filler'
    });

    parser.add_argument('source_excel', {
        help: 'Path to the source Excel file'
    });
    parser.add_argument('-r', '--rcic', {
        default: 'jacky',
        help: 'RCIC short name'
    });
    parser.add_argument('-p', '--print', {
        action: 'store_true',
        help: 'Print the output to console'
    });
    parser.add_argument('-l', '--lmiaNumber', {
        default: '',
        help: 'LMIA number'
    });
    parser.add_argument('-s', '--skipToPage', {
        type: 'int',
        default: null,
        help: 'The page number to be skiped to'
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
    parser.add_argument('-cj', '--compensation_justification_doc', {
        help: 'Compensation justification document for job in unionized industry'
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

    const args = parser.parse_args();

    // logical check
    // if lmia is provided, skipToPage must be provided and be greater than 5
    if (args.lmiaNumber && (!args.skipToPage || args.skipToPage < 5) && !args.print) {
        print("skipToPage must be provided and be greater than 5. ", "error");
        print("Exp: use -s 20 to specify skipping to page 20 . ", "info");
        process.exit(1);
    }

    // if pdf or pnp is provided, screen_snap_folder must be provided
    if ((args.pdf || args.png) && !args.screen_snap_folder) {
        print("screen_snap_folder must be provided if pdf or png is provided. ", "error");
        print("Exp: use -sf ./screenshots to specify the folder to save screenshots. ", "info");
        process.exit(1);
    }

    // check folder,file is valide and exists
    if (!fs.existsSync(args.source_excel)) {
        print(`${args.source_excel} file does not exist`, "error");
        process.exit(1);
    }

    if (args.compensation_justification_doc && !fs.existsSync(args.compensation_justification_doc)) {
        print(`${args.compensation_justification_doc} file does not exist`, "error");
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


    const config = {
        source_excel: args.source_excel,
        rcic: args.rcic,
        args: {
            print: args.print,
            lmiaNumber: args.lmiaNumber,
            skipToPage: args.skipToPage,
            pdf: args.pdf,
            png: args.png,
            screen_snap_folder: args.screen_snap_folder,
            compensation_justification_doc: args.compensation_justification_doc,
            upload_folder: args.upload_folder,
            headless: args.headless,
            slow_mo: args.slow_mo,
            view_port_size: {
                width: args.view_port_size[0],
                height: args.view_port_size[1]
            },
            defaultTimeOut: args.defaultTimeOut
        }
    };

    return config;
}

async function getLoginData(rcic) {
    try {
        const filePath = path.join(os.homedir(), '.immenv');
        const envVars = {};

        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        fileContents.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key != "") envVars[key] = value;
        });

        const account_key = `${rcic}_lmiaportal_account`
        const password_key = `${rcic}_lmiaportal_password`
        const security_key = `${rcic}_lmiaportal_sequrity_answers`

        return {
            "login": {
                "email": envVars[account_key],
                "password": envVars[password_key]
            },
            "security": JSON.parse(envVars[security_key].slice(1, -1)),
        };
    } catch (error) {
        print(`Error occurred while getting login data. Check your .immenv file to make sure the RCIC ${rcic} has correct lmia account information`, style = "error");
        throw error;
    }
}


function getSourceData(source_excel) {
    // const excel = new Excel("/Users/jacky/Desktop/5593.xlsx");
    const excel = new Excel(source_excel);
    let sourceData = excel.json();

    // 1.5 get which stream to fill
    const stream = sourceData.lmiacase.stream_of_lmia;

    // 2. convert data to ee lmia data by using the adaptor according to the stream
    let converted_data = {};
    let schema = {};
    let buildPages = {};

    // herer, stream is original defined in the excel file
    switch (stream) {
        case 'EE':
            const { eeConvert } = require("./adaptors/ee")
            const eeSchema = require('./validators/ee');
            const buildEEPages = require('./pagebuilders/ee');
            converted_data = eeConvert(sourceData);
            schema = eeSchema;
            buildPages = buildEEPages;
            break;
        case 'HWS':
            const { hwsConvert } = require("./adaptors/hws")
            const hwsSchema = require('./validators/hws');
            const buildHWSPages = require('./pagebuilders/hws');
            converted_data = hwsConvert(sourceData);
            schema = hwsSchema;
            buildPages = buildHWSPages;
            break;
        case 'LWS':
            const { lwsConvert } = require("./adaptors/lws")
            const lwsSchema = require('./validators/lws');
            const buildLWSPages = require('./pagebuilders/lws');
            converted_data = lwsConvert(sourceData);
            schema = lwsSchema;
            buildPages = buildLWSPages;
            break;
    }
    return { converted_data, schema, buildPages };
}

async function getValidatedData(schema, lmia_data) {
    schema.validate(lmia_data)
        .then(() => {
            print("\nData validated.\n", style = "success");;
        }).catch((error) => {
            print(`${error}`, style = "error");
            process.exit(1);
        });
}

async function getValidatedArgs(schema, args) {
    schema.validate(args)
        .then(() => {
            print("\nArgs validated.\n", style = "success");;
        }).catch((error) => {
            print(`${error}`, style = "error");
            process.exit(1);
        });
}


module.exports = {
    getArgs,
    getLoginData,
    getSourceData,
    getValidatedData,
    getValidatedArgs
}

