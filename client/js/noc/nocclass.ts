import { killAll } from 'chrome-launcher';
import { Outlook } from './outlook_salary';
const path = require('path');
var arraySort = require('array-sort');
var Typo = require("typo-js");
const fs = require('fs');

function getDetailsData() {
    let rawdata = fs.readFileSync(path.join(__dirname, "./nocdescription.json"));
    var noc_data = JSON.parse(rawdata);
    return noc_data;
}

function getSpecialPrograms() {
    let rawdata = fs.readFileSync(path.join(__dirname, "./specialnocs.json"));
    var programs = JSON.parse(rawdata);
    return programs;
}

export class Area {
    public static province_names = [
        'Newfoundland and Labrador',
        'Prince Edward Island',
        'Nova Scotia',
        'New Brunswick',
        'Quebec',
        'Ontario',
        'Manitoba',
        'Saskatchewan',
        'Alberta',
        'British Columbia',
        'Yukon Territory',
        'Northwest Territories',
        'Nunavut'
    ]

    public static province_names_short = [
        'NL',
        'PE',
        'NS',
        'NB',
        'QB',
        'ON',
        'MB',
        'SK',
        'AB',
        'BC',
        'YT',
        'NT',
        'NU'
    ]

    public static provinces = {
        0: [0, 3], // 'Newfoundland and Labrador'
        1: [-1, -1], // 'Prince Edward Island'
        2: [4, 8], //'Nova Scotia'
        3: [9, 13], //'New Brunswick'
        4: [14, 30], //'Quebec'
        5: [31, 41], //'Ontario'
        6: [42, 49], //'Manitoba'
        7: [50, 55], //'Saskatchewan'
        8: [56, 63], //'Alberta'
        9: [64, 71], //'British Columbia'
        10: [-1, -1], //'Yukon Territory'
        11: [-1, -1], //'Northwest Territories'
        12: [-1, -1] //'Nunavut'
    }
    public area_index: Number

    constructor(area_index: Number) {
        this.area_index = area_index
    }

    get prov_index() {
        for (const [key, value] of Object.entries(Area.provinces)) {
            if (this.area_index >= value[0] && this.area_index <= value[1]) return Number(key);
        }
    }

    get prov_name() {
        return Area.province_names[this.prov_index];
    }

    get prov_name_short() {
        return Area.province_names_short[this.prov_index];
    }
}

// NOC class
export class Noc {
    public static nocs: object = this.getNocs()
    public noc_code: string

    constructor(noc_code: string) {
        this.noc_code = noc_code
    }


    area_outlook(area_index: Number = 66) {
        return Noc.nocs[this.noc_code].region[area_index].outlook;
    }
    prov_outlook(prov_index: Number = 9) {
        return Noc.nocs[this.noc_code].province[prov_index].outlook;
    }

    area_salary_lowest(area_index: Number = 66) {
        return Noc.nocs[this.noc_code].region[area_index].lowest;
    }
    area_salary_median(area_index: Number = 66) {
        return Noc.nocs[this.noc_code].region[area_index].median;
    }
    area_salary_highest(area_index: Number = 66) {
        return Noc.nocs[this.noc_code].region[area_index].highest;
    }

    prov_salary_lowest(prov_index: Number = 9) {
        return Noc.nocs[this.noc_code].province[prov_index].lowest;
    }
    prov_salary_median(prov_index: Number = 9) {
        return Noc.nocs[this.noc_code].province[prov_index].median;
    }
    prov_salary_highest(prov_index: Number = 9) {
        return Noc.nocs[this.noc_code].province[prov_index].highest;
    }

    area_name(area_index: Number = 66) {
        return Noc.nocs[this.noc_code].region[area_index].region;
    }
    prov_name(prov_index: Number = 9) {
        return Noc.nocs[this.noc_code].province[prov_index].region;
    }

    get_area_outlook_wages(area_index: Number = 66) {
        return Noc.nocs[this.noc_code].region[area_index];
    }

    get_prov_outlook_wages(prov_index: Number = 9) {
        return Noc.nocs[this.noc_code].province[prov_index];
    }

    get_canada_outlook_wages() {
        return Noc.nocs[this.noc_code].canada;
    }
    static getNocs() {
        try {
            const filename = path.join(__dirname, './nocs.json');
            const rawdata = fs.readFileSync(filename);
            return JSON.parse(rawdata);
        }
        catch (err) {
            console.log(`${err}`);
            process.exit(1);
        }
    }

    // get noc details
    getDetails(args) {
        const noc = this.noc_code
        var noc_data = getDetailsData()[noc];
        switch (args) {
            case 'tt':
                return { noc: noc, label: "Title", content: noc_data['title'] }
                break;
            case 'gd':
                return { noc: noc, label: "general_description", content: noc_data['general_description'] }
                break;
            case 'md':
                return { noc: noc, label: "main_duties", content: noc_data['main_duties'] }
                break;
            case 'er':
                return { noc: noc, label: "employment_requirements", content: noc_data['employment_requirements'] }
                break;
            case 'ai':
                return { noc: noc, label: "additional_information", content: noc_data['additional_information'] }
                break;
            case 'te':
                return { noc: noc, label: "title_examples", content: noc_data['title_examples'] }
                break;
            case 'ec':
                return { noc: noc, label: "exclusion", content: noc_data['exclusion'] }
                break;
            default:
                return {}
                break;
        }
    }

