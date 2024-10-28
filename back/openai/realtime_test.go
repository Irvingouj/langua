package openai_test

import (
	"backend/openai"
	"fmt"
	"log"
	"testing"
	"time"
)

func TestWebSocketConnection(t *testing.T) {
	// Initialize the WebSocket connection
	conn, err := openai.Initialize()
	if err != nil {
		t.Fatalf("Failed to initialize WebSocket: %v", err)
	}
	defer func() {
		conn.Close()
		if err != nil {
			t.Errorf("Failed to close WebSocket: %v", err)
		}
	}()

	// Send the response.create message with custom instructions
	err = conn.SendResponseCreate("Please assist the user.")
	if err != nil {
		t.Fatalf("Failed to send response.create: %v", err)
	}

	// Define a channel to receive messages
	messages := make(chan interface{}, 1)

	// Define a handler function for incoming messages
	handleMessage := func(message interface{}) {
		messages <- message
	}

	// Start listening for messages in a separate goroutine
	go func() {
		err = conn.ListenForMessages(handleMessage)
		if err != nil {
			log.Printf("Error while listening for messages: %v", err)
		}
	}()

	// Wait for a message or timeout
	select {
	case msg := <-messages:
		fmt.Printf("Received message: %v\n", msg)
		// Optionally, perform assertions on the message
	case <-time.After(15 * time.Second):
		t.Fatal("Timeout waiting for message")
	}
}
