import copy
from dataclasses import dataclass, field, asdict
from typing import List, Optional

""" A row of info sheet """ ""


@dataclass
class InfoNode:
    variable: str  # Variable name, represent a key of the node
    index: float  # Index of the variable, will be used to rank the variable as its index
    description: str  # Description of the variable, in Chinese or English, etc...
    value: str  # Value of the variable, represent a value of the node

    """ Check if the index is valid int, for example: 1.1 or 1.2 """

    def __post_init__(self):
        try:
            float(self.index)
        except ValueError:
            raise ValueError(f"Invalid float value in InfoNode index: {self.index}")

    """ Only care about variable and its value, if both same then True """

    def __eq__(self, another):
        if another == None:
            return False
        return (
            True
            if self.variable == another.variable and self.value == another.value
            else False
        )

    """ + operator: if another has value, no matter self has value or not,  replace self's value with another's value, but if another has no value, keep self's value."""

    def __add__(self, another):
        obj = copy.deepcopy(self)
        if obj.variable != another.variable:
            raise TypeError(
                f"The two nodes ({obj.variable} {another.variable}) is different, can not add up"
            )
        if another.value:
            obj.value = another.value
        return obj

    """ - operator: if a node obj in self and in another, and if another has value, no matter self has value or not,  delete self's node obj, but if another has no value, keep self's node obj. """

    def __sub__(self, another):
        obj = copy.deepcopy(self)
        if obj.variable != another.variable:
            raise TypeError(
                f"The two nodes ({obj.variable} {another.variable}) is different, can not minus "
            )
        return obj

    def __hash__(self):
        return hash(self.variable + str(self.value))

    # return the variable name representing the object
    def __str__(self):
        return self.variable


""" Sheet: a list of InfoNode """ ""


@dataclass
class Sheet:
    """[SheetDict class used for handle inside  of sheet and between of sheets level information]

    Args:
        2D list including three  rows of sheet title list, column title list, and variables list
        The data rows must include 'variable','index','description', and 'value' four columns.

    Returns:
        SheetList object
    """

    sheet_name: str  # sheet name is a unique identifier for a sheet in excel sheet tag
    sheet_title: str  # sheet title is a brief description at the first row of the sheet
    column_titles: List[
        str
    ]  # column titles is a list of column titles at the second row of the sheet
    column_variables: List[
        str
    ]  # column titles is a list of column titles at the second row of the sheet
    data: List[
        InfoNode
    ]  # data is a list of InfoNode objects following the column titles
    index: int = 0  # for iterator

    def __str__(self):
        return self.sheet_title

    # Iterator
    def __iter__(self):
        return self

    def __next__(self):
        try:
            item = self.data[self.index]
        except IndexError:
            raise StopIteration()
        self.index += 1
        return item

    # hash only care about variables and values
    def __hash__(self):
        return hash(
            ",".join(
                [f"{info_node.variable}={info_node.value}" for info_node in self.data]
            )
        )

    def __len__(self):
        return len(self.data)

    @property
    def variables_list(self):
        return [info_node.variable for info_node in self.data]

    def get_info_node(self, variable):
        for info_node in self.data:
            if info_node.variable == variable:
                return info_node

    """ == return True if self and another has same variables. Only care about variables """

    def __eq__(self, another):
        if another == None:
            return False
        for info_node in self.data:
            if info_node.variable not in another.variables_list:
                return False
        return True

    # > return True if every another object's items is in self, and the length of self is greater than the other's
    def __gt__(self, another):
        flags = []
        for variable in another.variables_list:
            flags.append(True) if variable in self.variables_list else flags.append(
                False
            )
        flags.append(len(self) > len(another))
        return all(flags)

    """ + union two sets (self | another), and return a new set """

    def __add__(self, another):
        if self.sheet_name != another.sheet_name:
            raise ValueError(
                f"Sheet name is different: {self.sheet_name} <-->{another.sheet_name}, so can not add up."
            )

        """ deep copy self to obj, to avoid messing up self object """
        obj = copy.deepcopy(self)
        """ iterate another and insert or replace self's: """
        for variable in another.variables_list:
            """if node is not in self, add another's node in self's."""
            if variable not in self.variables_list:
                obj.data.append(another.get_info_node(variable))
                """ if node is in self, add another's node in self's."""
            else:
                setattr(
                    obj.get_info_node(variable),
                    variable,
                    obj.get_info_node(variable) + another.get_info_node(variable),
                )
        obj = self.get_sorted_sheet(obj)
        return obj

    """ - set difference, return a new set with elements in self but not in another """

    def __sub__(self, another):
        if self.sheet_name != another.sheet_name:
            raise ValueError(
                f"Sheet name is different: {self.sheet_name} <-->{another.sheet_name}, so can not sub."
            )
        obj = copy.deepcopy(self)
        for variable in self.variables_list:
            """self and another are in same sheet name，sub the variables in self if it's in the another"""
            if variable in another.variables_list:
                obj.data.remove(self.get_info_node(variable))

        obj = self.get_sorted_sheet(obj)
        return obj

    """ get common variables in self and another, and return a new object """

    def common(self, another):
        if self.sheet_name != another.sheet_name:
            raise ValueError(
                f"Sheet name is different: {self.sheet_name} <-->{another.sheet_name}, so can not find common parts."
            )

        obj = copy.deepcopy(self)
        """ get two dicts' intersection set """
        common_variables = set(self.variables_list) & set(another.variables_list)
        for variable in self.variables_list:
            if variable not in common_variables:
                obj.data.remove(self.get_info_node(variable))

        obj = self.get_sorted_sheet(obj)
        return obj

    """ copy: if self and another has common variables, then copy the value of another's shared variable to self """

    def copy(self, another):
        if self.sheet_name != another.sheet_name:
            raise ValueError(
                f"Sheet name is different: {self.sheet_name} <-->{another.sheet_name}, so can not be copied."
            )
        obj = copy.deepcopy(self)
        for variable in self.variables_list:
            if variable in another.variables_list:
                setattr(
                    obj.get_info_node(variable),
                    "value",
                    another.get_info_node(variable).value,
                )
        self.get_sorted_sheet(obj=obj)
        return obj

    """ Change the value of a variable in the sheet """

    def set_value(self, variable, value):
        for info_node in self.data:
            if info_node.variable == variable:
                info_node.value = value
                return

    """ Get the value of a variable in the sheet """

    def get_value(self, variable):
        for info_node in self.data:
            if info_node.variable == variable:
                return info_node.value

    """ Get sorted sheets data for exporting: making new excel file"""

    def get_sorted_sheet(self, obj=None):
        the_obj = obj or self
        the_obj.data = sorted(the_obj.data, key=lambda x: float(x.index), reverse=False)
        return the_obj

    """ Get sheet dict data """

    def get_sheet_data(self):
        sheet_data = {}  # save sheet data
        if len(self) > 0:
            data = {info_node.variable: info_node.value for info_node in self.data}
        else:
            data = {}
        sheet_data[self.sheet_name[5:]] = data  # remove 'info-' from sheet name
        return sheet_data


