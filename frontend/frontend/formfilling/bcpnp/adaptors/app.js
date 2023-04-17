/*
Data adaptor for profile page
*/

const { bestMatch } = require("../../libs/utils");
const { getAddress, is_same_address } = require("../../libs/contact");
const countries = require("./countries");
const bccities = require("./bccities");
const { convertWage } = require("../../libs/utils");
const { getOptionFromAPI } = require("../../libs/ai"); // using AI to get the option


const streams = {
    "EE-Skilled Worker": "Express Entry BC – Skilled Worker",
    "EE-International Graduate": "Express Entry BC – International Graduate",
    "Skilled Worker": "Skills Immigration – Skilled Worker",
    "International Graduate": "Skills Immigration – International Graduate",
}

const legal_structure_map = {
    "Incorporated": "IBC",
    "Limited Liability Partnership": "LLP",
    "Extra-provincially-registered": "EPR",
    "federally-incorporated": "EPR",
    "Other": "Other"
}

const education_map = {
    "High school": "SSOL",
    "Less than high school": "SSOL",
    "Associate": "AD",
    "Diploma/Certificate": "DCNT",
    "Diploma/Certificate (trades)": "DCT",
    "Bachelor": "BD",
    "Post-graduate diploma": "PBD",
    "Master": "M",
    "Doctor": "PHD",
}

const work_permit_map = {
    "Co-op Work Permit": "OO",
    "Exemption from Labour Market Impact Assessment": "OES",
    "Labour Market Impact Assessment Stream": "LMIA",
    "Live-in Caregiver Program": "LMIA",
    "Open Work Permit": "OO",
    "Open work permit for vulnerable workers": "OO",
    "Other": "OES",
    "Post Graduation Work Permit": "OO",
    "Start-up Business Class": "OO",
}

const company_indsutry_map = {
    "Aerospace": "AE",
    "Agriculture": "AG",
    "Biotechnology": "BIO",
    "Communication": "COM",
    "E-Commerce": "EC",
    "Education": "ED",
    "Engineering": "EN",
    "Entertainment": "ET",
    "Financial": "FIN",
    "Food Processing": "FF",
    "Health (Physicians)": "HP",
    "Health (Registered Nurses)": "HRN",
    "Health (Other)": "HO",
    "High Technology": "HT",
    "Hospitality": "H",
    "Information Technologies": "IT",
    "Manufacturing": "M",
    "Natural Resources": "NR",
    "Professional Business Services": "PBS",
    "Property Management": "PMT",
    "Recreation": "REC",
    "Retail": "R",
    "Skilled Trade": "ST",
    "Tourism/Culture": "TC",
    "Transportation": "T",
}

const prov_province = {
    "AB": "Alberta",
    "BC": "British Columbia",
    "MB": "Manitoba",
    "NB": "New Brunswick",
    "NL": "Newfoundland & Labrador",
    "NS": "Nova Scotia",
    "NT": "Northwest Territories",
    "NU": "Nunavut",
    "ON": "Ontario",
    "PE": "Prince Edward Island",
    "QC": "Quebec",
    "SK": "Saskatchewan",
    "YT": "Yukon",
}

const family_imm_status_canada_map = {
    "Citizen": "C",
    "Permanent Resident": "PR",
    "Refugee Claimant": "RC",
    "Student": "S",
    "Visitor": "V",
    "Worker": "W",
    "Other": "OTH",
}

const post_secondary_levels = [
    "Doctor",
    "Master",
    "Post-graduate diploma",
    "Bachelor",
    "Associate",
    "Diploma/Certificate",
];

