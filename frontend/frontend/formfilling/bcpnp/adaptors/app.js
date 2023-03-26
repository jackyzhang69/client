/*
Data adaptor for profile page
*/

const { bestMatch } = require("../../libs/utils");
const countries = require("./countries");
const bccities = require("./bccities");
const Address = require("../../libs/address");

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


function getFieldofStudy(field) {
    for (let key in field_of_study_map) {
        if (key.toLowerCase().includes(field.toLowerCase())) {
            return field_of_study_map[key];
        }
    }
    return field_of_study_map["Other"];
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
                "country": bestMatch(edu.country, countries),
                "completed": edu.graduate_date ? true : false
            }
            highSchool.push(high_school);
        }
    }
    return highSchool;
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


const getEducation = (education_level, is_trade) => {

    return is_trade && education_level == "Diploma/Certificate" ? education_map[edu_level + " (trades)"] : education_map[edu_level];

};


function getPostSecondaryData(edu) {
    return {
        "from": edu.start_date,
        "to": edu.end_date,
        "school_name": edu.school_name,
        "city": bestMatch(edu.city, bccities),
        "level": getEducation(edu.level, edu.is_trade),
        "field_of_study": getFieldofStudy(edu.field_of_study),
    };
}

const getBCPostSecondary = (data) => {
    let BCPostSecondaries = [];
    for (let edu of data.education) {
        if (edu.education_level === "Post-secondary" && (edu.province.toUpperCase() === "BC" || edu.province.toUpperCase() === "BRITISH COLUMBIA")) {
            const bc_post_secondary = getPostSecondaryData(edu)
            BCPostSecondaries.push(bc_post_secondary);
        }
    }
    return {
        "has_bc_post_secondary": BCPostSecondaries.length > 0 ? true : false,
        "bc_post_secondary": BCPostSecondaries
    };
}

const getCanadaPostSecondary = (data) => {
    let CanadaPostSecondaries = [];
    for (let edu of data.education) {
        if (edu.education_level === "Post-secondary" && edu.country === "Canada" && edu.province.toUpperCase() !== "BC" && edu.province.toUpperCase() !== "BRITISH COLUMBIA") {
            const canada_post_secondary = getPostSecondaryData(edu)
            CanadaPostSecondaries.push(canada_post_secondary);
        }
    }
    return {
        "has_canada_post_secondary": CanadaPostSecondaries.length > 0 ? true : false,
        "canada_post_secondary": CanadaPostSecondaries
    };
}

const getInternationalPostSecondary = (data) => {
    let InternationalPostSecondaries = [];
    for (let edu of data.education) {
        if (edu.education_level === "Post-secondary" && edu.country !== "Canada") {
            const international_post_secondary = getPostSecondaryData(edu)
            InternationalPostSecondaries.push(international_post_secondary);
        }
    }
    return {
        "has_international_post_secondary": InternationalPostSecondaries.length > 0 ? true : false,
        "international_post_secondary": InternationalPostSecondaries
    };
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
            "phone": work.phone_of_certificate_provider,
            "website": work.website,
            "unit": work.unit,
            "street_address": work.street_address,
            "city": work.city,
            "province": work.province,
            "country": bestMatch(work.country, countries),
            "postcode": work.postcode,
            "duties": work.duties,
        }
        workExperiences.push(work_experience);
    }
    return {
        "has_work_experience": workExperiences.length > 0 ? true : false,
        "work_experience": workExperiences
    };

}

const getFamilyMember = (data, relationship) => {
    for (let member in data.family) {
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
    const data = {
        "first_name": spouse.first_name,
        "last_name": spouse.last_name,
        "gender": data.personal.sex === "Male" ? "Female" : "Male",
        "date_of_birth": spouse.date_of_birth,
        "country_of_birth": bestMatch(spouse.country_of_birth, countries),
        "country_of_citizenship": bestMatch(spouse.country_of_citizenship, countries),
        "address": spouse.address,
        "date_of_marriage": data.personal.married_date,
        "sp_in_canada": data.marriage.sp_in_canada,
        "sp_canada_status": data.marriage.sp_canada_status,
        "sp_canada_status_end_date": data.marriage.sp_canada_status_end_date,
        "sp_canada_occupation": data.marriage.sp_canada_occupation,
        "sp_canada_employer": data.marriage.sp_canada_employer,
    }
    return data;
}

const getParentsData = (data) => {
    return {
        "first_name": mother.first_name,
        "last_name": mother.last_name,
        "date_of_birth": mother.date_of_birth,
        "country_of_birth": bestMatch(mother.country_of_birth, countries),
        "deceased": mother.date_of_death ? true : false,
        "address": mother.address,
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
            "country_of_birth": bestMatch(child.country_of_birth, countries),
            "country_of_citizenship": bestMatch(child.country_of_citizenship, countries),
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
            "country_of_birth": bestMatch(sibling.country_of_birth, countries),
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

const appAdaptor = (data) => {
    const appData = {
        "applicant": {
            "intended_city": data.bcpnp.intended_city,
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
                "ee_jsvc": data.ee.ee_jsvc,
                "ee_score": data.ee.ee_score,
                "ee_noc": data.ee.ee_noc,
                "ee_job_title": data.ee.ee_job_title,
            },
            "status": {
                "in_canada": data.status.current_country === "Canada" ? true : false,
                "current_country": data.status.current_country,
                "current_country_status": data.status.current_country_status,
                "current_workpermit_type": data.status.current_workpermit_type,
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
            "has_bc_post_secondary": getBCPostSecondary(data).hasBCPostSecondary,
            "bc_post_secondary": getBCPostSecondary(data).data,
            "has_canada_post_secondary": getCanadaPostSecondary(data).hasCanadaPostSecondary,
            "canada_post_secondary": getCanadaPostSecondary(data).data,
            "has_international_post_secondary": getInternationalPostSecondary(data).hasInternationalPostSecondary,
            "international_post_secondary": getInternationalPostSecondary(data).data,
        },
        "work_experience": {
            "has_work_experience": getWorkExperience(data).hasWorkExperience,
            "work_experience": getWorkExperience(data).data,
        },
        "family": {
            "has_spouse": ["Married", "Common-Law"].includes(data.marriage.marital_status) ? true : false,
            "spouse": getSpouse(data),
            "mother": getMother(data),
            "father": getFather(data),
            "has_children": getChildren(data).has_children,
            "children": getChildren(data).children,
            "has_sibling": getSibling(data).has_sibling,
            "sibling": getSibling(data).data,
            "has_other_family_in_canada": getOtherFamilyInCanada(data).has_other_family_in_canada,
            "other_family_in_canada": getOtherFamilyInCanada(data).data,
        },
        "joboffer": {
            "phone": null,
            "job_title": null,
            "noc": null,
            "days": null,
            "hours": null,
            "wage_unit": null,
            "wage_rate": null,
            "ot_ratio": null,
            "is_working": null,
            "work_start_date": null,
            "permanent": null,
            "job_duration": null,
            "job_duration_unit": null,
            "disability_insurance": null,
            "dental_insurance": null,
            "empolyer_provided_persion": null,
            "extended_medical_insurance": null,
            "extra_benefits": null,
            "license_request": null,
        }
    };

    return appData;
}

module.exports = {
    appAdaptor
};


