package main

import "cdsServer/app"

func main() {
	app := app.NewApp()
	defer app.Stop()
	app.Start()
}
