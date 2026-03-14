import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ImageBackground,
    Image,
    Animated,
    Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Bell, ShoppingCart } from 'lucide-react-native';
import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import TickerTape from '../../components/TickerTape';
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
                onPress={() => navigation.navigate('OrderDetail', { item, name: item.name })}
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
                    <TouchableOpacity style={styles.aiBtn} onPress={() => {/* AI Action */}}>
                        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                            <Image 
                                source={require('../../assets/ai_icon.png')} 
                                style={styles.aiIconImage} 
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerText}>Marketwatch</Text>

                <View style={[styles.headerSideContainer, { alignItems: 'flex-end' }]}>
                    <View style={styles.rightIcons}>
                        <TouchableOpacity style={styles.bucketBtn} onPress={() => {/* Bucket Action */}}>
                            <ShoppingCart size={24} color="white" fill="white" />
                            <View style={styles.bucketBadge}>
                                <Text style={styles.bucketBadgeText}>6</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                            <Bell size={24} color="white" />
                            {unreadAdminCount > 0 && (
                                <View style={styles.bellBadge}>
                                    <Text style={styles.bellBadgeText}>
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
                    <Search size={20} color="#9E9E9E" />
                    <TouchableOpacity
                        style={styles.searchClickable}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Text style={styles.searchPlaceholder}>Search & Add</Text>
                    </TouchableOpacity>
                    <Filter size={20} color="#9E9E9E" />
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
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 65,
    },
    headerSideContainer: {
        width: 100,
        justifyContent: 'center',
    },
    headerText: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
    },
    bellBtn: {
        padding: 5,
        position: 'relative',
    },
    aiBtn: {
        padding: 5,
    },
    aiIconImage: {
        width: 45, // Larger size
        height: 45,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bucketBtn: {
        padding: 5,
        marginRight: 15,
        position: 'relative',
    },
    bucketBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    bucketBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
    },
    bellBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    bellBadgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: '900',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'black',
        height: 48,
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
        fontSize: 14,
        fontWeight: '700',
    },
    activeTabText: {
        color: 'white',
    },
    searchSection: {
        paddingHorizontal: 0, // Left and Right se chipka hua
        paddingTop: 0,
        paddingBottom: 0, // Flush with tabs and watchlist
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 0, // Square edges to stay flush
    },
    searchClickable: {
        flex: 1,
        paddingHorizontal: 10,
    },
    searchPlaceholder: {
        color: '#424242',
        fontSize: 18,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 15,
    },
    itemWrapper: {
        paddingVertical: 6, // Reduced from 12
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    leftCol: {
        flex: 1.2,
        justifyContent: 'center',
    },
    priceCol: {
        flex: 1.1,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        fontSize: 18, // Slightly larger
        fontWeight: 'bold',
    },
    dateText: {
        color: 'white',
        fontSize: 14,
        marginVertical: 2,
    },
    labelsBottom: {
        color: 'white',
        fontSize: 14,
    },
    priceTextMain: {
        color: 'white',
        fontSize: 19,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    priceBox: {
        paddingHorizontal: 0,
        paddingVertical: 8,
        borderRadius: 6,
        width: '90%', // Use percentage for better relative scaling
        maxWidth: 100,
        alignItems: 'center',
        marginBottom: 6,
    },
    priceValText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    labelSmall: {
        color: 'white',
        fontSize: 15, // Matching screenshot
        opacity: 0.9,
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