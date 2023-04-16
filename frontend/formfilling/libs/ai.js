// /*
//  * This is AI module for the formfilling project. 
//  */
const axios = require('axios');
const { print } = require("./output")

// get url from provess env or .immenv. if both have, os env will prevail
async function getServerUrl() {
    const url = process.env.server;
    if (url) return url;

    const immenvPath = require('os').homedir() + '/.immenv';
    let serverUrl = null;
    if (require('fs').existsSync(immenvPath)) {
        const lines = require('fs').readFileSync(immenvPath, 'utf-8').split('\n');
        for (const line of lines) {
            const [key, value] = line.trim().split('=');
            if (key === 'SERVER_URL') {
                serverUrl = value;
                break;
            }
        }
    }
    return serverUrl.slice(1, -1).replace(/"/g, '');;
}



// An api for getting the option from the 
async function getOptionFromAPI(item, options) {
    const root = await getServerUrl();
    const endpoint = 'ai/get_option';
    const url = `${root}${endpoint}`;

    const payload = {
        item,
        options,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;
        return data.option;
    } catch (error) {
        print(`Error fetching data:, ${error}`, "error");
        return null;
    }
}

// An api for getting the two lists matched each other
async function getListMatch(targets, sources) {
    const root = await getServerUrl();
    const endpoint = 'ai/get_matched_list';
    const url = `${root}${endpoint}`;

    const payload = {
        targets,
        sources,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;
        return data.list;
    } catch (error) {
        print(`Error fetching data:, ${error}`, "error");
        return null;
    }
}

module.exports = {
    getOptionFromAPI,
    getListMatch
}



