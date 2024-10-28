package chat

import (
	"encoding/json"
	"log"
	"net/http"

	"backend/openai"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v5"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow any origin for WebSocket connections
	},
}

func RealtimeHandler(c echo.Context) error {
	log.Println("RealtimeHandler called, starting WebSocket connection")
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Println("Failed to upgrade to WebSocket:", err)
		return err
	}
	defer ws.Close()

	// Establish WebSocket connection to OpenAI Realtime API
	openaiConn, err := openai.Initialize()
	log.Println("openaiConn", openaiConn)
	if err != nil {
		log.Println("Failed to connect to OpenAI Realtime API:", err)
		return err
	}
	defer openaiConn.Close()

	// Channel to signal when to close the handler
	done := make(chan struct{})

	// Start listening for messages from OpenAI in a separate goroutine
	go func() {
		err := openaiConn.ListenForMessages(func(message interface{}) {
			if session, ok := message.(openai.SessionCreated); ok {
				log.Println("Received session created message %v", session)

				return
			}

			if session, ok := message.(openai.AudioBufferAppend); ok {
				log.Println("Received audio buffer append message %v", session)
				return
			}

			// print message as json
			messageJSON, err := json.Marshal(message)

			if err != nil {

				log.Println("Error marshaling message to JSON:", err)
				return
			}

			log.Println("Received message from OpenAI:", string(messageJSON))

		})

		if err != nil {
			log.Println("Error while listening for messages:", err)
		}
		// Signal that we're done
		close(done)
	}()

	// Main loop to read messages from client and send to OpenAI
	for {
		select {
		case <-done:
			log.Println("RealtimeHandler finished")
			return nil
		default:
			// Read message from the client
			_, message, err := ws.ReadMessage()
			if err != nil {
				log.Println("Error reading WebSocket message:", err)
				return err
			}

			// Parse message from client
			var clientMessage struct {
				Type   string `json:"type"`
				Data   string `json:"data"`
				Commit bool   `json:"commit"`
			}

			err = json.Unmarshal(message, &clientMessage)
			if err != nil {
				log.Println("Error unmarshaling message from client:", err)
				continue
			}

			switch clientMessage.Type {
			case "audio":

				if clientMessage.Commit {
					// Commit the audio buffer
					err = openaiConn.CommitAudioBuffer()
					if err != nil {
						log.Println("Error committing audio buffer to OpenAI:", err)
						continue
					}
				}

				// Client sent audio data
				// We assume the data is base64-encoded audio in PCM16 24kHz mono format
				err = openaiConn.AppendAudioToBuffer(clientMessage.Data)
				if err != nil {
					log.Println("Error sending audio to OpenAI:", err)
					continue
				}

			case "text":
				// Client sent text message
				err = openaiConn.SendUserMessage(clientMessage.Data)
				if err != nil {
					log.Println("Error sending text message to OpenAI:", err)
					continue
				}

			default:
				// Unknown message type
				log.Println("Unknown message type from client:", clientMessage.Type)
			}
		}
	}

}
