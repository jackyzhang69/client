const { bestMatch } = require("../../libs/utils")

const country_citizen = {
    "Afghanistan": "1: 252",
    "Albania": "2: 081",
    "Algeria": "3: 131",
    "Andorra": "4: 082",
    "Angola": "5: 151",
    "Antigua And Barbuda": "6: 621",
    "Argentina": "7: 703",
    "Armenia": "8: 049",
    "Australia": "9: 305",
    "Austria": "10: 011",
    "Azerbaijan": "11: 050",
    "Bahamas": "12: 622",
    "Bahrain": "13: 253",
    "Bangladesh": "14: 212",
    "Barbados": "15: 610",
    "Belarus": "16: 051",
    "Belgium": "17: 012",
    "Belize": "18: 541",
    "Benin": "19: 160",
    "Bhutan": "20: 254",
    "Bolivia": "21: 751",
    "Bosnia and Herzegovina": "22: 048",
    "Botswana": "23: 153",
    "Brazil": "24: 709",
    "Brunei Darussalam": "25: 255",
    "Bulgaria": "26: 083",
    "Burkina Faso": "27: 188",
    "Burma (Myanmar)": "28: 241",
    "Burundi": "29: 154",
    "Cabo Verde": "30: 911",
    "Cambodia": "31: 256",
    "Cameroon": "32: 155",
    "Canada": "33: 511",
    "Central African Republic": "34: 157",
    "Chad": "35: 156",
    "Chile": "36: 721",
    "China": "37: 202",
    "China (Hong Kong SAR)": "38: 200",
    "China (Macao SAR)": "39: 198",
    "Colombia": "40: 722",
    "Comoros": "41: 905",
    "Costa Rica": "42: 542",
    "Croatia": "43: 043",
    "Cuba": "44: 650",
    "Cyprus": "45: 221",
    "Czech Republic": "46: 015",
    "Democratic Rep. of Congo": "47: 158",
    "Denmark": "48: 017",
    "Djibouti": "49: 183",
    "Dominica": "50: 625",
    "Dominican Republic": "51: 651",
    "East Timor": "52: 916",
    "Ecuador": "53: 753",
    "Egypt": "54: 101",
    "El Salvador": "55: 543",
    "Equatorial Guinea": "56: 178",
    "Eritrea": "57: 162",
    "Estonia": "58: 018",
    "Ethiopia": "59: 161",
    "Federated States of Micronesia": "60: 835",
    "Fiji": "61: 801",
    "Finland": "62: 021",
    "France": "63: 022",
    "Gabon": "64: 163",
    "Gambia": "65: 164",
    "Georgia": "66: 052",
    "Germany, Federal Republic Of": "67: 024",
    "Ghana": "68: 165",
    "Greece": "69: 025",
    "Grenada": "70: 626",
    "Guatemala": "71: 544",
    "Guinea": "72: 166",
    "Guinea-Bissau": "73: 167",
    "Guyana": "74: 711",
    "Haiti": "75: 654",
    "Honduras": "76: 545",
    "Hungary": "77: 026",
    "Iceland": "78: 085",
    "India": "79: 205",
    "Indonesia": "80: 222",
    "Iran": "81: 223",
    "Iraq": "82: 224",
    "Ireland": "83: 027",
    "Israel": "84: 206",
    "Italy": "85: 028",
    "Ivory Coast": "86: 169",
    "Jamaica": "87: 602",
    "Japan": "88: 207",
    "Jordan": "89: 225",
    "Kazakhstan": "90: 053",
    "Kenya": "91: 132",
    "Kiribati": "92: 831",
    "Korea, North (DPRK)": "93: 257",
    "Korea, South": "94: 258",
    "Kosovo": "95: 064",
    "Kuwait": "96: 226",
    "Kyrgyzstan": "97: 054",
    "Laos": "98: 260",
    "Latvia": "99: 019",
    "Lebanon": "100: 208",
    "Lesotho": "101: 152",
    "Liberia": "102: 170",
    "Libya": "103: 171",
    "Liechtenstein": "104: 086",
    "Lithuania": "105: 020",
    "Luxembourg": "106: 013",
    "Macedonia": "107: 070",
    "Madagascar": "108: 172",
    "Malawi": "109: 111",
    "Malaysia": "110: 242",
    "Maldives": "111: 901",
    "Mali": "112: 173",
    "Malta": "113: 030",
    "Marshall Islands": "114: 834",
    "Mauritania": "115: 174",
    "Mauritius": "116: 902",
    "Mexico": "117: 501",
    "Moldova": "118: 055",
    "Monaco": "119: 087",
    "Mongolia": "120: 262",
    "Montenegro": "121: 063",
    "Morocco": "122: 133",
    "Mozambique": "123: 175",
    "Namibia": "124: 122",
    "Nauru": "125: 341",
    "Nepal": "126: 264",
    "Netherlands, The": "127: 031",
    "New Caledonia": "128: 822",
    "New Zealand": "129: 339",
    "Nicaragua": "130: 546",
    "Niger": "131: 176",
    "Nigeria": "132: 177",
    "Northern Mariana Islands": "133: 830",
    "Norway": "134: 032",
    "Oman": "135: 263",
    "Pakistan": "136: 209",
    "Palestinian Authority": "137: 213",
    "Panama": "138: 547",
    "Papua New Guinea": "139: 342",
    "Paraguay": "140: 755",
    "Peru": "141: 723",
    "Philippines": "142: 227",
    "Poland": "143: 033",
    "Portugal": "144: 034",
    "Qatar": "145: 265",
    "Republic of Congo": "146: 159",
    "Republic of Palau": "147: 836",
    "Romania": "148: 088",
    "Russia": "149: 056",
    "Rwanda": "150: 179",
    "Saint Kitts and Nevis": "151: 629",
    "Saint Lucia": "152: 630",
    "Samoa": "153: 844",
    "San Marino": "154: 089",
    "Sao Tome and Principe": "155: 914",
    "Saudi Arabia": "156: 231",
    "Senegal": "157: 180",
    "Serbia, Republic Of": "158: 062",
    "Seychelles": "159: 904",
    "Sierra Leone": "160: 181",
    "Singapore": "161: 246",
    "Slovakia": "162: 016",
    "Slovenia": "163: 047",
    "Solomon Islands": "164: 824",
    "Somalia": "165: 182",
    "South Africa, Republic Of": "166: 121",
    "South Sudan": "167: 189",
    "Spain": "168: 037",
    "Sri Lanka": "169: 201",
    "St. Vincent and the Grenadines": "170: 631",
    "Stateless": "171: 979",
    "Sudan": "172: 185",
    "Suriname": "173: 752",
    "Swaziland": "174: 186",
    "Sweden": "175: 040",
    "Switzerland": "176: 041",
    "Syria": "177: 210",
    "Taiwan": "178: 203",
    "Tajikistan": "179: 057",
    "Tanzania": "180: 130",
    "Thailand": "181: 267",
    "Togo": "182: 187",
    "Tonga": "183: 846",
    "Trinidad and Tobago": "184: 605",
    "Tunisia": "185: 135",
    "Turkey": "186: 045",
    "Turkmenistan": "187: 058",
    "Tuvalu": "188: 826",
    "Uganda": "189: 136",
    "UK - Brit. Ntl. Overseas": "190: 010",
    "UK - Brit. overseas citizen": "191: 004",
    "UK - Brit. overseas terr.": "192: 005",
    "UK - British citizen": "193: 003",
    "Ukraine": "194: 059",
    "United Arab Emirates": "195: 280",
    "United States of America": "196: 461",
    "Unknown": "197: 000",
    "Uruguay": "198: 724",
    "Uzbekistan": "199: 060",
    "Vanuatu": "200: 823",
    "Vatican City State": "201: 090",
    "Venezuela": "202: 725",
    "Vietnam": "203: 270",
    "Western Sahara": "204: 184",
    "Yemen": "205: 273",
    "Zambia": "206: 112",
    "Zimbabwe": "207: 113",
}

