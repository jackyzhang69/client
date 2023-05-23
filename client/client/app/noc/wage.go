package noc

type Wage struct {
	Highest float64 `json:"highest"`
	Lowest  float64 `json:"lowest"`
	Median  float64 `json:"median"`
}

type AreaWage map[string]Wage

type NOCAreaWage map[string]AreaWage

// getWage returns the wage for the specified noc and area
func (n *NOCAreaWage) GetWage(noc string, area string) (Wage, bool) {
	wage, ok := (*n)[noc][area]
	if !ok {
		return Wage{}, false
	}
	return wage, true
}

// get qualified nocs for the median wage  greater  or less than a given value in a given area
func (n *NOCAreaWage) GetWageQualifiedNocs(area string, median float64, greater bool) []string {
	var nocs []string
	for noc, wage := range *n {
		if greater && wage[area].Median > median {
			nocs = append(nocs, noc)
		} else if !greater && wage[area].Median <= median {
			nocs = append(nocs, noc)
		}
	}
	return nocs
}
