package noc

import (
	"app/util"
	"strings"
)

// special program define
type SpecialProgram struct {
	Program     string `json:"program"`
	Stream      string `json:"stream"`
	Description string `json:"description"`
	Noc_codes   string `json:"noc_codes"`
	Remark      string `json:"remark"`
	Source      string `json:"source"`
}

// special programs list
type SpecialProgramList []SpecialProgram

// get special programs based on noc code
func (s *SpecialProgramList) GetSpecialPrograms(noc_code string) (SpecialProgramList, bool) {
	var sp_list SpecialProgramList
	for _, sp := range *s {
		if strings.Contains(sp.Noc_codes, noc_code) {
			sp_list = append(sp_list, sp)
		}
	}
	if len(sp_list) > 0 {
		return sp_list, true
	}
	return SpecialProgramList{}, false
}

// print the special programs list
func (s *SpecialProgramList) Console_print() {
	table := [][]string{{"Program", "Stream"}}
	for _, sp := range *s {
		table = append(table, []string{sp.Program, sp.Stream})
	}
	util.PrintTable(table)
}

// get special streams based on program
func (s *SpecialProgramList) GetSpecialStreams(program string) (SpecialProgramList, bool) {
	var sp_list SpecialProgramList
	for _, sp := range *s {
		if sp.Program == program {
			sp_list = append(sp_list, sp)
		}
	}
	if len(sp_list) > 0 {
		return sp_list, true
	}
	return SpecialProgramList{}, false
}

// get special nocs in a program
func (s *SpecialProgram) GetSpecialNocs() []string {
	nocs := strings.Split(s.Noc_codes, ",")
	for i := range nocs {
		nocs[i] = strings.TrimSpace(nocs[i])
	}
	return nocs
}