const country_birth = {
    "Afghanistan": "1: 252",
    "Aland Island": "2: 401",
    "Albania": "3: 081",
    "Algeria": "4: 131",
    "Andorra": "5: 082",
    "Angola": "6: 151",
    "Anguilla": "7: 620",
    "Antigua And Barbuda": "8: 621",
    "Argentina": "9: 703",
    "Armenia": "10: 049",
    "Aruba": "11: 658",
    "Australia": "12: 305",
    "Austria": "13: 011",
    "Azerbaijan": "14: 050",
    "Bahamas": "15: 622",
    "Bahrain": "16: 253",
    "Bailwick of Jersey": "17: 412",
    "Bangladesh": "18: 212",
    "Barbados": "19: 610",
    "Belarus": "20: 051",
    "Belgium": "21: 012",
    "Belize": "22: 541",
    "Benin": "23: 160",
    "Bermuda": "24: 601",
    "Bhutan": "25: 254",
    "Bolivia": "26: 751",
    "Bonaire, Sint Eustatius, Saba": "27: 402",
    "Bosnia and Herzegovina": "28: 048",
    "Botswana": "29: 153",
    "Bouvet Island": "30: 403",
    "Brazil": "31: 709",
    "British Indian Ocean Territory": "32: 404",
    "British Virgin Islands": "33: 633",
    "Brunei Darussalam": "34: 255",
    "Bulgaria": "35: 083",
    "Burkina Faso": "36: 188",
    "Burma (Myanmar)": "37: 241",
    "Burundi": "38: 154",
    "Cabo Verde": "39: 911",
    "Cambodia": "40: 256",
    "Cameroon": "41: 155",
    "Canada": "42: 511",
    "Canary Islands": "43: 039",
    "Cayman Islands": "44: 624",
    "Central African Republic": "45: 157",
    "Chad": "46: 156",
    "Channel Islands": "47: 009",
    "Chile": "48: 721",
    "China": "49: 202",
    "China (Hong Kong SAR)": "50: 200",
    "China (Macao SAR)": "51: 198",
    "Christmas Island": "52: 405",
    "Colombia": "53: 722",
    "Comoros": "54: 905",
    "Cook Islands": "55: 840",
    "Costa Rica": "56: 542",
    "Croatia": "57: 043",
    "Cuba": "58: 650",
    "Curaçao": "59: 406",
    "Cyprus": "60: 221",
    "Czech Republic": "61: 015",
    "Czechoslovakia": "62: 014",
    "Democratic Rep. of Congo": "63: 158",
    "Denmark": "64: 017",
    "Djibouti": "65: 183",
    "Dominica": "66: 625",
    "Dominican Republic": "67: 651",
    "East Timor": "68: 916",
    "Ecuador": "69: 753",
    "Egypt": "70: 101",
    "El Salvador": "71: 543",
    "England": "72: 002",
    "Equatorial Guinea": "73: 178",
    "Eritrea": "74: 162",
    "Estonia": "75: 018",
    "Ethiopia": "76: 161",
    "Falkland Islands": "77: 912",
    "Faroe Islands": "78: 408",
    "Federated States of Micronesia": "79: 835",
    "Fiji": "80: 801",
    "Finland": "81: 021",
    "Fr. South. and Antarctic Lands": "82: 821",
    "France": "83: 022",
    "French Guiana": "84: 754",
    "French Polynesia": "85: 845",
    "Gabon": "86: 163",
    "Gambia": "87: 164",
    "Georgia": "88: 052",
    "Germany, Federal Republic Of": "89: 024",
    "Ghana": "90: 165",
    "Gibraltar": "91: 084",
    "Greece": "92: 025",
    "Greenland": "93: 521",
    "Grenada": "94: 626",
    "Guadeloupe": "95: 653",
    "Guam": "96: 832",
    "Guatemala": "97: 544",
    "Guernsey": "98: 409",
    "Guinea": "99: 166",
    "Guinea-Bissau": "100: 167",
    "Guyana": "101: 711",
    "Haiti": "102: 654",
    "Heard and MacDonald Islands": "103: 410",
    "Honduras": "104: 545",
    "Hong Kong": "105: 204",
    "Hungary": "106: 026",
    "Iceland": "107: 085",
    "India": "108: 205",
    "Indonesia": "109: 222",
    "Iran": "110: 223",
    "Iraq": "111: 224",
    "Ireland": "112: 027",
    "Isle of Man": "113: 411",
    "Israel": "114: 206",
    "Italy": "115: 028",
    "Ivory Coast": "116: 169",
    "Jamaica": "117: 602",
    "Japan": "118: 207",
    "Jordan": "119: 225",
    "Kampuchea Democratic Rep.": "120: 211",
    "Kazakhstan": "121: 053",
    "Kenya": "122: 132",
    "Kiribati": "123: 831",
    "Korea, North (DPRK)": "124: 257",
    "Korea, South": "125: 258",
    "Kosovo": "126: 064",
    "Kuwait": "127: 226",
    "Kyrgyzstan": "128: 054",
    "Laos": "129: 260",
    "Latvia": "130: 019",
    "Lebanon": "131: 208",
    "Lesotho": "132: 152",
    "Liberia": "133: 170",
    "Libya": "134: 171",
    "Liechtenstein": "135: 086",
    "Lithuania": "136: 020",
    "Luxembourg": "137: 013",
    "Macao": "138: 261",
    "Macedonia": "139: 070",
    "Madagascar": "140: 172",
    "Madeira": "141: 036",
    "Malawi": "142: 111",
    "Malaysia": "143: 242",
    "Maldives": "144: 901",
    "Mali": "145: 173",
    "Malta": "146: 030",
    "Marshall Islands": "147: 834",
    "Martinique": "148: 655",
    "Mauritania": "149: 174",
    "Mauritius": "150: 902",
    "Mayotte": "151: 906",
    "Mexico": "152: 501",
    "Moldova": "153: 055",
    "Monaco": "154: 087",
    "Mongolia": "155: 262",
    "Montenegro": "156: 063",
    "Montserrat": "157: 627",
    "Morocco": "158: 133",
    "Mozambique": "159: 175",
    "Namibia": "160: 122",
    "Nauru": "161: 341",
    "Nepal": "162: 264",
    "Netherlands Antilles, The": "163: 652",
    "Netherlands, The": "164: 031",
    "Nevis": "165: 628",
    "New Caledonia": "166: 822",
    "New Zealand": "167: 339",
    "Nicaragua": "168: 546",
    "Niger": "169: 176",
    "Nigeria": "170: 177",
    "Niue": "171: 414",
    "Northern Ireland": "172: 006",
    "Northern Mariana Islands": "173: 830",
    "Norway": "174: 032",
    "Oman": "175: 263",
    "Pakistan": "176: 209",
    "Palestinian Authority": "177: 213",
    "Panama": "178: 547",
    "Papua New Guinea": "179: 342",
    "Paraguay": "180: 755",
    "Peru": "181: 723",
    "Philippines": "182: 227",
    "Pitcairn Islands": "183: 842",
    "Poland": "184: 033",
    "Portugal": "185: 034",
    "Puerto Rico": "186: 656",
    "Qatar": "187: 265",
    "Republic of Congo": "188: 159",
    "Republic of Palau": "189: 836",
    "Réunion": "190: 903",
    "Romania": "191: 088",
    "Russia": "192: 056",
    "Rwanda": "193: 179",
    "Saint Helena": "194: 915",
    "Saint Kitts and Nevis": "195: 629",
    "Saint Lucia": "196: 630",
    "Saint Pierre and Miquelon": "197: 531",
    "Saint-Barthelemy": "198: 407",
    "Saint-Martin": "199: 415",
    "Samoa": "200: 844",
    "Samoa, American": "201: 843",
    "San Marino": "202: 089",
    "Sao Tome and Principe": "203: 914",
    "Saudi Arabia": "204: 231",
    "Scotland": "205: 007",
    "Senegal": "206: 180",
    "Serbia And Montenegro": "207: 061",
    "Serbia, Republic Of": "208: 062",
    "Seychelles": "209: 904",
    "Sierra Leone": "210: 181",
    "Singapore": "211: 246",
    "Sint-Maarten": "212: 416",
    "Slovakia": "213: 016",
    "Slovenia": "214: 047",
    "Solomon Islands": "215: 824",
    "Somalia": "216: 182",
    "South Africa, Republic Of": "217: 121",
    "South Sudan": "218: 189",
    "Spain": "219: 037",
    "Sri Lanka": "220: 201",
    "St. Vincent and the Grenadines": "221: 631",
    "Sudan": "222: 185",
    "Suriname": "223: 752",
    "Swaziland": "224: 186",
    "Sweden": "225: 040",
    "Switzerland": "226: 041",
    "Syria": "227: 210",
    "Taiwan": "228: 203",
    "Tajikistan": "229: 057",
    "Tanzania": "230: 130",
    "Thailand": "231: 267",
    "Tibet (Autonomous Region)": "232: 268",
    "Togo": "233: 187",
    "Tokelau": "234: 417",
    "Tonga": "235: 846",
    "Trinidad and Tobago": "236: 605",
    "Tunisia": "237: 135",
    "Turkey": "238: 045",
    "Turkmenistan": "239: 058",
    "Turks and Caicos Islands": "240: 632",
    "Tuvalu": "241: 826",
    "U.S. Minor outlying Islands": "242: 418",
    "Uganda": "243: 136",
    "Ukraine": "244: 059",
    "Union Of Soviet Socialist Rep": "245: 042",
    "United Arab Emirates": "246: 280",
    "United States of America": "247: 461",
    "Unknown": "248: 000",
    "Uruguay": "249: 724",
    "Uzbekistan": "250: 060",
    "Vanuatu": "251: 823",
    "Vatican City State": "252: 090",
    "Venezuela": "253: 725",
    "Vietnam": "254: 270",
    "Virgin Islands, U.S.": "255: 657",
    "Wales": "256: 008",
    "Wallis and Futuna Is., Terr.": "257: 841",
    "Western Sahara": "258: 184",
    "Yemen": "259: 273",
    "Yugoslavia": "260: 044",
    "Zambia": "261: 112",
    "Zimbabwe": "262: 113",
}

