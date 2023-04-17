const os = require('os');
const path = require('path');
const homeDir = os.homedir();
require('dotenv').config({ path: path.join(homeDir, '.immenv') });

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MongoDBUser}:${process.env.MongoDBPassword}@noah.yi5fo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function getProvMedian(prov_abbr) {
    try {
        await client.connect();
        const database = client.db('test');
        const immDataCollection = database.collection('imm_data');
        const immData = await immDataCollection.findOne({ name: "prov_median" });
        return immData.data[prov_abbr];
    } finally {
        await client.close();
    }
}

module.exports = {
    getProvMedian
}




