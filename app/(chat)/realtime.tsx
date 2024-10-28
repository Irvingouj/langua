// RealtimeScreen.tsx

import {
	useRealtimeConnection,
	useMessages,
	useSendText,
} from "@/components/context/RealtimeContext";
import AudioRecorderButton from "@/components/realtime/AudioRecorderButton";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { ServerMessage } from "@/util/RealtimeSDK";
import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	FlatList,
	StyleSheet,
} from "react-native";

export default function RealtimeScreen() {
	const { connected, startSession } = useRealtimeConnection();

	// biome-ignore lint/correctness/useExhaustiveDependencies: "startSession" will change since connected is changed and so is the context
	useEffect(() => {
		const handle = startSession();
		return () => {
			handle.close();
		};
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.statusText}>
				Connection Status: {connected ? "Connected" : "Disconnected"}
			</Text>
			<AudioRecorderButton />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	statusText: { marginBottom: 8 },
	messageList: { flex: 1, marginBottom: 8 },
	messageContainer: { marginBottom: 4 },
	messageText: { fontSize: 16 },
	errorText: { fontSize: 16, color: "red" },
	textInput: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 8,
		paddingHorizontal: 8,
	},
});
