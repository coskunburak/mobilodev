import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ReportsScreen from "../screens/ReportsScreen";
import TimerScreen from "../screens/TimerScreen";
const Tab = createBottomTabNavigator();


export default function TabNavigator(){
    return(
        <Tab.Navigator>
            <Tab.Screen
                name = "Timer"
                component = {TimerScreen}
                options={{title: "Zamanlayıcı"}}
            />
            <Tab.Screen
                name = "Reports"
                component = {ReportsScreen}
                options = {{title: "Raporlar"}}
            />
        </Tab.Navigator>
    );
}