const country_residence = {
    "Afghanistan": "252",
    "Albania": "081",
    "Algeria": "131",
    "Andorra": "082",
    "Angola": "151",
    "Anguilla": "620",
    "Antigua And Barbuda": "621",
    "Argentina": "703",
    "Armenia": "049",
    "Aruba": "658",
    "Australia": "305",
    "Austria": "011",
    "Azerbaijan": "050",
    "Azores": "035",
    "Bahamas": "622",
    "Bahrain": "253",
    "Bangladesh": "212",
    "Barbados": "610",
    "Belarus": "051",
    "Belgium": "012",
    "Belize": "541",
    "Benin": "160",
    "Bermuda": "601",
    "Bhutan": "254",
    "Bolivia": "751",
    "Bosnia and Herzegovina": "048",
    "Botswana": "153",
    "Brazil": "709",
    "British Virgin Islands": "633",
    "Brunei Darussalam": "255",
    "Bulgaria": "083",
    "Burkina Faso": "188",
    "Burma (Myanmar)": "241",
    "Burundi": "154",
    "Cabo Verde": "911",
    "Cambodia": "256",
    "Cameroon": "155",
    "Canada": "511",
    "Canary Islands": "039",
    "Cayman Islands": "624",
    "Central African Republic": "157",
    "Chad": "156",
    "Channel Islands": "009",
    "Chile": "721",
    "China": "202",
    "China (Hong Kong SAR)": "200",
    "China (Macao SAR)": "198",
    "Colombia": "722",
    "Comoros": "905",
    "Cook Islands": "840",
    "Costa Rica": "542",
    "Croatia": "043",
    "Cuba": "650",
    "Cyprus": "221",
    "Czech Republic": "015",
    "Democratic Rep. of Congo": "158",
    "Denmark": "017",
    "Djibouti": "183",
    "Dominica": "625",
    "Dominican Republic": "651",
    "East Timor": "916",
    "Ecuador": "753",
    "Egypt": "101",
    "El Salvador": "543",
    "England": "002",
    "Equatorial Guinea": "178",
    "Eritrea": "162",
    "Estonia": "018",
    "Ethiopia": "161",
    "Falkland Islands": "912",
    "Federated States of Micronesia": "835",
    "Fiji": "801",
    "Finland": "021",
    "Fr. South. and Antarctic Lands": "821",
    "France": "022",
    "French Guiana": "754",
    "French Polynesia": "845",
    "Gabon": "163",
    "Gambia": "164",
    "Georgia": "052",
    "Germany, Federal Republic Of": "024",
    "Ghana": "165",
    "Gibraltar": "084",
    "Greece": "025",
    "Greenland": "521",
    "Grenada": "626",
    "Guadeloupe": "653",
    "Guam": "832",
    "Guatemala": "544",
    "Guinea": "166",
    "Guinea-Bissau": "167",
    "Guyana": "711",
    "Haiti": "654",
    "Honduras": "545",
    "Hong Kong": "204",
    "Hungary": "026",
    "Iceland": "085",
    "India": "205",
    "Indonesia": "222",
    "Iran": "223",
    "Iraq": "224",
    "Ireland": "027",
    "Israel": "206",
    "Italy": "028",
    "Ivory Coast": "169",
    "Jamaica": "602",
    "Japan": "207",
    "Jordan": "225",
    "Kazakhstan": "053",
    "Kenya": "132",
    "Kiribati": "831",
    "Korea, North (DPRK)": "257",
    "Korea, South": "258",
    "Kosovo": "064",
    "Kuwait": "226",
    "Kyrgyzstan": "054",
    "Laos": "260",
    "Latvia": "019",
    "Lebanon": "208",
    "Lesotho": "152",
    "Liberia": "170",
    "Libya": "171",
    "Liechtenstein": "086",
    "Lithuania": "020",
    "Luxembourg": "013",
    "Macao": "261",
    "Macedonia": "070",
    "Madagascar": "172",
    "Madeira": "036",
    "Malawi": "111",
    "Malaysia": "242",
    "Maldives": "901",
    "Mali": "173",
    "Malta": "030",
    "Marshall Islands": "834",
    "Martinique": "655",
    "Mauritania": "174",
    "Mauritius": "902",
    "Mayotte": "906",
    "Mexico": "501",
    "Moldova": "055",
    "Monaco": "087",
    "Mongolia": "262",
    "Montenegro": "063",
    "Montserrat": "627",
    "Morocco": "133",
    "Mozambique": "175",
    "Namibia": "122",
    "Nauru": "341",
    "Nepal": "264",
    "Netherlands Antilles, The": "652",
    "Netherlands, The": "031",
    "Nevis": "628",
    "New Caledonia": "822",
    "New Zealand": "339",
    "Nicaragua": "546",
    "Niger": "176",
    "Nigeria": "177",
    "North Vietnam": "271",
    "Northern Ireland": "006",
    "Northern Mariana Islands": "830",
    "Norway": "032",
    "Oman": "263",
    "Pakistan": "209",
    "Palestinian Authority": "213",
    "Panama": "547",
    "Papua New Guinea": "342",
    "Paraguay": "755",
    "Peru": "723",
    "Philippines": "227",
    "Pitcairn Islands": "842",
    "Poland": "033",
    "Portugal": "034",
    "Puerto Rico": "656",
    "Qatar": "265",
    "Republic of Congo": "159",
    "Republic of Palau": "836",
    "Réunion": "903",
    "Romania": "088",
    "Russia": "056",
    "Rwanda": "179",
    "Saint Helena": "915",
    "Saint Kitts and Nevis": "629",
    "Saint Lucia": "630",
    "Saint Pierre and Miquelon": "531",
    "Saint-Martin": "415",
    "Samoa": "844",
    "Samoa, American": "843",
    "San Marino": "089",
    "Sao Tome and Principe": "914",
    "Saudi Arabia": "231",
    "Scotland": "007",
    "Senegal": "180",
    "Serbia, Republic Of": "062",
    "Seychelles": "904",
    "Sierra Leone": "181",
    "Singapore": "246",
    "Slovakia": "016",
    "Slovenia": "047",
    "Solomon Islands": "824",
    "Somalia": "182",
    "South Africa, Republic Of": "121",
    "South Sudan": "189",
    "Spain": "037",
    "Sri Lanka": "201",
    "St. Vincent and the Grenadines": "631",
    "Sudan": "185",
    "Suriname": "752",
    "Swaziland": "186",
    "Sweden": "040",
    "Switzerland": "041",
    "Syria": "210",
    "Taiwan": "203",
    "Tajikistan": "057",
    "Tanzania": "130",
    "Thailand": "267",
    "Togo": "187",
    "Tonga": "846",
    "Trinidad and Tobago": "605",
    "Tunisia": "135",
    "Turkey": "045",
    "Turkmenistan": "058",
    "Turks and Caicos Islands": "632",
    "Tuvalu": "826",
    "Uganda": "136",
    "Ukraine": "059",
    "United Arab Emirates": "280",
    "United States of America": "461",
    "Unknown": "000",
    "Uruguay": "724",
    "Uzbekistan": "060",
    "Vanuatu": "823",
    "Vatican City State": "090",
    "Venezuela": "725",
    "Vietnam": "270",
    "Virgin Islands, U.S.": "657",
    "Wales": "008",
    "Wallis and Futuna Is., Terr.": "841",
    "Western Sahara": "184",
    "Yemen": "273",
    "Zambia": "112",
    "Zimbabwe": "113",
}

