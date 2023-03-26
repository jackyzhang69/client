""" Theere are two ways to maintain context between API requests when using GPT-3 in Python."""
"""
The main advantage of using the 'openai' library is that it provides a simple and easy-to-use interface for interacting with GPT-3. The library also provides additional functionality such as natural language processing (NLP) capabilities, which can be useful for tasks such as text summarization and sentiment analysis.

The main advantage of using the 'gpt3' library is that it provides more control and flexibility when interacting with GPT-3. For example, it allows you to specify the 'max_tokens' and 'stop' parameters, which can be used to fine-tune the output of the API. It also allows you to specify the 'n' parameter, which can be used to generate multiple responses at once.

One potential disadvantage of using the 'openai' library is that it may be less flexible than the 'gpt3' library. For example, it may not provide as many options for fine-tuning the API output. Additionally, the 'openai' library may not be as well-suited for more advanced use cases that require greater control over the API.

One potential disadvantage of using the 'gpt3' library is that it requires more setup and configuration than the 'openai' library. Additionally, because the 'gpt3' library provides more control over the API, it may be more complex to use and may require more programming expertise.

In short, both libraries have their own advantages and disadvantages. The 'openai' library is more user-friendly and provides additional NLP functionality, while the 'gpt3' library provides more control and flexibility when interacting with GPT-3. Ultimately, the best library to use will depend on your specific use case and programming expertise.
"""
""" 1. Use the context parameter in the API request. """

import openai

# Set the API key
openai.api_key = "YOUR_API_KEY"

# Initialize the context
context = ""

# First request
response = openai.Completion.create(
    engine="text-davinci-002", prompt=f"{context} Hello, how are you?", temperature=0.5
)
context = response.choices[0].text

# Second request
response = openai.Completion.create(
    engine="text-davinci-002",
    prompt=f"{context} Can you tell me about your day?",
    temperature=0.5,
)
context = response.choices[0].text

# Third request
response = openai.Completion.create(
    engine="text-davinci-002",
    prompt=f"{context} What's your favorite hobby?",
    temperature=0.5,
)
print(response.choices[0].text)

"""" 2. Use the context parameter in the API request. """
import openai_secret_manager
import openai

# Get the API key
secret = openai_secret_manager.get_secret("openai")
openai.api_key = secret["api_key"]

# Initialize the session_id
session_id = ""

# First request
response = openai.Completion.create(
    engine="text-davinci-002",
    prompt="Hello, how are you?",
    temperature=0.5,
    max_tokens=2048,
    stop=["\n"],
    n=1,
    session_id=session_id,
)
session_id = response.session_id

# Second request
response = openai.Completion.create(
    engine="text-davinci-002",
    prompt="Can you tell me about your day?",
    temperature=0.5,
    max_tokens=2048,
    stop=["\n"],
    n=1,
    session_id=session_id,
)
session_id = response.session_id

# Third request
response = openai.Completion.create(
    engine="text-davinci-002",
    prompt="What's your favorite hobby?",
    temperature=0.5,
    max_tokens=2048,
    stop=["\n"],
    n=1,
    session_id=session_id,
)
print(response.choices[0].text)
