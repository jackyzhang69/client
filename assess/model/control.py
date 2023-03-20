from assess.cli.cli import Cli, MyArgumentParser
import os
from dataclasses import dataclass
from client.system.config import console
from rich.prompt import Confirm
from assess.model.assess import Project


@dataclass
class App:
    app_parser: MyArgumentParser
    cmd_app_map: dict
    app_parser_map: dict
    cli: Cli

    def ask_for_exit(self):
        """Ask for exit"""
        if Confirm.ask("Do you want to exit?"):
            self.exit_handler()

    def exit_handler(self):
        """Do something before exit"""
        # TODO: Do something before exit
        console.print("Goodbye!", style="bold green")

        exit()

    def excute(self, project: Project):
        cmd = self.cli.get_command()
        # if cmd.command in ["clear", "ls"]:
        #     os.system(cmd.command)
        if cmd.command in ["help", "h"]:
            """App level helper"""
            self.app_parser.print_help()
        elif cmd.command in ["exit", "e", "quit", "q"]:
            self.ask_for_exit()
        elif cmd.command in self.cmd_app_map.keys():

            """Command level helper"""
            first_token = cmd.tokens[0] if len(cmd.tokens) > 0 else ""
            if first_token in ["-help", "-h"]:
                parser = self.app_parser_map.get(cmd.command, None)
                if parser:
                    parser.print_help()
                else:
                    console.print(f"No help for command {cmd.command}", style="red")
                return

            self.cmd_app_map[cmd.command](cmd.tokens, project)
        else:
            try:
                shell_cmd = f"{cmd.command} {' '.join(cmd.tokens)}"
                os.system(shell_cmd)
            except ValueError as e:
                console.print(e, style="red")


@dataclass
class Command:
    tokens: list
    cmd_func_map: dict
    cmd_parser_map: dict

    def __post_init__(self):
        self.command, *self.tokens = self.tokens
        if self.command not in self.cmd_parser_map.keys():
            raise ValueError(f"Command {self.command} is not a valid command")

        """Get parser for command. Here argparse can handle help automatically"""
        self.parser = self.cmd_parser_map[self.command]

        if self.parser is None:
            raise ValueError(f"Parser for command {self.command} is not defined")

    def excute(self, project: Project):
        """sub-command level helper"""
        first_token = self.tokens[0] if len(self.tokens) > 0 else ""
        if first_token in ["-help", "-h"]:
            parser = self.cmd_parser_map.get(self.command, None)
            if parser:
                parser.print_help()
            else:
                console.print(f"No help for command {self.command}", style="red")
            return
        elif first_token in ["--info", "-i"]:
            self.cmd_func_map[self.command](first_token, project)
            return

        self.args = self.parser.parse_args(self.tokens)
        self.cmd_func_map[self.command](self.args, project)
