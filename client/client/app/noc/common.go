package noc

import (
	"app/util"
	"embed"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

var WAGE NOCAreaWage
var OUTLOOK NOCAreaOutlook
var CONTENT NocContent
var ER_MAP ER_Map
var SPECIAL_PROGRAMS SpecialProgramList

//go:embed data/wage.json data/outlook.json data/content.json data/er.json data/specialprograms.json
var dataFile embed.FS

// getNocData reads the JSON file and decodes it into the container
func GetData(json_file string, container interface{}) bool {
	file, err := dataFile.ReadFile(json_file)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return true
	}

	err = json.Unmarshal(file, container)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return true
	}
	return false
}

func Load_data() {
	var err bool

	// read the noc contents
	err = GetData("data/content.json", &CONTENT)

	if err {
		fmt.Println("Error reading file:", err)
		return
	}

	// Read the wages JSON file
	err = GetData("data/wage.json", &WAGE)
	if err {
		fmt.Println("Error reading file:", err)
		return
	}

	// Read the outlook JSON file
	err = GetData("data/outlook.json", &OUTLOOK)
	if err {
		fmt.Println("Error reading file:", err)
		return
	}

	// Read the er JSON file
	err = GetData("data/er.json", &ER_MAP)
	if err {
		fmt.Println("Error reading file:", err)
		return
	}

	// Read the special programs JSON file
	err = GetData("data/specialprograms.json", &SPECIAL_PROGRAMS)
	if err {
		fmt.Println("Error reading file:", err)
		return
	}
}

// GetNocContent returns the content of a NOC code
func GetContent(noc string) (Content, bool) {
	c, ok := CONTENT.GetNocContent(noc)
	if !ok {
		fmt.Println("Error reading file:", ok)
		return Content{}, true
	} else {
		return c, false
	}
}

// noc code, er code, lowest, median, highest, outlook, title
type WageOutlook struct {
	Lowest   float64 `json:"lowest"`
	Median   float64 `json:"median"`
	Highest  float64 `json:"highest"`
	Outlook  int     `json:"outlook"`
	Noc_code string  `json:"noc_code"`
	Er_code  string  `json:"er_code"`
	Title    string  `json:"title"`
}

// convert the wage and outlook to a list
func (w *WageOutlook) List() []string {
	return []string{
		w.Noc_code,
		w.Er_code,
		fmt.Sprintf("%.2f", w.Lowest),
		fmt.Sprintf("%.2f", w.Median),
		fmt.Sprintf("%.2f", w.Highest),
		fmt.Sprintf("%d", w.Outlook),
		w.Title,
	}
}

// list of wage and outlook
type WageOutlookList []WageOutlook

// make the wage and outlook list
func (w *WageOutlookList) List() [][]string {
	wo_list := [][]string{}

	title := []string{"NOC", "ER", "Lowest", "Median", "Highest", "Outlook", "Title"}
	wo_list = append(wo_list, title)

	for _, v := range *w {
		wo_list = append(wo_list, v.List())
	}
	return wo_list
}

// print the wage and outlook list in the console
func (w *WageOutlookList) Console_print() {
	wo_list := w.List()
	util.PrintTable(wo_list)
}

// get wage outlook based on noc code and er code
func GetWageOutlook(noc_code, er_code string) (WageOutlook, bool) {
	w, ok := WAGE.GetWage(noc_code, er_code)
	if !ok {
		fmt.Println("Error reading file:", ok)
		return WageOutlook{}, false
	}
	o, ok := OUTLOOK.GetOutlook(noc_code, er_code)
	if !ok {
		fmt.Println("Error reading file:", ok)
		return WageOutlook{}, false
	}
	content, ok := CONTENT.GetNocContent(noc_code)
	if !ok {
		fmt.Println("Error reading file:", ok)
		return WageOutlook{}, false
	}
	return WageOutlook{
		Lowest:   w.Lowest,
		Median:   w.Median,
		Highest:  w.Highest,
		Outlook:  o,
		Noc_code: noc_code,
		Er_code:  er_code,
		Title:    content.Title,
	}, true
}

