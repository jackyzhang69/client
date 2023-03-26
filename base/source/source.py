"""
This is the core class for source data. It will be used in the following steps:
1. For excel data source processing
2. For web data source processing

_sheets: list of Sheet objects. A single Sheet object contains variable, index, title, description, and value data
_tables: list of Table objects. A single Table object contains a list of datasests, each dataset includes some columns' data

"""
import asyncio
import json

from base.namespace import Language
from base.source.formatter import SPECIAL_TABLE_LIST, CellFormatter
from base.source.infosheet import Sheets
from base.source.tablesheet import Tables
from base.utils.client.translator import translate
from base.utils.utils import DateEncoder
from dataclasses import dataclass
from typing import Union


@dataclass
class Source:
    _sheets: Union[Sheets, None] = None
    _tables: Union[Tables, None] = None
    language: Language = Language.ENGLISH

    """ 
    + union two excel objs (self | another), and return a new excel obj
    in excel level, I consider to merge value together with variables. If duplicated, another value will prevail.
    """

    def __add__(self, another):
        self._sheets += another._sheets
        self._tables += another._tables

        return self

    def __sub__(self, another):
        self._sheets = self._sheets - another._sheets
        self._tables = self._tables - another._tables

        return self

    def copy(self, another):
        self._sheets = self._sheets.copy(another._sheets) if self._sheets else []
        self._tables = self._tables.copy(another._tables) if self._tables else []
        return self

        """
        Below are methods for getting data from excel files and export 
        """

    def get_sheets_data(self):
        sheets_data = {}
        for sheet in self._sheets._sheets:
            sheet_data = sheet.get_sheet_data()
            sheets_data = {**sheets_data, **sheet_data}
        return sheets_data

    def get_tables_data(self):
        tables_data = {}
        for table in self._tables._tables:
            table_data = table.get_table_data()
            tables_data = {**tables_data, **table_data}
        return tables_data

    @property
    def dict(self):
        return {**self.get_sheets_data(), **self.get_tables_data()}

    @property
    def json(self):
        plain_json = json.dumps(self.dict, cls=DateEncoder)
        return json.loads(plain_json)

    @property
    def glossary(self):
        from base.source.glossary import glossary
        return glossary

    """ Translate excel forms description,titles in another language, and return a new excel obj """

    def make_another_language_version(
        self, source_language="en", target_language: str = "zh"
    ):
        """translate sheets"""

        sheets_description = []
        # 1. get all sheets' descriptions
        for sheet in self._sheets._sheets:
            print(f"translating sheet {sheet.sheet_name}...")
            sheet_description = []
            # get sheet's title
            sheet_description.append(sheet.sheet_title)
            # get a sheet's column titles
            sheet_description.append("Question")
            sheet_description.append("Answer")
            # get a sheet's descriptions
            for node in sheet.data:
                sheet_description.append(node.description)
            sheets_description.append(sheet_description)

        # 2. translate the descriptions
        results = asyncio.run(
            translate(
                sheets_description,
                source_language=source_language,
                target_language=target_language,
            )
        )

        # 2.5 convert the incorrect translation to my defined translation
        results = self.convert_translation(results)

        # 3. update the title and descriptions
        for sheet_index, sheet in enumerate(self._sheets._sheets):
            # update the title and descriptions
            sheet.sheet_title = results[sheet_index].pop(0)
            # update the question and answer
            question = results[sheet_index].pop(0)
            answer = results[sheet_index].pop(0)
            sheet.column_titles = [
                sheet.column_titles[0],
                sheet.column_titles[1],
                question,
                answer,
            ]
            # update the descriptions
            for row_index in range(len(sheet.data)):
                sheet.data[row_index].description = results[sheet_index][row_index]

        """ translate tables """

        # 1. get all tables' descriptions
        tables_description = []
        for index, table in enumerate(self._tables._tables):
            print(f"translating table {table.table_name}...")
            table_description = []
            # get table's title
            table_description.append(table.table_title)
            # get a table's column titles
            for title in table.column_titles:
                table_description.append(title)
            tables_description.append(table_description)

        # 2. translate the descriptions
        results = asyncio.run(
            translate(
                tables_description,
                source_language=source_language,
                target_language=target_language,
            )
        )

        # 2.5 convert the incorrect translation to my defined translation
        results = self.convert_translation(results)

        # 3. update the title and descriptions
        for table_index, table in enumerate(self._tables._tables):
            table.table_title = results[table_index].pop(0)
            self._tables._tables[table_index].column_titles = results[table_index]

        """ Translate special tables"""
        # 1. get all special tables
        special_tables = [
            table
            for table in self._tables._tables
            if table.table_name in SPECIAL_TABLE_LIST
        ]
        # 2. get all special tables' display_type descritpions
        special_tables_description = []
        for table in special_tables:
            table_node_description = []
            for node in table.data:
                table_node_description.append(node.display_type)
            special_tables_description.append(table_node_description)
        # 3. translate the descriptions
        results = asyncio.run(
            translate(
                special_tables_description,
                source_language="en",
                target_language=target_language,
            )
        )
        # 3.5 convert the incorrect translation to my defined translation
        results = self.convert_translation(results)

        # 4. update the descriptions for display_type
        for table_index, table in enumerate(self._tables._tables):
            if table in special_tables:
                # get the table index in special_tables
                the_table_index = special_tables.index(table)
                for node_index in range(len(table.data)):
                    self._tables._tables[table_index].data[
                        node_index
                    ].display_type = results[the_table_index][node_index]

        return self

    """ Convert the incorrect translation to my defined translation """

    # Define a function to correct translations based on the glossary
    def correct_translation(self, translations):
        # 1. if translation is in glossary, return the correct translation
        temp_translations = [self.glossary.get(t, t) for t in translations]

        # 2. if translation is not in glossary, check if glossay's key is in the translation. if yes, replace the translation with the glossary's value
        for index, translation in enumerate(temp_translations):
            for key, value in self.glossary.items():
                if key in translation:
                    temp_translations[index] = translation.replace(key, value)

        # Return the corrected translations as a list
        return temp_translations

    def convert_translation(self, results):
        new_results = []

        for data in results:
            data = self.correct_translation(data)
            new_results.append(data)

        return new_results

    """ Translate sheets and tables values specified in a list of formattter translate key"""

    # get translate variables from formatter
    def get_translate_variables(self, sheet_table, is_table=False):
        formatter = CellFormatter(self.language)
        sheet_format = formatter.cell_formatter.get(
            sheet_table.table_name if is_table else sheet_table.sheet_name
        )
        # get translate variables defined in formatter
        variables_list = (
            sheet_format.get("translate")
            if sheet_format and sheet_format.get("translate")
            else []
        )
        # get variables list in this sheet/table
        if is_table:
            variables_list = [
                var for var in variables_list if var in sheet_table.column_variables
            ]
        else:
            variables_list = [
                var for var in variables_list if var in sheet_table.variables_list
            ]
        return variables_list

    # set sheet translation result to the values
    def set_sheet_translated_values(self, sheet, variable_list, values):
        for index, variable in enumerate(variable_list):
            for data_index, node in enumerate(sheet.data):
                if node.variable == variable:
                    sheet.data[data_index].value = values[index]

    # set table row translation result to the values, return a new table node
    def set_table_row_translated_values(self, table_node, variable_list, row_values):
        for index, variable in enumerate(variable_list):
            setattr(table_node, variable, row_values[index])

        return table_node

    # set table translation result to the values
    def set_table_translated_values(self, table, variable_list, table_values):
        # here  row_index could be more than table_values length, so we have to count non-null rows manually
        none_null_row_index = 0
        for row_index, row in enumerate(table.data):
            if (table.table_name in ["table-phone","table-personid"] ): # remove null rows
                if not row.number:
                    continue
            if (table.table_name in ["table-contact","table-eraddress","table-address"] ): # remove null rows
                if not row.street_name:
                    continue
            table.data[row_index] = self.set_table_row_translated_values(
                row, variable_list, table_values[none_null_row_index]
            )
            none_null_row_index += 1
        return table

    def translate_values(self, source_language="zh", target_language="en"):
        # translate sheets

        # 1. get all sheets' translate variables
        sheet_names = []
        sheets_variables = []
        sheets_values = []
        for sheet in self._sheets._sheets:
            variables_to_translate = self.get_translate_variables(sheet, is_table=False)

            # get translate values
            variables_to_translate_with_value = []
            values = []
            for node in sheet.data:
                if node.variable in variables_to_translate and node.value:
                    values.append(node.value)
                    variables_to_translate_with_value.append(node.variable)
            sheets_values.append(values)
            sheets_variables.append(variables_to_translate_with_value)
            if values:
                sheet_names.append(sheet.sheet_name)
                print(f"Translating sheet {sheet.sheet_name}...")
            # remove empty values and variables
            sheets_values = [value for value in sheets_values if value]
            sheets_variables = [variable for variable in sheets_variables if variable]

        # 2 translate values
        results = asyncio.run(
            translate(
                sheets_values,
                source_language=source_language,
                target_language=target_language,
            )
        )

        # 3. set translation result to the values
        for sheet in self._sheets._sheets:
            if sheet.sheet_name in sheet_names:
                result_sheet_index = sheet_names.index(sheet.sheet_name)
                self.set_sheet_translated_values(
                    sheet,
                    sheets_variables[result_sheet_index],
                    results[result_sheet_index],
                )

        # translate tables

        # 1. get all tables' translate variables, which is a 3 level list: tables->rows->variables
        translate_tables = []  # save the tables which need to be translated
        tables_values = (
            []
        )  # save the values of all the tables which need to be translated
        tables_variables = (
            []
        )  # save the variables of all the tables which need to be translated

        for table in self._tables._tables:
            variables_to_translate = self.get_translate_variables(table, is_table=True)
            if variables_to_translate:

                nodes_values = []  # save the values of all the nodes in the table
                for node in table.data:
                    node_values = []  # save the values of the node
                    for variable in variables_to_translate:
                        if hasattr(node, variable):
                            node_values.append(getattr(node, variable))
                    if any(node_values):  # if the node has values to translate
                        nodes_values.append(node_values)
                if nodes_values:  # if the table has values to translate
                    translate_tables.append(table)
                    tables_values.append(nodes_values)
                    tables_variables.append(
                        variables_to_translate
                    )  # save the variables of the table
                    print(f"Translating table {table.table_name}...")

        # 2. translate values
        translated_values = []
        for table_index, table in enumerate(translate_tables):
            values = tables_values[table_index]
            results = asyncio.run(
                translate(
                    values,
                    source_language=source_language,
                    target_language=target_language,
                )
            )
            translated_values.append(results)

        # 3. set all tables' translated values
        for table_index, table in enumerate(self._tables._tables):
            if table in translate_tables:
                index_in_tables_variables = translate_tables.index(table)
                self._tables._tables[table_index] = self.set_table_translated_values(
                    table,
                    tables_variables[index_in_tables_variables],
                    translated_values[index_in_tables_variables],
                )

        return self
