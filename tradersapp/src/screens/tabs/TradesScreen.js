import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ImageBackground,
    Modal,
    TextInput,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useTrades } from '../../context/TradeContext';

const { width } = Dimensions.get('window');

const TradeItem = ({ item, activeTab, livePrice, meta, onOpenCloseModal, onCancel, onSetTargetSL }) => {
    const isActive = activeTab === 'Active';
    const isPending = activeTab === 'Pending';
    const isClosed = activeTab === 'Closed';

    // Formatting name similar to screenshot
    const formattedName = item.displayName || (item.name.includes('FUT') ? item.name : (item.name + '26FEBFUT').toUpperCase());

    if (isClosed) {
        // Calculate realized P/L
        const m = meta || { multiplier: 1 };
        const pnlValue = (parseFloat(item.exitPrice || 0) - parseFloat(item.entryPrice || 0)) * parseInt(item.qty) * m.multiplier * (item.type === 'BUY' ? 1 : -1);
        const isNeg = pnlValue < 0;

        return (
            <View style={styles.tradeItem}>
                <View style={styles.closedHeader}>
                    <Text style={styles.symbolName}>{formattedName}</Text>
                    <View style={styles.closedBadges}>
                        <View style={[styles.pnlBadge, { backgroundColor: isNeg ? '#FFCDD2' : '#C8E6C9' }]}>
                            <Text style={[styles.pnlBadgeText, { color: isNeg ? '#D32F2F' : '#2E7D32' }]}>{pnlValue.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.qtyBadge, { backgroundColor: isNeg ? '#FFCDD2' : '#C8E6C9' }]}>
                            <Text style={[styles.qtyBadgeText, { color: isNeg ? '#D32F2F' : '#2E7D32' }]}>QTY:{item.qty || '1'}</Text>
                        </View>
                    </View>
                </View>

                {/* Prices Row */}
                <View style={styles.closedPricesRow}>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>{item.type === 'BUY' ? 'Bought By Trader' : 'Sold By Trader'}</Text>
                        <View style={styles.priceBoxRed}>
                            <Text style={styles.priceBoxText}>{item.entryPrice}</Text>
                        </View>
                    </View>
                    <View style={styles.priceInfoRight}>
                        <Text style={styles.priceLabel}>{item.type === 'BUY' ? 'Sold By Trader' : 'Bought By Trader'}</Text>
                        <View style={styles.priceBoxGreen}>
                            <Text style={styles.priceBoxText}>{item.exitPrice}</Text>
                        </View>
                    </View>
                </View>

                {/* Times Row */}
                <View style={styles.closedTimeRow}>
                    <Text style={styles.timeValue}>{item.time || '2026-02-04 13:00:15'}</Text>
                    <Text style={[styles.timeValue, { textAlign: 'right' }]}>{item.exitTime || '2026-02-04 12:59:55'}</Text>
                </View>

                <View style={styles.divider} />
            </View>
        );
    }

    // --- PENDING TRADE UI ---
    if (isPending) {
        return (
            <View style={styles.pendingTradeItem}>
                {/* Row 1: Symbol Name | Price */}
                <View style={styles.pendingRow1}>
                    <Text style={styles.pendingSymbolName}>{formattedName}</Text>
                    <Text style={styles.pendingPriceText}>{item.entryPrice}</Text>
                </View>

                {/* Row 2: Buy/Sell Qty, Time | Cancel Button */}
                <View style={styles.pendingRow2}>
                    <View>
                        <Text style={styles.pendingTypeQty}>{item.type === 'BUY' ? 'Bought' : 'Sold'} X {item.qty}</Text>
                        <Text style={styles.pendingTime}>{item.time || '17:17:39'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.pendingCancelBtn}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.pendingCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 3: Limit Price, Margin Used | Req Value */}
                <View style={styles.pendingRow3}>
                    <View>
                        <Text style={styles.pendingInfoLabel}>Limit Price</Text>
                        <Text style={styles.pendingInfoValue}>{item.entryPrice}</Text>
                        <Text style={[styles.pendingInfoLabel, { marginTop: 6 }]}>Margin used 10000</Text>
                    </View>
                    <View style={styles.pendingReqCol}>
                        <Text style={styles.pendingInfoLabel}>Req: 10000</Text>
                    </View>
                </View>

                <View style={styles.pendingDivider} />
            </View>
        );
    }

    // --- ACTIVE TRADE UI ---
    return (
        <View style={styles.tradeItem}>
            <View style={styles.activeCompactRow}>
                <View style={styles.activeLeft}>
                    <Text style={styles.symbolNameLarge}>{formattedName}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.boughtBadge}>
                            <Text style={styles.boughtBadgeText}>{item.type === 'BUY' ? 'Bought' : 'Sold'} X {item.qty || 1}</Text>
                        </View>
                        <Text style={styles.dateText}>{item.time || '17:17:39'}</Text>
                    </View>
                </View>
                <View style={styles.activeRight}>
                    <Text style={styles.ltpText}>{livePrice ? livePrice.toFixed(2) : '---'}</Text>
                    <TouchableOpacity style={styles.closeTradeBtn} onPress={onOpenCloseModal}>
                        <Text style={styles.closeTradeBtnText}>Close Trade</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.activeSubRow}>
                <Text style={styles.traderText}>{`${item.type === 'BUY' ? 'Bought' : 'Sold'} at ${item.entryPrice}`}</Text>
                <TouchableOpacity style={styles.setTargetBtn} onPress={onSetTargetSL}>
                    <Text style={styles.setTargetBtnText}>Set Target/SL</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.activeMarginRow}>
                <Text style={styles.marginText}>Margin used 10000</Text>
                <Text style={styles.marginText}>Req: 10000</Text>
            </View>

            <View style={styles.divider} />
        </View>
    );
};

