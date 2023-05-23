package others

import (
	"app/util"
	"testing"
)

func Test_result(t *testing.T) {
	jsonData := []byte(`{
		"familysize": [
			{
				"year": "2021",
				"sponsor_spouse": 1,
				"sponros_children": 0,
				"previous_sponsored": 3,
				"pa_spouse": 1,
				"pa_children": 0
			},
			{
				"year": "2020",
				"sponsor_spouse": "1",
				"sponros_children": "0",
				"previous_sponsored": "0",
				"pa_spouse": 1,
				"pa_children": 0
			},
			{
				"year": "2019",
				"sponsor_spouse": "1",
				"sponros_children": "0",
				"previous_sponsored": "0",
				"pa_spouse": 1,
				"pa_children": 0
			}
		],
		"sponsorincome": [
			{
				"year": 2021,
				"total_income": 62248,
				"oas": 0,
				"prov_payment_training": 0,
				"refuge_rap_payment": 0,
				"prov_social_assistanance": 0,
				"ei_regualar_benefits": 0
			},
			{
				"year": 2020,
				"total_income": 37118,
				"oas": 0,
				"prov_payment_training": 0,
				"refuge_rap_payment": 0,
				"prov_social_assistanance": 0,
				"ei_regualar_benefits": 0
			},
			{
				"year": 2019,
				"total_income": 57515,
				"oas": 0,
				"prov_payment_training": 0,
				"refuge_rap_payment": 0,
				"prov_social_assistanance": 0,
				"ei_regualar_benefits": 0
			}
		],
		"cosignerincome": [
			{
				"year": 2021,
				"total_income": 54889,
				"oas": 0,
				"prov_payment_training": 0,
				"refuge_rap_payment": 0,
				"prov_social_assistanance": 0,
				"ei_regualar_benefits": 0
			},
			{
				"year": 2020,
				"total_income": 49786,
				"oas": 0,
				"prov_payment_training": 0,
				"refuge_rap_payment": 0,
				"prov_social_assistanance": 0,
				"ei_regualar_benefits": 4630
			},
			{
				"year": 2019,
				"total_income": 34326,
				"oas": 0,
				"prov_payment_training": 0,
				"refuge_rap_payment": 0,
				"prov_social_assistanance": 0,
				"ei_regualar_benefits": 9423
			}
		]
	}`)

	result := Clac_pgp(jsonData)

	util.PrintTable(util.ConvertToStringSlice(result))
}