class Sheets:
    def __init__(self, sheets: List[Sheet]):
        self._sheets = sheets

    @property
    def sheet_names(self):
        return [sheet.sheet_name for sheet in self._sheets]

    def get_sheet(self, sheet_name):
        for sheet in self._sheets:
            if sheet.sheet_name == sheet_name:
                return sheet

    def __add__(self, another):
        """iterate another and insert or replace self's, merge sheets (info and talbe)"""
        obj = copy.deepcopy(self)
        for sheet_name in another.sheet_names:
            another_sheet = another.get_sheet(sheet_name)
            if sheet_name not in obj.sheet_names:
                obj._sheets.append(another_sheet)
            else:
                """add two sheet objects and update the sheet object in self._sheets"""
                self_sheet = obj.get_sheet(sheet_name)
                index = obj._sheets.index(self_sheet)
                # new_sheet = obj._sheets[index] + another_sheet
                new_sheet = self_sheet + another_sheet
                """ updated the sheet object """
                obj._sheets[index] = new_sheet

        return obj

    def __sub__(self, another):
        obj = copy.deepcopy(self)
        for sheet_index, sheet in enumerate(obj._sheets):
            if sheet.sheet_name in another.sheet_names:
                new_sheet = sheet - another.get_sheet(sheet.sheet_name)
                obj._sheets[sheet_index] = new_sheet

        # Remove all empty sheets
        obj._sheets = [sheet for sheet in obj._sheets if len(sheet) > 0]
        return obj

    def copy(self, another):
        obj = copy.deepcopy(self)
        sheets = []
        for sheet in obj._sheets:
            if sheet.sheet_name in another.sheet_names:
                # if another has the same sheet, then copy the value of another's shared variable to self
                new_sheet = sheet.copy(another.get_sheet(sheet.sheet_name))
                sheets.append(new_sheet)
            else:
                # if another has no the same sheet, then keep the self's sheet
                sheets.append(sheet)

        obj._sheets = sheets
        return obj