const country_passport = {
    "AFG (Afghanistan)": "1: 252",
    "AGO (Angola)": "2: 151",
    "ALB (Albania)": "3: 081",
    "AND (Andorra)": "4: 082",
    "ANG (Anguilla)": "5: 620",
    "ARE (United Arab Emirates)": "6: 280",
    "ARG (Argentina)": "7: 703",
    "ARM (Armenia)": "8: 049",
    "ATG (Antigua And Barbuda)": "9: 621",
    "AUS (Australia)": "10: 305",
    "AUT (Austria)": "11: 011",
    "AZE (Azerbaijan)": "12: 050",
    "BDI (Burundi)": "13: 154",
    "BEL (Belgium)": "14: 012",
    "BEN (Benin)": "15: 160",
    "BFA (Burkina Faso)": "16: 188",
    "BGD (Bangladesh)": "17: 212",
    "BGR (Bulgaria)": "18: 083",
    "BHR (Bahrain)": "19: 253",
    "BHS (Bahamas)": "20: 622",
    "BIH (Bosnia and Herzegovina)": "21: 048",
    "BLR (Belarus)": "22: 051",
    "BLZ (Belize)": "23: 541",
    "BMU (Bermuda)": "24: 601",
    "BOL (Bolivia)": "25: 751",
    "BRA (Brazil)": "26: 709",
    "BRB (Barbados)": "27: 610",
    "BRN (Brunei Darussalam)": "28: 255",
    "BTN (Bhutan)": "29: 254",
    "BWA (Botswana)": "30: 153",
    "CAF (Central African Republic)": "31: 157",
    "CAN (Canada)": "32: 511",
    "CHE (Switzerland)": "33: 041",
    "CHL (Chile)": "34: 721",
    "CHN (China (Hong Kong SAR))": "35: 200",
    "CHN (China (Macao SAR))": "36: 198",
    "CHN (China)": "37: 202",
    "CIV (Ivory Coast)": "38: 169",
    "CMR (Cameroon)": "39: 155",
    "COD (Democratic Rep. of Congo)": "40: 158",
    "COG (Republic of Congo)": "41: 159",
    "COL (Colombia)": "42: 722",
    "COM (Comoros)": "43: 905",
    "CPV (Cabo Verde)": "44: 911",
    "CRI (Costa Rica)": "45: 542",
    "CUB (Cuba)": "46: 650",
    "CYM (Cayman Islands)": "47: 624",
    "CYP (Cyprus)": "48: 221",
    "CZE (Czech Republic)": "49: 015",
    "D (Germany, Federal Republic Of)": "50: 024",
    "DJI (Djibouti)": "51: 183",
    "DMA (Dominica)": "52: 625",
    "DNK (Denmark)": "53: 017",
    "DOM (Dominican Republic)": "54: 651",
    "DZA (Algeria)": "55: 131",
    "ECU (Ecuador)": "56: 753",
    "EGY (Egypt)": "57: 101",
    "ERI (Eritrea)": "58: 162",
    "ESP (Spain)": "59: 037",
    "EST (Estonia)": "60: 018",
    "ETH (Ethiopia)": "61: 161",
    "FIN (Finland)": "62: 021",
    "FJI (Fiji)": "63: 801",
    "FRA (France)": "64: 022",
    "FSM (Federated States of Micronesia)": "65: 835",
    "GAB (Gabon)": "66: 163",
    "GBD (UK - Brit. overseas terr.)": "67: 005",
    "GBN (UK - Brit. Ntl. Overseas)": "68: 010",
    "GBO (UK - Brit. overseas citizen)": "69: 004",
    "GBP (UK - Brit. protected person)": "70: 917",
    "GBR (UK - British citizen)": "71: 003",
    "GBS (UK - British subject)": "72: 001",
    "GEO (Georgia)": "73: 052",
    "GHA (Ghana)": "74: 165",
    "GIN (Guinea)": "75: 166",
    "GMB (Gambia)": "76: 164",
    "GNB (Guinea-Bissau)": "77: 167",
    "GNQ (Equatorial Guinea)": "78: 178",
    "GRC (Greece)": "79: 025",
    "GRD (Grenada)": "80: 626",
    "GTM (Guatemala)": "81: 544",
    "GUY (Guyana)": "82: 711",
    "HND (Honduras)": "83: 545",
    "HRV (Croatia)": "84: 043",
    "HTI (Haiti)": "85: 654",
    "HUN (Hungary)": "86: 026",
    "IDN (Indonesia)": "87: 222",
    "IND (India)": "88: 205",
    "IRL (Ireland)": "89: 027",
    "IRN (Iran)": "90: 223",
    "IRQ (Iraq)": "91: 224",
    "ISL (Iceland)": "92: 085",
    "ISR (Israel)": "93: 206",
    "ITA (Italy)": "94: 028",
    "JAM (Jamaica)": "95: 602",
    "JOR (Jordan)": "96: 225",
    "JPN (Japan)": "97: 207",
    "KAZ (Kazakhstan)": "98: 053",
    "KEN (Kenya)": "99: 132",
    "KGZ (Kyrgyzstan)": "100: 054",
    "KHM (Cambodia)": "101: 256",
    "KIR (Kiribati)": "102: 831",
    "KNA (Saint Kitts and Nevis)": "103: 629",
    "KOR (Korea, South)": "104: 258",
    "KWT (Kuwait)": "105: 226",
    "LAO (Laos)": "106: 260",
    "LBN (Lebanon)": "107: 208",
    "LBR (Liberia)": "108: 170",
    "LBY (Libya)": "109: 171",
    "LCA (Saint Lucia)": "110: 630",
    "LIE (Liechtenstein)": "111: 086",
    "LKA (Sri Lanka)": "112: 201",
    "LSO (Lesotho)": "113: 152",
    "LTU (Lithuania)": "114: 020",
    "LUX (Luxembourg)": "115: 013",
    "LVA (Latvia)": "116: 019",
    "MAR (Morocco)": "117: 133",
    "MCO (Monaco)": "118: 087",
    "MDA (Moldova)": "119: 055",
    "MDG (Madagascar)": "120: 172",
    "MDV (Maldives)": "121: 901",
    "MEX (Mexico)": "122: 501",
    "MHL (Marshall Islands)": "123: 834",
    "MKD (Macedonia)": "124: 070",
    "MLI (Mali)": "125: 173",
    "MLT (Malta)": "126: 030",
    "MMR (Burma (Myanmar))": "127: 241",
    "MNE (Montenegro)": "128: 063",
    "MNG (Mongolia)": "129: 262",
    "MOZ (Mozambique)": "130: 175",
    "MRT (Mauritania)": "131: 174",
    "MSR (Montserrat)": "132: 627",
    "MUS (Mauritius)": "133: 902",
    "MWI (Malawi)": "134: 111",
    "MYS (Malaysia)": "135: 242",
    "NAM (Namibia)": "136: 122",
    "NER (Niger)": "137: 176",
    "NGA (Nigeria)": "138: 177",
    "NIC (Nicaragua)": "139: 546",
    "NLD (Netherlands, The)": "140: 031",
    "NOR (Norway)": "141: 032",
    "NPL (Nepal)": "142: 264",
    "NRU (Nauru)": "143: 341",
    "NZL (New Zealand)": "144: 339",
    "OMN (Oman)": "145: 263",
    "PAK (Pakistan)": "146: 209",
    "PAN (Panama)": "147: 547",
    "PER (Peru)": "148: 723",
    "PHL (Philippines)": "149: 227",
    "PLW (Republic of Palau)": "150: 836",
    "PNG (Papua New Guinea)": "151: 342",
    "POL (Poland)": "152: 033",
    "PRK (Korea, North (DPRK))": "153: 257",
    "PRT (Portugal)": "154: 034",
    "PRY (Paraguay)": "155: 755",
    "PSE (Palestinian Authority)": "156: 213",
    "QAT (Qatar)": "157: 265",
    "RKS (Kosovo)": "158: 064",
    "ROU (Romania)": "159: 088",
    "RUS (Russia)": "160: 056",
    "RWA (Rwanda)": "161: 179",
    "SAU (Saudi Arabia)": "162: 231",
    "SDN (Sudan)": "163: 185",
    "SEN (Senegal)": "164: 180",
    "SGP (Singapore)": "165: 246",
    "SHN (Saint Helena)": "166: 915",
    "SLB (Solomon Islands)": "167: 824",
    "SLE (Sierra Leone)": "168: 181",
    "SLV (El Salvador)": "169: 543",
    "SMR (San Marino)": "170: 089",
    "SOM (Somalia)": "171: 182",
    "SRB (Serbia, Republic Of)": "172: 062",
    "SSD (South Sudan)": "173: 189",
    "STP (Sao Tome and Principe)": "174: 914",
    "SUR (Suriname)": "175: 752",
    "SVK (Slovakia)": "176: 016",
    "SVN (Slovenia)": "177: 047",
    "SWE (Sweden)": "178: 040",
    "SWZ (Swaziland)": "179: 186",
    "SYC (Seychelles)": "180: 904",
    "SYR (Syria)": "181: 210",
    "TCA (Turks and Caicos Islands)": "182: 632",
    "TCD (Chad)": "183: 156",
    "TGO (Togo)": "184: 187",
    "THA (Thailand)": "185: 267",
    "TJK (Tajikistan)": "186: 057",
    "TKM (Turkmenistan)": "187: 058",
    "TLS (East Timor)": "188: 916",
    "TON (Tonga)": "189: 846",
    "TTO (Trinidad and Tobago)": "190: 605",
    "TUN (Tunisia)": "191: 135",
    "TUR (Turkey)": "192: 045",
    "TUV (Tuvalu)": "193: 826",
    "TWN (Taiwan)": "194: 203",
    "TZA (Tanzania)": "195: 130",
    "UGA (Uganda)": "196: 136",
    "UKR (Ukraine)": "197: 059",
    "UNA (UN specialized agency)": "198: 981",
    "UNO (UN or official)": "199: 980",
    "URY (Uruguay)": "200: 724",
    "USA (United States of America)": "201: 461",
    "UZB (Uzbekistan)": "202: 060",
    "VAT (Vatican City State)": "203: 090",
    "VCT (St. Vincent and the Grenadines)": "204: 631",
    "VEN (Venezuela)": "205: 725",
    "VGB (British Virgin Islands)": "206: 633",
    "VNM (Vietnam)": "207: 270",
    "VUT (Vanuatu)": "208: 823",
    "WSM (Samoa)": "209: 844",
    "YEM (Yemen)": "210: 273",
    "ZAF (South Africa, Republic Of)": "211: 121",
    "ZMB (Zambia)": "212: 112",
    "ZWE (Zimbabwe)": "213: 113",
}



