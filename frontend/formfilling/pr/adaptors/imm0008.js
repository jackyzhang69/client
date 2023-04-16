
/* 
data = {
    pa: {}, // must not null
    sp: {}, // nullable
    dp: [{}, {}, ...] // nullable
}
*/
const { bestMatch } = require("../../libs/utils");
const {
    cityIndex,
    textIndex,
    sex_map,
    eye_color,
    english_french_map,
    interview_language_map,
    all_languages,
    province_map,
    app_details_province_map,
    city_map,
    immigration_status,
    current_marital_status,
    previous_marital_status,
    phone_type,
    education_level,
    education0008_map,
    language_english_french,
    relationship_to_pa,
    dependant_type
} = require("./data0008");

const Country = require("./country")
const { getAddressByType, getIdByType, is_same_address, getPhone } = require("../../libs/contact");
const { EducationHistory } = require("../../libs/education");
const { truncateString, inRange } = require("./common");
// common part
const getCors = (person) => {
    const cors = person.cor;
    // if current is in Canada, add entry date and place
    if (cors[0].country === "Canada") {
        cors[0].entry_date = person.status.last_entry_date.replace(/-/g, "/");
        cors[0].entry_place = person.status.last_entry_place;
    }
    // change data format
    // 1. if the cor is a citizen country, set end date to today plus 30 years
    let today = new Date();
    today.setFullYear(today.getFullYear() + 30);
    const maxDate = today.toISOString().slice(0, 10).replace(/-/g, '/');

    for (let i = 0; i < cors.length; i++) {
        cors[i].start_date = cors[i].start_date.replace(/-/g, "/");
        cors[i].end_date = cors[i].end_date ? cors[i].end_date.replace(/-/g, "/") : i === 0 && cors[i].status === "Citizen" ? maxDate : null;
        cors[i].country = new Country(cors[i].country).residence_country;
        cors[i]["status_text"] = cors[i].status;
        cors[i].status = textIndex(cors[i].status, immigration_status);
    }
    return cors;
}

