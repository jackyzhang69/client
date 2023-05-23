package main

import (
	"app/noc"
	"app/util"
	"fmt"

	"github.com/spf13/cobra"
)

var erCmd = &cobra.Command{
	Use:   `er province`,
	Short: "Find economic region based on province",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("you must provide province abbreviation after er command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc.Load_data()
		province := args[0]
		ers, ok := noc.ER_MAP.GetErByProvince(province)
		if !ok {
			fmt.Println("GetErByProvince failed")
		}
		title := "Economic regions in province : " + province
		util.ConsolePrint(title, "success")
		ers.Print()
	},
}

func init() {
}
