// RealtimeContext.tsx

import type React from "react";
import { createContext, useContext, useRef, useState } from "react";
import { RealtimeSDK, type ServerMessage } from "../../util/RealtimeSDK";

interface RealtimeContextValue {
	sendText: (text: string) => void;
	sendAudio: (data: string) => void;
	messages: ServerMessage[];
	updateMessages: (messages: ServerMessage[]) => void;
	startSession: () => { close: () => void };
	connected: boolean;
}

export const RealtimeContext = createContext<RealtimeContextValue | undefined>(
	undefined,
);

export const RealtimeProvider: React.FC<{
	url: string;
	children: React.ReactNode;
}> = ({ url, children }) => {
	const sdkRef = useRef<RealtimeSDK | null>(null);
	const [messages, setMessages] = useState<ServerMessage[]>([]);
	const [connected, setConnected] = useState<boolean>(false);

	const startSession = () => {
		if (sdkRef.current) {
			console.warn("Realtime session already started");
			sdkRef.current.disconnect();
		}

		const realtime = new RealtimeSDK({ url });
		sdkRef.current = realtime;

		realtime.onMessage((message) => {
			setMessages((prevMessages) => [...prevMessages, message]);
		});

		realtime.onOpen(() => {
			setConnected(true);
		});

		realtime.onClose(() => {
			setConnected(false);
		});

		realtime.connect();

		return {
			close: () => {
				realtime.disconnect();
				sdkRef.current = null;
			},
		};
	};

	const sendText = (text: string) => {
		sdkRef.current?.sendText(text);
	};

	const sendAudio = (data: string) => {
		sdkRef.current?.sendAudio(data);
	};

	const updateMessages = (newMessages: ServerMessage[]) => {
		setMessages(newMessages);
	};

	return (
		<RealtimeContext.Provider
			value={{
				sendText,
				sendAudio,
				messages,
				updateMessages,
				connected,
				startSession,
			}}
		>
			{children}
		</RealtimeContext.Provider>
	);
};

export const useRealtime = () => {
	const context = useContext(RealtimeContext);
	if (!context) {
		throw new Error("useRealtime must be used within a RealtimeProvider");
	}
	return context;
};

export const useSendText = () => {
	const { sendText } = useRealtime();
	return sendText;
};

export const useSendAudio = () => {
	const { sendAudio } = useRealtime();
	return sendAudio;
};

export const useMessages = () => {
	const { messages, updateMessages } = useRealtime();
	return { messages, updateMessages };
};

export const useRealtimeConnection = () => {
	const { connected, startSession } = useRealtime();
	return { connected, startSession };
};
