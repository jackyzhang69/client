// For special nocs for a given program
package main

import (
	"app/noc"
	"app/util"
	"fmt"

	"github.com/spf13/cobra"
)

var info bool

var spNocsCmd = &cobra.Command{
	Use:   `spn program`,
	Short: "Find all noc codes based on a special program",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 && !info {
			return fmt.Errorf("you must provide program after spn command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc.Load_data()
		if info {
			programs := noc.SPECIAL_PROGRAMS.Get_programs()
			title := "Total special programs :"
			util.ConsolePrint(title, "success")
			util.PrintTable(programs)
		} else {
			program := args[0]
			er_code := cmd.Flag("er_code").Value.String()
			special_program_nocs := noc.GetSpecialProgramNocs(program, er_code)

			title := "Special noc codes for program " + program + " :"
			util.ConsolePrint(title, "success")
			special_program_nocs.Console_print()
		}

	},
}

func init() {
	// v := util.GetViper()
	// er_code := v.GetString("defualt_er_code")
	spNocsCmd.Flags().StringP("er_code", "e", "5920", "The economic region code")
	spNocsCmd.Flags().BoolVarP(&info, "info", "i", false, "Print info about the programs")
	if flag := contentCmd.Flag("info"); flag != nil {
		flag.NoOptDefVal = "true"
	}
}
