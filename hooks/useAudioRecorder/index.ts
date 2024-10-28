import { Platform } from "react-native";
import { useAudioRecorderIosAndro } from "./ios_andro";
import { useAudioRecorderWeb } from "./web";

export interface IAudioRecorder {
	isRecording: () => boolean;
	startRecording: () => Promise<void>;
	stopRecording: () => Promise<void>;
}

// if andriod or ios, use hooks/useAudioRecorder/ios_andro.ts
// else use hooks/useAudioRecorder/web.ts

export const useAudioRecorder = (): IAudioRecorder => {
	if (Platform.OS === "web") {
		return useAudioRecorderWeb();
	}
	return useAudioRecorderIosAndro();
};
