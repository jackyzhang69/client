package main

import (
	"app/noc"
	"app/util"
	"encoding/gob"
	"fmt"
	"log"
	"os"
	"os/user"
	"path/filepath"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

var refine bool

var dutyCmd = &cobra.Command{
	Use:   `duty noc_code `,
	Short: "Generate job duties based on noc code, title, industry, and location",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) != 1 {
			return fmt.Errorf("you must provide noc code after duty command")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		noc_code := args[0]
		title, _ := cmd.Flags().GetString("title")
		industry, _ := cmd.Flags().GetString("industry")
		location, _ := cmd.Flags().GetString("location")

		var duties noc.Duties
		if refine {
			duties = load_duties(noc_code, title, industry, location)
		} else {
			duties = generate_duties(noc_code, title, industry, location)
		}
		util.ConsolePrint("Job duties generated:\n", "success")
		for index, duty := range duties {
			fmt.Printf("%d %s\n", index+1, strings.Trim(duty.Text, " "))
		}
		if refine {
			util.ConsolePrint("Your can use below prompt to refine the duties. Highly recommended to do it in GPT 4:\n", "success")
			var duties_texts string
			for _, duty := range duties {
				duties_texts = duties_texts + duty.Text + "\n"
			}
			refined_duties := strings.Split(noc.Get_refine_prompts(duties_texts), "\n")
			for _, duty := range refined_duties {
				fmt.Println(duty)
			}
		}
	},
}

func init() {
	dutyCmd.Flags().StringP("title", "t", "", "Specify job title. Without input, the noc's standard title will be used")
	dutyCmd.Flags().StringP("industry", "i", "", "Specify the job performed in which industry")
	dutyCmd.Flags().StringP("location", "l", "", "Specify the work location")
	dutyCmd.Flags().BoolVarP(&refine, "refine", "r", false, "Specify whether to refine the duties")
	dutyCmd.MarkFlagRequired("location")
	dutyCmd.MarkFlagRequired("industry")
}

func generate_duties(noc_code, title, industry, location string) noc.Duties {
	util.ConsolePrint("Is working on generating job duties...", "info")
	// refine requests lots of time, so I don't use it in this version
	// duties, err := noc.Make_noc_duties(noc_code, title, industry, location, refine)
	duties, err := noc.Make_noc_duties(noc_code, title, industry, location, false)
	if err != nil {
		fmt.Println("Error getting duties: ", err.Error())
		return noc.Duties{}
	}

	return duties.Duties
}

func load_duties(noc_code, title, industry, location string) noc.Duties {
	duties, found := loadFromCache()
	if !found {
		duties = generate_duties(noc_code, title, industry, location)
		saveToCache(duties)
	}

	return duties
}

func loadFromCache() (noc.Duties, bool) {
	usr, err := user.Current()
	if err != nil {
		panic(err)
	}
	CacheFile := filepath.Join(usr.HomeDir, "noc_cache.gob")
	const CacheDuration = 1 * time.Hour

	info, err := os.Stat(CacheFile)
	if err != nil {
		return noc.Duties{}, false
	}

	if time.Since(info.ModTime()) > CacheDuration {
		return noc.Duties{}, false
	}

	util.ConsolePrint("Loading job duties from cache...", "info")
	// Load from cache
	var loadedData noc.Duties
	var f *os.File

	f, err = os.Open(CacheFile)
	if err != nil {
		log.Fatal(err)
	}

	decoder := gob.NewDecoder(f)
	if err = decoder.Decode(&loadedData); err != nil {
		log.Fatal(err)
	}

	f.Close()
	return loadedData, true
}

func saveToCache(duties noc.Duties) {
	usr, err := user.Current()
	if err != nil {
		panic(err)
	}
	CacheFile := filepath.Join(usr.HomeDir, "noc_cache.gob")

	// save to cache
	util.ConsolePrint("Saving job duties to cache...", "info")
	file, err := os.OpenFile(CacheFile, os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	encoder := gob.NewEncoder(file)
	err = encoder.Encode(duties)
	if err != nil {
		log.Fatal(err)
	}
}
