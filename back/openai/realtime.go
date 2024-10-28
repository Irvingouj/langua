package openai

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
)

const realtimeURL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"

var (
	apiKey  string
	initErr error
	once    sync.Once
)

type OpenAIRealtime struct {
	wsConn *websocket.Conn
}

// Initialize establishes a WebSocket connection to the OpenAI API.
// It ensures that the connection is initialized only once.
func Initialize() (*OpenAIRealtime, error) {
	once.Do(func() {
		var ok bool
		apiKey, ok = os.LookupEnv("OPENAI_API_KEY")

		if !ok {
			initErr = errors.New("OPENAI_API_KEY not set")
			return
		}

	})

	// Create HTTP headers with the required Authorization and OpenAI-Beta fields
	header := http.Header{}
	header.Add("Authorization", "Bearer "+apiKey)
	header.Add("OpenAI-Beta", "realtime=v1")

	// Establish a WebSocket connection
	dialer := websocket.DefaultDialer
	wsConn, resp, initErr := dialer.Dial(realtimeURL, header)
	if initErr != nil {
		log.Printf("Dial error: %v, response: %v", initErr, resp)
		return nil, initErr
	}

	fmt.Println("Connected to server.")

	if initErr != nil {
		return nil, initErr
	}

	return &OpenAIRealtime{wsConn: wsConn}, nil
}

// SendResponseCreate sends a 'response.create' message to the WebSocket.
// It accepts instructions to customize the assistant's behavior.
func (realtime *OpenAIRealtime) SendResponseCreate(instructions string) error {
	// Prepare the message to send upon connectionmodels
	message := ResponseCreate{
		Type: "response.create",
		Response: Response{
			Modalities:   []string{"text"},
			Instructions: instructions,
		},
	}

	// Send the message as JSON
	err := realtime.wsConn.WriteJSON(message)
	if err != nil {
		return fmt.Errorf("WriteJSON error: %v", err)
	}

	return nil
}

// SendUserMessage sends a user's message to the assistant.
func (realtime *OpenAIRealtime) SendUserMessage(content string) error {
	message := ConversationItemCreate{
		Type:           "conversation.item.create",
		PreviousItemID: nil, // or &previousItemID if you have one
		Item: ConversationItem{
			ID:   "", // Let the server generate the ID
			Type: "message",
			Role: "user",
			Content: []ContentItem{
				{
					Type: "text",
					Text: content,
				},
			},
		},
	}
	conn := realtime.wsConn
	// Send the message as JSON
	err := conn.WriteJSON(message)
	if err != nil {
		return fmt.Errorf("WriteJSON error: %v", err)
	}

	return nil
}

// ListenForMessages listens for incoming messages from the WebSocket.
// It processes each message as per your application's requirements.
func (realtime *OpenAIRealtime) ListenForMessages(handleMessage func(interface{})) error {
	conn := realtime.wsConn
	for {
		_, messageData, err := conn.ReadMessage()
		if err != nil {
			return fmt.Errorf("ReadMessage error: %v", err)
		}

		// Determine the type of message and unmarshal accordingly
		var baseMessage struct {
			Type string `json:"type"`
		}

		err = json.Unmarshal(messageData, &baseMessage)
		if err != nil {
			return fmt.Errorf("Unmarshal base message error: %v", err)
		}

		switch baseMessage.Type {
		case "session.created":
			var sessionCreated SessionCreated
			err = json.Unmarshal(messageData, &sessionCreated)
			if err != nil {
				return fmt.Errorf("Unmarshal session.created error: %v", err)
			}
			handleMessage(sessionCreated)

		case "conversation.item.created":
			var conversationItem ConversationItemCreate
			err = json.Unmarshal(messageData, &conversationItem)
			if err != nil {
				return fmt.Errorf("Unmarshal conversation.item.created error: %v", err)
			}
			handleMessage(conversationItem)

		case "response.audio.delta":
			var audioDelta ResponseAudioDelta
			err = json.Unmarshal(messageData, &audioDelta)
			if err != nil {
				return fmt.Errorf("Unmarshal response.audio.delta error: %v", err)
			}
			handleMessage(audioDelta)

		case "response.audio.done":
			var audioDone ResponseAudioDone
			err = json.Unmarshal(messageData, &audioDone)
			if err != nil {
				return fmt.Errorf("Unmarshal response.audio.done error: %v", err)
			}
			handleMessage(audioDone)

		case "error":
			var errorEvent ErrorEvent
			err = json.Unmarshal(messageData, &errorEvent)
			if err != nil {
				return fmt.Errorf("Unmarshal error event error: %v", err)
			}
			handleMessage(errorEvent)

		default:
			// Handle other message types or log them
			var genericMessage map[string]interface{}
			err = json.Unmarshal(messageData, &genericMessage)
			if err != nil {
				return fmt.Errorf("Unmarshal generic message error: %v", err)
			}
			handleMessage(genericMessage)
		}
	}
}

func (realtime *OpenAIRealtime) AppendAudioToBuffer(audioBase64 string) error {
	conn := realtime.wsConn
	event := struct {
		Type  string `json:"type"`
		Audio string `json:"audio"`
	}{
		Type:  "input_audio_buffer.append",
		Audio: audioBase64,
	}

	err := conn.WriteJSON(event)
	if err != nil {
		return fmt.Errorf("WriteJSON error: %v", err)
	}

	return nil
}

func (realtime *OpenAIRealtime) CommitAudioBuffer() error {
	conn := realtime.wsConn
	event := struct {
		Type string `json:"type"`
	}{
		Type: "input_audio_buffer.commit",
	}

	err := conn.WriteJSON(event)
	if err != nil {
		return fmt.Errorf("WriteJSON error: %v", err)
	}

	return nil
}

// CloseWebSocket safely closes the WebSocket connection.
func (realtime *OpenAIRealtime) Close() error {
	if realtime.wsConn != nil {
		return realtime.wsConn.Close()
	}
	return nil
}