const field_of_study_map = {
    "Aboriginal and foreign languages, literatures and linguistics": "AFLLL",
    "Agriculture, agriculture operations and related sciences": "ARS",
    "Architecture and related services": "AARS",
    "Area, ethnic, cultural, gender, and group studies": "AECG",
    "Biological and Biomedical Sciences": "BABS",
    "Business, management, marketing and related support services": "BMAMCOJ",
    "Communication, journalism and related programs": "CJRP",
    "Communications technologies/technicians and support services": "CT",
    "Computer and information sciences and support services": "CS",
    "Construction Trades": "CTD",
    "Culinary Services": "CSEV",
    "Education": "E",
    "Engineering technologies and engineering-related fields": "ENG",
    "English language and literature/letters": "ENGLL",
    "Family and consumer sciences/human sciences": "FCSHS",
    "French language and literature/letters": "FLLL",
    "Health professions and related programs": "HP",
    "History": "HI",
    "Legal Profession and Studies": "LPAS",
    "Liberal arts and sciences, general studies and humanities": "LAAS",
    "Library Sciences": "LS",
    "Mathematics and Statistics": "MAS",
    "Mechanic and repair technologies/technicians": "M",
    "Military science, leadership and operational art": "MSLOA",
    "Military technologies and applied sciences": "MTAS",
    "Natural Resources and Conservation": "NRAC",
    "Parks, recreation, leisure and fitness studies": "PRLFS",
    "Personal and culinary services": "PCS",
    "Philosophy and Religious Studies": "PARS",
    "Physical Sciences": "PS",
    "Precision production": "PP",
    "Pre-technology education/pre-industrial arts programs": "PTEPRIAP",
    "Psychology": "P",
    "Public administration and social service professions": "PA",
    "Science technologies/technicians": "STT",
    "Security and protective services": "SPS",
    "Social sciences": "SS",
    "Transportation and materials moving": "TMM",
    "Visual and Performing Arts": "VAPA",
    "Other": "OTH",
}

async function getSector(industry) {
    const option = await getOptionFromAPI(industry, Object.keys(company_indsutry_map));
    return company_indsutry_map[option];
}


async function getFieldofStudy(field) {
    const option = await getOptionFromAPI(field, Object.keys(field_of_study_map));
    return field_of_study_map[option];
}


const getHighSchool = (data) => {
    let highSchool = [];
    for (let edu of data.education) {
        if (edu.education_level === "High school") {
            const high_school = {
                "from": edu.start_date,
                "to": edu.end_date,
                "school_name": edu.school_name,
                "city": edu.city,
                "country": bestMatch(edu.country, Object.keys(countries)),
                "completed": edu.graduate_date ? true : false
            }
            highSchool.push(high_school);
        }
    }
    return highSchool;
}


const getEducation = (education_level, is_trade) => {

    return is_trade && education_level == "Diploma/Certificate" ? education_map[education_level + " (trades)"] : education_map[education_level];

};


async function getPostSecondaryData(edu) {
    let province = null;
    if (edu.country && edu.country.toUpperCase() === "CANADA" && edu.province) {
        edu.province.length === 2 ?
            province = bestMatch(edu.province, Object.keys(prov_province))
            :
            province = bestMatch(edu.province, Object.values(prov_province));
    }

    return {
        "from": edu.start_date,
        "to": edu.end_date,
        "school_name": edu.school_name,
        "city": province === "BC" || province === "British Columbia" ? bestMatch(edu.city, bccities) : edu.city,
        "province": province,
        "level": getEducation(edu.education_level, edu.is_trade),
        "field_of_study": await getFieldofStudy(edu.field_of_study),
        "original_field_of_study": edu.field_of_study,
    };
}

async function getBCPostSecondary(data) {
    let BCPostSecondaries = [];
    for (let edu of data.education) {
        if (post_secondary_levels.includes(edu.education_level) && (edu.province.toUpperCase() === "BC" || edu.province.toUpperCase() === "BRITISH COLUMBIA")) {
            const bc_post_secondary = await getPostSecondaryData(edu)
            BCPostSecondaries.push(bc_post_secondary);
        }
    }
    return {
        "has_bc_post_secondary": BCPostSecondaries.length > 0 ? true : false,
        "data": BCPostSecondaries
    };
}

