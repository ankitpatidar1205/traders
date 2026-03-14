import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    StatusBar,
    ScrollView,
    ImageBackground,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';
import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const OrderDetailScreen = ({ route, navigation }) => {
    const { name = 'ALUMINIUM', item = {} } = route.params || {};
    const { addTrade, addNotification, livePrices } = useTrades();
    const livePrice = livePrices[name] || item.ltp || '308.15';

    const displayItemName = name.includes('26FEBFUT') ? name : `${name.toUpperCase()}26FEBFUT`;

    const [activeTab, setActiveTab] = useState('Market');
    const [orderType, setOrderType] = useState('Mega');
    const [lots, setLots] = useState('1');
    const [price, setPrice] = useState(item.ltp || '308.15');
    const [modalVisible, setModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleOrder = (type, tradePrice) => {
        const isMarket = activeTab === 'Market';
        const finalPrice = isMarket ? (type === 'BUY' ? (item.price2 || '308.25') : (item.ltp || '308.15')) : price;

        addTrade({
            name: name,
            displayName: displayItemName,
            type: type,
            qty: lots,
            price: finalPrice,
            market: 'F&O',
            isCompleted: false,
            isPending: !isMarket // Market orders are Active, Order tab is Pending
        });

        // Add Notification
        const action = type === 'SELL' ? 'Sold' : 'Bought';
        addNotification({
            title: `${isMarket ? 'Market' : 'Limit'} Order placed`,
            message: `${action} ${lots} lots of ${displayItemName} at ${finalPrice}`,
            type: 'success'
        });

        setSuccessMessage(`${isMarket ? 'Market' : 'Limit'} ${type} Success\n${action} ${lots} lots of ${displayItemName}\nAT ${finalPrice}`);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        // Navigate to the Trades tab so user can see the placed order immediately
        navigation.navigate('Main', { screen: 'Trades' });
    };

    return (
        <ScreenWrapper>
            {/* Header with X in Top Right */}
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.title}>{displayItemName}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Market / Order Tabs */}
                <View style={styles.tabOuter}>
                    <TouchableOpacity
                        style={[
                            styles.tabPart,
                            activeTab === 'Market' ? styles.bgActive : styles.bgInactive
                        ]}
                        onPress={() => setActiveTab('Market')}
                    >
                        <Text style={[styles.tabLabel, activeTab === 'Market' ? styles.labelDark : styles.labelWhite]}>Market</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabPart,
                            activeTab === 'Order' ? styles.bgActive : styles.bgInactive
                        ]}
                        onPress={() => setActiveTab('Order')}
                    >
                        <Text style={[styles.tabLabel, activeTab === 'Order' ? styles.labelDark : styles.labelWhite]}>Order</Text>
                    </TouchableOpacity>
                </View>


                {/* Form Fields - Label changed to Quantity as per user request */}
                <View style={styles.fieldBlock}>
                    <Text style={styles.hintLabel}>Quantity</Text>
                    <TextInput
                        style={styles.valInput}
                        value={lots}
                        onChangeText={setLots}
                        keyboardType="numeric"
                    />
                    <View style={styles.lineDivider} />
                </View>

                {activeTab === 'Order' && (
                    <View style={styles.fieldBlock}>
                        <Text style={styles.hintLabel}>Price</Text>
                        <TextInput
                            style={styles.valInput}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                        <View style={styles.lineDivider} />
                    </View>
                )}

                {/* Market mode Sell/Buy Boxes (From 2nd photo) */}
                {activeTab === 'Market' ? (
                    <View style={styles.marketPriceRow}>
                        <TouchableOpacity
                            style={[styles.marketPriceBtn, { backgroundColor: '#C44655' }]}
                            onPress={() => handleOrder('SELL', livePrice)}
                        >
                            <Text style={styles.marketPriceLabel}>Sell @</Text>
                            <Text style={styles.marketPriceVal}>{livePrice}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.marketPriceBtn, { backgroundColor: '#2D864D' }]}
                            onPress={() => handleOrder('BUY', livePrice)} // In real app, buy price might be slightly higher
                        >
                            <Text style={styles.marketPriceLabel}>Buy @</Text>
                            <Text style={styles.marketPriceVal}>{livePrice}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Order mode Buttons */
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={[styles.btnAction, { backgroundColor: '#C44655' }]}
                            onPress={() => handleOrder('SELL', price)}
                        >
                            <Text style={styles.btnActionText}>Place Sell Order</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnAction, { backgroundColor: '#2D854D' }]}
                            onPress={() => handleOrder('BUY', price)}
                        >
                            <Text style={styles.btnActionText}>Place Buy Order</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Stock Detail Stats - 3 Columns */}
                <View style={styles.statsWrapper}>
                    <StatRow label="Bid" value={item.price1 || '308.1'} />
                    <StatRow label="Ask" value={item.price2 || '308.3'} />
                    <StatRow label="Last" value={item.ltp || '308.3'} />

                    <StatRow label="High" value={item.high || '309.95'} />
                    <StatRow label="Low" value={item.low || '307.3'} />
                    <StatRow label="Change" value={item.change || '1.05'} />

                    <StatRow label="Open" value={item.open || '308.05'} />
                    <StatRow label="Volume" value={item.vol || '539'} />
                    <StatRow label="Last Traded Qty" value="1" />

                    <StatRow label="Atp" value="308.08" />
                    <StatRow label="Lot Size" value="5000" />
                    <StatRow label="Open Interest" value="1785" />

                    <StatRow label="Bid Qty" value="107" />
                    <StatRow label="Ask Qty" value="145" />
                    <StatRow label="Prev. Close" value="307.25" />

                    <StatRow label="Upper Circuit" value="320.55" />
                    <StatRow label="Lower Circuit" value="295.95" />
                </View>

            </ScrollView>

            {/* Success Feedback Modal */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.modalBgLayer}>
                    <View style={styles.modalBoxCard}>
                        <View style={styles.successIconBox}>
                            <Check size={40} color="white" />
                        </View>
                        <Text style={styles.modalHeadingText}>Success</Text>
                        <Text style={styles.modalBodyText}>{successMessage}</Text>
                        <TouchableOpacity style={styles.modalDoneBtn} onPress={handleModalClose}>
                            <Text style={styles.modalDoneText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};


