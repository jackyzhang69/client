// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = `mongodb+srv://${process.env.MongoDBUser}:${process.env.MongoDBPassword}@noah.yi5fo.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function getProvMedian(prov_abbr) {
    /*
    try {
        await client.connect();
        const database = client.db('test');
        const immDataCollection = database.collection('imm_data');
        const immData = await immDataCollection.findOne({ name: "prov_median" });
        return immData.data[prov_abbr];
    } finally {
        await client.close();
    }
    */
   const immData = {
    "AB": 28.85,
    "BC": 26.44,
    "MB": 23,
    "NB": 21.79,
    "NL": 24.29,
    "NT": 37.3,
    "NS": 22,
    "NU": 36,
    "ON": 26.06,
    "PE": 21.63,
    "QC": 25,
    "SK": 25.96,
    "YT": 32
  };
    return immData[prov_abbr];
}

module.exports = {
    getProvMedian
}




