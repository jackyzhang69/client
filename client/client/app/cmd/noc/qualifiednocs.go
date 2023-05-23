package main

import (
	"app/noc"
	"app/util"
	"fmt"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
)

var less bool

var qualifiedNocCmd = &cobra.Command{
	Use:   `qnocs `,
	Short: "Find qualified noc codes based on code start letter, outlook, wage, economic region",
	Run: func(cmd *cobra.Command, args []string) {
		starts_with, _ := cmd.Flags().GetString("starts_with")
		outlook, _ := cmd.Flags().GetInt("outlook")
		median_wage, _ := cmd.Flags().GetFloat64("median_wage")
		er_code, _ := cmd.Flags().GetString("er_code")

		// load noc data
		noc.Load_data()
		condition := noc.QualifiedNocCondition{
			Begin_str:   starts_with,
			Outlook:     outlook,
			Median_wage: median_wage,
			Er_code:     er_code,
			Greater:     !less, // default is greater, not less
		}
		qualified_noc_codes := noc.GetWageOutlookQualifiedNocs(&condition)
		wo_list, ok := noc.GetWageOutlookList(qualified_noc_codes, condition.Er_code)
		if !ok {
			fmt.Println("GetWageOutlookList failed")
			return
		}
		title := "Qualified noc codes in economic region " + er_code + " :"
		title += get_additional_title(&condition)
		util.ConsolePrint(title, "success")
		wo_list.Console_print()
		msg := "Total number of qualified noc codes: " + strconv.Itoa(len(wo_list))
		util.ConsolePrint(msg, "success")
	},
}

func get_additional_title(condition *noc.QualifiedNocCondition) string {
	title := []string{}
	var str string
	if condition.Begin_str != "" {
		str = "noc code starts with " + condition.Begin_str
		title = append(title, str)
	}
	if condition.Outlook != 0 {
		str = "outlook higher than " + strconv.Itoa(condition.Outlook)
		title = append(title, str)
	}
	if condition.Median_wage != 0 {
		if condition.Greater {
			str = "median wage greater than " + strconv.FormatFloat(condition.Median_wage, 'f', 2, 64)
		} else {
			str = "median wage less than " + strconv.FormatFloat(condition.Median_wage, 'f', 2, 64)
		}
		title = append(title, str)
	}
	return strings.Join(title, ", ")
}

func init() {
	// v := util.GetViper()
	// er_code := v.GetString("defualt_er_code")

	qualifiedNocCmd.Flags().StringP("starts_with", "s", "", "Noc codes starts with")
	qualifiedNocCmd.Flags().IntP("outlook", "o", 3, "The outlook of the job")
	qualifiedNocCmd.Flags().Float64P("median_wage", "w", 0, "The median wage of the job")
	qualifiedNocCmd.Flags().StringP("er_code", "e", "5920", "The economic region code")
	qualifiedNocCmd.Flags().BoolVarP(&less, "less", "l", false, "The median wage is less than the given value")
	if flag := qualifiedNocCmd.Flag("less"); flag != nil {
		flag.NoOptDefVal = "true"
	}
}
