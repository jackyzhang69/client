
/* 
data = {
    pa: {}, // must not null
    sp: {}, // nullable
    dp: [{}, {}, ...] // nullable
}
*/
const { truncateString, inRange } = require("./common");
// common part
const travel_data = (person, role) => {
    if (!person || !person.travel) travels = null;
    else {
        for (let i = 0; i < person.travel.length; i++) {
            person.travel[i].start_date = person.travel[i].start_date.replace(/-/g, "/").slice(0, 7);
            person.travel[i].end_date = person.travel[i].end_date.replace(/-/g, "/").slice(0, 7);
            person.travel[i].length = truncateString(person.travel[i].length.toString(), 16);
        }
    }
    let name;
    if (role === "PA") {
        name = {
            family_name: truncateString(person.personal.last_name + ' ' + person.personal.native_last_name, 100),
            given_name: truncateString(person.personal.first_name + ' ' + person.personal.native_first_name, 100)
        }
    } else if (role === "DP" || role === "SP") {
        name = {
            family_name: truncateString(person.personal.last_name, 100),
            given_name: truncateString(person.personal.first_name, 100)
        }
        if (role === "DP") {
            if (person.travel) {
                for (let i = 0; i < person.travel.length; i++) {
                    person.travel[i]["given_name"] = truncateString(name.given_name, 100);
                }
            }
        }
    }

    const data = {
        travels: person.travel,
        ...name,
    }
    return data;
}

const getPa = (pa) => {
    const has_travel = pa.travel && pa.travel.length > 0;
    return { has_travel: has_travel, ...travel_data(pa, "PA") };
}

const getSp = (sp) => {
    if (!sp) {
        return null;
    }
    const has_travel = sp.travel && sp.travel.length > 0;
    return { has_travel: has_travel, ...travel_data(sp, "SP") };

}

const getDp = (dp) => {
    if (!dp || dp.length == 0) {
        return null;
    }
    dp_data = [];
    let has_travel = false;
    for (let i = 0; i < dp.length; i++) {
        if (dp[i].travel && dp[i].travel.length > 0) has_travel = true;
        dp_data.push(travel_data(dp[i], "DP"));
    }

    return { has_travel: has_travel, dps: dp_data };
}


const imm5562Adaptor = (data) => {
    const imm5562_data = {
        pa: getPa(data.pa),
        sp: getSp(data.sp),
        dp: getDp(data.dp),
    }
    return imm5562_data;
}

module.exports = { imm5562Adaptor };