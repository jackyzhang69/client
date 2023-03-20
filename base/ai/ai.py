import openai
import os, json

openai.api_key = os.getenv("OPENAI_API_KEY")
openai.organization = "org-edLgdM1D3wcQzlvtRAjjUEG9"


class AIModel:
    DAVINCI = "text-davinci-003"
    CURIE = "text-curie-001"
    BABBAGE = "text-babbage-001"
    ADA = "text-ada-001"


def get_ai_answer(
    prompt: str, model=AIModel.DAVINCI, temperature=0, answer_is_json=True
):
    r = openai.Completion.create(
        engine=model, prompt=prompt, max_tokens=1000, temperature=temperature
    )
    raw_text = r["choices"][0]["text"].strip()
    data = json.loads(raw_text) if answer_is_json else raw_text

    return data