const StatRow = ({ label, value }) => (
    <View style={styles.statCell}>
        <Text style={styles.statCellLabel}>{label}</Text>
        <Text style={styles.statCellValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    closeBtn: {
        padding: 5,
    },
    content: {
        paddingHorizontal: 15,
        paddingTop: 5,
    },
    tabOuter: {
        flexDirection: 'row',
        height: 44,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    tabPart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgActive: {
        backgroundColor: '#FFFFFF',
    },
    bgInactive: {
        backgroundColor: '#1E2D44',
    },
    tabLabel: {
        fontSize: 17,
        fontWeight: '600',
    },
    labelWhite: {
        color: 'white',
    },
    labelDark: {
        color: '#1E2D44',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    radioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioCircle: {
        width: 17,
        height: 17,
        borderRadius: 8.5,
        borderWidth: 1.5,
        borderColor: '#757575',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    radioDot: {
        width: 11,
        height: 11,
        borderRadius: 5.5,
        backgroundColor: '#63B3ED',
    },
    radioText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '500',
    },
    fieldBlock: {
        marginTop: 10,
        marginBottom: 20,
    },
    hintLabel: {
        color: 'white',
        fontSize: 17,
    },
    valInput: {
        color: 'white',
        fontSize: 20,
        height: 32,
        padding: 0,
        fontWeight: '500',
    },
    lineDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginTop: 5,
    },
    marketPriceRow: {
        flexDirection: 'row',
        height: 60,
        marginTop: 15, // Gap added back
        marginBottom: 20,
        borderRadius: 2,
        overflow: 'hidden',
    },
    marketPriceBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    marketPriceLabel: {
        color: 'white',
        fontSize: 14,
    },
    marketPriceVal: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15, // Gap added back
        marginVertical: 15,
    },
    btnAction: {
        flex: 0.49,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },
    btnActionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    statCell: {
        width: '33.33%',
        marginBottom: 15, // Increased vertical gap to match screenshot
    },
    statCellLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 2,
    },
    statCellValue: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBgLayer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBoxCard: {
        backgroundColor: 'white',
        width: '80%',
        padding: 25,
        borderRadius: 12,
        alignItems: 'center',
    },
    successIconBox: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalHeadingText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 8,
    },
    modalBodyText: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
        marginBottom: 18,
    },
    modalDoneBtn: {
        backgroundColor: '#2E7D32',
        paddingVertical: 10,
        paddingHorizontal: 35,
        borderRadius: 4,
    },
    modalDoneText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemWrapper: {
        paddingVertical: 6,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 15,
        alignItems: 'flex-start',
    },
});

export default OrderDetailScreen;