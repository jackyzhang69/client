import copy
from dataclasses import dataclass
from typing import List
from collections import OrderedDict
from base.source.formatter import SPECIAL_TABLE_LIST


# @dataclass
class TableNode:
    def __init__(self, **kwargs):
        for variable, cell in kwargs.items():
            if variable:
                setattr(self, variable, cell)
        # [setattr(self, variable, cell) for variable, cell in kwargs.items() if variable]

    def __len__(self):
        return len(self.__dict__)

    """ return True if every key and value is same and with same length """

    def __eq__(self, another):
        if len(self) != len(another):
            return False
        for p in self.__dict__:  # check every property's value is same
            if self.__dict__.get(p) != another.__dict__.get(p):
                return False
        return True

    """ + operator: if another has value, no matter self has value or not,  replace self's value with another's value, but if another has no value, keep self's value."""

    def __add__(self, another):
        obj = copy.deepcopy(self)
        # 相同变量部分：搜索another每一个值，如果不为空，就替代self。
        # 不同变量部分，another多出来的部分,增加变量和值到self。
        for p in another.__dict__:
            if p in self.__dict__:
                # If another has value, no matter self has value or not,  replace self's value with another's value
                if getattr(another, p, None):
                    setattr(obj, p, getattr(another, p))
                # but if another has no value, keep self's value.
            else:
                # if a property in another but not in self, add it to self
                setattr(obj, p, getattr(another, p, None))

        return obj

    """ copy:  if another has value, no matter self has value or not,  replace self's value with another's value"""

    def copy(self, another):
        obj = copy.deepcopy(self)
        # 相同变量部分：搜索another每一个值，替代self。
        for p in another.__dict__:
            if p in self.__dict__:
                setattr(obj, p, getattr(another, p))
        return obj

    def __hash__(self):
        hs = []
        for key, value in self.__dict__.items():
            hs.append("{} = {}".format(key, value))
        return hash(",".join(hs))

    """ return the variable name representing the object"""

    def __str__(self):
        str_str = ["{}:{}".format(key, value) for key, value in self.__dict__.items()]
        return ", ".join(str_str)

    """ return the string representing the class constructor method """

    def __repr__(self):
        repr_str = [
            '{} = "{}"'.format(key, value)
            if type(value) == str
            else "{} = {}".format(key, value)
            for key, value in self.__dict__.items()
        ]
        return f'TableNode({",".join(repr_str)})'

    """ return True or False representing node is null or not null. null means the infoNode has no any value, reflecting in excel is a blank row """

    def __bool__(self):
        return any(self.__dict__.values())

    """ 
    Return True if self and another has top three values in same, which we regard they are some record ,
    The purpose of doing so is to check if two records are actually same, so has to be merged.
    """

    def is_same_record(self, another: object):
        obj = copy.deepcopy(self)
        number = len(obj.__dict__) if len(obj.__dict__) < 3 else 3
        top_n = list(obj.__dict__)[0:number]

        for property in top_n:
            if getattr(obj, property, None) != getattr(another, property, None):
                return False
        return True

    @property
    def variables(self):
        return list(self.__dict__.keys())

    def get_value(self, variable):
        value = getattr(self, variable, None)
        return value if value else None

    def set_value(self, variable, value):
        setattr(self, variable, value)
        return self


""" Table: a list of TableNode """ ""