const contact_info = (person) => {
    let mail_address = getAddressByType(person.address, "mailing_address");
    let residential_address = getAddressByType(person.address, "residential_address");
    const same_address = is_same_address(mail_address, residential_address);
    // get dropbox index
    mail_country = new Country(mail_address.country);
    residential_country = new Country(residential_address.country);
    mail_address.country = mail_country.residence_country;
    residential_address.country = residential_country.residence_country;

    mail_address.unit = mail_address.unit ? mail_address.unit.toString() : "";
    residential_address.unit = residential_address.unit ? residential_address.unit.toString() : "";

    mail_address.street_number = mail_address.street_number !== null || mail_address.street_number !== undefined ? mail_address.street_number.toString() : "";
    residential_address.street_number = residential_address.street_number !== null || residential_address.street_number !== undefined ? residential_address.street_number.toString() : "";


    phone = getPhone(person.phone);
    phone.preferredPhone.type = textIndex(phone.preferredPhone.type, phone_type);
    phone.preferredPhone.country_code = phone.preferredPhone.country_code.replace(/[^0-9]/g, ''); // remove non-numeric characters
    if (phone.alternatePhone) {
        phone.alternatePhone.type = textIndex(phone.alternatePhone.type, phone_type);
        phone.alternatePhone.country_code = phone.alternatePhone.country_code.replace(/[^0-9]/g, '');
    };

    // truncate string for webform filling limiation
    mail_address.unit = truncateString(mail_address.unit, 10);
    mail_address.street_number = truncateString(mail_address.street_number, 10);
    mail_address.street_name = truncateString(mail_address.street_name, 100);
    mail_address.city = truncateString(mail_address.city, 30);
    mail_address.post_code = truncateString(mail_address.post_code, 10);

    residential_address.unit = truncateString(residential_address.unit, 10);
    residential_address.street_number = truncateString(residential_address.street_number, 10);
    residential_address.street_name = truncateString(residential_address.street_name, 100);
    residential_address.city = truncateString(residential_address.city, 30);
    residential_address.post_code = truncateString(residential_address.post_code, 10);

    return {
        mail_address,
        residential_address,
        same_address,
        phone,
        use_account_email: true,
    }
}
// 1. personal details
const personal_details = (person, role) => {
    const p = person.personal;
    const m = person.marriage;
    const birth_country = new Country(p.country_of_birth);
    const citizen = new Country(p.citizen);
    const citizen2 = p.citizen2 ? new Country(p.citizen2) : null;

    // Dependant only section
    let dependant_data = null;
    if (role !== "PA") {
        dependant_data = {
            accompany_to_canada: p.accompany_to_canada,
            why_not_accompany: p.why_not_accompany,
            relation: textIndex(p.relationship_to_pa, relationship_to_pa),
            dependant_type: p.dependant_type
        }
    }


    const pre_marriage_data = {
        pre_sp_last_name: truncateString(m.pre_sp_last_name, 100),
        pre_sp_first_name: truncateString(m.pre_sp_first_name, 100),
        pre_sp_dob: m.pre_sp_dob.replace(/-/g, "/"),
        pre_relationship_type: textIndex(m.pre_relationship_type, previous_marital_status),
        pre_start_date: m.pre_start_date.replace(/-/g, "/"),
        pre_end_date: m.pre_end_date.replace(/-/g, "/"),
    }

    let marriage_data;
    const marital_status = m.marital_status;
    let previous_married = false;
    // should check previous married is for imm0008 personal details marriage section
    // if in case of separated, divorced, widowed, annulled marriage, previous married should be true
    // so the check box  has been set to Yes by website default
    let should_check_previous_married = true;
    switch (marital_status) {
        case "Married":
        case "Common-law":
            marriage_data = {
                date: m.married_date.replace(/-/g, "/"),
                sp_last_name: truncateString(m.sp_last_name, 100),
                sp_first_name: truncateString(m.sp_first_name, 100),
                previous_married: m.previous_married === "Yes" ? true : false,
                pre_marriage_data
            }
            break;
        case "Separated":
        case "Divorced":
        case "Widowed":
        case "Annulled Marriage":
            previous_married = true;
            should_check_previous_married = false;
            marriage_data = {
                pre_marriage_data
            }
            break;
        case "Single":
        case "Unknown":
            marriage_data = {
                previous_married: m.previous_married === "Yes" ? true : false,
                pre_marriage_data
            }
    }

    const cors = getCors(person);
    const data = {
        role: role,
        relationship_to_pa: p.relationship_to_pa,
        accompany_to_canada: p.accompany_to_canada === "Yes" ? true : false,
        why_not: p.why_not,
        dependant_type: p.dependant_type,
        last_name: truncateString(p.last_name, 100),
        first_name: truncateString(p.first_name, 100),
        full_name: truncateString(p.first_name + " " + p.last_name, 100),
        used_first_name: truncateString(p.used_first_name),
        used_last_name: truncateString(p.used_last_name, 100),
        used_another_name: p.used_first_name && truncateString(p.used_last_name, 100) ? true : false,
        uci: p.uci ? p.uci.toString() : "",
        sex: textIndex(p.sex, sex_map),
        eye_color: textIndex(p.eye_color, eye_color),
        height: inRange(p.height, 30, 271).toString(),  // scope 30cm - 271cm. otherwise get the closer one
        dob: p.dob.replace(/-/g, "/"),
        country_of_birth: birth_country.birth_index,
        place_of_birth: truncateString(p.place_of_birth, 30),
        citizen: citizen.citizen_index,
        citizen2: citizen2 ? citizen2.citizen_index : null,
        cor: cors[0],
        has_previous_cor: person.cor.length > 1,
        previous_cor: cors.length > 1 ? cors.slice(1, 3) : null, // previous cor is maximum  for 2
        marital_status,
        marital_status_index: textIndex(marital_status, current_marital_status),
        previous_married,
        should_check_previous_married,
        marriage_data
    }

    return data;
}
// 2. passport
const passport = (person) => {
    const ids = person.personid;
    const passport = getIdByType(ids, "passport");
    const passport_country = new Country(passport.country);
    const data = {
        number: truncateString(passport.number.toString(), 20),
        country: passport_country.passport_index,
        expiry: passport.expiry_date.replace(/-/g, "/"),
        issued: passport.issue_date.replace(/-/g, "/"),
    }
    return data;
}
// 3 national id
const national_id = (person) => {
    const ids = person.personid;
    const national_id = getIdByType(ids, "id");
    if (!national_id) return null;
    const national_id_country = new Country(national_id.country);
    const data = {
        number: truncateString(national_id.number.toString(), 20),
        country: national_id_country.passport_index,
        expiry: national_id.expiry_date.replace(/-/g, "/"),
        issued: national_id.issue_date.replace(/-/g, "/"),
    }
    return data;
}
// 4 education
const education = (person) => {
    const educations = new EducationHistory(person.education);
    const highest = textIndex(educations.highest ? educations.highest : "None", education0008_map);
    const p = person.personal;
    let years = (p.primary_school_years + p.secondary_school_years + p.post_secondary_school_years + p.other_school_years);
    const data = {
        highest_education: highest,
        number_of_years: inRange(years, 0, 99).toString(),
        current_occupation: truncateString(p.current_occupation, 50),
        intended_occupation: truncateString(p.intended_occupation, 50),
    }
    return data;
}
// 5 language
const language = (person) => {
    const p = person.personal;
    const data = {
        native_language: bestMatch(p.native_language, Object.keys(all_languages)),
        english_french: p.english_french,
        preferred_language: p.which_one_better,
        language_test: p.language_test === "Yes" ? true : false,
    }

    return data;
}

// pa special part
// 1 application details
const application_details = (pa) => {
    const app = pa.prcase;
    let interview_language = bestMatch(app.interview_language, Object.keys(all_languages));
    let intended_city = bestMatch(app.intended_city, Object.keys(city_map[app.intended_province]));
    const data = {
        communication_language: textIndex(app.communication_language, english_french_map),
        interview_language: textIndex(interview_language, interview_language_map),
        need_translator: app.need_translator,
        province: app.intended_province,
        intended_city: intended_city,
    }
    return data;
}
// 2 contact information


const getDp = (dp) => {
    if (!dp || dp.length == 0) {
        return null;
    }
    dp_data = [];
    for (let i = 0; i < dp.length; i++) {
        dp_data.push(
            {
                personal_details: personal_details(dp[i], "DP"),
                passport: passport(dp[i]),
                national_id: national_id(dp[i]),
                education: education(dp[i]),
                language: language(dp[i])
            }
        );
    }
    return dp_data;
}


const imm0008Adaptor = (data) => {
    const imm0008_data = {
        pa: {
            application_details: application_details(data.pa),
            personal_details: personal_details(data.pa, "PA"),
            contact_info: contact_info(data.pa),
            passport: passport(data.pa),
            national_id: national_id(data.pa),
            education: education(data.pa),
            language: language(data.pa)
        },
        sp: data.sp ? {
            personal_details: personal_details(data.sp, "SP"),
            passport: passport(data.sp),
            national_id: national_id(data.sp),
            education: education(data.sp),
            language: language(data.sp)
        } : null,
        dp: getDp(data.dp),
    }
    return imm0008_data;
}

module.exports = { imm0008Adaptor };