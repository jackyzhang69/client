// This code is used for get noc codes based on job description and search model (semantic, lexical, or mix) through api call.

package noc

import (
	"app/util"
	"encoding/json"
	"fmt"
	"io/ioutil"
)

type body struct {
	Job_description string `json:"job_description"`
	Search_model    string `json:"search_model"`
}

type noc_code struct {
	Noc_code   string `json:"noc_code"`
	Similarity string `json:"similarity"`
}

type noc_codes []noc_code

type Response struct {
	Semantic_nocs noc_codes `json:"semantic_nocs"`
	Lexical_nocs  noc_codes `json:"lexical_nocs"`
	Rerank_nocs   noc_codes `json:"rerank_nocs"`
}

// common func for assembly Response
func make_list(codes noc_codes, titles []string) [][]string {
	var list [][]string
	list = append(list, titles)

	for _, code := range codes {
		content, ok := CONTENT.GetNocContent(code.Noc_code)
		if !ok {
			util.Logger.Error("GetNocContent failed")
		}

		list = append(list, []string{code.Noc_code, code.Similarity, content.Title})
	}
	return list
}

// print out Response in console
func (r Response) Console_print() {
	titles := []string{"Noc_code", "Similarity", "Title"}
	if len(r.Semantic_nocs) != 0 {
		util.ConsolePrint("Semantic search result:", "success")
		util.PrintTable(make_list(r.Semantic_nocs, titles))
	}
	if len(r.Lexical_nocs) != 0 {
		util.ConsolePrint("Lexical search result:", "success")
		util.PrintTable(make_list(r.Lexical_nocs, titles))
	}
	if len(r.Rerank_nocs) != 0 {
		util.ConsolePrint("Reranked result:", "success")
		util.PrintTable(make_list(r.Rerank_nocs, titles))
	}
}

func Get_noc_code(job_description string, search_model string) (result Response, ok bool) {
	// create a new body with request parameters
	reqBody := body{
		Job_description: job_description,
		Search_model:    search_model,
	}

	// convert the request body to JSON
	reqBodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return Response{}, false
	}

	// call the API
	resp, err := util.Imm_api_post("noc/get_noc_code", reqBodyBytes)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	// check if success
	if resp.StatusCode != 200 {
		fmt.Println("noc/get_noc_code response status code is ", resp.StatusCode)
		return Response{}, false
	}

	// Read the response body into a byte slice
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	// unmarshal the JSON-encoded response body into response struct
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		panic(err)
	}
	return result, true
}
