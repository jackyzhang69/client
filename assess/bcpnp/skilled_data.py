""" Based on BCPNP policy V2022-11-16"""

# work experience points, which is based on years
work_experience_points = [
    [5, 10000, 20],  # longer than 5 years
    [4, 5, 16],
    [3, 4, 12],
    [2, 3, 8],
    [1, 2, 4],
    [0.0000001, 1, 1],  # less than 1 years
]

# single logical check score
working_in_the_position_points = {True: 10}
one_year_experience_point = {True: 10}

# Education points
education_points = {
    0: 27,
    1: 22,
    2: 15,
    3: 15,
    4: 5,
    5: 5,
    6: 5,
    7: 0,
}
# Education bonus points
education_bonus_points = {0: 8, 1: 6}  # BC Post-secondary  # Canada Post-secondary

#    Eligible professional designation in B.C.
professional_designation = {
    True: 5,
}


# languange points
language_points = {10: 30, 9: 30, 8: 25, 7: 20, 6: 15, 5: 10, 4: 5}
english_french_above_clb4 = {True: 10}


# Wange range points
wage_points = [
    [70.00, 1000000, 55],
    [69.00, 69.99, 54],
    [68.00, 68.99, 53],
    [67.00, 67.99, 52],
    [66.00, 66.99, 51],
    [65.00, 65.99, 50],
    [64.00, 64.99, 49],
    [63.00, 63.99, 48],
    [62.00, 62.99, 47],
    [61.00, 61.99, 46],
    [60.00, 60.99, 45],
    [59.00, 59.99, 44],
    [58.00, 58.99, 43],
    [57.00, 57.99, 42],
    [56.00, 56.99, 41],
    [55.00, 55.99, 40],
    [54.00, 54.99, 39],
    [53.00, 53.99, 38],
    [52.00, 52.99, 37],
    [51.00, 51.99, 36],
    [50.00, 50.99, 35],
    [49.00, 49.99, 34],
    [48.00, 48.99, 33],
    [47.00, 47.99, 32],
    [46.00, 46.99, 31],
    [45.00, 45.99, 30],
    [44.00, 44.99, 29],
    [43.00, 43.99, 28],
    [42.00, 42.99, 27],
    [41.00, 41.99, 26],
    [40.00, 40.99, 25],
    [39.00, 39.99, 24],
    [38.00, 38.99, 23],
    [37.00, 37.99, 22],
    [36.00, 36.99, 21],
    [35.00, 35.99, 20],
    [34.00, 34.99, 19],
    [33.00, 33.99, 18],
    [32.00, 32.99, 17],
    [31.00, 31.99, 16],
    [30.00, 30.99, 15],
    [29.00, 29.99, 14],
    [28.00, 28.99, 13],
    [27.00, 27.99, 12],
    [26.00, 26.99, 11],
    [25.00, 25.99, 10],
    [24.00, 24.99, 9],
    [23.00, 23.99, 8],
    [22.00, 22.99, 7],
    [21.00, 21.99, 6],
    [20.00, 20.99, 5],
    [19.00, 19.99, 4],
    [18.00, 18.99, 3],
    [17.00, 17.99, 2],
    [16.00, 16.99, 1],
    [0.00, 16.00, 0],
]

# Region points.
region_points = {
    0: 0,  # Metro Vancouver Regional District
    1: 5,  # Squamish, Abbotsford, Agassiz, Mission, and Chilliwack
    2: 15,  # Areas of B.C. not included in Area 1 or 2 1
}
regional_bonus = {True: 10}

# BCPNP NOC data
SPECIAL_OCCUPATIONS = {
    "33102": "For the purposes of the BC PNP, only health care assistants / health care aides are eligible under NOC 3413."
}

TECH_OCCUPATIONS = [
    "10030",
    "20012",
    "21100",
    "21210",
    "21211",
    "21220",
    "21221",
    "21222",
    "21223",
    "21230",
    "21231",
    "21232",
    "21233",
    "21234",
    "21300",
    "21301",
    "21310",
    "21311",
    "21320",
    "21399",
    "22110",
    "22220",
    "22221",
    "22222",
    "22310",
    "50011",
    "22312",
    "51111",
    "51112",
    "51120",
    "52119",
    "52112",
    "52113",
    "52120",
    "53111",
]

HEALTHCARE_OCCUPATIONS = [
    "30010",
    "31300",
    "31301",
    "31102",
    "31110",
    "31201",
    "31120",
    "31121",
    "31112",
    "31203",
    "32120",
    "32103",
    "32121",
    "32122",
    "32123",
    "32110",
    "32111",
    "32101",
    "32102",
    "41300",
    "42201",
    "31100",
    "31101",
    "31302",
    "31303",
    "32103",
    "31209",
    "31202",
    "31204",
    "32120",
    "32129",
    "32112",
    "32200",
    "32109",
    "33100",
    "31200",
    "41301",
    "33102",
]

CHILDCARE_OCCUPATIONS = ["42202"]

OTHER_OCCUPATIONS = [
    "31103",
    "32104",
    "41200",
]

# for definition
areas = {
    0: "area1",
    1: "area2",
    2: "area3",
}
education = {
    0: "Doctor",
    1: "Master",
    2: "Bachelor",
    3: "Post Graduate Certificate or Diploma",
    4: "Trades certification",
    5: "Associate Degree",
    6: "Non-trades certification or Diploma",
    7: "Secondary",
}

education_bonus = {
    0: "BC Post-secondary",
    1: "Canada Post-secondary",
}