async function getCanadaPostSecondary(data) {
    let CanadaPostSecondaries = [];
    for (let edu of data.education) {
        if (post_secondary_levels.includes(edu.education_level) && edu.country.toUpperCase() === "CANADA" && edu.province.toUpperCase() !== "BC" && edu.province.toUpperCase() !== "BRITISH COLUMBIA") {
            const canada_post_secondary = await getPostSecondaryData(edu)
            CanadaPostSecondaries.push(canada_post_secondary);
        }
    }
    return {
        "has_canada_post_secondary": CanadaPostSecondaries.length > 0 ? true : false,
        "data": CanadaPostSecondaries
    };
}

async function getInternationalPostSecondary(data) {
    let InternationalPostSecondaries = [];
    for (let edu of data.education) {
        if (post_secondary_levels.includes(edu.education_level) && edu.country.toUpperCase() !== "CANADA") {
            const international_post_secondary = await getPostSecondaryData(edu)
            international_post_secondary.country = bestMatch(edu.country, Object.keys(countries));
            InternationalPostSecondaries.push(international_post_secondary);
        }
    }
    result = {
        "has_international_post_secondary": InternationalPostSecondaries.length > 0 ? true : false,
        "data": InternationalPostSecondaries
    };
    return result;
}

const getWorkExperience = (data) => {
    let workExperiences = [];
    for (let work of data.employment) {
        if (work.bcpnp_qualified === "No") continue;

        const work_experience = {
            "job_title": work.job_title,
            "noc_code": work.noc_code,
            "start_date": work.start_date,
            "end_date": work.end_date,
            "job_hours": work.weekly_hours >= 30 ? "Full-time" : "Part-time",
            "company": work.company,
            "phone": work.phone_of_certificate_provider ? work.phone_of_certificate_provider.toString() : "",
            "website": work.website ? work.website : "",
            "unit": work.unit ? work.unit.toString() : "",
            "street_address": work.street_address,
            "city": work.city,
            "province": work.province,
            "country": bestMatch(work.country, Object.keys(countries)),
            "postcode": work.postcode ? work.postcode.toString() : "",
            "duties": work.duties,
        }
        workExperiences.push(work_experience);
    }
    return {
        "has_work_experience": workExperiences.length > 0 ? true : false,
        "data": workExperiences
    };

}

const getFamilyMember = (data, relationship) => {
    for (let member of data.family) {
        if (member.relationship === relationship) {
            return member
        }
    }
}

const getFamilyMembers = (data, relationships) => {
    let familyMembers = [];
    for (let member of data.family) {
        if (relationships.includes(member.relationship)) {
            familyMembers.push(member)
        }
    }
    return familyMembers;
}

const getSpouse = (data) => {
    const spouse = getFamilyMember(data, "Spouse");
    const spouse_data = {
        "first_name": spouse.first_name,
        "last_name": spouse.last_name,
        "gender": data.personal.sex === "Male" ? "Female" : "Male",
        "date_of_birth": spouse.date_of_birth,
        "country_of_birth": bestMatch(spouse.birth_country, Object.keys(countries)),
        "country_of_citizenship": bestMatch(spouse.country_of_citizenship, Object.keys(countries)),
        "address": spouse.address,
        "date_of_marriage": data.marriage.married_date,
        "sp_in_canada": data.marriage.sp_in_canada,
        "sp_canada_status": data.marriage.sp_canada_status,
        "sp_canada_status_end_date": data.marriage.sp_canada_status_end_date,
        "sp_canada_occupation": data.marriage.sp_canada_occupation,
        "sp_canada_employer": data.marriage.sp_canada_employer,
        "is_working": data.marriage.sp_canada_employer ? true : false,
    }
    return spouse_data;
}

const getParentsData = (parent) => {
    return {
        "first_name": parent.first_name,
        "last_name": parent.last_name,
        "date_of_birth": parent.date_of_birth,
        "country_of_birth": bestMatch(parent.birth_country, Object.keys(countries)),
        "deceased": parent.date_of_death ? true : false,
        "address": parent.address,
    }
}
const getMother = (data) => {
    const mother = getFamilyMember(data, "Mother");
    return getParentsData(mother);
}

