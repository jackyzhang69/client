package main

import (
	"github.com/spf13/cobra"
)

func Execute() error {
	cmd := &cobra.Command{
		Use:   "calc [command]",
		Short: "A tool-set for calculating and assessing the eligibilities",
		Long: `
Calc app is a CLI application for: 
	- Calculating and assess the eligibility of sponsors and applicants for the Parent and Grandparent Program (PGP)
		`,
	}

	cmd.AddCommand(pgpCmd)
	cmd.AddCommand(capCmd)

	return cmd.Execute()
}