import ScreenWrapper from '../../components/ScreenWrapper';

const TradesScreen = ({ navigation }) => {
    const { trades, cancelTrade, livePrices, INSTRUMENT_META, setTargetSL } = useTrades();
    const [activeTab, setActiveTab] = useState('Pending'); // Match photo state

    // Target/SL Modal State
    const [targetModalVisible, setTargetModalVisible] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [targetPrice, setTargetPrice] = useState('');
    const [slPrice, setSlPrice] = useState('');

    // Cancel Confirmation Modal State
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [tradeToCancel, setTradeToCancel] = useState(null);

    const filteredTrades = trades.filter(t => {
        if (activeTab === 'Pending') return t.isPending && !t.isCompleted;
        if (activeTab === 'Active') return !t.isCompleted && !t.isPending;
        if (activeTab === 'Closed') return t.isCompleted;
        return true;
    });

    const handleSetTargetSL = () => {
        if (selectedTrade) {
            setTargetSL(selectedTrade.id, targetPrice, slPrice);
            setTargetModalVisible(false);
            setTargetPrice('');
            setSlPrice('');
            setSelectedTrade(null);
        }
    };

    const openTargetModal = (trade) => {
        setSelectedTrade(trade);
        setTargetPrice(trade.target || '');
        setSlPrice(trade.sl || '');
        setTargetModalVisible(true);
    };

    const handleCancelOrder = (trade) => {
        setTradeToCancel(trade);
        setCancelModalVisible(true);
    };

    const confirmCancelOrder = () => {
        if (tradeToCancel) {
            cancelTrade(tradeToCancel.id);
            setCancelModalVisible(false);
            setTradeToCancel(null);
        }
    };

    return (
        <ScreenWrapper>
            {/* Compact Centered Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Trades</Text>
            </View>

            {/* Thin Black Tab Bar */}
            <View style={styles.tabBar}>
                {['Pending', 'Active', 'Closed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredTrades}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TradeItem
                        item={item}
                        activeTab={activeTab}
                        livePrice={livePrices[item.name]}
                        meta={INSTRUMENT_META[item.name]}
                        onOpenCloseModal={() => navigation.navigate('ExitTrade', { trade: item })}
                        onCancel={() => handleCancelOrder(item)}
                        onSetTargetSL={() => openTargetModal(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No {activeTab} Orders</Text>
                        <View style={styles.emptyDivider} />
                    </View>
                }
            />

            {/* Target/SL Modal */}
            <Modal
                visible={targetModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setTargetModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Set Target & Stop Loss</Text>
                        <Text style={[styles.passwordLabel, { fontSize: 16, marginBottom: 15 }]}>{selectedTrade?.displayName}</Text>

                        <Text style={styles.passwordLabel}>Target Price</Text>
                        <TextInput
                            style={styles.passwordInput}
                            value={targetPrice}
                            onChangeText={setTargetPrice}
                            keyboardType="numeric"
                            placeholder="Enter Target Price"
                            placeholderTextColor="#999"
                        />

                        <Text style={styles.passwordLabel}>Stop Loss Price</Text>
                        <TextInput
                            style={styles.passwordInput}
                            value={slPrice}
                            onChangeText={setSlPrice}
                            keyboardType="numeric"
                            placeholder="Enter Stop Loss Price"
                            placeholderTextColor="#999"
                        />

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSetTargetSL}>
                            <Text style={styles.submitBtnText}>SET VALUES</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setTargetModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Cancel Order Confirmation Modal */}
            <Modal
                visible={cancelModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmModal}>
                        <Text style={styles.confirmTitle}>Cancel Order?</Text>
                        <Text style={styles.confirmMessage}>
                            Are you sure you want to cancel this order for {tradeToCancel?.displayName}?
                        </Text>

                        <View style={styles.confirmButtonRow}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.confirmYesBtn]}
                                onPress={confirmCancelOrder}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmYesText}>Yes, Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.confirmNoBtn]}
                                onPress={() => setCancelModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmNoText}>No, Keep It</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        letterSpacing: 0.5,
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
    listContent: {
        paddingTop: 10,
    },
    emptyContainer: {
        paddingHorizontal: 15,
        marginTop: 5,
    },
    emptyText: {
        color: 'white',
        fontSize: 13,
        textAlign: 'right',
        opacity: 0.8,
    },
    emptyDivider: {
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginTop: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    activeCompactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeLeft: {
        flex: 1,
    },
    activeRight: {
        alignItems: 'flex-end',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    activeSubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    activeMarginRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    symbolNameLarge: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    ltpText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 5,
    },
    boughtBadge: {
        backgroundColor: '#D1FFD4',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
        marginRight: 10,
    },
    boughtBadgeText: {
        color: '#1B5E20',
        fontSize: 11,
        fontWeight: 'bold',
    },
    dateText: {
        color: 'white',
        fontSize: 11,
        opacity: 0.8,
    },
    traderText: {
        color: '#B0BEC5',
        fontSize: 11,
        opacity: 0.85,
    },
    closeTradeBtn: {
        backgroundColor: '#C64756',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 2,
    },
    closeTradeBtnText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    setTargetBtn: {
        backgroundColor: '#2D864D',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    setTargetBtnText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    marginText: {
        color: '#B0BEC5',
        fontSize: 10,
        opacity: 0.7,
    },
    divider: {
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginTop: 12,
    },
    tradeItem: {
        paddingTop: 15,
        paddingHorizontal: 15,
    },

    // --- Closed Trade Styles ---
    closedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    symbolName: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    closedBadges: {
        flexDirection: 'row',
    },
    pnlBadge: {
        marginRight: 8,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    pnlBadgeText: {
        color: '#D32F2F',
        fontWeight: '700',
        fontSize: 11,
    },
    qtyBadge: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    qtyBadgeText: {
        color: '#D32F2F',
        fontWeight: '700',
        fontSize: 11,
    },
    closedPricesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    priceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInfoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        color: '#B0BEC5',
        fontSize: 10,
        marginRight: 5,
    },
    priceBoxRed: {
        backgroundColor: '#EF9A9A',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    priceBoxGreen: {
        backgroundColor: '#A5D6A7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    priceBoxText: {
        color: 'black',
        fontWeight: '700',
        fontSize: 11,
    },
    closedTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeValue: {
        color: '#B0BEC5',
        fontSize: 11,
        fontWeight: '700',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: width * 0.85,
        borderRadius: 8,
        padding: 24,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 20,
    },
    passwordLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 8,
    },
    passwordInput: {
        backgroundColor: '#F5F5F5',
        height: 48,
        borderRadius: 4,
        paddingHorizontal: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
        color: 'black'
    },
    submitBtn: {
        backgroundColor: '#2E7D32',
        height: 44,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelBtn: {
        backgroundColor: '#C62828',
        height: 44,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // --- Grid Layout Styles (Matched with Dashboard) ---
    tradeItemGrid: {
        paddingTop: 10,
        paddingHorizontal: 15,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    leftCol: {
        flex: 1.3,
        justifyContent: 'center',
        paddingRight: 10,
    },
    priceColGrid: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolNameGrid: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    dateTextGrid: {
        color: '#B0BEC5',
        fontSize: 11,
        marginVertical: 2,
        opacity: 0.8,
    },
    labelsBottomGrid: {
        color: '#B0BEC5',
        fontSize: 11,
        marginTop: 3,
        opacity: 0.8,
    },
    priceBoxGrid: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        width: '95%',
        maxWidth: 90,
        alignItems: 'center',
        marginBottom: 4,
    },
    priceValTextGrid: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    labelSmallGrid: {
        color: '#B0BEC5',
        fontSize: 11,
        opacity: 0.85,
    },
    actionRowGrid: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 4,
        marginBottom: 10,
    },
    // --- Pending Trade Item Styles ---
    pendingTradeItem: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    pendingRow1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pendingSymbolName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    pendingPriceText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    pendingRow2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pendingTypeQty: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    pendingTime: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '500',
    },
    pendingCancelBtn: {
        backgroundColor: 'rgba(91, 124, 149, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(91, 124, 149, 0.9)',
        shadowColor: '#2D5C6E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    pendingCancelBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    pendingRow3: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    pendingInfoLabel: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '500',
        opacity: 0.8,
    },
    pendingInfoValue: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    pendingReqCol: {
        alignItems: 'flex-end',
    },
    pendingDivider: {
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginTop: 8,
    },
    separatorGrid: {
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    // --- Confirmation Modal Styles ---
    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    confirmModal: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    confirmTitle: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    confirmMessage: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    confirmButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmYesBtn: {
        backgroundColor: '#FF5252',
    },
    confirmYesText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    confirmNoBtn: {
        backgroundColor: '#E0E0E0',
    },
    confirmNoText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default TradesScreen;
