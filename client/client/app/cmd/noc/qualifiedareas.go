package main

import (
	"app/noc"
	"app/util"
	"fmt"
	"strconv"

	"github.com/spf13/cobra"
)

var qualifiedAreaCmd = &cobra.Command{
	Use:   `qareas noc_code [outlook]`,
	Short: "Find qualified areas based on noc code and outlook",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide noc code after qareas command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc_code := args[0]
		outlook := func() int {
			if len(args) > 1 {
				val, err := strconv.Atoi(args[1])
				if err != nil {
					panic(err)
				}
				return val
			}
			return 3
		}()

		noc.Load_data()
		qualified_areas := noc.GetOutlookQualifiedAreas(noc_code, outlook)
		er_name_list, ok := noc.ER_MAP.GetErList(qualified_areas)
		if !ok {
			fmt.Println("GetErList failed")
		}
		title := "Qualified areas for noc code " + noc_code + " with outlook >=" + strconv.Itoa(outlook) + " :"
		util.ConsolePrint(title, "success")
		er_name_list.Print()
		msg := "Total number of qualified areas: " + strconv.Itoa(len(er_name_list))
		util.ConsolePrint(msg, "success")
	},
}

func init() {

}
