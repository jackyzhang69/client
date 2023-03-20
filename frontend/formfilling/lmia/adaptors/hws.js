/*
This module is an adaptor converting the data from excel to the data for the LMIA EE stream  form filling.
*/

const { commonData } = require("./common")

// create the adapter to convert the source data to the format of output data
const hwsConvert = (data) => {
    const d = data.emp5626

    // will provide TFW's name?
    const willProvideTFWName = d.named == "Yes" ? true : false
    let common = commonData(data)
    // set provide name value in foreign_worker
    common.foreign_worker["provide_name"] = willProvideTFWName;

    // seasonal information
    seasonal_info = {
        "is_seasonal": d.is_in_seasonal_industry == "Yes" ? true : false,
        "start": d.start_month,
        "end": d.end_month,
        "canadian_workers": d.last_canadian_number ? d.last_canadian_number.toString() : "0",
        "foreign_workers": d.last_tfw_number ? d.last_tfw_number.toString() : "0",
    }

    // 5 activities
    let activities = []
    for (let i = 0; i < 5; i++) {
        if (d[`activity${i}_title`]) {
            activities.push({
                "title": d[`activity${i}_title`],
                "describe": d[`activity${i}_description`],
                "outcome": d[`activity${i}_outcome`],
                "comments": d[`activity${i}_comment`],
            })
        }
    }

    // exempted from transition plan criteria mapping
    let exempted_crieria = {
        "Caregiver positions in health care institutions": "Crgvr",
        "Limited duration positions": "LmtdDrtn",
        "On-farm primary agricultural positions": "FrmPrmAg",
        "Positions within a specialized occupation": "QbcPstn",
        "Unique skills or traits": "SkllsTrts",
    }

    transition_plan = {
        "current_number_of_canadian_workers": d.current_canadian_number ? d.current_canadian_number.toString() : "0",
        "current_number_of_foreign_workers": d.current_tfw_number ? d.current_tfw_number.toString() : "0",
        "exempted_from_tp": d.tp_waivable == "Yes" ? true : false,
        "exempted_crieria": exempted_crieria[d.waive_creteria],
        "exemption_details": d.waive_details,
        "have_completed_tp": d.has_finished_tp == "Yes" ? true : false,
        "previous_tp_results": d.finished_tp_result,
        "activities": activities
    }


    // assemble all the converted data
    const convertedData = {
        willProvideTFWName,
        seasonal_info,
        transition_plan,
        ...common
    }
    return convertedData
}

module.exports = {
    hwsConvert
}
