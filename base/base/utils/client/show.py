import json
from dataclasses import dataclass
from typing import List, Union

from pydantic import ValidationError
from rich.markdown import Markdown
from rich.table import Table

from client.system.config import BASEDIR, console


def markdown_title_list(ds: list[str], title=None, title_level=4):
    output = ""
    if title:
        output += "#" * title_level + " " + title + "\n"
    for data in ds:
        output += "- " + data + "\n"
    return output


# input list and outpout markdown table text
def markdown_table(ds: list, title: Union[str, None] = None, title_style="###"):
    head = ds[0]
    head_str = "|"
    head_sep = "|"
    for col in range(0, len(ds[0])):
        head_str += str(head[col]) + "|"
        head_sep += "------------- " + "|"
    # print(head_str)
    # print(head_sep)
    output = head_str + "\n" + head_sep + "\n"

    row_data = "|"
    for row in range(1, len(ds)):
        for col in range(0, len(ds[0])):
            row_data += str(ds[row][col]) + "|"
        # print(row_data)
        output += row_data + "\n"
        row_data = "|"

    # Add title
    output = title_style + " " + title + "\n" + output if title else output

    return output


def show_markdown_content(markdown_text: str, style="white"):
    rich_text = Markdown(markdown_text)
    console.print(rich_text, style=style)


""" Make table for a 2D data list. Can highlight by specifying the rows or columns and given customized highlight style"""


def makeTable(
    table_name,
    table_list: list,
    with_footer: bool = False,
    highlight_rows: Union[List[int], None] = None,
    highlight_cols: Union[List[int], None] = None,
    highlight_style="bold green",
):
    if len(table_list) == 0:
        raise ValueError("The table has no data")

    table = Table(title=table_name, show_footer=with_footer)
    titles = table_list.pop(0)

    def make_columns(footers):
        for i, title in enumerate(titles):
            style = (
                highlight_style or "bold green"
                if highlight_cols and i in highlight_cols
                else "cyan"
            )
            if footers:
                table.add_column(
                    header=title,
                    footer=footers[i],
                    justify="left",
                    style=style,
                    no_wrap=False,
                )
            else:
                table.add_column(
                    header=title, justify="left", style=style, no_wrap=False
                )

    if with_footer:
        if len(table_list) == 0:
            raise ValueError("The table has no data")
        footers = table_list.pop(-1)
        make_columns(footers)
    else:
        make_columns(None)

    for i, content in enumerate(table_list):
        content_strings = [str(c) for c in content]
        style = highlight_style if highlight_rows and i in highlight_rows else None
        table.add_row(*content_strings, style=style)

    return table


""" make table data structure for a 2D data list. Can highlight by specifying the rows or columns and given customized highlight style"""


@dataclass
class ConsoleTable:
    title: str
    table_data: list
    highlight_rows: Union[List[int], None] = None
    highlight_cols: Union[List[int], None] = None
    highlight_style: str = "bold green"
    with_footer: bool = False
    with_header: bool = True

    """ Show table in console with flag markdown=True to show in markdown format, else show in rich table format"""

    def show(self, markdown=False, markdown_title_style="###"):
        if markdown:
            console.print(
                markdown_table(
                    self.table_data, title=self.title, title_style=markdown_title_style
                )
            )
        else:
            table = makeTable(
                self.title,
                self.table_data,
                with_footer=self.with_footer,
                highlight_rows=self.highlight_rows,
                highlight_cols=self.highlight_cols,
                highlight_style=self.highlight_style,
            )
            console.print(table)

    """ Get table title and table data"""

    def get_title_data(self):
        return self.title, self.table_data

def print_validation_error(e: ValidationError, language="English"):
    dict_file = (
        BASEDIR / "base/source" / "schema.json"
        if language.lower() == "english"
        else BASEDIR
        / "base/source"
        / "sysdict_zh.json"  # TODO: Shoud be revised in the future
    )
    with open(dict_file, "r") as f:
        schema = json.load(f)

    loc_msg = ""
    error_msg = ""
    for err in e.errors():
        """
        match len(err['loc']):
            case 1:
                loc_msg=f'sheet {err["loc"][0]} is not existed: '
            case 2: # sheet error
                sheet,variable=err['loc']
                description=sysdict[sheet].get(variable) or variable# get description to replace variable
                loc_msg=f"info-{sheet}->{description}: "
            case 3: # table error
                table,row,variable=err['loc']
                description=sysdict[table].get(variable) or variable # get description to replace variable
                loc_msg=f"table-{table}->{description}->row {row}: "
            case  _:
                locs=[]
                for loc in err['loc']:
                    locs.append(str(loc))
                loc_msg="->".join(locs)+": "
        """
        err_len = len(err["loc"])
        if err_len == 1:
            loc_msg = (
                f'sheet {err["loc"][0]} is not existed, or Model level check error:\n'
            )
        elif err_len == 2:
            sheet, variable = err["loc"]
            variable_dict = schema[f"info-{sheet}"].get(variable)
            description = (
                variable_dict.get("description") if variable_dict else variable
            )
            loc_msg = f"info-{sheet}->{description}: "
        elif err_len == 3:
            table, row, variable = err["loc"]
            variable_dict = schema[f"table-{table}"].get(variable)
            description = (
                variable_dict.get("description") if variable_dict else variable
            )
            # get description to replace variable
            loc_msg = f"table-{table}->{description}->row {row+5}: "
        else:
            locs = []
            for loc in err["loc"]:
                locs.append(str(loc))
            loc_msg = "->".join(locs) + ": "
        error_msg += loc_msg + err["msg"] + "\n"
    return error_msg

