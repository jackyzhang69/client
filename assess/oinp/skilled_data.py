""" Based on OINP """

teer_level_points = {"0": 10, "1": 10, "2": 8, "3": 8, "4": 0, "5": 0}

category_points = {
    "0": 10,
    "2": 10,
    "3": 10,
    "7": 7,
    "1": 5,
    "9": 5,
    "4": 4,
    "8": 4,
    "5": 3,
    "6": 3,
}

hourly_rate_points = [
    [40, 100000, 10],
    [35, 39.99, 8],
    [30, 34.99, 7],
    [25, 29.99, 6],
    [20, 24.99, 5],
    [0, 19.99, 0],
]

workpermit_points = {True: 10}

woring_6m_plus_points = {True: 3}

earning_40k_plus_points = {True: 3}

language_points = {10: 10, 9: 10, 8: 6, 7: 4, 6: 0}

num_official_language_points = {2: 10, 1: 5}

area_points = {
    0: 0,  # Toronto
    1: 3,  # Inside GTA (except Toronto)
    2: 8,  # Other areas outside GTA (except Northern Ontario)
    3: 10,  # Northern Ontario
}

areas = {
    0: "area0",
    1: "area1",
    2: "area2",
    3: "area3",
}
"""
PhD – 10 points
Masters – 8 points
Bachelors or equivalent – 6 points
College diploma or trade certificate – 5 points
Less than college or trade certificate – 0 points
"""
educations = {
    0: "Doctor",
    1: "Master",
    2: "Bachelor",
    3: "Trades certification or Diploma",
    4: "Secondary or below",
}

education_points = {
    0: 10,  # Doctor
    1: 8,  # Master
    2: 6,  # Bachelor
    3: 5,  # Trades certification or Diploma
    4: 0,  # Secondary
}
"""
STEM/Health (Engineering, Health, Math, Computer Science) and Trades (agriculture and natural resources operations and management, mechanics and repair, architecture, construction and precision production) - 12 points
Business and administration, social, legal, education, behavioral science, personal, security and transport services, social work and related programs - 6 points
Arts and humanities, BHASE programs, n.e.c - 0 points
"""
field_points = {
    0: 12,
    1: 6,
}

""" 
2 Official Languages – 10 points
1 Official Language – 5 points
"""
num_canadian_education_points = {2: 10, 1: 5}

""" 
Northern Ontario – 10 points
Other areas outside GTA (except Northern Ontario) – 8 points
Inside GTA (except Toronto) – 3 points
Toronto – 0 points
"""
study_location_poitns = {
    0: 0,
    1: 3,
    2: 8,
    3: 10,
}
