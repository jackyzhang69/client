from base.source.excel import Excel
import os, json

""" 
This module is used to get the schemas of all mother-excel files. And, of course, can  be used to get the schemas of all existed excel files.
Get all excel's InfoSheet/TableSheet name, sheet title,column title, variable and index in a dict
"""


def get_sheet_name_variable_index_dict(sheet):
    sheet_variable_index_dict = {}
    sheet_variable_index_dict["sheet_title"]=sheet.sheet_title
    sheet_variable_index_dict["column_titles"]=sheet.column_titles
    sheet_variable_index_dict["column_variables"]=sheet.column_variables
    
    sheet_variable_index_dict["data"] = {}
    for info_node in sheet.data:
        variable_name = info_node.variable
        variable_index = info_node.index
        variable_description = info_node.description

        sheet_variable_index_dict["data"][variable_name] = {}
        sheet_variable_index_dict["data"][variable_name]["index"] = variable_index
        sheet_variable_index_dict["data"][variable_name]["description"] = variable_description

    return sheet_variable_index_dict


def get_sheets_name_variable_index_dict(sheets):
    sheets_variable_index_dict = {}
    for sheet in sheets:
        sheets_variable_index_dict[
            sheet.sheet_name
        ] = get_sheet_name_variable_index_dict(sheet)
    return sheets_variable_index_dict


def get_excels_sheets_name_variable_index_list(excel_filenames):
    excels_sheets_name_variable_index_list = {}
    for excel_filename in excel_filenames:
        excel = Excel(excel_filename)
        the_index = get_sheets_name_variable_index_dict(excel._sheets._sheets)
        excels_sheets_name_variable_index_list = {
            **excels_sheets_name_variable_index_list,
            **the_index,
        }
    return excels_sheets_name_variable_index_list


""" get all excel's TableSheet name, variable name and index in a dict """


def get_table_name_variable_index_dict(table):
    table_variable_index_dict = {}
    table_variable_index_dict["table_title"]=table.table_title
    table_variable_index_dict["column_titles"]=table.column_titles
    table_variable_index_dict["column_variables"]=table.column_variables
    table_variable_index_dict["column_index"]=table.column_index
    
    table_variable_index_dict["data"]={}
    for index, variable in table.index_variable_pair.items():
        table_variable_index_dict["data"][variable] = {}
        table_variable_index_dict["data"][variable]["index"] = index
        table_variable_index_dict["data"][variable]["column_title"] = table.index_title_pair[
            index
        ]

    return table_variable_index_dict


def get_tables_name_variable_index_dict(tables):
    tables_variable_index_dict = {}
    for table in tables:
        tables_variable_index_dict[
            table.table_name
        ] = get_table_name_variable_index_dict(table)
    return tables_variable_index_dict


def get_excels_tables_name_variable_index_list(excel_filenames):
    excels_tables_name_variable_index_list = {}
    for excel_filename in excel_filenames:
        excel = Excel(excel_filename)
        the_index = get_tables_name_variable_index_dict(excel._tables._tables)
        excels_tables_name_variable_index_list = {
            **excels_tables_name_variable_index_list,
            **the_index,
        }
    return excels_tables_name_variable_index_list


def get_excel_files(directory):
    xlsx_files = []
    for file in os.listdir(directory):
        if file.endswith(".xlsx"):
            xlsx_files.append(os.path.join(directory, file))
    return xlsx_files


"""" get the list of all excel files in the directory of imm/data/excel"""


def get_the_list(directory):
    # get the list of all excel files in the directory of imm/data/excel
    files = get_excel_files(directory)
    sheet_indexes = get_excels_sheets_name_variable_index_list(files)
    table_indexes = get_excels_tables_name_variable_index_list(files)
    return {**sheet_indexes, **table_indexes}


def main():
    user_home = os.path.expanduser("~")
    indexes = get_the_list(f"{user_home}/imm/data/excel")
    with open("base/source/schema.json", "w") as f:
        json.dump(indexes, f)
    print("schema.json has been created successfully")


if __name__ == "__main__":
    main()
