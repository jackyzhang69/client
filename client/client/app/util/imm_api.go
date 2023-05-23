package util

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

var SERVER_URL string
var v = GetViper()

func init() {
	SERVER_URL = v.GetString("server_url")
}

func get_token(username string, password string) (string, error) {
	// get token from config
	token := v.GetString("IMM_TOKEN")
	Logger.Debug("token: ", token)
	if token != "" {
		// check if it's expired
		expire := v.GetInt("IMM_EXPIRE")
		Logger.Debug("expire: ", expire)
		if expire != 0 {
			if time.Now().Unix() < int64(expire) {
				return token, nil
			} else {
				Logger.Info("Token expired, refreshing...")
			}
		}
	} else {
		fmt.Println("No token saved, retrieving...")
	}
	return refresh_token(username, password)
}

func refresh_token(username string, password string) (string, error) {
	data := url.Values{}
	data.Set("username", username)
	data.Set("password", password)

	resp, err := http.PostForm(SERVER_URL+"/"+"login", data)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("invalid response status code: %d", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var tokenData struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int64  `json:"expires_in"`
	}
	err = json.Unmarshal(body, &tokenData)
	if err != nil {
		return "", err
	}

	// token expires in 9 hours
	expire := time.Now().Add(9 * time.Hour).Unix()

	v.Set("IMM_TOKEN", tokenData.AccessToken)
	v.Set("IMM_EXPIRE", strconv.FormatInt(expire, 10))

	// Save the changes to the config file
	err = v.WriteConfig()
	if err != nil {
		fmt.Println(fmt.Errorf("failed to write config file: %w", err))
	}

	return tokenData.AccessToken, nil
}

func gen_request_headers() (http.Header, error) {
	token, err := get_token(v.GetString("imm_account"), v.GetString("imm_password"))
	if err != nil {
		return nil, err
	}
	headers := http.Header{}
	headers.Add("accept", "application/json")
	headers.Add("Content-Type", "application/json")
	headers.Add("Authorization", "Bearer "+token)
	return headers, nil
}

func Imm_api_post(endpoint string, reqBody []byte) (*http.Response, error) {
	url := SERVER_URL + "/" + endpoint
	Logger.Debug("imm_api_post enpoint url: ", url)

	headers, err := gen_request_headers()
	if err != nil {
		return &http.Response{}, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		Logger.Error(err)
	}
	req.Header = headers

	// Send request
	resp, err := http.DefaultClient.Do(req)

	// request error
	if err != nil {
		return &http.Response{}, fmt.Errorf("imm_api_post request error: %v", err)
	}

	// response error
	if resp.StatusCode != http.StatusOK {
		return &http.Response{}, fmt.Errorf("invalid response status code: %d", resp.StatusCode)
	}

	return resp, nil
}

func Imm_api_get(endpoint string, queries url.Values) (*http.Response, error) {
	url := SERVER_URL + "/" + endpoint
	Logger.Debug("imm_api_get enpoint url: ", url)

	headers, err := gen_request_headers()
	if err != nil {
		return &http.Response{}, err
	}

	req, err := http.NewRequest("GET1", url, nil)
	if err != nil {
		return &http.Response{}, err
	}
	req.Header = headers

	// Send request
	resp, err := http.DefaultClient.Do(req)

	// request error
	if err != nil {
		return &http.Response{}, err
	}

	// response error
	if resp.StatusCode != http.StatusOK {
		return &http.Response{}, fmt.Errorf("invalid response status code: %d", resp.StatusCode)
	}

	return resp, nil

}

// delete and put is not tested yet TODO:
func Imm_api_delete(endpoint string) (*http.Response, error) {
	url := SERVER_URL + "/" + endpoint

	headers, err := gen_request_headers()
	if err != nil {
		return &http.Response{}, err
	}

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		fmt.Println(err)
	}
	req.Header = headers

	// Send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
	}

	return resp, nil
}

func Imm_api_put(endpoint string, queries url.Values) (*http.Response, error) {
	url := SERVER_URL + "/" + endpoint

	headers, err := gen_request_headers()
	if err != nil {
		return &http.Response{}, err
	}

	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		fmt.Println(err)
	}
	req.Header = headers

	// Send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
	}

	return resp, nil
}
