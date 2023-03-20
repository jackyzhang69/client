from typing import Union, List
import os, dotenv, time


def append_ext(filename: Union[str, List[str]], ext):
    def convert(fn):
        names = fn.split(".")
        if len(names) == 2:
            return fn
        elif len(names) == 1:
            return names[0] + ext
        else:
            raise ValueError(f"{filename} is invalid filename")

    if type(filename) == list:
        return [convert(fn) for fn in filename]
    else:
        return convert(filename)


def remove_ext(filename: Union[str, List[str]]):
    def convert(fn):
        names = fn.split(".")
        if len(names) >= 1:
            return names[0]
        else:
            raise ValueError(f"{filename} is invalid filename")

    if type(filename) == list:
        return [convert(fn) for fn in filename]
    else:
        return convert(filename)


""" Toggle the color between two colors. Default colors are ["ebf2de", "dce7f1"]"""


class Toggle:
    number = 0

    @classmethod
    def toggle_color(cls, colors=["ebf2de", "dce7f1"]):
        cls.number += 1
        if cls.number % 2 == 0:
            return colors[0]
        else:
            return colors[1]


""" Get .immenv value from environment variable"""


def get_immenv_value(key):
    path = os.path.abspath(os.path.join(os.path.expanduser("~"), ".immenv"))
    config = dotenv.dotenv_values(path)
    return config.get(key)


""" Timing decorator """ ""


def timing(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Execution time: {end_time - start_time:.5f} seconds")
        return result

    return wrapper
