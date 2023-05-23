/*
Data adaptor for representative  page
*/

const repAdaptor = (data) => {
    const bcpnp = data.bcpnp;
    const rcic = data.rcic;

    const repData = {
        "login": {
            "password": bcpnp.password,
            "username": bcpnp.account
        },
        "rep": {
            "member_id": rcic.rcic_number,
            "last_name": rcic.last_name,
            "first_name": rcic.first_name,
            "orgnization": rcic.company,
            "phone": rcic.telephone,
            "phone_secondary": rcic.a_telephone,
            "email": rcic.email,
            "country": rcic.country,
            "address_line": rcic.address_unit + " " + rcic.address_no + " " + rcic.street_name,
            "city": rcic.city,
            "state": rcic.province,
            "postal_code": rcic.postcode
        },
    }
    return repData;
}

module.exports = {
    repAdaptor
};