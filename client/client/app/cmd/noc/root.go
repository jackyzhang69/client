package main

import (
	"github.com/spf13/cobra"
)

func Execute() error {
	cmd := &cobra.Command{
		Use:   "noc",
		Short: "Noc App",
		Long: `
Noc App is a CLI application for: 
	- Searching noc code by job title and/or duties with semantic, lexical, or mix model
	- Finding qualified noc codes based on outlook, median wage etc.
	- Finding Qualified areas based on outlook
	- Getting noc(s) wage and outlook. 
	- Getting content based on noc code
	- Finding Economic Region (ER) by province
	- Finding special programs by noc code
	- Finding special nocs by program
	- Generating job duties based on noc code, title, industry, and location
		`,
	}

	cmd.AddCommand(findCmd)
	cmd.AddCommand(qualifiedNocCmd)
	cmd.AddCommand(qualifiedAreaCmd)
	cmd.AddCommand(wageOutlookCmd)
	cmd.AddCommand(contentCmd)
	cmd.AddCommand(erCmd)
	cmd.AddCommand(spCmd)
	cmd.AddCommand(spNocsCmd)
	cmd.AddCommand(dutyCmd)

	return cmd.Execute()
}