@dataclass
class Table:
    """
    [TableList class used for handle inside  of table sheet and between of table sheets level information]

    Args:
        2D list including three  rows of sheet title list, column title list, and variables list
        columns are defined by excel files.
    Returns:
        TableList object
    """

    table_name: str  # table name represent the sheet name in excel sheet tag
    table_title: str  # table title represent the sheet title in the sheet first row
    column_titles: List[
        str
    ]  # column titles represent the sheet column titles in the sheet second row
    column_variables: List[
        str
    ]  # column variables represent the sheet column variables in the sheet third row
    column_index: List[
        int
    ]  # variable index represent the sheet column index in the sheet fourth row
    data: List[
        TableNode
    ]  # data represent the sheet data in the sheet fourth row and below

    index: int = 0

    def __post_init__(self):
        self.index_variable_pair = dict(zip(self.column_index, self.column_variables))
        converted_to_int = {int(k): v for k, v in self.index_variable_pair.items()}
        self.index_variable_pair = converted_to_int
        self.column_index = [int(i) for i in self.column_index]
        self.index_title_pair = dict(zip(self.column_index, self.column_titles))
        pass

    def __str__(self):
        return self.table_title

    """ hash only care about variables """

    def __hash__(self):
        return hash(",".join([node for node in self.data.__dict__.keys()]))

    def get_variable_by_title(self, title):
        """Create a dictionary to map column titles to column variables"""
        title_to_variable = {
            title: variable
            for title, variable in zip(self.column_titles, self.column_variables)
        }
        return title_to_variable.get(title)

    def get_title_by_variable(self, variable):
        """Create a dictionary to map column variables to column titles"""
        variable_to_title = {
            variable: title
            for title, variable in zip(self.column_titles, self.column_variables)
        }
        return variable_to_title.get(variable)

    """ == > < All this operations do not consider value. They only compare sheet variables """
    """ == return True if self and another has same variables. Only care about variables """

    def __eq__(self, another):
        """check if sheet has same column variables, which means same data structure"""
        if another == None or another == []:
            return False
        if self.data == [] and another == []:
            return True
        if self.column_variables != another.column_variables:
            return False
        return True

    """  > return True if every another object's items is in self, and the length of self is greater than the other's """

    def __gt__(self, another):
        flags = []
        for variable in another.column_variables:
            flags.append(True) if variable in self.column_variables else flags.append(
                False
            )
        flags.append(len(self.column_variables) > len(another.column_variables))
        return all(flags)

    """ + union two objects (self | another)'s two lists(column_titles, column_variables), and return a new object """

    def __add__(self, another):
        if self.table_name != another.table_name:
            raise ValueError(
                f"Sheet name is different: {self.table_name} <-->{another.table_name}, so can not add up."
            )

        obj = copy.deepcopy(self)

        """ 
        merge the indeices,titles,and varialbes of two objects, keeping the oder remains same. 
        """
        obj.column_index = list(
            OrderedDict.fromkeys(
                list(self.column_index) + list(another.column_index)
            ).keys()
        )

        obj.column_titles = list(
            OrderedDict.fromkeys(
                list(self.column_titles) + list(another.column_titles)
            ).keys()
        )

        obj.column_variables = list(
            OrderedDict.fromkeys(
                list(self.column_variables) + list(another.column_variables)
            ).keys()
        )

        obj.index_title_pair = dict(zip(obj.column_index, obj.column_titles))
        obj.index_variable_pair = dict(zip(obj.column_index, obj.column_variables))

        another.column_titles, another.column_variables, another.column_index = (
            obj.column_titles,
            obj.column_variables,
            obj.column_index,
        )

        """ expand obj and another to the new union. As a result, they will be in same number of columns """

        """ if the property has no value, set the property as None. """
        for o in obj.data:
            for v in obj.column_variables:
                if not getattr(o, v, None):
                    setattr(o, v, None)

        """ here obj.column_variables are expaned.  """
        for a in another.data:
            for v in another.column_variables:
                if not getattr(a, v, None):
                    setattr(a, v, None)

        """ Now self and another are in same dimension in columns, let's sort the target table """
        obj = self.get_sorted_table(obj=obj)

        temp_data = []
        """ for every obj data, find its counter-part data in another """
        for node_obj in obj.data:
            """if same record,  pop up the same one and merge"""
            for node_another in another.data:
                if node_obj.is_same_record(node_another):
                    node_obj += another.data.pop(another.data.index(node_another))
                    temp_data.append(node_obj)  # 将merge过的记录添加到临时list中
                else:
                    if node_obj not in temp_data:  # 如果不是同一条记录，而且在临时列表中没有，添加，
                        temp_data.append(node_obj)

        """ re-order the table node properties accoring to the tartet table new order"""
        new_temp_data = [
            self.re_order_table_node_properties(obj, table_node)
            for table_node in temp_data
        ]

        """ append all different rows to obj.data """
        obj.data = new_temp_data + another.data

        return obj

    """ - set difference, return a new set with elements in self but not in another """

    def __sub__(self, another: object):
        # deep copy self to obj, to avoid messing up self object
        obj = copy.deepcopy(self)

        if self.column_variables != another.column_variables:
            raise ValueError(
                f"Excel table-sheet minus is only used for same table schema, and remove row in self which also in another.  {self.column_titles} is not same as {another.column_variables}, so could not minus"
            )

        for obj_index, obj_node in enumerate(
            self.data
        ):  # use self.data because obj.data is changing...
            # remove node in self, if it is also in another
            variables = obj_node.__dict__.keys()
            # tables with variable_type and display_type are special tables, which need to be handled differently
            if obj_node in another.data:
                if "variable_type" not in variables or "display_type" not in variables:
                    obj.data.remove(obj_node)
                else:
                    # delete all data in obj_node, but keeps the variable_type and display_type
                    variables = [
                        var
                        for var in obj_node.variables
                        if var not in ["variable_type", "display_type"]
                    ]
                    for var in variables:
                        obj_node = obj_node.set_value(var, None)
                    obj.data[obj_index] = obj_node
        return obj

    """ According to the given table's variables order, re-order the table node properties"""

    def re_order_table_node_properties(self, table, table_node):
        data = {}
        for var in table.column_variables:
            row = getattr(table_node, var)
            data[var] = row
        return TableNode(**data)

    def copy(self, another):
        obj = copy.deepcopy(self)

        if another.table_name in SPECIAL_TABLE_LIST:
            return self.special_copy(obj, another)

        # for general tables
        for ad in another.data:
            # if has same schema
            if obj.column_variables == another.column_variables:
                # if another not in original one, just append another's rows to original one.
                if ad not in obj.data:
                    obj.data.append(ad)
            # if has different schema
            else:
                # get self's column variable,and get value from another, then make a TableNode object and insert to self.data
                kwargs = {
                    key: getattr(ad, key, None) for key in obj.column_variables if key
                }
                copied_obj = TableNode(**kwargs)
                obj.data.append(copied_obj)

        return obj

    def __len__(self):
        return len(self.data)

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

    """ In special case, """

    def _get_table_node_by_variable(self, variable):
        for node in self.data:
            if node.variable_type == variable:
                return node

    def special_copy(self, obj, another):
        """Iterate object and add up the same record"""
        for index, node_obj in enumerate(obj.data):
            """
            Get the same record in another object and copy it to the object
            in special case, the "variable_type" is a fixed variable, so we can use it to find the same record
            """
            variable = node_obj.variable_type
            if (
                variable == "working_address"
            ):  # :(  working_address is a special case in special case
                another_node = another.data[index]
            else:
                another_node = another._get_table_node_by_variable(variable)
            obj.data[index] = obj.data[index].copy(another_node)

        """ re-order the table node properties accoring to the tartet table new order"""
        new_temp_data = [
            self.re_order_table_node_properties(obj, table_node)
            for table_node in obj.data
        ]
        obj.data = new_temp_data

        return obj

    """ Get sorted table data for exporting: making new excel file """

    def get_sorted_table(self, obj=None):
        """Sort the column index first, then re-oder the column titles and variables"""
        the_obj = obj or self
        the_obj.column_index = sorted(
            [int(x) for x in the_obj.column_index], reverse=False
        )

        """ Re-oder the column titles"""
        the_obj.column_titles = [
            the_obj.index_title_pair[index] for index in the_obj.column_index
        ]

        """Re-oder the column variables"""
        the_obj.column_variables = [
            the_obj.index_variable_pair[index] for index in the_obj.column_index
        ]

        return the_obj

    def get_table_data(self):
        table_data = {}  # save table data
        data = []
        if len(self) > 0:
            for table_node in self.data:
                row = {k: v for k, v in table_node.__dict__.items()}
                data.append(row)
        else:
            data = []
        table_data[self.table_name[6:]] = data  # remove 'table-' from sheet name
        return table_data