const getFather = (data) => {
    const father = getFamilyMember(data, "Father");
    return getParentsData(father);
}

const getChildren = (data) => {
    const children = getFamilyMembers(data, ["Son", "Daughter"]);
    let childrenData = [];
    for (let child of children) {
        childrenData.push({
            "first_name": child.first_name,
            "last_name": child.last_name,
            "date_of_birth": child.date_of_birth,
            "country_of_birth": bestMatch(child.birth_country, Object.keys(countries)),
            "country_of_citizenship": bestMatch(child.country_of_citizenship, Object.keys(countries)),
            "address": child.address,
        })
    }
    return {
        "has_children": childrenData.length > 0 ? true : false,
        "children": childrenData
    };
}

const getSibling = (data) => {
    const siblings = getFamilyMembers(data, ["Brother", "Sister"]);
    let siblingsData = [];
    for (let sibling of siblings) {
        siblingsData.push({
            "first_name": sibling.first_name,
            "last_name": sibling.last_name,
            "date_of_birth": sibling.date_of_birth,
            "country_of_birth": bestMatch(sibling.birth_country, Object.keys(countries)),
            "marital_status": sibling.marital_status,
            "deceased": mother.date_of_death ? true : false,
            "address": sibling.address,
        })
    }
    return {
        "has_siblings": siblingsData.length > 0 ? true : false,
        "siblings": siblingsData
    };
}

const getOtherFamilyInCanada = (data) => {
    let otherFamilyInCanada = [];
    for (let member of data.canadarelative) {
        otherFamilyInCanada.push({
            "first_name": member.first_name,
            "last_name": member.last_name,
            "gender": member.sex,
            "relationship": member.relationship,
            "city": member.city,
            "province": prov_province[member.province],
            "status": family_imm_status_canada_map[member.status],
            "years_in_canada": member.years_in_canada,
        })
    }
    return {
        "has_other_family_in_canada": otherFamilyInCanada.length > 0 ? true : false,
        "other_family_in_canada": otherFamilyInCanada
    };
}


const getContact = (data) => {
    for (const contact of data.contact) {
        if (contact.variable_type === "primary") {
            return {
                "last_name": contact.last_name,
                "first_name": contact.first_name,
                "job_title": contact.position,
                "phone": contact.phone ? contact.phone.toString() : "",
                "email": contact.email,
            };
        }
    }

}

const getWorkingAddress = (address) => {
    let workingAddress = [];
    for (const addr of address) {
        if (addr.variable_type === "working_address" && addr.street_name) {
            workingAddress.push({
                "unit": addr.unit ? addr.unit : "",
                "street_address": addr.street_number + " " + addr.street_name,
                "city": addr.city,
                "phone": addr.phone ? addr.phone.toString() : "",
            });
        }
    }
    return workingAddress;
}

const getEndDate = (job_duration, job_duration_unit) => {
    const currentDate = new Date();
    let endDate;

    switch (job_duration_unit) {
        case 'day':
            endDate = new Date(currentDate.setDate(currentDate.getDate() + job_duration));
            break;
        case 'week':
            endDate = new Date(currentDate.setDate(currentDate.getDate() + (job_duration * 7)));
            break;
        case 'month':
            endDate = new Date(currentDate.setMonth(currentDate.getMonth() + job_duration));
            break;
        case 'year':
            endDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + job_duration));
            break;
        default:
            console.error('Invalid job_duration_unit');
            return null;
    }

    // Convert the end date to "yyyy-mm-dd" format
    const endDateString = endDate.toISOString().slice(0, 10);
    return endDateString;
}