// get wage outlook based on noc codes and er code
func GetWageOutlookList(noc_codes []string, er_code string) (WageOutlookList, bool) {
	wo_list := WageOutlookList{}
	for _, code := range noc_codes {
		wage_outlook, ok := GetWageOutlook(code, er_code)
		if !ok {
			fmt.Println("Error reading file:", ok)
			return WageOutlookList{}, false
		}
		wo_list = append(wo_list, wage_outlook)
	}
	return wo_list, true
}

// get qualified NOC codes based on outlook and median wage
type QualifiedNocCondition struct {
	Begin_str   string  `json:"begin_str"`
	Er_code     string  `json:"er_code"`
	Outlook     int     `json:"outlook"`
	Median_wage float64 `json:"median_wage"`
	Greater     bool    `json:"greater"`
}

// get qualified NOC codes based on outlook,median wage, noc code starts letter, and er code
func GetWageOutlookQualifiedNocs(q *QualifiedNocCondition) []string {
	// get wage qualifed nocs
	wage_nocs := WAGE.GetWageQualifiedNocs(q.Er_code, q.Median_wage, q.Greater)

	// get outlook qualifed nocs
	outlook_nocs := OUTLOOK.GetOutlookQualifiedNocsStartsWith(q.Begin_str, q.Er_code, q.Outlook)

	// get intersection of the two lists
	noc_list := util.Intersection(wage_nocs, outlook_nocs)

	return noc_list
}

// qualified areas based on noc code and outlook
func GetOutlookQualifiedAreas(noc_code string, outlook int) []string {
	areas := OUTLOOK.GetQualifiedAreas(noc_code, outlook)
	return areas
}

// get nocs wage outlook from special program and er code
// type SpecialNoc struct {
// 	Noc_code string  `json:"noc_code"`
// 	Title    string  `json:"title"`
// 	Outlook  int     `json:"outlook"`
// 	Median   float64 `json:"median"`
// }

type SpecialStreamNocs struct {
	Stream  string          `json:"stream"`
	Wo_list WageOutlookList `json:"wo_list"`
}

type SpecialProgramNocs struct {
	Program string              `json:"program"`
	Streams []SpecialStreamNocs `json:"streams"`
}

// get the programs list
func (s *SpecialProgramList) Get_programs() [][]string {
	programs := []string{}
	for _, program := range *s {
		programs = append(programs, program.Program)
	}
	// remove duplicates
	programs = util.RemoveDuplicates(programs)

	// assemb the programs list
	programs_list := [][]string{}
	for index, program := range programs {
		programs_list = append(programs_list, []string{strconv.Itoa(index), program})
	}
	return programs_list
}

// printout the special program nocs in console table
func (s *SpecialProgramNocs) Console_print() {
	for _, stream := range s.Streams {
		util.ConsolePrint("Stream: "+stream.Stream, "success")
		stream.Wo_list.Console_print()
	}
}

// get special program nocs based on program and er code
func GetSpecialProgramNocs(program, er_code string) SpecialProgramNocs {
	// get special streams
	special_stream, ok := SPECIAL_PROGRAMS.GetSpecialStreams(strings.ToUpper(program))
	if !ok {
		fmt.Println("Error reading file:", ok)
		return SpecialProgramNocs{}
	}

	// get special program nocs
	special_program_nocs := SpecialProgramNocs{
		Program: program,
		Streams: []SpecialStreamNocs{},
	}
	for _, stream := range special_stream {
		// get special stream nocs
		special_stream_nocs := SpecialStreamNocs{
			Stream:  stream.Stream,
			Wo_list: WageOutlookList{},
		}
		noc_codes := stream.GetSpecialNocs()
		wo_list, ok := GetWageOutlookList(noc_codes, er_code)
		if !ok {
			fmt.Println("Error reading file:", ok)
			return SpecialProgramNocs{}
		}

		special_stream_nocs.Wo_list = wo_list
		special_program_nocs.Streams = append(special_program_nocs.Streams, special_stream_nocs)
	}
	return special_program_nocs
}
