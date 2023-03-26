from typing import List, Union
from .utils import best_match
from .utils import remove_non_ascii

class JsonMaker:
    """According to data model, generate json file for pdf form filling"""

    def __init__(self):
        self.actions = []

    def _getKey_Num(self, data: str, options: List[str], like=False):
        s_char = data[0].lower()
        count = 0
        matched_one = best_match(data, options)
        for elem in options:
            if elem[0].lower() == s_char:
                count += 1
                if elem.lower() == data.lower():
                    break
                elif like and f"({data})" in elem:
                    break
                elif elem.lower() == matched_one.lower():
                    break
        return (s_char, count)

    """ First element in actions, indicating which form it is """
    def add_form(self,form_name:str):
        self.actions.append({"action_type":"Check","form":form_name})
        
    def add_skip(self, times: int):
        self.actions.append({"action_type": "Skip", "times": times})

    def add_press_key(self,key,times:int=0):
        self.actions.append({"action_type": "Press_key", "key":key,"times": times})

    def add_button(self):
        self.actions.append({"action_type": "Button"})


    def add_text(
        self, data: Union[str, list], pause: float = 0, custom_pause = None, remove_non_ascii_string=True
    ):
        data = data or ""
        if remove_non_ascii_string:
            if type(data)==list:
                for i, d in enumerate(data):
                    data[i] = remove_non_ascii(d)
            else:
                data = remove_non_ascii(str(data))

        action = {"action_type": "TextField", "data": str(data), "pause": pause}
        if custom_pause:
            action["custom_pause"] = custom_pause
        self.actions.append(action)
        
    def add_radio(self, data: bool):
        self.actions.append(
            {
                "action_type": "RadioButton",
                "data": data,
                
            }
        )

    def add_radio_list(self, position=0):
        self.actions.append(
            {
                "action_type": "RadioButtonList",
                "position": position,
            }
        )

    def add_checkbox(self, data: bool):
        self.actions.append({"action_type": "CheckBox", "data": data})

    def add_info(self, info: str):
        self.actions.append({"action_type": "OutputInfo", "info": info})

    def add_dropdown(self, data: str, options: list[str], like=False):
        key, num = self._getKey_Num(data, options, like=like)
        self.actions.append(
            {
                "action_type": "DropdownList",
                "data": data,
                "key": key,
                "num": num,
                "like": like,
            }
        )

    def add_date(self, the_date, noday: bool = False, pause: float = 0.01, custom_pause = None):
        data = {
                "action_type": "DateField",
                "date": the_date,
                "noday": noday,
                "pause": pause,
            }
        if custom_pause is not None:
            data["custom_pause"] = custom_pause
        self.actions.append(data)

    def add_pause(self, pause: float = 1):
        self.actions.append({"action_type": "Pause", "pause": pause})