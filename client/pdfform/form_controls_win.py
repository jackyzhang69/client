import time
from abc import ABC, abstractmethod
from datetime import date, timedelta
from pywinauto.keyboard import send_keys
import clipboard

class Control(ABC):
    """Pdf form input control base class"""

    verbose: bool = False

    @abstractmethod
    def fill(self):
        """Fill this control"""


class Skip(Control):
    """Skip disabled control"""

    addtional_skip = 0

    def __init__(self, times=1, verbose=False):
        self.times = times
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print("Skip to next")
        for _ in range(self.times):
            send_keys("{TAB}")
        Skip.addtional_skip += self.times

class Press_key(Control):
    """Press a certain key control"""

    def __init__(self, key,times=1,verbose=False):
        self.key=key
        self.times = times
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print(f"Pressed {self.key}")
        for _ in range(self.times):
            send_keys(self.key)
        Skip.addtional_skip += self.times
        

class Button(Control):
    def __init__(self, verbose=False) -> None:
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print("Click button")
        send_keys("{ENTER}")


class Pause(Control):
    """Pause for a moment"""

    def __init__(self, seconds, verbose=False):
        self.seconds = seconds
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print(f"Pause {self.seconds} seconds")
        time.sleep(self.seconds)


class TextField(Control):
    """Text field"""

    def __init__(self, data, pause=0.01,pause_between=0.5,verbose=False):
        """data: text to fill. For some special cases, date could be split to 3 or 2 strings to fill. 
            pause is for each string input speed control (between characters), while pause_between is for pause duration between strings
        """
        self.data = data
        self.pause=pause
        self.pause_between=pause_between
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print(f"Fill text field with {self.data}")
        if type(self.data) == list:
            for d in self.data:
                clipboard.copy(str(d))
                send_keys('^v', pause=self.pause)
                time.sleep(self.pause_between)
            send_keys("{TAB}")
        else:
            clipboard.copy(self.data)
            send_keys('^v')
            send_keys("{TAB}")


class RadioButton(Control):
    """Radio button"""

    def __init__(self, data, verbose=False):
        """data: False for No, True for yes"""
        self.data = data
        self.verbose = verbose

    def fill(self):
        if self.data:
            key = "{VK_RIGHT}"
        else:
            key = "{VK_SPACE}"
        if self.verbose:
            print(f"Fill radio button with {self.data}, press {key} key")
        send_keys(key)
        send_keys("{TAB}")


# Check one button in a button list. Check the position with True
class RadioButtonList(Control):
    """Radio button List"""

    def __init__(self, verbose=False, position=0):
        self.verbose = verbose
        self.position = position

    def fill(self):
        if self.position > 0:
            for _ in range(1, self.position + 1):
                send_keys("{VK_RIGHT}")
        else:
            send_keys("{VK_SPACE}")

        if self.verbose:
            print(f"Fill radio button with checked in position {self.position}")
        send_keys("{TAB}")


class CheckBox(Control):
    """Check box"""

    def __init__(self, data, verbose=False):
        self.data = data
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print(f"Fill check box with {self.data}")
        if self.data:
            send_keys("{VK_SPACE}")
            send_keys("{TAB}")
        else:
            send_keys("{TAB}")
        # time.sleep(self.pause)


class OutputInfo(Control):
    """Output log info"""

    def __init__(self, info, verbose=False):
        self.info = info
        self.verbose = verbose

    def fill(self):
        if self.verbose:
            print(f"------- {self.info} -------")


class DropdownList(Control):
    """Dropdown list"""

    def __init__(self, data, key, num, verbose=False):
        self.data = data
        self.key = key
        self.num = num
        self.verbose = verbose

    def fill(self):
        # key, num = self.key_presses()
        if self.verbose:
            print(
                f"Select dropdown list with {self.data}, press {self.key} {self.num} time(s)"
            )
        for _ in range(self.num):
            send_keys(self.key, vk_packet=False, pause=0.1)

        send_keys("{TAB}")


class DateField(Control):
    """Date field"""

    def __init__(self, the_date, noday: bool = False, pause=0.01,pause_between=0.5,verbose=False):
        self.date = the_date or date.today() + timedelta(days=1)
        self.noday = noday
        self.pause=pause
        self.pause_bwtween=pause_between
        self.verbose = verbose

    def fill(self):
        self.date = (
            self.date.strftime("%Y-%m-%d") if type(self.date) == date else self.date
        )
        year, month, day = self.date.split("-")
        if self.noday:
            if self.verbose:
                print(f"Fill date {year}-{month}")
            send_keys(year,pause=self.pause)
            time.sleep(self.pause_bwtween)
            send_keys(month,pause=self.pause)
            time.sleep(self.pause_bwtween)

        else:
            if self.verbose:
                print(f"Fill date {year}-{month}-{day}")
            send_keys(year,pause=self.pause)
            time.sleep(self.pause_bwtween)
            send_keys(month,pause=self.pause)
            time.sleep(self.pause_bwtween)
            send_keys(day,pause=self.pause)
            time.sleep(self.pause_bwtween)
            
        send_keys("{TAB}")
