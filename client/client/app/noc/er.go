package noc

import (
	"app/util"
	"strings"
)

// ER: Economic Region
type ER struct {
	ER_name  string `json:"er_name"`
	Province string `json:"province"`
}

// ER_Map is a map of ERs with the key being the ER code
type ER_Map map[string]ER

// getEr returns er name and province name based on er code
func (e *ER_Map) GetEr(er_code string) (ER, bool) {
	er, ok := (*e)[er_code]
	if !ok {
		return ER{}, false
	}
	return er, true
}

// getErList returns all er codes based on er code list
func (e *ER_Map) GetErList(er_codes []string) (ER_code_name_list, bool) {
	var ers ER_code_name_list
	for _, er_code := range er_codes {
		er, ok := e.GetEr(er_code)
		if !ok {
			return ER_code_name_list{}, false
		}
		new_er := ER_code_name{ER_code: er_code, ER_name: er.ER_name, ER_province: er.Province}
		ers = append(ers, new_er)
	}
	return ers, true
}

// all er code elements
type ER_code_name struct {
	ER_code     string
	ER_name     string
	ER_province string
}

// all er code elements list
type ER_code_name_list []ER_code_name

// get er code and er name based on province name
func (e *ER_Map) GetErByProvince(province string) (ER_code_name_list, bool) {
	var ers ER_code_name_list
	for er_code, er := range *e {
		if er.Province == strings.ToUpper(province) {
			er := ER_code_name{ER_code: er_code, ER_name: er.ER_name, ER_province: er.Province}
			ers = append(ers, er)
		}
	}
	if len(ers) > 0 {
		return ers, true
	}
	return ER_code_name_list{}, false
}

// print the ER code and name
func (e *ER_code_name_list) Print() {
	table := [][]string{{"ER Code", "ER Name", "Province"}}
	for _, er := range *e {
		table = append(table, []string{er.ER_code, er.ER_name, er.ER_province})
	}
	util.PrintTable(table)
}

// get er name,province based on er codes
func GetErByErCodes(er_codes []string) (ER_code_name_list, bool) {
	var ers ER_code_name_list
	for _, er_code := range er_codes {
		er, ok := ER_MAP.GetEr(er_code)
		if !ok {
			return ER_code_name_list{}, false
		}
		new_er := ER_code_name{ER_code: er_code, ER_name: er.ER_name, ER_province: er.Province}
		ers = append(ers, new_er)
	}
	return ers, true
}
