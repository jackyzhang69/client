/*
    1. get data from excel
    2. convert data to bcpnp data by using the adaptor
    3. validate the data by using the schema, which based on the stream

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
        description: 'Get args for BCPNP web form filler'
    });

    parser.add_argument('task', {
        help: 'What task to do. Options: "pro" for profile, "reg" for registration, "app" for application, and "rep" for representative'
    });

    parser.add_argument('source_excel', {
        help: 'Path to the source Excel file'
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

    parser.add_argument('-u', '--update', {
        action: 'store_true',
        default: false,
        help: 'Update the existing profile or representative'
    });

    // parser.add_argument('-uf', '--upload_folder', {
    //     default: path.join(process.cwd(), 'upload'),
    //     help: 'Folder to upload files'
    // });

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


    if (args.screen_snap_folder && !fs.existsSync(args.screen_snap_folder)) {
        print(`${args.screen_snap_folder} does not exist`, "error");
        process.exit(1);
    }

    // if (args.upload_folder && !fs.existsSync(args.upload_folder)) {
    //     print(`${args.upload_folder} does not exist`, "error");
    //     process.exit(1);
    // }


    const config = {
        task: args.task.toUpperCase(),
        source_excel: args.source_excel,
        update: args.update,
        pdf: args.pdf,
        png: args.png,
        screen_snap_folder: args.screen_snap_folder,
        headless: args.headless,
        slow_mo: args.slow_mo,
        view_port_size: {
            width: args.view_port_size[0],
            height: args.view_port_size[1]
        },
        defaultTimeOut: args.defaultTimeOut
    };

    return config;
}


function getSourceData(args) {
    const excel = new Excel(args.source_excel);
    let sourceData = excel.json();

    // convert data to ee lmia data by using the adaptor according to the stream
    let converted_data = {};
    let schema = {};
    let buildPages = {};

    // 
    switch (args.task.toUpperCase()) {
        case 'PRO':
            const { profileAdaptor } = require("./adaptors/profile")
            const { profileSchema } = require('./validators/profile');
            const { buildProfilePages, updateProfilePages } = require('./pagebuilders/profile');
            converted_data = profileAdaptor(sourceData);
            schema = profileSchema;
            buildPages = args.update ? updateProfilePages : buildProfilePages;
            break;
        case 'REG':
            const { registerAdaptor } = require("./adaptors/register")
            const { registerSchema } = require('./validators/register');
            const { buildRegisterPages } = require('./pagebuilders/register');
            converted_data = registerAdaptor(sourceData);
            schema = registerSchema;
            buildPages = buildRegisterPages;
            break;
        case 'REP':
            const { repAdaptor } = require("./adaptors/rep")
            const { repSchema } = require('./validators/rep');
            const { buildRepPages } = require('./pagebuilders/rep');
            converted_data = repAdaptor(sourceData);
            schema = repSchema;
            buildPages = buildRepPages;
            break;
        case 'APP':
            print("Not implemented yet", "error");
            break;
    }
    return { converted_data, schema, buildPages };
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
    getArgs,
    getSourceData,
    getValidatedData,
}

