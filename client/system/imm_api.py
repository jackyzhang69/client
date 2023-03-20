import requests
import dotenv
import os
from datetime import datetime
import base64
import json
from client.system.config import SERVER_URL

path = os.path.abspath(os.path.join(os.path.expanduser("~"), ".immenv"))

# load env variables if a .env file exists
dotenv.load_dotenv(path)


ENV_PATH = ENV_PATH = path
AUTH_URL = SERVER_URL + "login"
print(f"We are using server {SERVER_URL}")

def get_token(username: str, password: str):
    # get token from env
    token = dotenv.get_key(ENV_PATH, "IMM_TOKEN")
    if token is not None:
        # check if it's expired
        expire = dotenv.get_key(ENV_PATH, "IMM_EXPIRE")
        if expire is not None and datetime.now().timestamp() < int(expire):
            # print(f'Using saved token \ntoken: {token}, \nexpire: {datetime.fromtimestamp(int(expire))}')
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
        dotenv.set_key(ENV_PATH, "IMM_TOKEN", token)
        dotenv.set_key(ENV_PATH, "IMM_EXPIRE", str(expire))
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
    token = get_token(os.getenv("imm_account"), os.getenv("imm_password"))
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
