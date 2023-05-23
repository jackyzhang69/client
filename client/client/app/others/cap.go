package others

import (
	"app/util"
	"encoding/json"
	"fmt"
	"io/ioutil"
)

func Clac_cap(jsonData []byte) map[string]interface{} {
	// Send the request
	url := "calc/cap"
	response, err := util.Imm_api_post(url, jsonData)
	if err != nil {
		fmt.Println(err)
	}
	// structure
	type Results struct {
		Result map[string]interface{} `json:"result"`
	}

	// read response body
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		fmt.Println(err)
	}
	// unmarshal
	var results Results
	err = json.Unmarshal(body, &results)
	if err != nil {
		fmt.Println(err)
	}

	return results.Result
}
