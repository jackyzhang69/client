/*
Data adatpor for the register 
*/
const { bestMatch, convertWage } = require('../../libs/utils');
const bcCities = require('./bcCities');
const { EducationHistory } = require('../../libs/education');


const getWorkExperience = (employment) => {
    let work_experience = [];
    for (const job of employment) {
        const work = {
            "job_title": job.job_title,
            "noc_code": job.noc_code,
            "job_hours": job.weekly_hours > 30 ? "Full-time" : "Part-time",
            "start_date": job.start_date,
            "end_date": job.end_date,
            "company_name": job.company,
            "was_in_canada": job.country === "Canada" ? true : false,
        };
        work_experience.push(work);
    }
    return work_experience;
}


const getWorkingAddress = (erAddress) => {
    for (const addr of erAddress) {
        if (addr.variable_type === "working_address" && addr.street_name) {
            return addr;
        }
    }
}

const getLanguage = (language, languageType) => {
    const testTypes = languageType === "English" ? ["IELTS", "CELPIP"] : ["TEF", "TCF"];
    let lang = {};
    for (const l of language) {
        if (testTypes.includes(l.test_type)) {
            lang = l;
            break;
        }
    }

    let return_language = {
        test_type: lang.test_type ? lang.test_type : null,
        test_report_number: lang.registration_number ? lang.registration_number.toString() : null,
        pin: lang.pin ? lang.pin : null,
        listening: lang.listening ? lang.listening.toString() : null,
        reading: lang.reading ? lang.reading.toString() : null,
        speaking: lang.speaking ? lang.speaking.toString() : null,
        writting: lang.writting ? lang.writting.toString() : null,
    };

    if (languageType === "French") {
        return_language["attestation_number"] =
            lang.registration_number ? lang.registration_number.toString() : null;
        return_language["date_session"] = lang.test_date;
    } else {
        return_language["registration_number"] =
            lang.registration_number ? lang.registration_number.toString() : null;
        return_language["date_sign"] = lang.test_date;
    }
    if (!return_language.reading || !return_language.listening || !return_language.speaking || !return_language.writting) {
        return_language = null;
    }

    return return_language;
}


const registerAdaptor = (data) => {
    const streams = {
        "EE-Skilled Worker": "Express Entry BC – Skilled Worker",
        "EE-International Graduate": "Express Entry BC – International Graduate",
        "Skilled Worker": "Skills Immigration – Skilled Worker",
        "International Graduate": "Skills Immigration – International Graduate",
    }

    const edus = {
        "Less than high school": "SSOL",
        "High school": "SSOL",
        "Associate": "AD",
        "Diploma/Certificate": "DCNT",
        "Diploma/Certificate (trades)": "DCT",
        "Bachelor": "BD",
        "Post-graduate diploma": "PBD",
        "Master": "MD",
        "Doctor": "PHD"
    }
    const edu_history = new EducationHistory(data.education);
    const highest_edu = edu_history.highest_obj;

    const currentYear = new Date().getFullYear();
    const password = `Super${currentYear}!`;
    const user_id = data.personal.last_name[0] + data.personal.first_name[0] + data.personal.dob.replace(/-/g, "");

    const working_address = getWorkingAddress(data.eraddress);
    const english = getLanguage(data.language, "English");
    const french = getLanguage(data.language, "French");


    const register = {
        "stream": streams[data.bcpnp.case_stream],
        "login": {
            "username": data.bcpnp.account ? data.bcpnp.account : user_id,
            "password": data.bcpnp.password ? data.bcpnp.password : password,
        },
        "registrant": {
            "have_active_registration": data.bcpnp.have_active_registration === "No" ? false : true,
            "applied_before": data.bcpnp.has_applied_before === "No" ? false : true,
            "previous_file_number": data.bcpnp.pre_file_no
        },
        "education": {
            "highest_level": edus[highest_edu.education_level],
            "graduate_date": highest_edu.end_date,
            "obtained_in_canada": highest_edu.country === "Canada" ? true : false,
            "obtained_in_bc": highest_edu.province === "BC" ? true : false,
            "have_eca": data.personal.did_eca === "No" ? false : true,
            "qualified_supplier": data.personal.eca_supplier,
            "certificate_number": data.personal.eca_number,
            "meet_professional_designation_requirement": data.joboffer.license_met === "No" ? false : true,
            "professional_designation": data.joboffer.license_description,
        },
        "work_experience": getWorkExperience(data.employment),
        "job_offer": {
            "legal_name": data.general.legal_name,
            "operating_name": data.general.operating_name,
            "unit_number": working_address.unit ? working_address.unit.toString() : null,
            "street_address": working_address.street_number + " " + working_address.street_name,
            "city": bcCities[bestMatch(working_address.city, Object.keys(bcCities))],
            "post_code": working_address.post_code,
            "phone": working_address.phone ? working_address.phone.toString() : null,
            "job_title": data.joboffer.job_title,
            "noc_code": data.joboffer.noc,
            "hours_per_week": data.joboffer.hours ? data.joboffer.hours.toString() : null,
            "hourly_rate": convertWage(data.joboffer.wage_rate, data.joboffer.wage_unit, "hourly", data.joboffer.hours / data.joboffer.days, data.joboffer.days).amount.toString(),
            "annual_wage": convertWage(data.joboffer.wage_rate, data.joboffer.wage_unit, "annually", data.joboffer.hours / data.joboffer.days, data.joboffer.days).amount.toString(),
            "current_working_for_employer": data.joboffer.is_working === "No" ? false : true,
            "working_full_time": data.joboffer.hours > 30 ? true : false,
            "meet_regional_requirements": data.bcpnp.regional_exp_alumni
        },
        "language": {
            "has_english": english ? true : false,
            "has_french": french ? true : false,
            "english": english,
            "french": french
        },
        "submit": {
            "pa_name": data.personal.first_name + " " + data.personal.last_name,
            "has_rep": data.rcic ? true : false,
            "rep": {
                "first_name": data.rcic ? data.rcic.first_name : "",
                "last_name": data.rcic ? data.rcic.last_name : "",
                "phone": data.rcic ? data.rcic.telephone.toString() : "",
            }
        }
    };
    if (data.bcpnp.case_stream.startsWith("EE-")) {
        register.ee = {
            "profile_number": data.ee.ee_profile_no,
            "expiry_date": data.ee.ee_expiry_date,
            "validation_code": data.ee.ee_jsvc,
            "score": data.ee.ee_score ? data.ee.ee_score.toString() : null,
            "noc_code": data.ee.ee_noc,
            "job_title": data.ee.ee_job_title,
        }
    }

    return register;
}


module.exports = { registerAdaptor };