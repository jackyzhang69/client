# Age points here
age_points = (
    [18, 90, 99],
    [19, 95, 105],
    [30, 95, 105],
    [31, 90, 99],
    [32, 85, 94],
    [33, 80, 88],
    [34, 75, 83],
    [35, 70, 77],
    [36, 65, 72],
    [37, 60, 66],
    [38, 55, 61],
    [39, 50, 55],
    [40, 45, 50],
    [41, 35, 39],
    [42, 25, 28],
    [43, 15, 17],
    [44, 5, 6],
)

age_with_sp_points = {row[0]: row[1] for row in age_points}
age_without_sp_points = {row[0]: row[2] for row in age_points}

# Education points here
# Bachelor & Associate Degree 是BCPNP里面定义的，为了做成统一的education数据结构，加到这里单独赋值
# Bachelor分数跟3年的 post secondary 一样 Associate Degree跟2年的post secondary 一样。
edu_levels = {
    0: "Doctor",
    1: "Master",
    2: "Professional",
    3: "Bachelor",
    4: "Associate Degree",
    5: "Two more post-secondary",
    6: "3-year post-secondary",
    7: "2-year post-secondary",
    8: "1-year post-secondary",
    9: "Secondary",
    10: "Under Secondary",
}


edu_level_without_sp_points = {
    0: 150,
    1: 135,
    2: 135,  # professional degree needed to practice in a licensed profession. https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/federal-skilled-workers/selection-criteria-education.html#after
    3: 120,
    4: 98,
    5: 128,  # Two or more post-secondary, at least one is more than 3 year
    6: 120,
    7: 98,
    8: 90,
    9: 30,
    10: 0,
}

edu_level_with_sp_points = {
    0: 140,
    1: 126,
    2: 126,  # professional degree needed to practice in a licensed profession. https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/federal-skilled-workers/selection-criteria-education.html#after
    3: 112,
    4: 91,
    5: 119,  # Two or more post-secondary, at least one is more than 3 year
    6: 112,
    7: 91,
    8: 84,
    9: 28,
    10: 0,
}


# Language points here
clb_points = (
    [10, 32, 34],
    [9, 29, 31],
    [8, 22, 23],
    [7, 16, 17],
    [6, 8, 9],
    [5, 6, 6],
    [4, 6, 6],
)
clb_with_sp_points = {clb[0]: clb[1] for clb in clb_points}
clb_without_sp_points = {clb[0]: clb[2] for clb in clb_points}

# Second official language (maximum 4 points)
clb_points2 = ([5, 1, 1], [6, 1, 1], [7, 3, 3], [8, 3, 3], [9, 6, 6])

clb2_with_sp_points = {clb[0]: clb[1] for clb in clb_points2}
clb2_without_sp_points = {clb[0]: clb[2] for clb in clb_points2}

# Canadian work experience points here
canadian_work_experience_points = (
    [1, 35, 40],
    [2, 46, 53],
    [3, 56, 64],
    [4, 63, 72],
    [5, 70, 80],
)

canadian_work_experience_with_sp_points = {
    cwe[0]: cwe[1] for cwe in canadian_work_experience_points
}
canadian_work_experience_without_sp_points = {
    cwe[0]: cwe[2] for cwe in canadian_work_experience_points
}

# spouse educaiton points table
sp_edu_points = {
    0: 10,
    1: 10,
    2: 10,  # professional degree needed to practice in a licensed profession. https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/federal-skilled-workers/selection-criteria-education.html#after
    3: 8,
    4: 7,
    5: 9,  # Two or more post-secondary, at least one is more than 3 year
    6: 8,
    7: 7,
    8: 6,
    9: 2,
    10: 0,
}

# spouse languange points table
sp_language_points = {5: 1, 6: 1, 7: 3, 8: 3, 9: 5}

# spouse Canadian work experiene points table
sp_ca_we_points = {1: 5, 2: 7, 3: 8, 4: 9, 5: 10}


# With good official language proficiency (Canadian Language Benchmark Level [CLB] 7 or higher) and a post-secondary degree
# Points for CLB 7 or more on all first official language abilities, with one or more under CLB 9 (Maximum 25 points)
# Points for CLB 9 or more on all four first official language abilities (Maximum 50 points)
edu_language7_points = {
    0: 25,
    1: 25,
    2: 25,
    3: 13,
    4: 13,
    5: 25,
    6: 13,
    7: 13,
    8: 13,
    9: 0,
    10: 0,
}

edu_language9_points = {
    0: 50,
    1: 50,
    2: 50,
    3: 25,
    4: 25,
    5: 50,
    6: 25,
    7: 25,
    8: 25,
    9: 0,
    10: 0,
}


# With Canadian work experience and a post-secondary degree
# Points for education + 1 year of Canadian work experience (Maximum 25 points)
# Points for education + 2 years or more of Canadian work experience (Maximum 50 points)
edu_ca_we1_points = {
    0: 25,
    1: 25,
    2: 25,
    3: 13,
    4: 13,
    5: 25,
    6: 13,
    7: 13,
    8: 13,
    9: 0,
    10: 0,
}

edu_ca_we2_points = {
    0: 50,
    1: 50,
    2: 50,
    3: 25,
    4: 25,
    5: 50,
    6: 25,
    7: 25,
    8: 25,
    9: 0,
    10: 0,
}


# Foreign work experience – With good official language proficiency (Canadian Language Benchmark Level [CLB] 7 or higher)
# Points for foreign work experience + CLB 7 or more on all first official language abilities, one or more under 9 (Maximum 25 points)
# Points for foreign work experience + CLB 9 or more on all four first official language abilities (Maximum 50 points)
foreign_we_languange7_points = {0: 0, 1: 13, 2: 13, 3: 25}

foreign_we_languange9_points = {0: 0, 1: 25, 2: 25, 3: 50}


# Foreign work experience – With Canadian work experience
# Points for foreign work experience + 1 year of Canadian work experience (Maximum 25 points)
# Points for foreign work experience + 2 years or more of Canadian work experience (Maximum 50 points)

foreign_we_ca1_we_points = {0: 0, 1: 13, 2: 13, 3: 25}

foreign_we_ca2_we_points = {0: 0, 1: 25, 2: 25, 3: 50}
