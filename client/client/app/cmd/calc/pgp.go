package main

import (
	"app/others"
	"app/util"
	"fmt"

	"github.com/spf13/cobra"
)

var pgpCmd = &cobra.Command{
	Use:   `pgp excel_file`,
	Short: "Calculate the eligibility of sponsors and applicants for the Parent and Grandparent Program (PGP)",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide excel filename after pgp command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		excel := args[0]
		e := util.NewExcel(excel)
		jsonData, err := e.Json()
		if err != nil {
			fmt.Println("Error opening Excel file:", err)
			return
		}
		result := others.Clac_pgp(jsonData)

		util.PrintTable(util.ConvertToStringSlice(result))
	},
}

func init() {
}
