// /*
//  * This is AI module for the formfilling project. 
//  */

// const openai = require('openai');
// openai.api_key = process.env.OPENAI_API_KEY;

// const AIModel = {
//     DAVINCI: "text-davinci-003",
//     CURIE: "text-curie-001",
//     BABBAGE: "text-babbage-001",
//     ADA: "text-ada-001"
// }


// async function getAiAnswer(prompt, model = AIModel.DAVINCI, temperature = 0, answerIsJson = true) {
//     const response = await openai.Completion.create({
//         engine: model,
//         prompt: prompt,
//         max_tokens: 1000,
//         temperature: temperature
//     });
//     const rawText = response.choices[0].text.trim();
//     const data = answerIsJson ? JSON.parse(rawText) : rawText;

//     return data;
// }


// async function pickASelect(categories, item) {
//     const prompt = `
//     I ${categories},tell me which category should the ${item} belongs to ? Give me the result only the category you picked word in the list.Nothing more.
//     `
//     const response = await getAiAnswer(prompt, AIModel.DAVINCI, 0, false);
//     return response;
// }

// (async function main() {
//     const answer = await pickASelect(["apple", "banana", "orange"], "apple");
//     console.log(answer);
// })();

// const openai = require('openai');
const axios = require('axios');
const apiKey = process.env.OPENAI_API_KEY;
const prompt = 'Once upon a time';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
};

const body = {
    'prompt': prompt,
    'temperature': 0.5,
    'max_tokens': 50,
    'top_p': 1,
    'frequency_penalty': 0,
    'presence_penalty': 0
};

axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));



