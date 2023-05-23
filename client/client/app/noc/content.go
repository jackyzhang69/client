package noc

import (
	"app/util"
	"fmt"
	"reflect"
)

type Content struct {
	Title                 string   `json:"title"`
	TitleExamples         []string `json:"title_examples"`
	MainDuties            []string `json:"main_duties"`
	EmploymentRequirement []string `json:"employment_requirement"`
	AdditionalInformation []string `json:"additional_information"`
	Exclusion             []string `json:"exclusion"`
}

type NocContent map[string]Content

// getNocContent returns the content for the specified noc
func (n *NocContent) GetNocContent(noc string) (Content, bool) {
	content, ok := (*n)[noc]
	if !ok {
		return Content{}, false
	}
	return content, true
}

// print the content for the specified noc
func (n *Content) Console_print(fields ...string) {
	contentValue := reflect.ValueOf(*n)
	contentType := reflect.TypeOf(*n)

	if len(fields) == 0 {
		// If no fields are provided, print all fields
		fields = make([]string, contentType.NumField())
		for i := 0; i < contentType.NumField(); i++ {
			fields[i] = contentType.Field(i).Name
		}
	}

	for _, field := range fields {
		fieldValue := contentValue.FieldByName(field)
		fieldType, _ := contentType.FieldByName(field)
		if fieldValue.IsValid() {
			if fieldValue.Kind() == reflect.Slice {
				// If fieldValue is a slice, print each element on a separate line
				fieldName := fieldType.Tag.Get("json")
				outputString := fmt.Sprintf("%s:\n", fieldName)
				util.ConsolePrint(outputString, "success")
				for i := 0; i < fieldValue.Len(); i++ {
					// fmt.Printf("  - %v\n", fieldValue.Index(i).Interface())
					content := fmt.Sprintf("  - %v\n", fieldValue.Index(i).Interface())
					util.ConsolePrint(content, "")

				}
			} else {
				// If fieldValue is not a slice, print it as before
				util.ConsolePrint(fieldType.Tag.Get("json"), "success")
				util.ConsolePrint(fieldValue.Interface().(string), "")
			}
		} else {
			fmt.Printf("Invalid field: %s\n", field)
		}
	}
}
