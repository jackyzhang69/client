package main

import (
	"app/noc"
	"app/util"
	"fmt"
	"strings"

	"github.com/spf13/cobra"
)

var wageOutlookCmd = &cobra.Command{
	Use:   `wages noc_code(s) [er_code]`,
	Short: "Find wage and outlook based on noc code(s) and er code",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide at least one noc code after wages command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc.Load_data()
		noc_codes := args
		er_code, _ := cmd.Flags().GetString("er_code")

		wo_list, ok := noc.GetWageOutlookList(noc_codes, er_code)
		if !ok {
			fmt.Println("GetWageOutlookList failed")
		}
		title := "Wage and Outlook for noc_code(s): " + strings.Join(noc_codes, ", ") + " in economic region: " + er_code
		util.ConsolePrint(title, "success")
		wo_list.Console_print()
	},
}

func init() {
	// v := util.GetViper()
	// er_code := v.GetString("defualt_er_code")
	wageOutlookCmd.Flags().StringP("er_code", "e", "5920", "The economic region code")
}
