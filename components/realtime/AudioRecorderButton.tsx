import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

const AudioRecorderButton = () => {
	const { startRecording, stopRecording, isRecording } = useAudioRecorder();
	const { startPlayAudio, stopPlayAudio } = useAudioPlayer();

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[styles.button, isRecording() && styles.recording]}
				onPress={() => {
					if (isRecording()) {
						stopRecording();
					} else {
						startRecording();
					}
				}}
			/>
		</View>
	);
};

export default AudioRecorderButton;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		borderColor: "black",
		borderWidth: 1,
		justifyContent: "center", // Centers vertically
		alignItems: "center", // Centers horizontally
	},
	button: {
		width: 100,
		height: 100,
		borderRadius: 50, // Makes the button circular
		backgroundColor: "red", // Default color
		justifyContent: "center",
		alignItems: "center",
	},
	recording: {
		backgroundColor: "darkred", // Color when recording
	},
});
