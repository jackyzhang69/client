/*
This module is an adaptor converting the data from excel to the data for the LMIA EE stream  form filling.
*/

const { commonData } = require("./common")
const { titleCase } = require("../../libs/utils")

// create the adapter to convert the source data to the format of output data
const lwsConvert = (data) => {
    const d = data.emp5627

    // will provide TFW's name?
    const willProvideTFWName = d.named == "Yes" ? true : false

    // set provide name value in foreign_worker
    let common = commonData(data)
    common.foreign_worker["provide_name"] = willProvideTFWName;

    // accommodation
    const houseTypeMap = {
        "apartment": "Apartment",
        "house": "House",
        "dorm": "DormRoom",
        "other": "Other"
    }

    const accommodation = {
        "provide_accommodation": d.provide_accommodation == "Yes" ? true : false,
        "rate": d.rent_amount ? d.rent_amount.toString() : null,
        "unit": d.rent_unit ? titleCase(d.rent_unit) : null,
        "type": d.accommodation_type ? houseTypeMap[d.accommodation_type] : null,
        "bedrooms": d.bedrooms ? d.bedrooms.toString() : null,
        "occupants": d.people ? d.people.toString() : null,
        "bathrooms": d.bathrooms ? d.bathrooms.toString() : null,
        "description": d.explain,
        "why_not_provide": d.description
    };

    // cap
    const capExemptionMap = {
        "Caregiver positions in a health care facility (NOC 3012, 3233, and 3413)": "CareHCFac",
        "On-farm primary agricultural positions": "OnFarmPrim",
        "Position for the Global Talent Stream": "GTS",
        "Position(s) is/are highly mobile": "PosHMob",
        "Position(s) is/are truly temporary": "PosTTemp",
        "Seasonal 270-day exemption": "Seas180Ex",
    }
    const get_caps = (cap_list) => {
        let caps = []
        for (let i = 0; i < cap_list.length; i++) {
            const d = cap_list[i];
            const cap = {
                "A": d.q_a ? d.q_a.toString() : '0',
                "B": d.q_b ? d.q_b.toString() : '0',
                "C": d.q_c ? d.q_c.toString() : '0',
                "D": d.q_d ? d.q_d.toString() : '0',
                "E": d.q_e ? d.q_e.toString() : '0',
                "F": d.q_f ? d.q_f.toString() : '0',
                "G": d.q_g ? d.q_g.toString() : '0',
                "H": d.q_h ? d.q_h.toString() : '0',
            }
            caps.push(cap)
        }
        return caps;
    }
    const cap = {
        "is_cap_exempted": d.cap_exempted == "Yes" ? true : false,
        "which_exemption": d.which_exemption ? capExemptionMap[d.which_exemption] : null,
        "exemption_details": d.exemption_rationale,
        "in_seasonal_industry": d.is_in_seasonal_industry === "Yes" ? true : false,
        "start_date": (new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
        "end_date": (new Date()).toISOString().slice(0, 10),
        "location_caps": get_caps(data.emp5627cap),
    }

    // assemble all the converted data
    const convertedData = {
        willProvideTFWName,
        accommodation,
        cap,
        ...common
    }
    return convertedData
}

module.exports = {
    lwsConvert
}