const getLanguage = (language, index) => {
    if (!language || language.length === 0) {
        return null;
    }
    let lang = {};
    if (index === 0) {
        lang = language[0];
    } else if (index === 1) {
        language.length > 1 ? lang = language[1] : null;
    }

    if (lang === null) return null;

    let return_language = {
        test_type: lang.test_type ? lang.test_type : null,
        test_report_number: lang.registration_number ? lang.registration_number.toString() : null,
        pin: lang.pin ? lang.pin : null,
        listening: lang.listening ? lang.listening.toString() : null,
        reading: lang.reading ? lang.reading.toString() : null,
        speaking: lang.speaking ? lang.speaking.toString() : null,
        writting: lang.writting ? lang.writting.toString() : null,
    };

    if (lang.test_type !== "IELTS" && lang.test_type !== "CELPIP") {
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



async function appAdaptor(data) {
    const business_address = getAddress(data.eraddress, "business_address", countries);
    const mailing_address = getAddress(data.eraddress, "mailing_address", countries);
    const hourly_wage = convertWage(data.joboffer.wage_rate, data.joboffer.wage_unit, "hourly", data.joboffer.hours / data.joboffer.days, data.joboffer.days).amount.toString();
    const annual_wage = convertWage(data.joboffer.wage_rate, data.joboffer.wage_unit, "annually", data.joboffer.hours / data.joboffer.days, data.joboffer.days).amount.toString();

    const bc_post_secondary = await getBCPostSecondary(data);
    const canada_post_secondary = await getCanadaPostSecondary(data);
    const international_post_secondary = await getInternationalPostSecondary(data);

    const work_experience = getWorkExperience(data);
    const pt_number = data.general.pt_employee_number ? data.general.pt_employee_number : 0
    const ft_number = (data.general.ft_employee_number + pt_number / 2).toString()

    const spouse = getSpouse(data);
    const economic_sector = await getSector(data.general.industry);

    const first_language = getLanguage(data.language, 0);
    const second_language = getLanguage(data.language, 1);

    const appData = {
        "stream": streams[data.bcpnp.case_stream],
        "login": {
            "username": data.bcpnp.account ? data.bcpnp.account : user_id,
            "password": data.bcpnp.password ? data.bcpnp.password : password,
        },
        "applicant": {
            "intended_city": data.bcpnp.intended_city,
            "has_bc_drivers_license": data.bcpnp.has_bc_drivers_license === "Yes" ? true : false,
            "has_lmia": data.bcpnp.has_lmia === "Yes" ? true : false,
            "has_first_language": first_language ? true : false,
            "has_second_language": second_language ? true : false,
            "did_eca": data.personal.did_eca === "Yes" ? true : false,
            "regional_exp_alumni": data.bcpnp.regional_exp_alumni == "Yes" ? true : false,
            "about_application": {
                "q1": data.bcpnp.q1 == "Yes" ? true : false,
                "q1_explaination": data.bcpnp.q1_explaination,
                "q2": data.bcpnp.q2 == "Yes" ? true : false,
                "q2_explaination": data.bcpnp.q2_explaination,
                "q3": data.bcpnp.q3 == "Yes" ? true : false,
                "q3_explaination": data.bcpnp.q3_explaination,
                "q4": data.bcpnp.q4 == "Yes" ? true : false,
                "q4_file_number": data.bcpnp.q4_file_number,
                "q4_explaination": data.bcpnp.q4_explaination,
                "q5": data.bcpnp.q5 == "Yes" ? true : false,
                "q5_explaination": data.bcpnp.q5_explaination,
                "q6": data.bcpnp.q6 == "Yes" ? true : false,
                "q6_explaination": data.bcpnp.q6_explaination,
                "q7": data.bcpnp.q7 == "Yes" ? true : false,
                "q7_explaination": data.bcpnp.q7_explaination,
            },
            "ee": {
                "ee_profile_no": data.ee.ee_profile_no,
                "ee_expiry_date": data.ee.ee_expiry_date,
                "ee_jsvc": data.ee.ee_jsvc ? data.ee.ee_jsvc.toString() : "",
                "ee_score": data.ee.ee_score ? data.ee.ee_score.toString() : "",
                "ee_noc": data.ee.ee_noc ? data.ee.ee_noc.toString() : "",
                "ee_job_title": data.ee.ee_job_title,
            },
            "status": {
                "in_canada": data.status.current_country === "Canada" ? true : false,
                "uci": data.personal.uci ? data.personal.uci.toString() : "",
                "current_country": data.status.current_country,
                "current_country_status": data.status.current_country_status,
                "current_workpermit_type": work_permit_map[data.status.current_workpermit_type],
                "has_vr": data.status.has_vr,
                "current_status_start_date": data.status.current_status_start_date,
                "current_status_end_date": data.status.current_status_end_date,
                "other_status_explaination": data.status.other_status_explaination,
                "last_entry_date": data.status.last_entry_date,
                "last_entry_place": data.status.last_entry_place,
            }
        },
        "education": {
            "high_school": getHighSchool(data),
            "has_bc_post_secondary": bc_post_secondary.has_bc_post_secondary,
            "bc_post_secondary": bc_post_secondary.has_bc_post_secondary ? bc_post_secondary.data : null,
            "has_canada_post_secondary": canada_post_secondary.has_canada_post_secondary,
            "canada_post_secondary": canada_post_secondary.has_canada_post_secondary ? canada_post_secondary.data : null,
            "has_international_post_secondary": international_post_secondary.has_international_post_secondary,
            "international_post_secondary": international_post_secondary.has_international_post_secondary ? international_post_secondary.data : null,
        },
        "work_experience": {
            "has_work_experience": work_experience.has_work_experience,
            "work_experience": work_experience.has_work_experience ? work_experience.data : null,
        },
        "family": {
            "has_spouse": ["Married", "Common-Law"].includes(data.marriage.marital_status) ? true : false,
            "spouse": spouse,
            "mother": getMother(data),
            "father": getFather(data),
            "has_children": getChildren(data).has_children,
            "children": getChildren(data).children,
            "has_sibling": getSibling(data).has_sibling,
            "sibling": getSibling(data).data,
            "has_other_family_in_canada": getOtherFamilyInCanada(data).has_other_family_in_canada,
            "other_family_in_canada": getOtherFamilyInCanada(data).data,
        },
        // within Job offer page
        "company_details": {
            "legal_name": data.general.legal_name,
            "operating_name": data.general.operating_name ? data.general.operating_name : "",
            "corporate_structure": legal_structure_map[data.general.corporate_structure],
            "registration_number": data.general.registration_number,
            "fulltime_equivalent": ft_number,
            "establish_year": data.general.establish_date.split("-")[0],
            "economic_sector": economic_sector,
            "website": data.general.website,
            "address": business_address,
            "mailing_is_same_as_business": is_same_address(business_address, mailing_address),
            "mailing_address": mailing_address,
            "employer_contact": getContact(data),
        },
        "joboffer": {
            "has_fulltime_jo": data.joboffer.hours >= 30,
            "is_indeterminate": data.joboffer.permanent === "Yes" ? true : false,
            "end_date": !data.joboffer.permanent === "No" ? getEndDate(data.joboffer.job_duration, data.joboffer.job_duration_unit) : null,
            "job_title": data.joboffer.job_title,
            "noc": data.joboffer.noc,
            "require_license": data.joboffer.license_request === "Yes" ? true : false,
            "hours": data.joboffer.hours ? data.joboffer.hours.toString() : "",
            "hourly_wage": hourly_wage ? hourly_wage.toString() : "",
            "annual_wage": annual_wage ? annual_wage.toString() : "",
        },
        "work_location": getWorkingAddress(data.eraddress),
        "submit": {
            "pa_name": data.personal.first_name + " " + data.personal.last_name,
            "spouse_name": spouse ? spouse.first_name + " " + spouse.last_name : null,
            "has_paid_rep": data.rcic.first_name && data.rcic.last_name ? true : false,
            "rcic_first_name": data.rcic.first_name,
            "rcic_last_name": data.rcic.last_name,
            "rcic_phone": data.rcic.telephone ? data.rcic.telephone.toString() : "",
        }
    };

    return appData;
}

module.exports = {
    appAdaptor
};


