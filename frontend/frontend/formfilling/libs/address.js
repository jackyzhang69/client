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

module.exports = Address;