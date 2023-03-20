from pathlib import Path
from rich.console import Console
from rich.style import Style
import typer, json, os, sys, dotenv
from pymongo import MongoClient
import certifi

# Get project's home directory,
BASEDIR = Path(__file__).parents[2]
# All data directory
DATADIR = BASEDIR / "data"
# Insert the BASEDIR to system path
sys.path.insert(0, os.fspath(BASEDIR))

path = os.path.abspath(os.path.join(os.path.expanduser("~"), ".immenv"))
config = dotenv.dotenv_values(path)

# app and console definition
app = typer.Typer()
console = Console()

error_style = Style(color="red")
success_style = Style(color="green")
env_server = os.getenv("server")

SERVER_URL = env_server if env_server else "https://imm.jackyzhang.pro/"
# SERVER_URL = env_server if env_server else "http://127.0.0.1:8000/"

# imm account
imm_account: str = config.get("imm_user")
imm_password: str = config.get("imm_password")

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
