/*
    Adaptor for PR Renewal form

*/

const { getAddress, is_same_address, getPhone } = require("../../libs/contact");
const { bestMatch } = require("../../libs/utils");
const countries = require("./countries");

const getAddressHistory = (address) => {
    let address_history = [];
    for (const addr of address) {
        address_history.push({
            "from": addr.start_date.replace(/-/g, '/'),
            "to": addr.end_date ? addr.end_date.replace(/-/g, '/') : null,
            "address": addr.street_and_number,
            "city": addr.city,
            "province": addr.province,
            "country": bestMatch(addr.country, Object.keys(countries)),
        });
    }

    return address_history;
}

const getEducationHistory = (education) => {
    let education_history = [];
    for (const edu of education) {
        education_history.push({
            "from": edu.start_date.replace(/-/g, "/"),
            "to": edu.end_date ? edu.end_date.replace(/-/g, "/") : "",
            "name": edu.school,
            "activity": "study",
            "city": edu.city,
            "country": bestMatch(edu.country, Object.keys(countries)),
        });
    }

    return education_history;
}

const getEmploymentHistory = (employment) => {
    let employment_history = [];
    for (const emp of employment) {
        employment_history.push({
            "from": emp.start_date.replace(/-/g, "/"),
            "to": emp.end_date ? emp.end_date.replace(/-/g, "/") : "",
            "name": emp.company,
            "activity": "work",
            "city": emp.city,
            "country": bestMatch(emp.country, Object.keys(countries)),
        });
    }

    return employment_history;
}

// merge edu and emp history based on date sequence
const getEduEmpHistory = (data) => {
    const education_history = getEducationHistory(data.education);
    const employment_history = getEmploymentHistory(data.employment);
    const history = [...education_history, ...employment_history];

    history.sort((a, b) => new Date(b.from) - new Date(a.from));
    return history;
}

// get absences 
const getAbsences = (data) => {
    const reasons = {
        "A": "1: A",
        "B": "2: B",
        "C": "3: C",
        "Other": "4: Other",
    }
    let absences = [];
    for (const absence of data.absence) {
        absences.push(
            {
                "from": absence.start_date.replace(/-/g, "/"),
                "to": absence.end_date ? absence.end_date.replace(/-/g, "/") : "",
                "city_country": absence.city + "/" + absence.country,
                "reason": reasons[absence.reason],
                "other_explaination": absence.explain,
            }
        );
    }

    return absences;
}

const provinces = {
    "Alberta": "1: 09",
    "British Columbia": "2: 11",
    "Manitoba": "3: 07",
    "New Brunswick": "4: 04",
    "Newfoundland and Labrador": "5: 01",
    "Nova Scotia": "6: 03",
    "Northwest Territories": "7: 10",
    "Nunavut": "8: 64",
    "Ontario": "9: 06",
    "Prince Edward Island": "10: 02",
    "Quebec": "11: 05",
    "Saskatchewan": "12: 08",
    "Yukon": "13: 12"
};

const provinces_abbr = {
    "AB": "1: 09",
    "BC": "2: 11",
    "MB": "3: 07",
    "NB": "4: 04",
    "NL": "5: 01",
    "NS": "6: 03",
    "NT": "7: 10",
    "NU": "8: 64",
    "ON": "9: 06",
    "PE": "10: 02",
    "QC": "11: 05",
    "SK": "12: 08",
    "YT": "13: 12"
};

const situations = {
    "Renew your present PR card": "1: renew",
    "Replace a lost, stolen or damaged PR card": "2: replace",
    "Obtain your first PR card": "3: first",
}

const phone_map = {
    "residential": "1: 01",
    "cellular": "2: 02",
    "business": "3: 03",
}

/**
 * 
upload is not supported yet
 */
// if the application is urgent, provide the related documents
// const urgent_documents = {
//     "Job opportunity": "1: 83",
//     "Work related to your current job": "2: 84",
//     "Your own serious illness": "3: 85",
//     "Death of a family member": "4: 86",
//     "Serious illness of a family member": "5: 87",
//     "You are in a crisis, emergency, or vulnerable situation": "6: 88"
// }

