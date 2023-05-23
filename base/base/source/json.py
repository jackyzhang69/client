from base.source.infosheet import Sheet, InfoNode
from base.source.tablesheet import Table, TableNode
from base.source.writer import ExcelWritter
from base.source.source import Source

import json
from config import BASEDIR

with open(BASEDIR/"base/source/schema.json") as f:
    schema = json.load(f)

# check if variable is in sheet of schema
def is_valid_sheet_variable(sheet_name,variable:str):
    if variable not in schema[sheet_name]["data"].keys():
        raise ValueError(f"Variable {variable} is not in schema")
    return True

# check if variable is in table of schema
def is_valid_table_variable(table_name,variable:str):
    if variable not in schema[table_name]["data"].keys():
        raise ValueError(f"Variable {variable} is not in schema")
    return True

def make_infonode(sheet_name,variable:str,value:str):
    if not is_valid_sheet_variable(sheet_name,variable):
        return None
    
    node={
        "variable": variable,
        "index": schema[sheet_name]["data"][variable]["index"],
        "description": schema[sheet_name]["data"][variable]["description"],
        "value": value  
    }
    
    return InfoNode(**node)
    
    
def make_sheet(sheet_name,sheet_data:dict):
    sheet_name="info-"+sheet_name
    nodes=[make_infonode(sheet_name,key,value) for key, value in sheet_data.items()]
    sheet={
        "sheet_title":schema[sheet_name]["sheet_title"],
        "column_titles":schema[sheet_name]["column_titles"],
        "column_variables":schema[sheet_name]["column_variables"],
        "data":[node for node in nodes if node ],
        "sheet_name":sheet_name,
    }
    return Sheet(**sheet)

def make_table(table_name,table_data:dict):
    table_name="table-"+table_name
    colum_variables=[key for key in table_data[0].keys() if key in schema[table_name]["data"].keys()]
    if not colum_variables:
        return None
    
    schema_data=schema[table_name]["data"]
    column_titles=[ schema_data[key]["column_title"] for key in colum_variables]
    column_index=[ schema_data[key]["index"] for key in colum_variables]
    
    table={
        "table_title":schema[table_name]["table_title"],
        "column_titles":column_titles,
        "column_variables":colum_variables,
        "column_index":column_index,
        "data":[TableNode(**row) for row in table_data],
        "table_name":table_name,
    }
    return Table(**table)

def make_sheets_talbes(json_data:dict):
    sheets=[]
    tables=[]
    for key, value in json_data.items():
        if type(value)==dict:
            sheets.append(make_sheet(key,value))
        elif type(value)==list:
            tables.append(make_table(key,value))
        else:
            raise TypeError("Invalid type for json data")
    
    tables=[table for table in tables if table]    
    return sheets,tables

def make_source(json_data:dict):
    sheets,tables=make_sheets_talbes(json_data)
    return Source(sheets,tables)

def create_excel(json_data:dict,excel_path:str):
    sheets,tables=make_sheets_talbes(json_data)
    excel=ExcelWritter(excel_path,sheets,tables).create()
    return excel



