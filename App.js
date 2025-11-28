import { NavigationContainer } from "@react-navigation/native";
import { SessionProvider } from "./src/context/SessionProvider";
import TabNavigator from "./src/navigation/TabNavigator";

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SessionProvider>
  );
}
