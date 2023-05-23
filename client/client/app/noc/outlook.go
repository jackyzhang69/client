package noc

import (
	"strings"
)

type AreaOutlook map[string]int

type NOCAreaOutlook map[string]AreaOutlook

// getOutlook returns the outlook for the specified noc and area
func (n *NOCAreaOutlook) GetOutlook(noc string, area string) (int, bool) {
	outlook, ok := (*n)[noc][area]
	if !ok {
		return 0, false
	}
	return outlook, true
}

// get area code list for the outlook index greater than a given value
func (n *NOCAreaOutlook) GetQualifiedAreas(noc string, outlook int) []string {
	var areas []string
	for area, index := range (*n)[noc] {
		if index >= outlook {
			areas = append(areas, area)
		}
	}
	return areas
}

// get qualified nocs for the outlook index greater than a given value in a given area
func (n *NOCAreaOutlook) GetOutlookQualifiedNocs(area string, outlook int) []string {
	var nocs []string
	for noc, index := range *n {
		if index[area] >= outlook {
			nocs = append(nocs, noc)
		}
	}
	return nocs
}

// find qualified nocs which starts with given number for the outlook index greater than a given value in a given area
func (n *NOCAreaOutlook) GetOutlookQualifiedNocsStartsWith(starts, area string, outlook int) []string {
	var nocs []string
	for noc, index := range *n {
		if strings.HasPrefix(noc, starts) && index[area] >= outlook {
			nocs = append(nocs, noc)
		}
	}
	return nocs
}
