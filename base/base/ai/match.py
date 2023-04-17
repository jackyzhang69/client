from .ai import AIModel, get_ai_answer,get_ai_chat_answer


def get_option(item: str, options: list[str]):
    prompt = f"""
    you are a classification expert. I will input a string and a list of string. What I want you to do is that you must math the string to the list of string, and find the best matching string from the list, and then return to me. Just give me the option((key, rather than value)) picked from the list, no more anything else!!! don't speak too much, only the key. Below is the string: {item}, , and the list of string:  {options}"""

    option = get_ai_answer(
        prompt, model=AIModel.DAVINCI, temperature=0, answer_is_json=False
    )

    return option


# targets should be longer than sources. every source should be matched to a target, if a target has no matched source, it will be None
def get_matched_list(targets:list[str],sources:list[str]):
    prompt = f"""
    You are a classification expert.I require a JSON output where a target list of strings is matched with a source list of strings.
    Specifically, you need to iterate over the source list and match each string to a target string.
    The output JSON object should have target strings as keys and matched source strings as values.If there is no match for a target string, its value should be null.Also, the mapping between the source and target lists should be one - to - one, with each source string used only once.
    If a target string has no match in the source list, include it in the JSON object with a value of null. The output is only json object, no any other string.
    Below is the source list: {sources},and the target list:{targets}. 
    """
    
    json_data = get_ai_chat_answer(
        prompt, model="gpt-4"
    )

    return json_data