    // Find related special programs
    getRelatedPrograms() {
        var related_programs = [];
        const programs = getSpecialPrograms().noc;
        for (var program of programs) {
            program.noc_codes && program.noc_codes.includes(this.noc_code) && related_programs.push(program);
        }
        return related_programs;
    }
    showRelatedPrograms(related_programs, with_source = false, with_description = false) {
        // description and source list
        var description = [];
        var source = [];
        for (var p of related_programs) {
            delete p.noc_codes;
            p.stream = p.stream ? p.stream.slice(0, 60) : "";
            p.remark = p.remark ? p.remark.slice(0, 60) : "";

            // get source and description seperately
            source.push(p.source);
            delete p.source;
            description.push(p.description);
            delete p.description;
        }
        console.table(related_programs)
        if (with_source) {
            for (var [index, s] of Object.entries(source)) console.log(`Program ${index} source: ${s}`);
        }
        console.log("\n");
        if (with_description) {
            for (var [index, d] of Object.entries(description)) console.log(`Program ${index} description: ${d}`);
        }
    }

}

export class Nocs {
    nocs: Noc[]

    constructor(nocs: Noc[] = []) {
        this.nocs = nocs
    }

    qualifiedNocs(starts_with, outlook, area_index, order_by = "median", reverse = false) {
        const nocs = Noc.nocs
        const prov_index = (new Area(area_index)).prov_index || null;

        var qualified_nocs = [];
        for (const [key, value] of Object.entries(nocs)) {
            if (prov_index && key.startsWith(starts_with) && nocs[key].province[prov_index].outlook === Number(outlook)) {
                qualified_nocs.push({ noc: key, ...nocs[key].province[prov_index] });
            }
            if (key.startsWith(starts_with) && nocs[key].region[area_index].outlook === Number(outlook)) {
                qualified_nocs.push({ noc: key, ...nocs[key].region[area_index] });
            }
        }
        arraySort(qualified_nocs, order_by, reverse);
        return qualified_nocs;
    }

    qualifiedPlaces(noc, outlook, order_by = 'median', reverse = false) {
        var qualified_places = []
        const nocs = Noc.nocs;
        // for provinces
        for (const prov of nocs[noc].province) {
            if (prov.outlook == outlook) qualified_places.push({ province: prov.region, ...prov });
        }
        // for regions
        for (const [i, area] of nocs[noc].region.entries()) {
            const the_area = new Area(i)
            if (area.outlook == outlook) qualified_places.push({ province: the_area.prov_name, ...area });
        }
        // arraySort(qualified_places, order_by, reverse);
        return qualified_places
    }

    include_title_element(noc_title, key_words) {
        var included = []
        for (var key of key_words) {
            if (noc_title.includes(key)) {
                included.push(true)
            } else {
                included.push(false)
            }
        }
        return included.every(e => e == true)
    }

    getNocCodes(keywords, title_examples = null, main_duties = null) {
        var dictionary = new Typo("en_US");
        var suggestions = [];
        for (var kw of keywords) {
            var is_spelled_correctly = dictionary.check(kw);
            if (!is_spelled_correctly) {
                suggestions.push({ word: kw, suggestion: dictionary.suggest(kw) });
            }
        }
        if (suggestions.length > 0) {
            var err = false;
            for (var suggestion of suggestions) {
                console.log(`"${suggestion.word}" is misspelled. Suggestions:`, suggestion.suggestion);
                err = true;
            }
            err && process.exit(1);
        }
        const title = keywords.join(' ').toLowerCase().split(" ");
        const noc_data = getDetailsData();
        var nocs = []

        for (var noc of Object.keys(noc_data)) {
            if (this.include_title_element(noc_data[noc].title.toLowerCase(), title)) nocs.push({ noc: noc, title: noc_data[noc].title });
            title_examples && this.include_title_element(noc_data[noc].title_examples.toLowerCase(), title) && nocs.push({ noc: noc, title: noc_data[noc].title });
            main_duties && this.include_title_element(noc_data[noc].main_duties.toLowerCase(), title) && nocs.push({ noc: noc, title: noc_data[noc].title });
        }
        return nocs;
    }
}

const noc1 = new Noc('0213');
var ps = noc1.getRelatedPrograms()
// noc1.showRelatedPrograms(ps);

// console.log(noc1.getDetails('md').main_duties);
// console.table(noc1.get_area_outlook_wages(16))
// const noc2 = new Noc("1111");
// const noc3 = new Noc("0111");

// // console.log(noc1.prov_outlook())
// // console.log(noc1.noc_code, noc1.prov_name(), noc1.prov_salary_lowest(), noc1.prov_salary_median(), noc1.prov_salary_highest())

// const nocs = new Nocs();
// console.table(nocs.getNocCodes('marketing', true, true))
// console.log(nocs.qualifiedNocs('11', 3, 47))
// // console.log(nocs.qualifiedPlaces('1111', 3))