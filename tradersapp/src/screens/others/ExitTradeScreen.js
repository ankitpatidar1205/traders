import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    ScrollView,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';

const ExitTradeScreen = ({ route, navigation }) => {
    const { trade } = route.params || {};
    const { closeTrade, livePrices, INSTRUMENT_META, addNotification } = useTrades();
    const [modalVisible, setModalVisible] = useState(false);

    if (!trade) return null;

    const meta = INSTRUMENT_META[trade.name] || { multiplier: 1 };
    const livePrice = livePrices[trade.name] || parseFloat(trade.entryPrice);
    const entryPrice = parseFloat(trade.entryPrice);
    const qty = parseInt(trade.qty);
    const isBuy = trade.type === 'BUY';
    const displayName = trade.displayName || (trade.name === 'CRUDEOIL' || trade.name === 'NATURALGAS' ? `${trade.name}26FEBFUT` : trade.name);


    // Calculate P/L
    const pl = (livePrice - entryPrice) * qty * meta.multiplier * (isBuy ? 1 : -1);
    const isProfit = pl >= 0;

    const handleExit = () => {
        const exitTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
        closeTrade(trade.id, livePrice.toFixed(2), exitTime);

        // Add Notification
        addNotification({
            title: 'Trade Closed',
            message: `${displayName} was closed at ${livePrice.toFixed(2)}. P/L: ${pl.toFixed(2)}`,
            type: isProfit ? 'success' : 'alert'
        });

        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        navigation.navigate('Main', { screen: 'Portfolio' });
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Exit Trade</Text>
            </View>

            {/* Symbol Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.symbolTitle}>{displayName}</Text>
            </View>

            {/* Exit Button */}
            <TouchableOpacity
                style={[styles.exitButton, { backgroundColor: isProfit ? '#2E7D32' : '#C62828' }]}
                onPress={handleExit}
            >
                <Text style={styles.exitButtonText}>
                    Exit {trade.type === 'BUY' ? 'Buy' : 'Sell'} in {isProfit ? 'profit' : 'loss'} of {Math.abs(pl).toFixed(0)}
                </Text>
            </TouchableOpacity>

            {/* Market Depth / Stats */}
            <ScrollView contentContainerStyle={styles.statsContainer}>
                <View style={styles.statsGrid}>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Bid : {(livePrice - 1).toFixed(0)}</Text>
                        <Text style={styles.statLabelRight}>Ask : {livePrice.toFixed(0)}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Last : {livePrice.toFixed(0)}</Text>
                        <Text style={styles.statLabelRight}>Change : 60</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>High : 5796</Text>
                        <Text style={styles.statLabelRight}>Low : 5763</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Open : 5764</Text>
                        <Text style={styles.statLabelRight}>Bid Qty : 314</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Close : 5709</Text>
                        <Text style={styles.statLabelRight}>Ask Qty : 326</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Volume : 5343</Text>
                        <Text style={styles.statLabelRight}>Last Traded Qty : 1</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Upper ckt : 5937</Text>
                        <Text style={styles.statLabelRight}>Open Interest : 11642</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Atp : 5778.64</Text>
                        <Text style={styles.statLabelRight}>Lower ckt : 5481</Text>
                    </View>
                    <View style={styles.statRow}>
                        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 5 }} />
                        <Text style={styles.statLabelRight}>Lot Size : {meta.multiplier}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Success Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleModalClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.iconContainer}>
                            <View style={styles.successIconCircle}>
                                <Check size={40} color="white" strokeWidth={4} />
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text style={styles.modalMessage}>
                            {isBuy ? 'Bought' : 'Sold'} {parseFloat(qty).toFixed(8)} lots of {displayName} AT {entryPrice}
                        </Text>

                        <TouchableOpacity style={styles.okButton} onPress={handleModalClose}>
                            <Text style={styles.okBtnText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F3D3E',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: 'black',
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    symbolTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    exitButton: {
        marginHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 30,
    },
    exitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsContainer: {
        paddingHorizontal: 20,
    },
    statsGrid: {
        marginTop: 10,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statLabel: {
        color: '#B0BEC5',
        fontSize: 16,
        flex: 1,
    },
    statLabelRight: {
        color: '#B0BEC5',
        fontSize: 16,
        flex: 1,
        textAlign: 'right',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '85%',
        paddingVertical: 35,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#C8E6C9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: 'black',
        marginBottom: 15,
    },
    modalMessage: {
        fontSize: 16,
        color: '#212121',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
        fontWeight: '600',
    },
    okButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 4,
        width: '60%',
        alignItems: 'center',
    },
    okBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ExitTradeScreen;
