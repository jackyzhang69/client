""" 
SINP Entrepreneur Immigration based on May 10, 2016
"""

age_points = [
    [0, 20, 0],
    [21, 29, 10],
    [30, 39, 15],
    [40, 54, 10],
    [55, 200, 0],
]

visited_points = {True: 15}

language_points = {10: 15, 9: 15, 8: 15, 7: 15, 6: 15, 5: 10, 4: 5}

""" 
Qualified trade:
Has a trade or occupational certification that required at least one (1) year full time post secondary training or apprenticeship equivalent
Qualified bachelor or above:
Has completed a Bachelor Degree or PostGraduate Degree/Designation in a Business, Agriculture, or Science/Technology field
"""
education_points = {0: 10, 1: 15,2:0}  # qualified_trade  # qualified_bachelor 2 for others with 0 points
educations = {0: "Qualified trade", 1: "Qualified bachelor"}

# business sector
net_asset_points = [
    [500000, 549999, 0],
    [550000, 749999, 5],
    [750000, 999999, 10],
    [1000000, 900000000000, 15],
]

experience_points = [[4, 7, 10], [8, 100, 15]]
# if with 50%+ ownership in above range , it will be additional 5 points
ownership50plus_flag_points = 5

business_revenue_points = [
    [50000, 99999, 5],
    [100000, 249999, 10],
    [250000, 499999, 15],
    [500000, 90000000000, 20],
]
""" 
If with experience in below innovative factor, will have 10 points
Export Trade
Registered patents
Gazelle business
    
"""
innovation_points = {True: 10}

# Business establishment plan
investment_points = [
    [200000, 349999, 0],
    [350000, 499999, 5],
    [500000, 749999, 10],
    [750000, 999999, 15],
    [1000000, 10000000, 20],
]

""" 
if in these economic factors, will have 15 points
Science and technology
Manufacturing
Export
Rural business succession
Rural business development
"""
key_economic_points = {True: 15}
