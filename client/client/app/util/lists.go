package util

import (
	"fmt"
)

func Intersection(slice1, slice2 []string) []string {
	// Find the intersection of the two slices
	intersection := []string{}
	for _, s1 := range slice1 {
		for _, s2 := range slice2 {
			if s1 == s2 {
				intersection = append(intersection, s1)
				break
			}
		}
	}
	return intersection
}

// check if a string is in a string slice
func InSlice(s string, slice []string) bool {
	for _, str := range slice {
		if s == str {
			return true
		}
	}
	return false
}

// remove duplicates from a string slice
func RemoveDuplicates(s []string) []string {
	set := make(map[string]bool)
	var result []string
	for _, item := range s {
		if _, ok := set[item]; !ok {
			set[item] = true
			result = append(result, item)
		}
	}
	return result
}

// convert a 2D interface slice to a 2D string slice
func ConvertToStringSlice(data [][]interface{}) [][]string {
	result := make([][]string, len(data))
	for i, row := range data {
		result[i] = make([]string, len(row))
		for j, val := range row {
			result[i][j] = fmt.Sprintf("%v", val)
		}
	}
	return result
}