class Tables:
    def __init__(self, tables: List[Table]):
        self._tables = tables

    @property
    def table_names(self):
        return [table.table_name for table in self._tables]

    def get_table(self, table_name):
        for table in self._tables:
            if table.table_name == table_name:
                return table

    def __add__(self, another):
        obj = copy.deepcopy(self)
        for table_name in another.table_names:
            another_table = another.get_table(table_name)
            if table_name not in obj.table_names:
                obj._tables.append(another_table)
            else:
                """add two table objects"""
                self_talbe = obj.get_table(table_name)
                index = obj._tables.index(self_talbe)
                new_table = obj._tables[index] + another_table
                """ updated the table object """
                obj._tables[index] = new_table

        return obj

    def __sub__(self, another):
        obj = copy.deepcopy(self)
        for table_index, table in enumerate(obj._tables):
            if table.table_name in another.table_names:
                new_table = table - another.get_table(table.table_name)
                obj._tables[table_index] = new_table

        """ remove the empty table """
        obj._tables = [table for table in obj._tables if len(table) > 0]
        return obj

    def copy(self, another):
        obj = copy.deepcopy(self)
        tables = []
        for table in obj._tables:
            if table.table_name in another.table_names:
                # if another has same table, copy the contont to the new table and append to the tables
                new_table = table.copy(another.get_table(table.table_name))
                tables.append(new_table)
            else:
                # if another doesn't have same table, just append the table to the tables
                tables.append(table)

        obj._tables = tables
        return obj
