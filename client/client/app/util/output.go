package util

import (
	"os"

	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
)

func PrintTable(data [][]string) {
	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader(data[0])
	data = data[1:]
	for _, row := range data {
		table.Append(row)
	}
	table.Render()
}

func ConsolePrint(message, format string) {
	switch format {
	case "info":
		color.Blue(message)
	case "error":
		color.Red(message)
	case "warning":
		color.Yellow(message)
	case "success":
		color.Green(message)
	default:
		color.White(message)
	}
}
