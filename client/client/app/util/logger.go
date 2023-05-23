package util

import (
	"github.com/sirupsen/logrus"
)

// Initialize the Logger
var Logger = logrus.New()

func init() {
	Logger.SetLevel(logrus.WarnLevel)
}
