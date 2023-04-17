
/* 
This is the data source module for the formfilling project. Currently it only supports excel file, but it will be extended to support database in the future.
1. Read excel file and convert to json. The info sheet should start with "info-" and the table sheet should start with "table-", which all follows the naming convention of the source 3.0
2. TODO: read all schema of the source model

*/

const XLSX = require('xlsx');

class Excel {

    constructor(filename) {
        this.filename = filename;
    }

    getDateString(dateNum) {
        return XLSX.SSF.format('yyyy-mm-dd', dateNum);
    }

    json() {
        let excel_data = {}
        const workbook = XLSX.readFile(this.filename);
        const sheetNames = workbook.SheetNames;

        for (let sheetName of sheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_row_object_array(worksheet);
            if (sheetName.startsWith("info-")) {
                // info name as key . Get the info name from sheet name by removing "info-"
                const info_name = sheetName.substring(5);
                excel_data[info_name] = {};
                // loop data starting from 2 to skip the header
                for (let i = 2; i < data.length; i++) {
                    // get the key and value from the row
                    const row_values = Object.values(data[i]);
                    const [key, , , value] = row_values;
                    // Check if the value is a date
                    if (key.includes("date") || key.includes("dob")) {
                        excel_data[info_name][key] = this.getDateString(value);
                    } else {
                        excel_data[info_name][key] = value;
                    }
                }
            } else if (sheetName.startsWith("table-")) {
                // table name as key . Get the table name from sheet name by removing "table-"
                const table_name = sheetName.substring(6);
                excel_data[table_name] = [];
                // get the table variables 
                const variables = Object.values(data[1]);
                // get indexes of the variables including "date"
                const date_indexes = variables.map((v, i) => v.includes("date") ? i : null).filter(v => v !== null);

                // loop data starting from 4 to skip the header
                for (let i = 4; i < data.length + 1; i++) {
                    let row = {};
                    for (let j = 0; j < variables.length; j++) {
                        // Check if the value is a date
                        const cell = worksheet[XLSX.utils.encode_cell({ r: i, c: j })];

                        let column_value;
                        if (cell && (cell.v === 0 || cell.v === '0')) {
                            column_value = cell.v;
                        } else {
                            column_value = (cell && cell.v) ? cell.v : undefined;
                        }

                        if (date_indexes.includes(j)) {
                            if (column_value === undefined || column_value === null || column_value === "") {
                                row[variables[j]] = null;
                            } else {
                                row[variables[j]] = this.getDateString(column_value);
                            }
                        } else {
                            row[variables[j]] = column_value;
                        }
                    }
                    // check special tables for contact, eradddress, 
                    switch (table_name) {
                        case "contact":
                            if (row.first_name) excel_data[table_name].push(row); // only push the row if the first name is not empty
                            break;
                        case "eraddress":
                        case "address":
                            if (row.street_name) excel_data[table_name].push(row); // only push the row if the street name is not empty
                            break;
                        case "phone":
                        case "personid":
                            if (row.number) excel_data[table_name].push(row); // only push the row if the number is not empty
                            break;
                        default:
                            excel_data[table_name].push(row);
                            break;
                    }
                }
            }
        }

        // console.log(JSON.stringify(excel_data, null, 2));
        return excel_data;
    }
}

// 2. Get data from database. TBD

// class Database {}


module.exports = {
    Excel
}





