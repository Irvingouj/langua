package main

import (
	"backend/api"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	app := pocketbase.New()

	// serves static files from the provided public dir (if exists)
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		api.AddRouters(e, app)
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
