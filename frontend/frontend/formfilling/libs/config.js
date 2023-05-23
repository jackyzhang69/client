const fs = require("fs");
const toml = require("toml");

const config = toml.parse(fs.readFileSync("config.toml", "utf-8"));
const SERVER_URL = config.SERVER_URL;
const RCICs = config.RCICs;

module.exports = { SERVER_URL, RCICs };
