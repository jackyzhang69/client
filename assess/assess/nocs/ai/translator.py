import requests
import os
import json

""" This function translates a string using the DeepL API."""""
def translate(text, target_language="en"):
    if not text:
        return ""
    
    # create a request to the DeepL API
    url = "https://api-free.deepl.com/v2/translate"
    key=os.environ["DEEPL_AUTH_KEY"]
    if not key:
        raise Exception("No DeepL API key found. Please set the DEEPL_AUTH_KEY environment variable.")
    
    payload = {
        "auth_key": key,
        "text": text,
        # "source_lang":source_language,
        "target_lang": target_language
    }
    response = requests.get(url, params=payload).text
    response = json.loads(response)
    return response["translations"][0]["text"]