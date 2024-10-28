import React from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";

export default function ChatScreen() {

	return (
		<View style={styles.container}>
			<ScrollView style={styles.conversationArea}>
				<View style={styles.message}>
					<Text style={styles.chatGPTMessage}>
						Hello! How can I assist you today?
					</Text>
				</View>
			</ScrollView>

			<View style={styles.inputArea}>
				<TextInput
					style={styles.input}
					placeholder="Type a message..."
					placeholderTextColor="#888"
				/>
				<TouchableOpacity style={styles.sendButton}>
					<Text style={styles.sendButtonText}>Send</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5FCFF",
	},
	header: {
		height: 60,
		backgroundColor: "#6200EA",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 10,
	},
	headerTitle: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
	},
	conversationArea: {
		flex: 1,
		padding: 10,
	},
	message: {
		marginBottom: 15,
		padding: 10,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
		alignSelf: "flex-start",
	},
	chatGPTMessage: {
		fontSize: 16,
		color: "#333",
	},
	inputArea: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderTopWidth: 1,
		borderColor: "#ddd",
		backgroundColor: "#fff",
	},
	input: {
		flex: 1,
		height: 40,
		borderColor: "#888",
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 15,
		marginRight: 10,
		color: "#333",
	},
	sendButton: {
		backgroundColor: "#6200EA",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
	},
	sendButtonText: {
		color: "#fff",
		fontSize: 16,
	},
});
