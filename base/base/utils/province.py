from assess.nocs.er_map import ER_MAP
from pydantic import BaseModel
from base.utils.db import Collection

prov_data = Collection("imm_data").find_one({"name": "prov_median"})
provincial_median_wage = prov_data.get("data") if prov_data else None

ER_LIST = ER_MAP.keys()
PROV_PROVINCE = {
    "NL": "Newfoundland and Labrador",
    "PE": "Prince Edward Island",
    "NS": "Nova Scotia",
    "NB": "New Brunswick",
    "QC": "Quebec",
    "ON": "Ontario",
    "MB": "Manitoba",
    "SK": "Saskatchewan",
    "AB": "Alberta",
    "BC": "British Columbia",
    "YK": "Yukon",
    "NT": "Northwest Territories",
    "NU": "Nunavut",
}
PROVINCE_PROV = {v: k for k, v in PROV_PROVINCE.items()}

ER_PROV = {
    "1000": "NL",
    "1110": "PE",
    "1200": "NS",
    "1300": "NB",
    "2400": "QC",
    "3500": "ON",
    "4600": "MB",
    "4700": "SK",
    "4800": "AB",
    "5900": "BC",
    "6010": "YK",
    "6110": "NT",
    "6210": "NU",
}
PROV_ER = {v: k for k, v in ER_PROV.items()}


class ProvinceData(BaseModel):
    prov: str
    province: str
    er: str

    @property
    def median_wage(self):
        return provincial_median_wage.get(self.prov)


class Province:
    def get_prov_er_by_area_er(self, area_er: str):
        prov = ER_MAP[area_er]["province"]
        return PROV_ER[prov]

    def get_by_prov(self, prov: str):
        if prov and prov.upper() not in PROV_PROVINCE.keys():
            raise ValueError(f"{prov} is not a valid province abbreviation")
        prov = prov.upper()
        data = {
            "er": PROV_ER[prov],
            "province": PROV_PROVINCE[prov],
            "prov": prov,
        }
        return ProvinceData(**data)

    # get province data by er code, which could be province's code or its area's er code
    def get_by_er(self, er: str):
        if er not in ER_LIST:
            raise ValueError(f"{er} is not a valid ER code")
        if er in ER_PROV.keys():
            data = {
                "er": er,
                "prov": ER_PROV[er],
                "province": PROV_PROVINCE[ER_PROV[er]],
            }
            return ProvinceData(**data)
        else:
            prov_er = self.get_prov_er_by_area_er(er)
            data = {
                "er": prov_er,
                "prov": ER_PROV[prov_er],
                "province": PROV_PROVINCE[ER_PROV[prov_er]],
            }
            return ProvinceData(**data)

    def get_by_province(self, province: str):
        if province not in PROV_PROVINCE.values():
            raise ValueError(f"{province} is not a valid province name")
        data = {
            "prov": PROVINCE_PROV[province],
            "province": province,
            "er": PROV_ER[PROVINCE_PROV[province]],
        }
        return ProvinceData(**data)
