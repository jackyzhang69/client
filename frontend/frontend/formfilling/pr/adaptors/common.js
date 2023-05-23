

const get_family_member = (family, relationship) => {
    let family_member = [];

    for (let i = 0; i < family.length; i++) {
        if (family[i].relationship === relationship) {
            family_member.push(family[i]);
        }
    }
    return family_member;
}

const get_educations = (educations, role) => {
    const edu = JSON.parse(JSON.stringify(educations)); // deep copy an edu in order to mess up following using of original education data
    for (let i = 0; i < edu.length; i++) {
        edu[i].start_date = edu[i].start_date.replace(/-/g, "/").slice(0, 7);
        edu[i].end_date = edu[i].end_date.replace(/-/g, "/").slice(0, 7);
        edu[i]["city_country"] = truncateString(edu[i].city + " / " + edu[i].country, 21);
        edu[i].school_name = truncateString(edu[i].school_name, 24);
        edu[i].education_level = truncateString(edu[i].education_level, 17);
        edu[i].field_of_study = truncateString(edu[i].field_of_study, 17);
    }
    return edu ? edu : null;
}

const get_personal_history = (person, role) => {
    const personal_history = person.history;
    for (let i = 0; i < personal_history.length; i++) {
        personal_history[i].start_date = personal_history[i].start_date.replace(/-/g, "/").slice(0, 7);
        personal_history[i].end_date = personal_history[i].end_date ? personal_history[i].end_date.replace(/-/g, "/").slice(0, 7) : new Date().toISOString().replace(/-/g, "/").slice(0, 7);
        personal_history[i].city_and_country = truncateString(personal_history[i].city_and_country, 30);
        personal_history[i].activity = truncateString(personal_history[i].activity, 21);
        personal_history[i].status = truncateString(personal_history[i].status, 14);
        personal_history[i].name_of_company_or_school = truncateString(personal_history[i].name_of_company_or_school, 27);

    }
    return personal_history ? personal_history : null;
}

const get_membership = (person, role) => {
    const membership = person.member;
    for (let i = 0; i < membership.length; i++) {
        membership[i].start_date = membership[i].start_date.replace(/-/g, "/").slice(0, 7);
        membership[i].end_date = membership[i].end_date ? membership[i].end_date.replace(/-/g, "/").slice(0, 7) : new Date().toISOString().replace(/-/g, "/").slice(0, 7);
        membership[i].city_country = truncateString(membership[i].city + " / " + membership[i].country, 17);
        membership[i].organization_name = truncateString(membership[i].organization_name, 26);
        membership[i].position = truncateString(membership[i].position, 20);
        membership[i].organization_type = truncateString(membership[i].organization_type, 17);
    }
    return membership ? membership : null;
}

const get_government_position = (person, role) => {
    const government_position = person.government;
    for (let i = 0; i < government_position.length; i++) {
        government_position[i].start_date = government_position[i].start_date.replace(/-/g, "/").slice(0, 7);
        government_position[i].end_date = government_position[i].end_date ? government_position[i].end_date.replace(/-/g, "/").slice(0, 7) : new Date().toISOString().replace(/-/g, "/").slice(0, 7);
        government_position[i].country = truncateString(government_position[i].country, 29);
        government_position[i].department = truncateString(government_position[i].department, 30);
        government_position[i].position = truncateString(government_position[i].position, 21);
    }
    return government_position ? government_position : null;
}

const get_military_service = (person, role) => {
    const military_service = person.military;
    for (let i = 0; i < military_service.length; i++) {
        military_service[i].start_date = military_service[i].start_date.replace(/-/g, "/").slice(0, 7);
        military_service[i].end_date = military_service[i].end_date ? military_service[i].end_date.replace(/-/g, "/").slice(0, 7) : new Date().toISOString().replace(/-/g, "/").slice(0, 7);
        military_service[i].country = truncateString(military_service[i].country, 30);
        military_service[i].service_detail = truncateString(military_service[i].service_detail, 63);
        military_service[i].rank = truncateString(military_service[i].rank, 14);
        military_service[i].reason_for_end = truncateString(military_service[i].reason_for_end, 30);
        military_service[i].combat_detail = truncateString(military_service[i].combat_detail, 679);



    }
    return military_service ? military_service : null;
}

const get_addresses = (person, role) => {
    const addresses = person.addresshistory;
    for (let i = 0; i < addresses.length; i++) {
        addresses[i].start_date = addresses[i].start_date.replace(/-/g, "/").slice(0, 7);
        addresses[i].end_date = addresses[i].end_date ? addresses[i].end_date.replace(/-/g, "/").slice(0, 7) : new Date().toISOString().replace(/-/g, "/").slice(0, 7);
        addresses[i].street_and_number = truncateString(addresses[i].street_and_number, 30);
        addresses[i].city = truncateString(addresses[i].city, 30);
        addresses[i].province = truncateString(addresses[i].province, 14);
        addresses[i].country = truncateString(addresses[i].country, 30);
        addresses[i].post_code = addresses[i].post_code ? truncateString(addresses[i].post_code.toString(), 9) : "";

    }
    return addresses ? addresses : null;
}


const get_age = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBirthdayPassed = (today.getMonth() > birthDate.getMonth()) ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!isBirthdayPassed) {
        age--;
    }
    return age;
}

function truncateString(inputString, maxCharacters) {
    if (typeof inputString === 'string' && inputString.length > maxCharacters) {
        return inputString.slice(0, maxCharacters);
    }
    return inputString;
}

function inRange(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

module.exports = {
    get_family_member,
    get_educations,
    get_personal_history,
    get_membership,
    get_government_position,
    get_military_service,
    get_addresses,
    get_age,
    truncateString,
    inRange
}
