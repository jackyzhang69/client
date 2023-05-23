package noc

import (
	"fmt"
	"testing"
)

// test GetErByProvince
func TestGetErByProvince(t *testing.T) {
	Load_data()
	ers, ok := ER_MAP.GetErByProvince("bc")
	if !ok {
		t.Error("GetErByProvince failed")
	}
	ers.Print()
}

// test GetEr
func TestGetEr(t *testing.T) {
	Load_data()
	er, ok := ER_MAP.GetEr("5920")
	if !ok {
		t.Error("GetEr failed")
	}
	fmt.Println(er.ER_name, er.Province)
}

// test GetWageOutlook

func TestGetWageOutlook(t *testing.T) {
	Load_data()
	wage_outlook, ok := GetWageOutlook("11100", "5920")
	if !ok {
		t.Error("GetWageOutlook failed")
	}
	fmt.Println(wage_outlook)
}

// test get wage outlook based on noc codes and er code
func TestGetWageOutlookList(t *testing.T) {
	Load_data()
	noc_codes := []string{"11100", "21311"}
	wo_list, ok := GetWageOutlookList(noc_codes, "5920")
	if !ok {
		t.Error("GetWageOutlookList failed")
	}
	wo_list.Console_print()
}

// test get qualified NOC codes based on outlook and median wage
func TestGetWageOutlookQualifiedNocCodes(t *testing.T) {
	Load_data()
	condition := QualifiedNocCondition{
		Outlook:     4,
		Median_wage: 36.5,
		Begin_str:   "21",
		Er_code:     "5920",
		Greater:     true,
	}

	qualified_noc_codes := GetWageOutlookQualifiedNocs(&condition)
	wo_list, ok := GetWageOutlookList(qualified_noc_codes, condition.Er_code)
	if !ok {
		t.Error("GetWageOutlookList failed")
	}
	wo_list.Console_print()
}

func TestGetOutlookQualifiedAreas(t *testing.T) {
	Load_data()
	qualified_areas := GetOutlookQualifiedAreas("21311", 4)
	er_name_list, ok := ER_MAP.GetErList(qualified_areas)
	if !ok {
		t.Error("GetErList failed")
	}
	er_name_list.Print()
}

// test Content information
func TestContent(t *testing.T) {
	Load_data()
	content, ok := CONTENT.GetNocContent("21311")
	if !ok {
		t.Error("GetNocContent failed")
	}
	content.Console_print("Title", "MainDuties")
}

// test special programs
func TestSpecialPrograms(t *testing.T) {
	Load_data()
	programs, ok := SPECIAL_PROGRAMS.GetSpecialPrograms("21311")
	if !ok {
		t.Error("GetSpecialPrograms failed")
	}
	programs.Console_print()
}

// test get nocs from special programs
func TestGetSpecialProgramNocs(t *testing.T) {
	Load_data()
	special_program_nocs := GetSpecialProgramNocs("BCPNP", "5920")
	special_program_nocs.Console_print()
}

// test get noc codes based on job description and search model (semantic, lexical, or mix) through api call.
func TestGetNocCode(t *testing.T) {
	Load_data()
	respBody, ok := Get_noc_code("Software Developer in a large chain store", "mix")

	if !ok {
		fmt.Println("Get noc code failed")
		return
	}
	respBody.Console_print()
}

// test make noc duties with multiple positions
func TestMake_noc_duties_with_multiple_positions(t *testing.T) {
	duties, err := Make_noc_duties("63200", "Cooks", "Restaurant", "BC", true)
	if err != nil {
		fmt.Println(err)
		return
	}
	for _, duty := range duties.Duties {
		fmt.Println(duty.Text)
	}

	for _, duty := range duties.Refined_duties {
		fmt.Println(duty.Text)
	}
}
