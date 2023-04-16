const { bestMatch } = require('./utils');

class Address {
    constructor(street_number, street_name, city, province, country, post_code, po_box = null, unit = null, district = null) {
        this.po_box = po_box;
        this.unit = unit;
        this.street_number = street_number;
        this.street_name = street_name;
        this.district = district;
        this.city = city;
        this.province = province;
        this.country = country;
        this.post_code = post_code;
    }

    getStreetAddress() {
        let streetAddress = `${this.street_number} ${this.street_name}`;

        if (this.unit) {
            streetAddress = `${this.unit}-${streetAddress}`;
        }

        if (this.district) {
            streetAddress = `${streetAddress} ${this.district}`;
        }

        return streetAddress;
    }

    getCityAddress() {
        let streetAddress = this.district ? `${this.street_number} ${this.street_name} ${this.district}} ${this.city}` : `${this.street_number} ${this.street_name} ${this.city}`;

        if (this.unit) {
            streetAddress = `${this.unit}-${streetAddress}`;
        }

        return streetAddress;
    }

    getFullAddress() {
        let fullAddress = "";

        if (this.po_box) {
            fullAddress += `PO Box ${this.po_box}, `;
        }

        fullAddress += `${this.getStreetAddress()}, ${this.city}, ${this.province}, ${this.country} ${this.post_code}`;

        return fullAddress;
    }
}

const getAddress = (address, type, countries) => {
    for (const addr of address) {
        if (addr.variable_type === type && addr.street_name) {
            return {
                "unit": addr.unit ? addr.unit : "",
                "street_address": addr.street_number + " " + addr.street_name,
                "city": addr.city,
                "province": addr.province,
                "post_code": addr.post_code,
                "country": countries[bestMatch(addr.country, Object.keys(countries))],
            };
        }
    }
}

const is_same_address = (address1, address2) => {
    return (
        address1.unit === address2.unit &&
        address1.street_address === address2.street_address &&
        address1.city === address2.city &&
        address1.province === address2.province &&
        address1.post_code === address2.post_code &&
        address1.country === address2.country
    );
}


const getPhone = (phones) => {
    let preferredNumber = null;
    let businessNumber = null;
    let alternateNumber = null;

    for (let type of ["cellular", "residential"]) {
        for (let p of phones) {
            if (p.variable_type === type) {
                preferredNumber = p;
                break;
            }
        }
        if (preferredNumber) break;
    }

    for (let p of phones) {
        if (p !== preferredNumber) {
            if (p.number && p.contry_code) alternateNumber = p;
            break;
        }
    }

    for (let p of phones) {
        if (p.variable_type === "business") {
            if (p.number && p.contry_code) businessNumber = p;
            break;
        }
    }

    if (!preferredNumber) throw new Error("No preferred phone number found");

    const return_phones = {
        "preferredPhone": {
            "country_code": preferredNumber.country_code.toString(),
            "number": preferredNumber.number.toString()
        },
        "alternatePhone": alternateNumber ? {
            "country_code": alternateNumber.country_code.toString(),
            "number": alternateNumber.number.toString()
        } : null,
        "businessPhone": businessNumber ? {
            "country_code": businessNumber.country_code.toString(),
            "number": businessNumber.number.toString()
        } : null
    }

    return return_phones;

}


module.exports = {
    Address,
    getAddress,
    is_same_address,
    getPhone
}

