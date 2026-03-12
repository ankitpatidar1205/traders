import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { IndianRupee, Briefcase, FileText, User, Wallet, BookText } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import TradesScreen from '../screens/TradesScreen';
import AccountScreen from '../screens/AccountScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import FundsScreen from '../screens/FundsScreen';
import DepositRequestScreen from '../screens/DepositRequestScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EconomicCalendarScreen from '../screens/EconomicCalendarScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SearchScreen from '../screens/SearchScreen';
import ExitTradeScreen from '../screens/ExitTradeScreen';
import WithdrawalRequestScreen from '../screens/WithdrawalRequestScreen';
import LearningScreen from '../screens/LearningScreen';
import AlertsScreen from '../screens/AlertsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;
                    const iconProps = {
                        size: 28,
                        color: color,
                        fill: color // Making icons solid to match photo
                    };

                    if (route.name === 'Watchlist') {
                        // Watchlist is just the Rupee symbol font
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
                tabBarInactiveTintColor: '#597895', // Using your requested color for inactive icons
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    height: 65, // Slightly taller for better spacing
                    paddingBottom: 10,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Watchlist" component={DashboardScreen} />
            <Tab.Screen name="Trades" component={TradesScreen} />
            <Tab.Screen name="Portfolio" component={PortfolioScreen} />
            <Tab.Screen name="Account" component={AccountScreen} />
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
                <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
                <Stack.Screen name="Funds" component={FundsScreen} />
                <Stack.Screen name="DepositRequest" component={DepositRequestScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="EconomicCalendar" component={EconomicCalendarScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="ExitTrade" component={ExitTradeScreen} />
                <Stack.Screen name="WithdrawalRequest" component={WithdrawalRequestScreen} />
                <Stack.Screen name="Learning" component={LearningScreen} />
                <Stack.Screen name="Alerts" component={AlertsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
