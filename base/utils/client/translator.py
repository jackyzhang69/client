import aiohttp
import asyncio
import os

""" This function translates a string using the DeepL API."""""
async def translate_string(session,text, source_language="zh",target_language="en"):
    if not text:
        return ""
    
    # create a request to the DeepL API
    url = "https://api-free.deepl.com/v2/translate"
    payload = {
        "auth_key": os.environ["DEEPL_AUTH_KEY"],
        "text": text,
        "source_lang":source_language,
        "target_lang": target_language
    }
    async with session.get(url, params=payload) as response:
        # extract the translated text from the response
        response_json = await response.json()
        return response_json["translations"][0]["text"]

""" This function translates a string or list of strings using the DeepL API."""
async def translate_string_or_list(session,text, source_language="zh", target_language="en"):
    if isinstance(text, str):
        # if text is a string, translate it
        return await translate_string(session,text,source_language=source_language,target_language=target_language)
    elif isinstance(text, list):
        # if text is a list, translate each item and return a list of translations
        return [await translate_string(session,item,source_language=source_language,target_language=target_language) for item in text]
    
""" translate a list of strings or list of lists of strings"""
async def translate_list_of_list(session,text_list, source_language="zh", target_language="en"):
    tasks = []
    for text in text_list:
        task=asyncio.create_task(translate_string_or_list(session,text,source_language=source_language,target_language=target_language))
        tasks.append(task)
    results= await asyncio.gather(*tasks)
    return results


""" Translate all, including nested lists"""
async def translate(text_list,source_language="zh",target_language="en"):
    async with aiohttp.ClientSession() as session:
        result = await translate_list_of_list(session,text_list,source_language=source_language,target_language=target_language)
        return result
    
    
def main():
    tl=text_list = ["Hello", "Goodbye", ["Hello", "Goodbye"]]
    result=asyncio.run(translate(tl,source_language="en",target_language="zh"))
    print(result)
    
if __name__ == "__main__":
    main()