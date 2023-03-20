/*
Data adaptor for profile page
*/

const { bestMatch } = require("../../libs/utils");
const Address = require("../../libs/address");

const getPassport = (data) => {
    let passport;
    for (let id of data.personid) {
        if (id.variable_type === "passport") {
            passport = id;
            break;
        }
    }
    const passport_data = {
        "number": passport.number,
        "country": passport.country,
        "issue_date": passport.issue_date,
        "expiry_date": passport.expiry_date
    }
    return passport_data;
}

const getContact = (data) => {
    let preferredNumber = null;
    let businessNumber = null;

    for (let type of ["cellular", "residential"]) {
        for (let p of data.phone) {
            if (p.variable_type === type) {
                preferredNumber = p;
                break;
            }
        }
        if (preferredNumber) break;
    }

    for (let p of data.phone) {
        if (p.variable_type === "business") {
            if (p.number && p.contry_code) businessNumber = p;
            break;
        }
    }

    if (!preferredNumber) throw new Error("No preferred phone number found");

    const contact = {
        "PreferredPhone": {
            "country_code": preferredNumber.country_code.toString(),
            "number": preferredNumber.number.toString()
        },
        "business": {
            "country_code": businessNumber ? businessNumber.country_code.toString() : "",
            "number": businessNumber ? businessNumber.number.toString() : ""
        }
    }

    return contact;

}

const getAddress = (data) => {
    let address = null;
    for (let addr of data.address) {
        if (addr.variable_type === "residential_address") {
            address = addr;
            break;
        }
    }
    if (!address) throw new Error("No residential address found");

    address = new Address(address.street_number, address.street_name, address.city, address.province, address.country, address.post_code, address.po_box, address.unit, address.district);
    let address_data = {
        "street": address.getStreetAddress(),
        "city": address.city,
        "province": address.province,
        "postal_code": address.post_code,
        "country": address.country
    }
    return address_data;

}

const profileAdaptor = (data) => {
    const currentYear = new Date().getFullYear();
    const password = `Super${currentYear}!`;
    const user_id = data.personal.last_name[0] + data.personal.first_name[0] + data.personal.dob.replace(/-/g, "");
    const has_used_name = data.personal.used_last_name && data.personal.used_first_name ? true : false;
    const countries = require("./counties.json");
    const country_of_birth = countries[bestMatch(data.personal.country_of_birth, Object.keys(countries))];

    const profile = {
        "email": data.personal.email,
        "password": password,
        "user_id": user_id,
        "question_answers": [
            {
                "question": "What is your countryr?",
                "answer": "Canada"
            },
            {
                "question": "What is your province?",
                "answer": "BC"
            },
            {
                "question": "What is your city?",
                "answer": "Vancouver"
            }
        ],
        "person": {
            "last_name": data.personal.last_name,
            "first_name": data.personal.first_name,
            "has_used_name": has_used_name,
            "used_last_name": data.personal.used_last_name,
            "used_first_name": data.personal.used_first_name,
            "dob": data.personal.dob,
            "country_of_birth": country_of_birth,
            "place_of_birth": data.personal.place_of_birth,
            "sex": data.personal.sex
        },
        "passport": getPassport(data),
        "contact": getContact(data),
        "address": getAddress(data),
        "additional": "CIC"
    }
    return profile;
}


module.exports = { profileAdaptor };