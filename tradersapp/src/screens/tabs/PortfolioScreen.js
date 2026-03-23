import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTrades, INSTRUMENT_META } from '../../context/TradeContext';
import ScreenWrapper from '../../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const PortfolioScreen = () => {
    const { activePL, marginAvailable, ledgerBalance, marginUsed, trades, livePrices } = useTrades();

    const StatCard = ({ label, value, color = '#FFFFFF', isPositive = true }) => (
        <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={[styles.cardValue, { color: color }]}>{value}</Text>
        </View>
    );

    const SegmentCard = ({ title, segments }) => (
        <View style={styles.segmentCard}>
            <Text style={styles.segmentTitle}>{title}</Text>
            {segments.map((seg, idx) => (
                <View key={idx} style={styles.segmentRow}>
                    <Text style={styles.segmentLabel}>{seg.name}</Text>
                    <Text style={[styles.segmentValue, { color: seg.color }]}>{seg.value}</Text>
                </View>
            ))}
        </View>
    );

    const TradeCard = ({ trade }) => {
        const livePrice = livePrices[trade.name] || parseFloat(trade.entryPrice);
        const meta = INSTRUMENT_META[trade.name] || { multiplier: 1 };
        const pnl = (livePrice - parseFloat(trade.entryPrice)) * parseInt(trade.qty) * meta.multiplier * (trade.type === 'BUY' ? 1 : -1);
        const margin = Math.abs(parseInt(trade.qty) * 50000 / 1000); // Simplified margin calculation

        return (
            <View style={styles.tradeCard}>
                <View style={styles.tradeHeaderTop}>
                    <View style={styles.tradeLabelContainer}>
                        <Text style={styles.tradeLabel}>{trade.type === 'BUY' ? 'Bought' : 'Sold'}</Text>
                        <View style={styles.qtyBadge}>
                            <Text style={styles.tradeQty}>QTY {trade.qty}</Text>
                        </View>
                    </View>
                    <View style={styles.marginSection2}>
                        <Text style={styles.marginLabel2}>Margin</Text>
                        <Text style={styles.marginValue2}>{Math.round(margin).toString().padStart(3, '0')}</Text>
                    </View>
                </View>

                <View style={styles.tradeDetails}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.tradeName}>{trade.displayName}</Text>
                        <View style={styles.priceInfoContainer}>
                            <Text style={styles.priceLabel}>Avg </Text>
                            <Text style={styles.priceValue}>{parseFloat(trade.entryPrice).toLocaleString('en-IN')}</Text>
                            <Text style={styles.priceLabel}> • CMP </Text>
                            <Text style={styles.priceValue}>{livePrice.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tradeFooter}>
                    <View style={styles.plContainer}>
                        <Text style={styles.plLabel}>P/L </Text>
                        <Text style={styles.plValue}>
                            {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </Text>
                    </View>
                    <LinearGradient
                        colors={['#f87d7d', '#fa854a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.closeButton}
                    >
                        <TouchableOpacity onPress={() => Alert.alert('Close Trades', `Close ${trade.displayName}?`)}>
                            <Text style={styles.closeButtonText}>Close Trades</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Portfolio</Text>
                </View>

                {/* Unified Stats & Margin Card */}
                <View style={styles.section}>
                    <View style={styles.unifiedCard}>
                        {/* Top Row - Ledger Balance & Margin Available */}
                        <View style={styles.topRow}>
                            <View style={styles.topItem}>
                                <Text style={styles.statLabel}>Ledger Balance</Text>
                                <Text style={styles.statValue}>
                                    {ledgerBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                            <View style={styles.topItem}>
                                <Text style={styles.statLabel}>Margin Available</Text>
                                <Text style={styles.statValue}>
                                    {marginAvailable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                        </View>

                        {/* Divider between top and second row */}
                        <View style={styles.divider} />

                        {/* Second Row - Active P/L & M2M */}
                        <View style={styles.topRow}>
                            <View style={styles.topItem}>
                                <Text style={styles.statLabel}>Active P/L</Text>
                                <Text style={styles.statValue}>
                                    {activePL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                            <View style={styles.topItem}>
                                <Text style={styles.statLabel}>M2M</Text>
                                <Text style={styles.statValue}>
                                    {activePL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Holding Margin Required - Vertical List */}
                        <View style={styles.marginSection}>
                            <View style={styles.marginRow}>
                                <Text style={styles.marginTitleText}>Holding Margin Required:</Text>
                                <Text style={styles.marginRowValue}>5318</Text>
                            </View>
                            <View style={styles.marginRow}>
                                <Text style={styles.marginRowLabel}>NSE / BSE</Text>
                                <Text style={styles.marginRowValue}>0</Text>
                            </View>
                            <View style={styles.marginRow}>
                                <Text style={styles.marginRowLabel}>MCX</Text>
                                <Text style={styles.marginRowValue}>5318</Text>
                            </View>
                            <View style={styles.marginRow}>
                                <Text style={styles.marginRowLabel}>Options</Text>
                                <Text style={styles.marginRowValue}>0</Text>
                            </View>
                            <View style={styles.marginRow}>
                                <Text style={styles.marginRowLabel}>COMEX</Text>
                                <Text style={styles.marginRowValue}>0</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Active Trades */}
                {trades && trades.filter(t => !t.isCompleted && !t.isPending).length > 0 && (
                    <View style={styles.section}>
                        {trades.filter(t => !t.isCompleted && !t.isPending).map((trade, idx) => (
                            <TradeCard key={idx} trade={trade} />
                        ))}
                    </View>
                )}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#E8E8E8',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    unifiedCard: {
        // backgroundColor: 'rgba(22, 88, 142, 0.4)',
        // backgroundColor: 'rgb(35, 76, 99)',
        backgroundColor: 'rgba(18, 70, 95, 1)',
        borderRadius: 16,
        padding: 16,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    topItem: {
        flex: 1,
        paddingHorizontal: 6,
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.4,
    },
    statValue: {
        color: '#E8E8E8',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    divider: {
        height: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: 8,
    },
    marginSection: {
        marginTop: 4,
    },
    marginRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
    },
    marginTitleText: {
        color: '#E8E8E8',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    marginRowLabel: {
        color: '#CBD5E1',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    marginRowValue: {
        color: '#E8E8E8',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    cardsGrid: {
        flexDirection: 'row',
        gap: 0,
    },
    statCard: {
        backgroundColor: 'rgba(142, 87, 87, 0.08)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    cardLabel: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    segmentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    segmentTitle: {
        color: '#E8E8E8',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.2,
        marginBottom: 14,
    },
    segmentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    },
    segmentLabel: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    segmentValue: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    tradeCard: {
        backgroundColor: 'rgba(10, 35, 60, 0.8)',
        borderRadius: 16,
        padding: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 12,
    },
    tradeHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    tradeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tradeLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tradeLabel: {
        color: '#4CAF50',
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 6,
        letterSpacing: 0.3,
    },
    qtyBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    tradeQty: {
        color: '#CBD5E1',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    tradeMargin: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    marginSection2: {
        alignItems: 'flex-end',
    },
    marginLabel2: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    marginValue2: {
        color: '#E8E8E8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    tradeDetails: {
        marginBottom: 12,
    },
    tradeName: {
        color: '#E8E8E8',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    priceInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    priceValue: {
        color: '#E8E8E8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    tradePriceInfo: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    tradeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    plContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    plLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E8E8E8',
        letterSpacing: 0.3,
    },
    plValue: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FF6B5B',
        letterSpacing: 0.3,
    },
    tradePL: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FF6B5B',
        letterSpacing: 0.3,
    },
    closeButton: {
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    closeButtonText: {
        color: '#1a1a1a',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default PortfolioScreen;
