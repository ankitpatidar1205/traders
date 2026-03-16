import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
    Alert,
    ScrollView,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    IndianRupee,
    User,
    Key,
    FileText,
    LogOut,
    ChevronRight,
    Briefcase,
    BookText,
    BookOpen,
    Bell,
    LifeBuoy
} from 'lucide-react-native';

import ScreenWrapper from '../../components/ScreenWrapper';
import * as api from '../../services/api';

const AccountScreen = ({ navigation }) => {
    const user = api.getSessionUser();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: () => navigation.navigate('Login'), style: 'destructive' }
            ]
        );
    };

    const MenuItem = ({ title, icon: Icon, onPress, isLast, labelRight }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={styles.menuItemText}>{title}</Text>
            <View style={styles.rightContent}>
                {labelRight ? <Text style={styles.rightLabel}>{labelRight}</Text> : null}
                {Icon && <Icon size={20} color="#333" strokeWidth={2.5} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Account</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="white"
                        colors={['#CFD1C4']}
                    />
                }
            >

                {/* User Info */}
                <Text style={styles.userName}>
                    {user?.full_name || 'User'} ({user?.username || 'Guest'})
                </Text>

                {/* Menu Items */}
                <View style={styles.menuList}>
                    <MenuItem
                        title="Funds"
                        icon={IndianRupee}
                        onPress={() => navigation.navigate('Funds')}
                    />
                    <MenuItem
                        title="Profile"
                        icon={User}
                        onPress={() => navigation.navigate('ProfileDetails')}
                    />
                    <MenuItem
                        title="Support"
                        icon={LifeBuoy}
                        onPress={() => navigation.navigate('Support')}
                    />
                    <MenuItem
                        title="Deposit Request"
                        icon={Key} // Icon looked like a key or tool
                        onPress={() => navigation.navigate('DepositRequest')}
                    />
                    <MenuItem
                        title="Withdrawal Request"
                        icon={IndianRupee}
                        onPress={() => navigation.navigate('WithdrawalRequest')}
                    />
                    <MenuItem
                        title="Change Password"
                        icon={Key}
                        onPress={() => navigation.navigate('ChangePassword')}
                    />
                    <MenuItem
                        title="Economic Calendar"
                        icon={FileText}
                        onPress={() => navigation.navigate('EconomicCalendar')}
                    />
                    <MenuItem
                        title="Price Alerts"
                        icon={Bell}
                        onPress={() => navigation.navigate('Alerts')}
                    />
                    <MenuItem
                        title="Learning Module"
                        icon={BookOpen}
                        onPress={() => navigation.navigate('Learning')}
                    />
                    <MenuItem
                        title="Log Out"
                        icon={LogOut}
                        onPress={handleLogout}
                    />
                    <MenuItem
                        title="App Version"
                        labelRight="1.9.0"
                        isLast
                        onPress={() => { }}
                    />
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 5,
    },
    menuList: {
        gap: 4, // Reduced gap for more compact list
    },
    menuItem: {
        backgroundColor: '#CFD1C4', // Correct beige/tan shade
        borderRadius: 6, // Restored curves per user request
        paddingVertical: 8, // Reduced vertical padding
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightLabel: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 15,
        fontSize: 16,
        fontWeight: '500',
        opacity: 0.8,
    }
});


export default AccountScreen;
