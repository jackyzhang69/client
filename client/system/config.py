import json
import os
import platform
import shutil
import sys
from pathlib import Path

import certifi
import dotenv
import typer
from pymongo import MongoClient
from rich.console import Console
from rich.style import Style

# Get project's home directory,
BASEDIR = Path(__file__).parents[2]
# All data directory
DATADIR = BASEDIR / "data"
# Insert the BASEDIR to system path
sys.path.insert(0, os.fspath(BASEDIR))

# app name
APP_NAME = "immclient"


# config path
def get_config_path(app_name):
    operating_system = platform.system()
    config_path = ""

    if operating_system == "Darwin":
        home_dir = str(Path.home())
        config_path = os.path.join(home_dir, "Library", "Application Support", app_name)
    elif operating_system == "Windows":
        app_data_dir = os.getenv("APPDATA")
        config_path = os.path.join(app_data_dir, app_name)
    else:
        raise Exception(f"Unsupported operating system: {operating_system}")

    return config_path


# app and console definition
app = typer.Typer()
console = Console()

error_style = Style(color="red")
success_style = Style(color="green")
env_server = os.getenv("server")


# imm account
config_path = get_config_path(APP_NAME) + "/config.json"
with open(config_path) as f:
    config = json.load(f)
imm_account: str = config.get("imm_user")
imm_password: str = config.get("imm_password")
SERVER_URL = env_server if env_server else config.get("server_url")

# Mongodb
account = os.getenv("MongoDBUser")
password = os.getenv("MongoDBPassword")
connection = f"mongodb+srv://{account}:{password}@noah.yi5fo.mongodb.net/test?retryWrites=true&w=majority"
client = MongoClient(connection, tlsCAFile=certifi.where())
database = "test"
db = client[database]


class Default:
    # default rcic and its company
    rcic = config.get("rcic") or "jacky"
    rciccompany = config.get("rciccompany") or "noah"
    temp_num = 1  # for word generation using template
    uploaddir = "."  # for webform, uploading all dir's file
    initial = True  # Only for BCPNP webform to check if it is initial reg or app
    previous = False  # Only for BCPNP webform to check if there is previous application
    user_permission = ["make", "check"]


def show_exception(e: Exception):
    console.print(e, style="red")


def show_error(e):
    console.print(e, style="red")


def show_warning(msg: str):
    console.print(msg, style="yellow")


def show_success(msg: str):
    console.print(msg, style=success_style)


def print_errors(r):
    if r.status_code == 401:
        console.print(r.json().get("detail"), style=error_style)
    elif r.status_code == 422:
        console.print("Validation erro:", style=error_style)
        console.print(r.json()["detail"], style=error_style)
    else:
        console.print(r.status_code, style=error_style)
        console.print(r.json()["detail"], style=error_style)