class Country {
    constructor(country) {
        this.country = country;
    }

    /**
     * get_value:
     * 1. if country in country_data.keys()(only compare in lower case), return the value
     * 2. else if not in the keys, try to check if any key includes the country. If included and only one result, return the value; else find the best matched and return the value.
     * 3. else find the best matched and return the value
     */
    get_value(country_data, country, return_country_name = false) {
        let included_countries = [];

        for (let c in country_data) {
            if (c.toLowerCase() === country.toLowerCase()) {
                return return_country_name ? c : country_data[c];
            } else if (c.toLowerCase().includes(country.toLowerCase())) {
                included_countries.push(c);
            }
        }

        // only one, then return value
        let matches = included_countries.length;
        if (matches === 1) {
            let result = included_countries[0];
            return return_country_name ? result : country_data[result];
        } else if (matches > 1) {
            let matched_country = bestMatch(
                country,
                included_countries,
                true // to_lowercase=True
            );
            return return_country_name ? matched_country : country_data[matched_country];
        }

        // not in keys, and not included in keys
        let matched_country = bestMatch(
            country,
            Object.keys(country_data),
            true // to_lowercase=True
        );
        return return_country_name ? matched_country : country_data[matched_country];
    }

    get passport_index() {
        return this.get_value(country_passport, this.country);
    }

    get passport_country() {
        return this.get_value(country_passport, this.country, true);
    }

    get residence_index() {
        return this.get_value(country_residence, this.country);
    }

    get residence_country() {
        return this.get_value(country_residence, this.country, true);
    }

    get birth_index() {
        return this.get_value(country_birth, this.country);
    }

    get birth_country() {
        return this.get_value(country_birth, this.country, true);
    }

    get citizen_index() {
        return this.get_value(country_citizen, this.country);
    }

    get citizen_country() {
        return this.get_value(country_citizen, this.country, true);
    }
}

// const c1 = new Country("Germany");

// console.log(c1.birth_index, c1.birth_country);
// console.log(c1.citizen_index, c1.citizen_country);
// console.log(c1.passport_index, c1.passport_country);
// console.log(c1.residence_index, c1.residence_country);

module.exports = Country;