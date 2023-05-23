
const { getListMatch } = require("../../libs/ai"); // using AI to get the option
const fs = require('fs');
const path = require('path');
const { print } = require("../../libs/output");

// nput as upload_folder to return an object, with the value as full path of the files in the folder, and key as filename without extension. 
const getUploadFiles = (upload_folder) => {
    const files = fs.readdirSync(upload_folder);

    let totalSize = 0;
    const fileMap = {};

    for (const file of files) {
        const name = path.parse(file).name;
        const fullPath = path.join(upload_folder, file);
        const stat = fs.statSync(fullPath);
        const fileSize = stat.size;

        if (fileSize > 3 * 1024 * 1024) {
            throw new Error(`File ${fullPath} is too large (maximum size is 3MB)`);
        }

        totalSize += fileSize;
        if (totalSize > 50 * 1024 * 1024) {
            throw new Error('Total file size exceeds 50MB');
        }

        fileMap[name] = fullPath;
    }

    return fileMap;
}

// get the matched list from the AI API. Key is the target list, value is the source list.
async function appAttachmentAdaptor(args, data) {
    const files_map = await getUploadFiles(args.upload_folder);
    let pa_slots = [];

    if (data.stream.includes("Express Entry")) {
        pa_slots.push("Express entry candidacy");
    }
    if (data.applicant.status.current_country === "Canada") {
        pa_slots.push("Canadian immigration records")
    }
    pa_slots.push(" Biographical page of passport");
    pa_slots.push("Current photograph");

    if (data.applicant.has_bc_drivers_license) {
        pa_slots.push("driver licence");
    }

    if (data.applicant.has_lmia) {
        pa_slots.push("Labour Market Impact Assessment (LMIA)");
    }
    if (data.applicant.has_first_language) {
        pa_slots.push("Language test results (if applicable as per the requirements in our Program Guide)");
    }

    if (data.applicant.has_second_language) {
        pa_slots.push("Language test results in second official language");
    }
    pa_slots.push("Current resume / CV");

    if (data.applicant.did_eca) {
        pa_slots.push("Educational credential assessment (ECA)");
    }

    if (data.education.has_bc_post_secondary || data.education.has_canada_post_secondary || data.education.has_international_post_secondary) {
        pa_slots.push("Education Certificates (Diploma, Degree, etc)"); // surpose all is requried
    }

    if (data.stream.includes("International Graduate")) {
        pa_slots.push("Official education transcript(s)");
    }
    if (data.joboffer.require_license) {
        pa_slots.push("Professional Designation");
    }
    if (data.applicant.regional_exp_alumni) {
        pa_slots.push("Evidence of meeting either Regional Experience or Regional Alumni requirements");
    }

    let sp_slots = []
    if (data.family.has_spouse && data.family.spouse.sp_canada_status === "Worker" && data.family.spouse.is_working) {
        sp_slots.push("Spousal Canadian work permit");
        sp_slots.push("Spousal Canadian two most recent pay stubs");
        sp_slots.push("Spousal Canadian employment offer letter");

    }

    const emp_slots = [
        "Employer Declaration Form",
        "Employer recommendation letter",
        "Signed Job Offer Letter",
        "Detailed job description",
        "Evidence of recruitment",
        "Company information",
        "Certificate of incorporation",
        "Municipal business licence",
    ];
    const upload_slots = pa_slots.concat(sp_slots).concat(emp_slots);

    print(`AI is working to match the files in ${args.upload_folder} with upload slots in BCPNP attachments. Wait for seconds...`, "info");
    let map = await getListMatch(upload_slots, Object.keys(files_map));
    // map = JSON.parse(map);

    // get the full path of files from files map
    const return_map = {};
    for (const key of Object.keys(map)) {
        if (map[key]) {
            return_map[key] = files_map[map[key]];
        } else {
            return_map[key] = null;
        }
    }

    // convert the driver license to webpage text
    return_map["Include front and back of licence"] = return_map["driver licence"];
    delete return_map["driver licence"];

    return return_map;
}

module.exports = { appAttachmentAdaptor };



