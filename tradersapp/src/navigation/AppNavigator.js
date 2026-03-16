import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { IndianRupee, Briefcase, FileText, User, Wallet, BookText } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/tabs/DashboardScreen';
import PortfolioScreen from '../screens/tabs/PortfolioScreen';
import TradesScreen from '../screens/tabs/TradesScreen';
import AccountScreen from '../screens/tabs/AccountScreen';
import OrderDetailScreen from '../screens/others/OrderDetailScreen';
import ProfileDetailsScreen from '../screens/others/ProfileDetailsScreen';
import FundsScreen from '../screens/others/FundsScreen';
import DepositRequestScreen from '../screens/others/DepositRequestScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import NotificationsScreen from '../screens/others/NotificationsScreen';
import EconomicCalendarScreen from '../screens/others/EconomicCalendarScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SearchScreen from '../screens/others/SearchScreen';
import ExitTradeScreen from '../screens/others/ExitTradeScreen';
import WithdrawalRequestScreen from '../screens/others/WithdrawalRequestScreen';
import LearningScreen from '../screens/others/LearningScreen';
import AlertsScreen from '../screens/others/AlertsScreen';
import SupportScreen from '../screens/others/SupportScreen';
import AiAssistantScreen from '../screens/others/AiAssistantScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const WatchlistStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WatchlistHome" component={DashboardScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
);

const TradesStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TradesHome" component={TradesScreen} />
        <Stack.Screen name="ExitTrade" component={ExitTradeScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
);

const PortfolioStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PortfolioHome" component={PortfolioScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
);

const AccountStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AccountHome" component={AccountScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
        <Stack.Screen name="Funds" component={FundsScreen} />
        <Stack.Screen name="DepositRequest" component={DepositRequestScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="EconomicCalendar" component={EconomicCalendarScreen} />
        <Stack.Screen name="WithdrawalRequest" component={WithdrawalRequestScreen} />
        <Stack.Screen name="Learning" component={LearningScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
);

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;
                    const iconProps = {
                        size: 28,
                        color: color,
                    };

                    if (route.name === 'Watchlist') {
                        return <Text style={{ color, fontSize: 24, fontWeight: 'bold' }}>₹</Text>;
                    } else if (route.name === 'Trades') {
                        icon = <BookText {...iconProps} />;
                    } else if (route.name === 'Portfolio') {
                        icon = <Briefcase {...iconProps} />;
                    } else if (route.name === 'Account') {
                        icon = <User {...iconProps} />;
                    }
                    return icon;
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#597895',
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    height: 85,
                    paddingBottom: 25,
                    paddingTop: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Watchlist" component={WatchlistStack} />
            <Tab.Screen name="Trades" component={TradesStack} />
            <Tab.Screen name="Portfolio" component={PortfolioStack} />
            <Tab.Screen name="Account" component={AccountStack} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
