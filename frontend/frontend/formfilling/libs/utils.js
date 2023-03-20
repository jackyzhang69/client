const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');
const PDFMerge = require('pdf-merge');
const { print } = require('./output');

function getFilesInFolder(folderPath, extension = '.pdf', return_file_with_ext = true) {
    if (!fs.existsSync(folderPath)) {
        throw new Error('Folder does not exist');
    }

    const files = fs.readdirSync(folderPath);

    const fileList = files.filter(file => path.extname(file).toLowerCase() === extension);

    if (return_file_with_ext) {
        return fileList.map(file => path.join(folderPath, file));
    } else {
        return fileList;
    }
}

function timing(func) {
    return async function (...args) {
        const startTime = Date.now();
        const result = await func.apply(this, args);
        const endTime = Date.now();
        console.log(`Execution time: ${(endTime - startTime) / 1000} seconds`);
        return result;
    };
}


function bestMatchString(term, listNames, toLowercase = true) {
    let maxScore = -1;
    let minScore = 0;
    let maxName = "";
    for (let term2 of listNames) {
        if (toLowercase) {
            term = term.toLowerCase();
            score = stringSimilarity.compareTwoStrings(term, term2.toLowerCase());
        } else {
            score = stringSimilarity.compareTwoStrings(term, term2);
        }
        if (score > minScore && score > maxScore) {
            maxName = term2;
            maxScore = score;
        }
    }
    return { maxScore, maxName };
}

// term is string, items is array of strings
function bestMatch(term, items, toLowercase = true) {
    let includedItems = [];
    if (!Array.isArray(items) || items === null) throw new Error("items must be an array of strings");

    for (let item of items) {
        const is_same = toLowercase ? item.toLowerCase() === term.toLowerCase() : item === term;
        const is_included = toLowercase ? item.toLowerCase().includes(term.toLowerCase()) : item.includes(term);
        if (is_same) {
            return item;
        } else if (is_included) {
            includedItems.push(item);
        }
    }

    let matches = includedItems.length;
    if (matches === 1) {
        return includedItems[0];
    } else if (matches > 1) {
        let matchedItem = bestMatchString(term, includedItems, toLowercase);
        return matchedItem.maxName
    } else {
        let matchedCountry = bestMatchString(term, items, toLowercase);
        return matchedCountry.maxName
    }
}


// convert wage based on amount and unit

function convertWage(amount, unit, targetUnit, workingHoursPerDay = 8, workingDaysPerWeek = 5) {
    const conversionTable = {
        hourly: {
            hourly: `1 * amount`,
            daily: `${workingHoursPerDay} * amount`,
            weekly: `${workingHoursPerDay * workingDaysPerWeek} * amount`,
            monthly: `${workingHoursPerDay * workingDaysPerWeek * 4} * amount`,
            annually: `${workingHoursPerDay * workingDaysPerWeek * 52} * amount`
        },
        daily: {
            hourly: `1 / ${workingHoursPerDay} * amount`,
            daily: `1 * amount`,
            weekly: `${workingDaysPerWeek} * amount`,
            monthly: `${workingDaysPerWeek * 4} * amount`,
            annually: `${workingDaysPerWeek * 52} * amount`
        },
        weekly: {
            hourly: `1 / (${workingHoursPerDay} * ${workingDaysPerWeek}) * amount`,
            daily: `1 / ${workingDaysPerWeek} * amount`,
            weekly: `1 * amount`,
            monthly: `4 * amount`,
            annually: `52 * amount`
        },
        monthly: {
            hourly: `1 / (${workingHoursPerDay} * ${workingDaysPerWeek} * 4) * amount`,
            daily: `1 / (${workingDaysPerWeek} * 4) * amount`,
            weekly: `1 / 4 * amount`,
            monthly: `1 * amount`,
            annually: `12 * amount`
        },
        annually: {
            hourly: `1 / (${workingHoursPerDay} * ${workingDaysPerWeek} * 52) * amount`,
            daily: `1 / (${workingDaysPerWeek} * 52) * amount`,
            weekly: `1 / 52 * amount`,
            monthly: `1 / 12 * amount`,
            annually: `1 * amount`
        }
    };

    const formula = conversionTable[unit][targetUnit];
    const targetAmount = eval(formula.replace("amount", amount));
    const explanation = `To convert ${amount} ${unit} to ${targetUnit} based on ${workingHoursPerDay} working hours per day and ${workingDaysPerWeek} working days per week, we do ${formula} which is (${amount} * (${formula.replace(" * amount", '')}))`;


    return {
        amount: targetAmount,
        unit: targetUnit,
        explaination: explanation
    };
}

// function that return input string as title case
function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}




// Merge PDFs in a folder to one
async function mergePDFs(folderPath, output_name = "application.pdf", delete_originals = true) {
    // Get all PDF files in the folder
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.pdf'));

    // Sort files by creation time
    files.sort((a, b) => {
        return fs.statSync(path.join(folderPath, a)).birthtimeMs - fs.statSync(path.join(folderPath, b)).birthtimeMs;
    });

    // Merge PDFs
    await PDFMerge(files.map(file => path.join(folderPath, file)), { output: path.join(folderPath, output_name) });
    print(`Merged ${files.length} PDFs to ${output_name}`, "success")

    // Delete original PDFs
    if (delete_originals) {
        for (const file of files) {
            fs.unlinkSync(path.join(folderPath, file));
        }
        print(`Deleted ${files.length} original PDFs`, "success")
    }
}


module.exports = {
    getFilesInFolder,
    bestMatch,
    bestMatchString,
    timing,
    convertWage,
    titleCase,
    mergePDFs
};