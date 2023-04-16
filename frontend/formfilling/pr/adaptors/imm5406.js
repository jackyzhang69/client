
/* 
data = {
    pa: {}, // must not null
    sp: {}, // nullable
    dp: [{}, {}, ...] // nullable
}
*/
const { Address, getAddressByType } = require("../../libs/contact");
const { remove, get_family_member, get_age, truncateString, inRange } = require("./common");

// common part
const marriage_map = {
    "Annulled Marriage": "1: 09",
    "Common-Law": "2: 03",
    "Divorced": "3: 04",
    "Separated": "4: 05",
    "Married": "5: 01",
    "Single": "7: 02",
    "Widowed": "9: 06",
    "Unknown": "8: 00",
}

const get_data = (person) => {
    if (!person) {
        return null;
    }

    data = {
        full_name: truncateString(person.first_name + " " + person.last_name, 63),
        dob: person.date_of_birth.replace(/-/g, "/"),
        country_of_birth: truncateString(person.birth_country, 30),
        marital_status: marriage_map[person.marital_status], // maybe should consider by label instead of value
        email: person.email ? truncateString(person.email, 40) : "none",
        address: truncateString(person.address, 80),
        relationship: truncateString(person.relationship, 27),
    }
    return data;
}

const get_family_data = (person) => {
    const app = person.personal
    const family = person.family;
    const spouse = get_family_member(family, "Spouse");
    const father = get_family_member(family, "Father");
    const mother = get_family_member(family, "Mother");
    const daughter = get_family_member(family, "Daughter");
    const son = get_family_member(family, "Son");
    const brother = get_family_member(family, "Brother");
    const sister = get_family_member(family, "Sister");
    const children = daughter.concat(son);
    const siblings = brother.concat(sister);

    const ra = getAddressByType(person.address, "residential_address");
    const address = new Address(ra.street_number, ra.street_name, ra.city, ra.province, ra.country, ra.post_code, ra.po_box, ra.unit, ra.district);
    const app_data = {
        full_name: truncateString(app.first_name + " " + app.last_name, 63),
        dob: app.dob.replace(/-/g, "/"),
        country_of_birth: truncateString(app.country_of_birth, 30),
        marital_status: marriage_map[person.marriage.marital_status],
        email: app.email ? truncateString(app.email, 40) : "none",
        address: truncateString(address.getFullAddress(), 80),
        relationship: "Applicant",
        spouse: get_data(spouse ? spouse[0] : null),
        father: get_data(father[0]),
        mother: get_data(mother[0]),
        children: children.map((child) => get_data(child)),
        siblings: siblings.map((sibling) => get_data(sibling)),
    }
    return app_data;
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
        const data = get_family_data(p);
        dp_data.push(data);
    }
    return dp_data;
}


const imm5406Adaptor = (data) => {
    const imm5406_data = {
        pa: get_family_data(data.pa),
        sp: get_family_data(data.sp),
        dp: getDp(data.dp),
    }
    return imm5406_data;
}

module.exports = { imm5406Adaptor };