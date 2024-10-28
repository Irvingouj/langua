import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import ChatScreen from "./home";
import RealtimeScreen from "./realtime";
const Drawer = createDrawerNavigator();

export default function Layout() {
	return (
		<Drawer.Navigator>
			<Drawer.Screen name="Chat" component={ChatScreen} />
			<Drawer.Screen name="Realtime" component={RealtimeScreen} />
		</Drawer.Navigator>
	);
}
