import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    FlatList,
    Animated,
    Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Bell, Wallet, Sparkles } from 'lucide-react-native';
import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import TickerTape from '../../components/TickerTape';
import CuteBot from '../../components/CuteBot';
import MarketUpdatePopup from '../../components/MarketUpdatePopup';

const CATEGORIES = ['MCX Futures', 'NSE Futures', 'Options'];

const DashboardScreen = ({ navigation }) => {
    const { watchlist, livePrices, unreadAdminCount, adminNotifications, acknowledgeNotification } = useTrades();
    const [selectedCategory, setSelectedCategory] = useState('MCX Futures');
    const [showPromo, setShowPromo] = useState(false);

    // AI Icon Animation
    const floatAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -5,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 5,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Show popup on start if there's an unacknowledged admin message
    useEffect(() => {
        const unack = adminNotifications.find(n => !n.acknowledged);
        if (unack) {
            // Popup will show after 1 second of loading the dashboard
            const timer = setTimeout(() => {
                setShowPromo(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []); // Only run once on mount (Login/Start)

    const handleAcknowledge = () => {
        const unacknowledged = adminNotifications.find(n => !n.acknowledged);
        if (unacknowledged) {
            acknowledgeNotification(unacknowledged.id);
        }
        setShowPromo(false);
    };

    const filteredWatchlist = watchlist.filter(item => {
        if (!item.category) return selectedCategory === 'MCX Futures'; // Default/Fallback
        return item.category === selectedCategory;
    });

    const renderMarketItem = ({ item }) => {
        const livePrice = livePrices[item.name] || item.ltp;
        const isUp1 = parseFloat(item.change) >= 0;
        const isUp2 = parseFloat(item.change) >= 0;

        const buyColor = '#2D864D'; // Green
        const sellColor = '#C64756'; // Red

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderDetail', { item, name: item.name, category: item.category })}
                style={styles.itemWrapper}
            >
                <View style={styles.itemRow}>
                    <View style={styles.leftCol}>
                        <Text style={styles.symbolName}>{item.name.toUpperCase()}</Text>
                        <Text style={styles.dateText}>{item.date || '2026-02-27'}</Text>
                        <Text style={styles.labelsBottom}>
                            Chg:{item.change} H:{item.high}
                        </Text>
                    </View>

                    <View style={styles.priceCol}>
                        <View style={[styles.priceBox, { backgroundColor: isUp1 ? buyColor : sellColor }]}>
                            <Text style={styles.priceValText}>{livePrice}</Text>
                        </View>
                        <Text style={styles.labelSmall}>L: {item.low}</Text>
                    </View>

                    <View style={styles.priceCol}>
                        <View style={[styles.priceBox, { backgroundColor: isUp2 ? buyColor : sellColor }]}>
                            <Text style={styles.priceValText}>{item.price2 || item.open}</Text>
                        </View>
                        <Text style={styles.labelSmall}>O: {item.open}</Text>
                    </View>
                </View>
                <View style={styles.separator} />
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper style={{ paddingTop: 0 }}>
            {/* Ticker at the very top, outside the main header container */}
            <View style={{ height: 35 }}>
                <TickerTape />
            </View>

            {/* Center Title */}
            <View style={styles.headerTitleContainer}>
                <View style={styles.headerSideContainer}>
                    <TouchableOpacity
                        style={styles.aiBtn}
                        onPress={() => navigation.navigate('AiAssistant')}
                    >
                        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                            <CuteBot size={32} />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerText}>Marketwatch</Text>

                <View style={[styles.headerSideContainer, { alignItems: 'flex-end' }]}>
                    <View style={styles.rightIcons}>
                        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Account', { screen: 'Funds' })}>
                            <Wallet size={18} color="white" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Notifications')}>
                            <Bell size={18} color="white" strokeWidth={2} />
                            {unreadAdminCount > 0 && (
                                <View style={styles.iconBadge}>
                                    <Text style={styles.badgeText}>
                                        {unreadAdminCount > 9 ? '9+' : String(unreadAdminCount)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Black Tabs */}
            <View style={styles.tabBar}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.tab, selectedCategory === cat && styles.activeTab]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={[styles.tabText, selectedCategory === cat && styles.activeTabText]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* White Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={18} color="#9E9E9E" />
                    <TouchableOpacity
                        style={styles.searchClickable}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Text style={styles.searchPlaceholder}>Search & Add</Text>
                    </TouchableOpacity>
                    <Filter size={18} color="#9E9E9E" />
                </View>
            </View>

            {/* Watchlist */}
            <FlatList
                data={filteredWatchlist}
                renderItem={renderMarketItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items in {selectedCategory}</Text>
                    </View>
                }
            />

            <MarketUpdatePopup
                visible={showPromo}
                onClose={() => setShowPromo(false)}
                onAcknowledge={handleAcknowledge}
                title={adminNotifications.find(n => !n.acknowledged)?.title}
                message={adminNotifications.find(n => !n.acknowledged)?.message}
            />
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    darkOverlay: {
        flex: 1,
        backgroundColor: 'rgba(6, 26, 55, 0.43)', // Darkens the bg.jpg for a richer teal color
    },
    safeArea: {
        flex: 1,
    },
    headerTitleContainer: {
        paddingTop: 6,
        paddingBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 50,
    },
    headerSideContainer: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        flex: 1,
        textAlign: 'center',
    },
    headerIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        position: 'relative',
    },
    aiBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(147, 51, 234, 0.15)',
        borderWidth: 1.5,
        borderColor: '#9333EA',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    iconBadge: {
        position: 'absolute',
        top: -1,
        right: -1,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FF3B30', 
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#061A37',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'black',
        height: 42,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: 'white',
    },
    tabText: {
        color: '#757575',
        fontSize: 12,
        fontWeight: '700',
    },
    activeTabText: {
        color: 'white',
    },
    searchSection: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        height: 45,
        borderRadius: 0,
    },
    searchClickable: {
        flex: 1,
        paddingHorizontal: 8,
    },
    searchPlaceholder: {
        color: '#757575',
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 15,
    },
    itemWrapper: {
        paddingVertical: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    leftCol: {
        flex: 1.3,
        justifyContent: 'center',
        paddingRight: 10,
    },
    priceCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    midCol: {
        flex: 1,
        alignItems: 'center',
    },
    rightCol: {
        flex: 1,
        alignItems: 'center',
    },
    symbolName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    dateText: {
        color: '#B0BEC5',
        fontSize: 11,
        marginVertical: 2,
        opacity: 0.8,
    },
    labelsBottom: {
        color: '#B0BEC5',
        fontSize: 11,
        marginTop: 3,
        opacity: 0.8,
    },
    priceTextMain: {
        color: 'white',
        fontSize: 19,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    priceBox: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        width: '95%',
        maxWidth: 90,
        alignItems: 'center',
        marginBottom: 4,
    },
    priceValText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    labelSmall: {
        color: '#B0BEC5',
        fontSize: 11,
        opacity: 0.85,
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginTop: 6, // Reduced from 15
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: 'white',
        opacity: 0.6,
    }
});

export default DashboardScreen;