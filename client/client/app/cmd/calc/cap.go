package main

import (
	"app/others"
	"app/util"
	"fmt"
	"sort"

	"github.com/spf13/cobra"
)

var capCmd = &cobra.Command{
	Use:   `cap excel_file`,
	Short: "Calculate the CAP for LMIA low wage stream",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide excel filename after cap command")
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
		result := others.Clac_cap(jsonData)

		// print it out in order
		print_result(result)
	},
}

func init() {
}

func print_result(result map[string]interface{}) {
	// Step 1: Extract keys from the map
	var keys []string
	for key := range result {
		keys = append(keys, key)
	}

	// Step 2: Sort the keys
	sort.Strings(keys)

	// Step 3: Print elements in alphabetical order
	for _, key := range keys {
		value := result[key]
		fmt.Println(key, ":", value)
	}
}
