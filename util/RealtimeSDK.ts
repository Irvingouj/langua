// RealtimeSDK.ts

export type MessageType = "audio" | "text" | "error" | "audio_done";

export type ClientMessage =
	| {
			type: "audio" | "text";
			data: string;
	  }
	| {
			type: "audio";
			commit: boolean;
	  };

export interface ServerMessage {
	type: MessageType;
	data?: string;
	message?: string; // For error messages
	played?: boolean; // For tracking playback
}

export interface RealtimeSDKOptions {
	url: string; // The WebSocket URL to connect to
}

export type MessageHandler = (message: ServerMessage) => void;

export class RealtimeSDK {
	private ws?: WebSocket;
	private url: string;
	private messageHandler?: MessageHandler;
	private reconnectInterval = 5000; // 5 seconds
	private retryMax = 5;
	private messageQueue: ClientMessage[] = [];
	private onOpenCallback?: () => void;
	private onCloseCallback?: () => void;

	constructor(options: RealtimeSDKOptions) {
		this.url = options.url;
	}

	public connect(): void {
		this.connectWithRetry();
	}

	private connectWithRetry(): void {
		if (this.retryMax <= 0) {
			console.error("Max retries reached, giving up");
			return;
		}

		this.retryMax -= 1;

		this.ws = new WebSocket(this.url);
		console.log("Connecting to WebSocket:", this.url);
		this.ws.onopen = () => {
			console.log("WebSocket connection established");
			this.onOpenCallback?.();
			// Send any queued messages
			for (const message of this.messageQueue) {
				const messageString = JSON.stringify(message);
				this.ws?.send(messageString);
			}
			this.messageQueue = [];
		};

		this.ws.onmessage = (event) => {
			this.handleMessage(event.data);
		};

		this.ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		this.ws.onclose = () => {
			console.log("WebSocket connection closed, attempting to reconnect");
			this.onCloseCallback?.();
			setTimeout(() => {
				this.connectWithRetry();
			}, this.reconnectInterval);
		};
	}

	public disconnect(): void {
		if (this.ws) {
			this.ws.close();
		}
	}

	public sendAudio(data: string): void {
		const message: ClientMessage = {
			type: "audio",
			data,
		};
		this.sendMessage(message);
	}

	public sendText(text: string): void {
		const message: ClientMessage = {
			type: "text",
			data: text,
		};
		this.sendMessage(message);
	}

	public onMessage(handler: MessageHandler): void {
		this.messageHandler = handler;
	}

	public onOpen(callback: () => void): void {
		this.onOpenCallback = callback;
	}

	public onClose(callback: () => void): void {
		this.onCloseCallback = callback;
	}

	private sendMessage(message: ClientMessage): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			const messageString = JSON.stringify(message);
			this.ws.send(messageString);
		} else {
			console.warn("WebSocket is not open. Queueing message");
			this.messageQueue.push(message);
		}
	}

	private handleMessage(data: string): void {
		try {
			const message: ServerMessage = JSON.parse(data);
			if (this.messageHandler) {
				this.messageHandler(message);
			}
		} catch (error) {
			console.error("Error parsing message from server:", error);
		}
	}
}
