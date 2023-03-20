from client.system.config import app

# from system.config import SERVER_URL as URL
from pprint import pprint
import typer
from rich.console import Console
from rich.text import Text
from getpass import getpass
from typing import List
from client.system.imm_api import imm_api_get, imm_api_post, imm_api_delete, imm_api_put


def get_id_by_email(email: str):
    users = imm_api_get("user/")
    for user in users.json()["data"]:
        if email == user.get("email"):
            return user.get("_id")


def delete_by_email(email: str):
    user_id = get_id_by_email(email)
    res = imm_api_delete(f"user/{user_id}")
    result = res.json()

    if result.get("status_code") == 204:
        f"Record with id {user_id} has been deleted.",
        return user_id
    elif result.get("status_code") == 401:
        print(res.json().get("detail"))
    elif result.status_code == 500:
        print("system internal error...")
    else:
        print(f"No record with email as {email}")


def delete_by_id(id: str):
    res = imm_api_delete(f"user/{id}")
    status = res.json()
    if status["status_code"] == 204:
        print(
            f"Record with id {id} has been deleted.",
        )
    elif status["status_code"] == 401:
        print("Error:", status["detail"])
    elif res.status_code == 500:
        print("system internal error...")


@app.command()
def register(
    username: str = typer.Argument(None, help="User name"),
    email: str = typer.Argument(None, help="Email, used as login name"),
    phone: str = typer.Argument(None, help="Telephone"),
):
    psw1 = getpass()
    psw2 = getpass("Input password again: ")
    if psw1 != psw2:
        raise ValueError("The two passwords are not same.")
    user = {
        "username": username,
        "email": email,
        "phone": phone,
        "password": psw2,
    }
    r = imm_api_post("user", user)
    if r.status_code == 200:
        print(r.json())
    elif r.status_code == 500:
        print("system internal error...")
    else:
        print(r.json())


@app.command()
def show(
    email: str = typer.Argument(None, help="Email, used as login name"),
    id: str = typer.Option(None, help="id, record id"),
):
    if id:
        r = imm_api_get(f"user/{id}")
    elif email:
        id = get_id_by_email(email)
        if id:
            r = imm_api_get(f"user/{id}")
        else:
            print(f"No user with email as {email}")
            exit(1)
    else:
        r = imm_api_get("user/")
    if r.status_code == 200:
        pprint(r.json()["data"])
    elif r.status_code == 500:
        print("system internal error...")
    else:
        print(r.status_code, r.json().get("detail"))


@app.command()
def delete(
    email: str = typer.Argument(None, help="Email, used as login name"),
    id: str = typer.Argument(None, help="id, record id"),
):
    if email:
        delete_by_email(email)
    elif id:
        delete_by_id(id)
    else:
        print("You have to either assign email or _id")


@app.command()
def role(user_email: str, role: str):
    data = {"user_email": user_email, "role": role}
    r = imm_api_post("user/role", data)
    print(r.status_code, r.json())


@app.command()
def permission(
    user_email: str,
    remove: bool = typer.Option(False),
    permission: List[str] = typer.Option(None),
):
    data = {"user_email": user_email, "permissions": list(permission), "remove": remove}
    r = imm_api_post("user/permission", data)
    print(r.status_code, r.json())


@app.command()
def password(user_email: str, password: str):
    _id = get_id_by_email(user_email)
    query = {"password": password}
    r = imm_api_put(f"user/password/{_id}", query)
    print(r.json())


if __name__ == "__main__":
    try:
        app()
    except Exception as e:
        print(e)
