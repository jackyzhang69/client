package util

import (
	"encoding/json"
	"time"

	"github.com/tealeg/xlsx"
)

type Excel struct {
	filename string
}

func NewExcel(filename string) *Excel {
	return &Excel{
		filename: filename,
	}
}

func (e *Excel) getDateString(dateNum float64) string {
	t := time.Unix(int64(dateNum), 0)
	return t.Format("2006-01-02")
}

func (e *Excel) Json() ([]byte, error) {
	excelData := make(map[string]interface{})
	workbook, err := xlsx.OpenFile(e.filename)
	if err != nil {
		return []byte{}, err
	}

	for _, sheet := range workbook.Sheets {
		sheetName := sheet.Name
		data := sheet.Rows

		if sheetName[:5] == "info-" {
			infoName := sheetName[5:]
			excelData[infoName] = make(map[string]interface{})

			for i := 3; i < len(data); i++ {
				row := data[i].Cells
				key := row[0].Value
				value := row[3].Value

				if key != "" {
					if keyContainsDate(key) {
						dateValue, _ := row[3].Float()
						excelData[infoName].(map[string]interface{})[key] = e.getDateString(dateValue)
					} else {
						excelData[infoName].(map[string]interface{})[key] = value
					}
				}
			}
		} else if sheetName[:6] == "table-" {
			tableName := sheetName[6:]
			excelData[tableName] = make([]map[string]interface{}, 0)
			variables := data[2].Cells

			dateIndexes := make([]int, 0)
			for i, variable := range variables {
				if keyContainsDate(variable.Value) {
					dateIndexes = append(dateIndexes, i)
				}
			}

			for i := 4; i < len(data); i++ {
				row := data[i].Cells
				tableRow := make(map[string]interface{})
				isEmptyRow := true

				for j, variable := range variables {
					cell := row[j]
					columnValue := cell.Value

					if cell.Type() == xlsx.CellTypeNumeric && cell.Value == "0" {
						columnValue = cell.Value
					}

					if contains(dateIndexes, j) {
						if columnValue == "" {
							tableRow[variable.Value] = nil
						} else {
							dateValue, _ := cell.Float()
							tableRow[variable.Value] = e.getDateString(dateValue)
						}
					} else {
						tableRow[variable.Value] = columnValue
					}
					if columnValue != "" {
						isEmptyRow = false
					}
				}
				if !isEmptyRow {
					switch tableName {
					case "contact":
						if tableRow["first_name"].(string) != "" {
							excelData[tableName] = append(excelData[tableName].([]map[string]interface{}), tableRow)
						}
					case "eraddress", "address":
						if tableRow["street_name"].(string) != "" {
							excelData[tableName] = append(excelData[tableName].([]map[string]interface{}), tableRow)
						}
					case "phone", "personid":
						if tableRow["number"].(string) != "" {
							excelData[tableName] = append(excelData[tableName].([]map[string]interface{}), tableRow)
						}
					default:
						excelData[tableName] = append(excelData[tableName].([]map[string]interface{}), tableRow)
					}
				}

			}
		}
	}
	jsonData, err := json.MarshalIndent(excelData, "", "  ")
	if err != nil {
		return []byte{}, err
	}

	return jsonData, nil
}

func keyContainsDate(key string) bool {
	return keyContainsSubstring(key, "date") || keyContainsSubstring(key, "dob")
}

func keyContainsSubstring(key, substr string) bool {
	return len(key) >= len(substr) && key[:len(substr)] == substr
}

func contains(arr []int, val int) bool {
	for _, v := range arr {
		if v == val {
			return true
		}
	}
	return false
}

// func do() {
// 	e := NewExcel("/Users/jacky/desktop/pgp/yx.xlsx")
// 	jsonData, err := e.Json()
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	fmt.Println(jsonData)
// }

// func main() {
// 	do()
// }
