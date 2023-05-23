package main

import (
	"app/noc"
	"fmt"

	"github.com/spf13/cobra"
)

var findCmd = &cobra.Command{
	Use:   `find "your input of job title and/or duties"`,
	Short: "Find noc code based on job title/duties and search model",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) != 1 {
			return fmt.Errorf("you must provide job title and/or duties after find command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		duties := args[0]
		model, _ := cmd.Flags().GetString("model")

		if model != "semantic" && model != "lexical" && model != "mix" {
			fmt.Println("Invalid model")
			return
		}

		// load noc data
		noc.Load_data()

		result, ok := noc.Get_noc_code(duties, model)
		if !ok {
			fmt.Println("Get_noc_code failed")
			return
		}
		result.Console_print()
	},
}

func init() {
	findCmd.MarkFlagRequired("duties")
	findCmd.Flags().StringP("model", "m", "semantic", "The search model (semantic, lexical, or mix)")

}
