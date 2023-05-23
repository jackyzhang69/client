package noc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strings"
	"sync"
)

type TextCompletionResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

type Choice struct {
	Text         string      `json:"text"`
	Index        int         `json:"index"`
	Logprobs     interface{} `json:"logprobs"` // You can define a struct for this if needed
	FinishReason string      `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type Duty struct {
	Index int
	Text  string
}

type Duties []Duty

func (d Duties) Len() int           { return len(d) }
func (d Duties) Swap(i, j int)      { d[i], d[j] = d[j], d[i] }
func (d Duties) Less(i, j int) bool { return d[i].Index < d[j].Index }

func (d Duties) SortByIndex() {
	sort.Sort(d)
}

type Return_duties struct {
	Duties         []Duty
	Refined_duties []Duty
}

func makePostRequest(httpClient *http.Client, url string, prompt string) ([]byte, error) {
	// Define the request payload
	payload := map[string]interface{}{
		"model":       "text-davinci-003",
		"prompt":      prompt,
		"max_tokens":  200,
		"temperature": 0.9,
	}

	// Convert the payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("Error marshaling JSON payload: %s\n", err.Error())
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, err
	}

	// Set the appropriate headers for JSON data
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer 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")

	// Send the request
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the response body
	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return responseBody, nil

}

func Make_noc_duties(noc_code, title, industry, region string, refine bool) (return_duites Return_duties, err error) {
	// Define the prompts
	prompts, err := get_prompts(noc_code, title, industry, region)
	if err != nil {
		fmt.Printf("Error getting prompts: %s\n", err.Error())
		return Return_duties{}, err
	}

	// Create a channel to collect the response data
	responseChan := make(chan Duty)

	// define a http httpClient to send request
	httpClient := &http.Client{}
	url := "https://api.openai.com/v1/completions"

	go func() {
		con_worker(httpClient, url, prompts, responseChan)
	}()

	// make a response list
	var duties Duties
	for duty := range responseChan {
		duties = append(duties, duty)
	}

	duties.SortByIndex()

	refined_duties := []Duty{}
	// if refined is requried, do it here
	if refine {
		var duties_texts string
		for _, duty := range duties {
			duties_texts = duties_texts + duty.Text + "\n"
		}
		response, err := makePostRequest(httpClient, url, Get_refine_prompts(duties_texts))
		if err != nil {
			fmt.Printf("Error making POST request for get refined duties: %v\n", err)
			return Return_duties{}, err
		}
		var resp TextCompletionResponse
		err_unmarshal := json.Unmarshal(response, &resp)
		if err_unmarshal != nil {
			fmt.Printf("Error decoding response JSON: %s\n", err_unmarshal.Error())
			return Return_duties{}, err_unmarshal
		}
		temp_duties := strings.Trim(resp.Choices[0].Text, " ")
		duty_list := strings.Split(temp_duties, "\n")
		for index, duty := range duty_list {
			refined_duties = append(refined_duties, Duty{Index: index, Text: duty})
		}
	}

	return Return_duties{Duties: duties, Refined_duties: refined_duties}, nil
}

// con_worker is a concurrent worker to send request
func con_worker(httpClient *http.Client, url string, prompts []string, responseChan chan Duty) {
	var wg sync.WaitGroup
	wg.Add(len(prompts))

	for index, prompt := range prompts {
		go func(index int, prompt string) {
			// Make the POST request
			response, err := makePostRequest(httpClient, url, prompt)
			if err != nil {
				fmt.Printf("Error making POST request for prompt '%s': %v\n", prompt, err)
				wg.Done()
				return
			}

			var resp TextCompletionResponse
			err_unmarshal := json.Unmarshal(response, &resp)
			if err_unmarshal != nil {
				fmt.Printf("Error decoding response JSON: %s\n", err_unmarshal.Error())
				wg.Done()
				return
			}
			duty := strings.Trim(resp.Choices[0].Text, " ")
			responseChan <- Duty{Index: index, Text: duty}
			wg.Done()
		}(index, prompt)
	}

	wg.Wait()
	close(responseChan)
}

func get_prompts(noc_code, position, industry, region string) (prompts []string, err error) {
	Load_data()
	content, ok := CONTENT.GetNocContent(noc_code)
	if !ok {
		return nil, fmt.Errorf("noc code not found")
	}
	duties := content.MainDuties
	if position == "" {
		position = content.Title
	}

	for _, duty := range duties {
		prompts = append(prompts, make_prompt(position, industry, region, duty))
	}

	return prompts, nil
}

func make_prompt(position, industry, region, duty string) (prompt string) {
	template := `
    You are an export of human resource. You need to help generate specific job duties for a given position, based on the generic description from the Canadian National Occupational Classification (NOC) code.  Please convert the following NOC generic descriptions into specific job duties, using the provided example as a guide, and ensure that the duties are appropriate for the specific industry.While maintaining semantic consistency, try to use different words than those in the original description. Additionally, if the original description is short and abstract, consider adding some concrete details to expand it, but avoid generating excessively long content。When referring to nouns mentioned in the NOC generic description, consider whether they are applicable to the specific job, industry, and region, and avoid simply copying from the original text:

    Example:
    Context: This position is marketing manager in restaurant industry in Toronto, Canada. 
    NOC Generic Description: Plan, direct and evaluate the activities of firms and departments that develop and implement advertising campaigns to promote the sales of products and services.
    Specific Job Duty: Strategize, oversee, and assess the initiatives of teams and departments responsible for creating and executing marketing campaigns to increase sales and promote restaurant offerings and services.

    Context: This position is marketing manager in restaurant industry in Toronto, Canada. 
    NOC Generic Description: Establish distribution networks for products and services, initiate market research studies and analyze their findings, assist in product development, and direct and evaluate the marketing strategies of establishments.
    Specific Job Duty: Develop and manage channels to promote menu items and services, conduct market research to identify customer preferences, assist in menu development, and oversee marketing strategies to improve restaurant visibility and sales.

    Context: The position is %s in the %s industry, located in %s.
    NOC Generic Description: %s

    Specific Job Duty:

    `
	prompt = fmt.Sprintf(template, position, industry, region, duty)
	return
}

// refine the generated duties
func Get_refine_prompts(duties string) (prompt string) {
	template := `Revise and reorganize a provided list of job duties, ensuring the removal of repetitive content while maintaining the meaning and intent of each responsibility. The revised list should be concise, effective, and clearly communicate all responsibilities without requiring the preservation of the original order. Refrain from providing additional information beyond the refined list of duties.
    The duties are:
    %v`
	prompt = fmt.Sprintf(template, duties)
	return prompt
}
