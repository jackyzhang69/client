from assess.nocs.er_map import ER_MAP
from pydantic import BaseModel, Field, validator
from base.utils.utils import best_match

ER_LIST = ER_MAP.keys()
PROVINCES = [
    "NL",
    "PE",
    "NS",
    "NB",
    "QC",
    "ON",
    "MB",
    "SK",
    "AB",
    "BC",
    "YK",
    "NT",
    "NU",
]


class EconomicRegion(BaseModel):
    def er_name(self, er_code):
        if er_code not in ER_LIST:
            raise ValueError(f"{er_code} is not a valid Econoimc Region code. ")
        return ER_MAP[er_code]["er_name"]

    def er_code(self, er_name: str):
        er_map_reverse = {v["er_name"]: k for k, v in ER_MAP.items()}
        er_name = best_match(er_name, er_map_reverse.keys())
        return er_map_reverse[er_name]

    def get_ers(self, province: str):
        if province not in PROVINCES and province.upper() != "ALL":
            raise ValueError(
                f"{province} is not a legal abbreviations of Canada provinces {PROVINCES}"
            )
        ers = [["ER Code", "ER Name"]]
        for er_code, value in ER_MAP.items():
            if value["province"] == province or province.upper() == "ALL":
                er = [er_code, value["er_name"]]
                ers.append(er)
        return ers

    def get_prov(self, er_code: str):
        if er_code in ER_MAP.keys():
            return ER_MAP[er_code]["province"]
        else:
            raise ValueError(f"{er_code} is not a valid Economic Region code")
