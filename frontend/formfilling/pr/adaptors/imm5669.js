
/* 
data = {
    pa: {}, // must not null
    sp: {}, // nullable
    dp: [{}, {}, ...] // nullable
}
*/
const { get_family_member, get_educations, get_personal_history, get_membership, get_government_position, get_military_service, get_addresses, get_age } = require("./common");
const { truncateString, inRange } = require("./common");
// common part
function get_person(person, role) {
    const personal_details = get_personal_details(person, role);
    const questionanaire = get_questionaire(person, role);
    const education = get_education(person, role);
    const personal_history = get_personal_history(person, role);
    const membership = get_membership(person, role);
    const government_posotion = get_government_position(person, role);
    const military_service = get_military_service(person, role);
    const addresses = get_addresses(person, role);
    return {
        personal_details,
        questionanaire,
        education,
        personal_history,
        membership,
        government_posotion,
        military_service,
        addresses,
    };
}

const get_personal_details = (person, role) => {
    const p = person.personal;
    let father = get_family_member(person.family, "Father");
    if (father.length > 0) {
        father = father[0];
    } else {
        throw "Principle applicant's Father not exist... ";
    }
    let mother = get_family_member(person.family, "Mother");
    if (mother.length > 0) {
        mother = mother[0];
    } else {
        throw "Principle applicant's Mother not exist... ";
    }

    const parent = (parent) => {
        return {
            family_name: truncateString(parent.last_name + " " + parent.native_last_name, 57),
            given_name: truncateString(parent.first_name + " " + parent.native_first_name, 57),
            dob: parent.date_of_birth.replace(/-/g, "/"),
            date_of_death: parent.date_of_death ? parent.date_of_death.replace(/-/g, "/") : null,
            place_of_birth: truncateString(parent.place_of_birth, 30),
            birth_country: truncateString(parent.birth_country, 30)
        }
    }

    const data = {
        last_name: truncateString(p.last_name, 57),
        first_name: truncateString(p.first_name, 57),
        full_name: p.first_name + " " + p.last_name,
        full_name_in_native: truncateString(p.native_last_name + " " + p.native_first_name, 90),
        dob: p.dob.replace(/-/g, "/"),
        father: parent(father),
        mother: parent(mother),
    }
    return data;

}

const get_questionaire = (person, role) => {
    const q = person.prbackground;
    data = {
        q1: q.q1 === "Yes" ? true : false,
        q2: q.q2 === "Yes" ? true : false,
        q3: q.q3 === "Yes" ? true : false,
        q4: q.q4 === "Yes" ? true : false,
        q5: q.q5 === "Yes" ? true : false,
        q6: q.q6 === "Yes" ? true : false,
        q7: q.q7 === "Yes" ? true : false,
        q8: q.q8 === "Yes" ? true : false,
        q9: q.q9 === "Yes" ? true : false,
        q10: q.q10 === "Yes" ? true : false,
        q11: q.q11 === "Yes" ? true : false,
        details: truncateString(q.details, 679)
    }
    const has_details = data.q1 || data.q2 || data.q3 || data.q4 || data.q5 || data.q6 || data.q7 || data.q8 || data.q9 || data.q10 || data.q11;
    data["has_details"] = has_details;
    return data;
}

const get_education = (person, role) => {
    const p = person.personal;
    const e = person.education;
    const data = {
        primary_school_years: p.primary_school_years ? truncateString(p.primary_school_years.toString(), 2) : "0",
        secondary_school_years: p.secondary_school_years ? truncateString(p.secondary_school_years.toString(), 2) : "0",
        post_secondary_school_years: p.post_secondary_school_years ? truncateString(p.post_secondary_school_years.toString(), 2) : "0",
        other_school_years: p.other_school_years ? truncateString(p.other_school_years.toString(), 2) : "0",
        educations: get_educations(e, role)
    }
    return data;
}

const getDp = (dp) => {
    if (!dp || dp.length == 0) {
        return null;
    }
    dp_data = [];
    for (let i = 0; i < dp.length; i++) {
        const p = dp[i];
        const age = get_age(p.personal.dob);
        if (age < 18) continue;
        const person = get_person(p, "DP");
        dp_data.push(person);
    }

    return dp_data;
}


const imm5669Adaptor = (data) => {
    const imm5669_data = {
        pa: get_person(data.pa, "PA"),
        sp: data.sp ? get_person(data.sp, "SP") : null,
        dp: getDp(data.dp),
    }
    return imm5669_data;
}

module.exports = { imm5669Adaptor };


