import token
import requests
import dotenv
import os
from datetime import datetime
import base64
import json
from client.system.config import SERVER_URL, config, config_path

AUTH_URL = SERVER_URL + "login"
print(f"We are using server {SERVER_URL}")


def get_token(username: str, password: str):
    # get token from env
    token = config.get("imm_token")
    if token is not None:
        # check if it's expired
        expire = config.get("imm_expire")
        if expire is not None and datetime.now().timestamp() < int(expire):
            return token
        else:
            print("Token expired, refreshing...")
    else:
        print("No token saved, retrieving...")
    return refresh_token(username, password)


def refresh_token(username: str, password: str):
    data = {"username": username, "password": password}
    try:
        resp = requests.post(url=AUTH_URL, data=data)
        resp.raise_for_status()

        token = resp.json().get("access_token")
        # JWT token = header + '.' + payload + '.' + signature
        jwt_segs = token.split(".")
        encoded_payload = jwt_segs[1]
        # decode with correct padding
        decoded_payload = base64.b64decode(
            encoded_payload + "=" * (-len(encoded_payload) % 4)
        )
        expire = json.loads(decoded_payload).get("exp")
        # update env file to keep latest token and expire values
        with open(config_path, "w") as f:
            config["imm_token"] = token
            config["imm_expire"] = str(expire)
            json.dump(config, f)

        return token
    except requests.exceptions.HTTPError as errh:
        print(errh)
        if resp.status_code == 401:
            print("Incorrect username/password.")
        return
    except requests.exceptions.ConnectionError as errc:
        print(errc)
        return


def gen_request_headers():
    imm_account = config.get("imm_account")
    imm_password = config.get("imm_password")
    token = get_token(imm_account, imm_password)

    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    return headers


def imm_api_post(endpoint: str, data=None):
    resp = requests.post(
        SERVER_URL + endpoint, json=data, headers=gen_request_headers()
    )
    return resp


def imm_api_get(endpoint: str, queries=None):
    resp = requests.get(
        SERVER_URL + endpoint, params=queries, headers=gen_request_headers()
    )
    return resp


def imm_api_delete(endpoint: str):
    resp = requests.delete(SERVER_URL + endpoint)
    return resp


def imm_api_put(endpoint: str, params=None):
    resp = requests.put(SERVER_URL + endpoint, params=params)
    return resp
