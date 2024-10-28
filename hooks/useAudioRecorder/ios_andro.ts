import type { IAudioRecorder } from "./index";
import { useState } from "react";
import { Audio } from "expo-av";
import { Buffer } from "buffer";
import { useSendAudio } from "@/components/context/RealtimeContext";
import * as FileSystem from "expo-file-system";

export const useAudioRecorderIosAndro = (): IAudioRecorder => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const sendAudio = useSendAudio();
	const [permissionResponse, requestPermission] = Audio.usePermissions();

	const startRecording = async () => {
		if (recording) {
			console.log("Already recording!");
			return;
		}
		try {
			console.log("Requesting permissions...");
			if (permissionResponse?.status !== "granted") {
				console.log("Permission to access microphone is required!");
				await requestPermission();
			}

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY,
			);
			recording.setOnRecordingStatusUpdate((status) => {
				if (status.isRecording) {
					const uri = recording.getURI();
					const reader = new FileReader();
					reader.onload = () => {
						const buffer = reader.result as ArrayBuffer;
						const base64 = Buffer.from(buffer).toString("base64");
						sendAudio(base64);
					};
				}
			});

			setRecording(recording);
			uploadChunksToServer(recording, 1024, 1000, sendAudio);

			console.log("Recording started");
		} catch (err) {
			console.error("Failed to start recording", err);
		}
	};

	async function stopRecording() {
		console.log("Stopping recording..");
		setRecording(null);
		await recording?.stopAndUnloadAsync();
		const uri = recording?.getURI();
		console.log("Recording stopped and stored at", uri);
	}

	const isRecording = () => !!recording;

	return {
		isRecording,
		startRecording,
		stopRecording,
	};
};

export async function uploadChunksToServer(
	recording: Audio.Recording,
	chunkSize: number,
	delayBetweenChunks: number,
	sendAudio: (data: string) => void,
): Promise<void> {
	console.log("Calling uploadChunksToServer");

	await new Promise((resolve) => setTimeout(resolve, 1000));
	const uri = recording.getURI();
	if (!uri) {
		console.error("No URI found for the recording instance");
		return;
	}
	let info = await FileSystem.getInfoAsync(uri);
	let currentPosition = 0;
	let currentFileSize = info.exists && info.size ? info.size : 0;
	let prevPosition = 0;

	// // Loop to upload chunks until all data is uploaded
	do {
		try {
			info = await FileSystem.getInfoAsync(uri);
			currentFileSize = info.exists && info.size ? info.size : 0;
			// Check if we are blocked (file not growing)
			if (
				currentPosition + chunkSize >= currentFileSize &&
				currentPosition === prevPosition &&
				prevPosition !== 0
			) {
				console.log("Blocked - waiting for more data");
				continue; // Skip to the next iteration if blocked
			}
			console.log(
				`Uploading from position ${currentPosition}, file size: ${currentFileSize}`,
			);
			const fileChunk = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
				position: currentPosition,
				length: chunkSize,
			});
			currentPosition += chunkSize;
			sendAudio(fileChunk);
			prevPosition = currentPosition;
		} catch (error) {
			console.error("Error during chunk upload:", error);
		}

		if (
			!(await recording.getStatusAsync()).isRecording &&
			currentFileSize - currentPosition < chunkSize
		) {
			const fileChunk = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
				position: currentPosition,
				length: currentFileSize - currentPosition, // Read the remaining data
			});

			currentPosition += currentFileSize - currentPosition;
			sendAudio(fileChunk);
			break;
		}

		await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
	} while (currentPosition < currentFileSize);
}
