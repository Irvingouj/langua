// useAudioPlayer.ts

import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { useMessages } from "@/components/context/RealtimeContext";

export const useAudioPlayer = () => {
	const { messages, updateMessages } = useMessages();
	const [sound, setSound] = useState<Audio.Sound | null>(null);

	const startPlayAudio = () => {
		const playAudioInner = async (base64Data: string) => {
			const soundObject = new Audio.Sound();
			try {
				await soundObject.loadAsync({
					uri: `data:audio/pcm;base64,${base64Data}`,
				});
				await soundObject.playAsync();
				// Unload the sound when done
				soundObject.setOnPlaybackStatusUpdate((status) => {
					if (status.isLoaded && !status.isPlaying) {
						soundObject.unloadAsync();
					}
				});
			} catch (error) {
				console.error("Error playing audio:", error);
			} finally {
				setSound(soundObject);
			}
		};

		// Find new audio messages and play them
		const newAudioMessages = messages.filter(
			(msg) => msg.type === "audio" && !msg.played,
		);

		if (newAudioMessages.length > 0) {
			for (const msg of newAudioMessages) {
				if (msg.data) {
					playAudioInner(msg.data);
				}
			}

			// Create a new messages array with updated 'played' status
			const updatedMessages = messages.map((msg) =>
				msg.type === "audio" && !msg.played ? { ...msg, played: true } : msg,
			);

			updateMessages(updatedMessages);
		}
	};

	const stopPlayAudio = () => {
		// Stop all currently playing sounds
		sound?.stopAsync();
	};

	const isPlaying = () =>
		sound
			?.getStatusAsync()
			.then((status) => status.isLoaded && status.isPlaying);

	return { startPlayAudio, stopPlayAudio, isPlaying };
};
