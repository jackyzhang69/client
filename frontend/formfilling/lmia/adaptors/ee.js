/*
This module is an adaptor converting the data from excel to the data for the LMIA EE stream  form filling.
*/

const { commonData } = require("./common")

// create the adapter to convert the source data to the format of output data
const eeConvert = (data) => {
    // pr 
    let why_qualified = data.personalassess.work_experience_brief + " " + data.personalassess.education_brief + " " + data.personalassess.language_brief + " " + data.personalassess.competency_brief + " " + data.personalassess.language_brief;
    if (data.personalassess.performance_remark) {
        why_qualified += " " + data.personalassess.performance_remark;
    }

    const pr = {
        support_pr_only: data.lmiacase.purpose_of_lmia == "Supporting Permanent Resident only",
        joined_with_another_employer: data.lmiacase.has_another_employer === "Yes" ? true : false,
        who_currently_filling_the_duties: data.position.who_current_fill,
        how_did_you_find_the_tfw: data.position.how_did_you_find,
        previously_employed: data.position.worked_working == "Yes" ? true : false,
        previous_employment_desc: data.position.worked_working_details,
        how_did_you_determine_the_tfw: why_qualified,
        how_when_offered: data.position.how_when_offer
    }


    // assemble all the converted data
    const convertedData = {
        pr,
        ...commonData(data)
    }
    return convertedData
}

module.exports = {
    eeConvert
}
