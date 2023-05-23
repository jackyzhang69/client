package util

import (
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"runtime"

	"github.com/spf13/viper"
)

func GetViper() *viper.Viper {
	var app_name string = "immclient"
	var config_path string

	usr, err := user.Current()
	if err != nil {
		panic(err)
	}

	config_path, err = get_config_path(usr, app_name)
	if err != nil {
		panic(err)
	}

	v := viper.New()

	v.SetConfigName("config")
	v.AddConfigPath(".")
	v.AddConfigPath("..")
	v.AddConfigPath(config_path)
	v.AddConfigPath("/")

	v.SetConfigType("json")

	err = v.ReadInConfig()
	if err != nil {
		panic(fmt.Errorf("fatal error config file: %s", err))
	}

	return v
}

// get config.json from mac or windows
func get_config_path(usr *user.User, app_name string) (string, error) {
	var config_path string
	switch operating_system := runtime.GOOS; operating_system {
	case "darwin":
		config_path = filepath.Join(usr.HomeDir, "Library", "Application Support", app_name)
	case "windows":
		appDataDir := os.Getenv("APPDATA")
		config_path = filepath.Join(appDataDir, app_name)
	default:
		return "", fmt.Errorf("unsupported operating system: %s", operating_system)
	}
	return config_path, nil
}
