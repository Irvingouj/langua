package openai

import (
	"encoding/json"
	"fmt"
)

type SessionUpdate struct {
	EventID string  `json:"event_id"`
	Type    string  `json:"type"`
	Session Session `json:"session"`
}

type InputAudioTranscription struct {
	Model string `json:"model"`
}

type TurnDetection struct {
	Type              string  `json:"type"`
	Threshold         float64 `json:"threshold"`
	PrefixPaddingMs   int     `json:"prefix_padding_ms"`
	SilenceDurationMs int     `json:"silence_duration_ms"`
}

type Tool struct {
	Type        string     `json:"type"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Parameters  ToolParams `json:"parameters"`
}

type ToolParams struct {
	Type       string                  `json:"type"`
	Properties map[string]ToolProperty `json:"properties"`
	Required   []string                `json:"required"`
}

type ToolProperty struct {
	Type string `json:"type"`
}

type AudioBufferAppend struct {
	EventID string `json:"event_id"`
	Type    string `json:"type"`
	Audio   string `json:"audio"`
}

type AudioBufferCommit struct {
	EventID string `json:"event_id"`
	Type    string `json:"type"`
}

type AudioBufferClear struct {
	EventID string `json:"event_id"`
	Type    string `json:"type"`
}

type ConversationItemCreate struct {
	EventID        string           `json:"event_id"`
	Type           string           `json:"type"`
	PreviousItemID *string          `json:"previous_item_id"` // null is represented by a pointer
	Item           ConversationItem `json:"item"`
}

type ConversationItem struct {
	ID      string        `json:"id"`
	Type    string        `json:"type"`
	Role    string        `json:"role"`
	Content []ContentItem `json:"content"`
}

type ContentItem struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type ResponseCreate struct {
	EventID  string   `json:"event_id"`
	Type     string   `json:"type"`
	Response Response `json:"response"`
}

type Response struct {
	Modalities        []string `json:"modalities"`
	Instructions      string   `json:"instructions"`
	Voice             string   `json:"voice"`
	OutputAudioFormat string   `json:"output_audio_format"`
	Tools             []Tool   `json:"tools"`
	ToolChoice        string   `json:"tool_choice"`
	Temperature       float64  `json:"temperature"`
	MaxOutputTokens   int      `json:"max_output_tokens"`
}

type SessionCreated struct {
	EventID string  `json:"event_id"`
	Type    string  `json:"type"`
	Session Session `json:"session"`
}

type Session struct {
	ID                      string        `json:"id"`
	Object                  string        `json:"object"`
	Model                   string        `json:"model"`
	Modalities              []string      `json:"modalities"`
	Instructions            string        `json:"instructions"`
	Voice                   string        `json:"voice"`
	InputAudioFormat        string        `json:"input_audio_format"`
	OutputAudioFormat       string        `json:"output_audio_format"`
	InputAudioTranscription *string       `json:"input_audio_transcription"` // null is represented by a pointer
	TurnDetection           TurnDetection `json:"turn_detection"`
	Tools                   []Tool        `json:"tools"`
	ToolChoice              string        `json:"tool_choice"`
	Temperature             float64       `json:"temperature"`
	MaxResponseOutputTokens IntOrString   `json:"max_response_output_tokens"`
}

type ResponseAudioDelta struct {
	Type  string `json:"type"`
	Audio string `json:"audio"`
	// You can include additional fields if necessary
}
type ResponseAudioDone struct {
	Type string `json:"type"`
	// You can include additional fields if necessary
}

// ResponseTextDelta represents a chunk of text data in the assistant's response.
type ResponseTextDelta struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type ErrorEvent struct {
	Type  string `json:"type"`
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
		Param   string `json:"param"`
		EventID string `json:"event_id"`
	} `json:"error"`
}

type IntOrString struct {
	IntValue    *int
	StringValue *string
}

func (v *IntOrString) UnmarshalJSON(data []byte) error {
	// Try to unmarshal the data as an integer first.
	var intValue int
	if err := json.Unmarshal(data, &intValue); err == nil {
		v.IntValue = &intValue
		v.StringValue = nil
		return nil
	}

	// If it's not an integer, try to unmarshal it as a string.
	var stringValue string
	if err := json.Unmarshal(data, &stringValue); err == nil {
		v.StringValue = &stringValue
		v.IntValue = nil
		return nil
	}

	return fmt.Errorf("value is neither int nor string")
}

func (v *IntOrString) IsInf() bool {
	return v.StringValue != nil && *v.StringValue == "inf"
}

func (v *IntOrString) String() string {
	if v.IsInf() {
		return "inf"
	}
	if v.IntValue != nil {
		return fmt.Sprintf("%d", *v.IntValue)
	}
	return ""
}