// const forms = {
//     "IMM 5644": "Document Checklist",
//     "IMM 5476": "Use of a Representative",
//     "IMM 5475": "Authority to Release Personal Information to a Designated Individual",
//     "IRM 0002": "Request for a Change of Sex or Gender Identifier",
//     "IRM 0004": "Confirmation of Eligibility for a Reclaimed Name Change",
//     "IRM 0005": "Statutory Declaration to Reclaim an Indigenous Name on Canadian Citizenship Certificates or Permanent Resident Cards",
//     "IMM 5409": "Statutory Declaration of Common-Law Union"
// }

// const photos = {
//     "photo_front": "Upload your photo (front)",
//     "photo_back": "Upload your photo (back)",
// }



const renewAdaptor = (data) => {
    const app = data.prrenew;
    const p = data.personal;

    const residential_addr = getAddress(data.address, "residential_address", ["Canada"]);
    const mailing_addr = getAddress(data.address, "mailing_address", ["Canada"]);
    residential_addr.province = provinces_abbr[residential_addr.province];
    mailing_addr.province = provinces_abbr[mailing_addr.province];

    const phones = getPhone(data.phone);
    phones.preferredPhone.type = phone_map[phones.preferredPhone.type];
    if (phones.alternatePhone) { phones.alternatePhone.type = phone_map[phones.alternatePhone.type]; }

    const pr_renewal_data = {
        "application": {
            "is_urgent": app.is_urgent === "Yes" ? true : false,
            "situation": situations[app.situation.trim()],
            "uci": p.uci ? p.uci : "",
            "language": app.language,
            "date_became_pr": app.date_became_pr.replace(/-/g, "/"),
            "place_became_pr": app.place_became_pr,
            "province_became_pr": provinces[app.province_became_pr],
        },
        "personal": {
            "first_name_on_landing_paper": app.first_name_on_landing_paper,
            "last_name_on_landing_paper": app.last_name_on_landing_paper,
            "name_changed": app.name_changed === "Yes" ? true : false,
            "current_first_name": p.first_name,
            "current_last_name": p.last_name,
            "gender": p.sex,
            "eye_color": p.eye_color,
            "height": p.height ? p.height.toString() : "",
            "dob": p.dob.replace(/-/g, '/'),
            "country_of_birth": p.country_of_birth,
            "country_of_citizenship": p.citizen,
            "more_than_one_citizenship": p.citizen2 ? true : false,
            "other_citizenships": p.citizen2,
            "email": p.email,
            "residential_address": residential_addr,
            "mailing_address_is_same": is_same_address(residential_addr, mailing_addr),
            "mailing_address": mailing_addr,
            "phone": phones.preferredPhone,
            "has_alternate_phone": phones.alternatePhone ? true : false,
            "alternate_phone": phones.alternatePhone,
            "marital_status": data.marriage.marital_status,
            "married_date": data.marriage.married_date.replace(/-/g, "/"),
        },
        "immigration_history": {
            "had_removal_order": app.had_removal_order === "Yes" ? true : false,
            "had_inadmissibility_report": app.had_inadmissibility_report === "Yes" ? true : false,
            "had_lost_pr_status": app.had_lost_pr_status === "Yes" ? true : false,
            "submitted_appeal": app.submitted_appeal === "Yes" ? true : false,
            "has_PRTD": app.has_PRTD === "Yes" ? true : false,
            "PRTD": app.PRTD,
            "explaination": app.explaination,
        },
        "personal_history": {
            "address": getAddressHistory(data.addresshistory),
            "work_education": getEduEmpHistory(data),
        },
        "residency_obligation": {
            "traveled_outside_canada": app.traveled_outside_canada === "Yes" ? true : false,
            "employed_outside_canada": app.employed_outside_canada === "Yes" ? true : false,
            "accompanied_canadian_citizen": app.accompanied_canadian_citizen === "Yes" ? true : false,
            "accompanied_pr": app.accompanied_pr === "Yes" ? true : false,
            "has_humanitarian_reason": app.has_humanitarian_reason === "Yes" ? true : false,
            "humanitarian_reason": app.humanitarian_reason,
            "absences": getAbsences(data),
        },
        "upload": {

        }
    }

    return pr_renewal_data;
}


module.exports = { renewAdaptor }