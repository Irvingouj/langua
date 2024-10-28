package api

import (
	"backend/api/chat"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func AddRouters(e *core.ServeEvent, app *pocketbase.PocketBase) {
	log.Println("AddRouters")
	e.Router.GET("/app/chat/realtime", chat.RealtimeHandler)
}
