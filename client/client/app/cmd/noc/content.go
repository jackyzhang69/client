package main

import (
	"app/noc"
	"fmt"

	"github.com/spf13/cobra"
)

var title_examples bool
var main_duties bool
var employment_requirement bool
var additional_information bool
var exclusion bool

var contentCmd = &cobra.Command{
	Use:   `info noc_code`,
	Short: "Find noc content based on noc code",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide noc code after info command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc.Load_data()
		noc_code := args[0]
		content, ok := noc.CONTENT.GetNocContent(noc_code)
		if !ok {
			fmt.Println("GetNocContent failed")
		}
		print_content := []string{"Title"}
		if title_examples {
			print_content = append(print_content, "TitleExamples")
		}
		if main_duties {
			print_content = append(print_content, "MainDuties")
		}
		if employment_requirement {
			print_content = append(print_content, "EmploymentRequirement")
		}
		if additional_information {
			print_content = append(print_content, "AdditionalInformation")
		}

		if exclusion {
			print_content = append(print_content, "Exclusion")
		}
		content.Console_print(print_content...)
	},
}

func init() {
	contentCmd.Flags().BoolVarP(&title_examples, "title_examples", "e", false, "Title examples")
	if flag := contentCmd.Flag("title_examples"); flag != nil {
		flag.NoOptDefVal = "true"
	}

	contentCmd.Flags().BoolVarP(&main_duties, "main_duties", "d", false, "Main duties")
	if flag := contentCmd.Flag("main_duties"); flag != nil {
		flag.NoOptDefVal = "true"
	}

	contentCmd.Flags().BoolVarP(&employment_requirement, "employment_requirements", "r", false, "Employment requirement")
	if flag := contentCmd.Flag("employment_requirements"); flag != nil {
		flag.NoOptDefVal = "true"
	}

	contentCmd.Flags().BoolVarP(&additional_information, "additional_information", "a", false, "Additional information")
	if flag := contentCmd.Flag("additional_information"); flag != nil {
		flag.NoOptDefVal = "true"
	}

	contentCmd.Flags().BoolVarP(&exclusion, "exclusion", "x", false, "Exclusion")
	if flag := contentCmd.Flag("exclusion"); flag != nil {
		flag.NoOptDefVal = "true"
	}

}
