/*
 * This is AI module for the formfilling project.
 */
const { print } = require("./output");
const { SERVER_URL } = require("./config");
const fetch = require("node-fetch");

// get url from provess env or .immenv. if both have, os env will prevail
async function getServerUrl() {
  const url = process.env.server;
  if (url) return url;
  else return SERVER_URL;
}

// An api for getting the option from the
async function getOptionFromAPI(item, options) {
  const root = await getServerUrl();
  const endpoint = "ai/get_option";
  const url = `${root}${endpoint}`;

  const payload = {
    item,
    options,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.option;
  } catch (error) {
    print(`Error fetching data:, ${error}`, "error");
    return null;
  }
}

// An api for getting the two lists matched each other
async function getListMatch(targets, sources) {
  const root = await getServerUrl();
  const endpoint = "ai/get_matched_list";
  const url = `${root}${endpoint}`;

  const payload = {
    targets,
    sources,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.list;
  } catch (error) {
    print(`Error fetching data:, ${error}`, "error");
    return null;
  }
}

module.exports = {
  getOptionFromAPI,
  getListMatch,
};
