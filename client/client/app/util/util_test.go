package util

import (
	"fmt"
	"io/ioutil"
	"testing"
)

// test GetErByProvince
func TestImm_api_post(t *testing.T) {
	resp, err := Imm_api_post("noc/get_noc_code/", []byte(`{"job_description":"software developer","search_model":"semantic"}`))
	if err != nil {
		Logger.Error(err)
		return
	}
	fmt.Println(resp)
}

// test imm api get
func TestImm_api_get(t *testing.T) {
	resp, err := Imm_api_get("user", nil)
	if err != nil {
		Logger.Error(err)
	}
	defer resp.Body.Close()

	// Read the response body into a byte slice
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		Logger.Error(err)
	}

	fmt.Println(string(respBody))
}

// test get viper config
func TestGetViperConfig(t *testing.T) {
	fmt.Println(GetViper())
}
