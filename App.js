import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from "./src/context/AuthProvider";

import { SessionProvider } from "./src/context/SessionProvider";
import AuthStack from "./src/navigation/AuthStack";
import TabNavigator from "./src/navigation/TabNavigator";
import colors from "./src/theme/colors";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AuthProvider>
  );
}