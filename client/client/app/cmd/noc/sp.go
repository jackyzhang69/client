// For special programs
package main

import (
	"app/noc"
	"app/util"
	"fmt"

	"github.com/spf13/cobra"
)

var spCmd = &cobra.Command{
	Use:   `sp noc_code`,
	Short: "Find special programs based on noc code",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide noc code after sp command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc.Load_data()
		noc_code := args[0]
		programs, ok := noc.SPECIAL_PROGRAMS.GetSpecialPrograms(noc_code)
		if !ok {
			fmt.Println("GetSpecialPrograms failed")
		}
		title := "Special programs for noc code " + noc_code + " :"
		util.ConsolePrint(title, "success")
		programs.Console_print()
	},
}

func init() {
}
