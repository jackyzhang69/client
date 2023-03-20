import argparse
import shlex
from typing import List, Optional
from dataclasses import dataclass
from rich.prompt import Confirm
from client.system.config import console
import sys, os
from datetime import date
from assess.cli import input 


@dataclass
class Command:
    """Class that represents a command"""

    command: str
    tokens: Optional[List[str]]


# Override the ArgumentParserError to avoid exit from program
class ArgumentParserError(Exception):
    pass


# Define my own ArgumentParse by inheriting from the original one
class MyArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        # show(message, style=colorama.Fore.RED)
        raise ValueError(message)


# Override the ChoiceAction to avoid exiting from apps
class ChoiceAction(argparse.Action):
    def __init__(self, option_strings, **kwargs):
        super().__init__(option_strings, **kwargs)

    def __call__(self, parser, namespace, values, option_string=None):
        # print(f"__call__: values = {values}")
        if values not in self.choices:
            # handle the error here
            print("Error: invalid choice")
        else:
            # set the values attribute in the namespace object
            setattr(namespace, self.dest, values)


# Override the original Action to avoid exit after getting help
class HelpAction(argparse.Action):
    def __init__(self, option_strings, **kwargs):
        super().__init__(option_strings, **kwargs)

    def __call__(self, parser, namespace, values, option_string=None):
        parser.print_help()


class DateFormatter(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        try:
            setattr(namespace, self.dest, date.fromisoformat(values))
        except ValueError:
            raise argparse.ArgumentError(self, f"Invalid date: {values}")


def exit_handler():
    if Confirm.ask("Do you really want to exit? "):
        console.print("Good bye. ..", style="blue")
    else:
        pass


class Cli:
    def __init__(self, root: str = ""):
        self.command_chain = [root]

    # command chain prompting user of the command level
    def show_command_chain(self):
        return "/".join(self.command_chain) + "$: "

    def get_command(self):
        try:
            line=input.prompt(
                input.get_prompt(),
                refresh_interval=1,
                completer=input.animal_completer,
                complete_while_typing=True,
                complete_style=input.CompleteStyle.MULTI_COLUMN,
                key_bindings=input.kb,
                auto_suggest=input.AutoSuggestFromHistory(),
                enable_history_search=True,
                history=input.history,
            )
            input.history.append_string(line)
            command, *tokens = shlex.split(line)
        except KeyboardInterrupt:
            if Confirm.ask("\nDo you really want to exit? "):
                console.print("Good bye. ..", style="blue")
                sys.exit()
            else:
                return Command(command="", tokens=[])
        except ValueError:
            console.print("You didn't input any command and/arguments.", style="red")
            return Command(command="", tokens=[])
        else:
            return Command(command=command, tokens=tokens)
