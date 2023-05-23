package main

import (
	"encoding/json"
	"fmt"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

type QualifiedNoc struct {
	Begin_str   string  `json:"begin_str"`
	Er_code     string  `json:"er_code"`
	Outlook     int     `json:"outlook"`
	Median_wage float64 `json:"median_wage"`
	Greater     bool    `json:"greater"`
}

func main() {
	myApp := app.New()
	myWindow := myApp.NewWindow("Qualified Noc Data")

	dataEntry := widget.NewMultiLineEntry()
	submitButton := widget.NewButton("Submit", func() {
		var data QualifiedNoc
		err := json.Unmarshal([]byte(dataEntry.Text), &data)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		fmt.Printf("Data: %+v\n", data)
	})

	content := container.NewVBox(
		widget.NewLabel("Enter QualifiedNoc JSON data:"),
		dataEntry,
		submitButton,
	)

	myWindow.SetContent(content)
	myWindow.Resize(fyne.NewSize(600, 400))
	myWindow.ShowAndRun()
}
