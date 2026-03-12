import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import ScreenWrapper from '../components/ScreenWrapper';

const ProfileDetailsScreen = ({ navigation }) => {

    const renderCard = (title, children) => (
        <View style={styles.cardWrapper}>
            <Text style={styles.cardHeader}>{title.toUpperCase()}</Text>
            <View style={styles.card}>
                {children}
            </View>
        </View>
    );

    const renderDetailRow = (label, value, isLast = false) => (
        <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="white" size={32} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile Details</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60, paddingTop: 15 }}
            >

                {renderCard('NSE: Trading Enabled', (
                    <>
                        {renderDetailRow('Brokerage', '800 per crore')}
                        {renderDetailRow('Margin Intraday', 'Turnover / 500')}
                        {renderDetailRow('Margin Holding', 'Turnover / 100', true)}
                    </>
                ))}

                {renderCard('Index Options: Trading Enabled', (
                    <>
                        {renderDetailRow('Brokerage', '20 per lot')}
                        {renderDetailRow('Margin Intraday', 'Turnover / 5')}
                        {renderDetailRow('Margin Holding', 'Turnover / 2.000000', true)}
                    </>
                ))}

                {renderCard('Stock Options: Trading', (
                    <>
                        {renderDetailRow('Brokerage', '20.0000 per lot')}
                        {renderDetailRow('Margin Intraday', 'Turnover / 5')}
                        {renderDetailRow('Margin Holding', 'Turnover / 2', true)}
                    </>
                ))}

                {renderCard('MCX Options: Trading', (
                    <>
                        {renderDetailRow('Brokerage', '20.0000 per lot')}
                        {renderDetailRow('Margin Intraday', 'Turnover / 5')}
                        {renderDetailRow('Margin Holding', 'Turnover / 2', true)}
                    </>
                ))}

                {renderCard('MCX: Trading Enabled', (
                    <>
                        {renderDetailRow('Exposure Type', 'per lot')}
                        {renderDetailRow('Brokerage', '800 per lot')}
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Margin Intraday</Text>
                            <Text style={styles.commoditiesText}>
                                ALUMINI/1000, ALUMINIUM/1000, COPPER/10000, COTTON/1000, CRUDEOIL/10000, GOLD/10000, SILVER/15000, ZINC/10000
                            </Text>
                        </View>
                        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.label}>Margin Holding</Text>
                            <Text style={styles.commoditiesText}>
                                ALUMINI/1000, ALUMINIUM/1000, COPPER/10000, COTTON/1000, CRUDEOIL/10000, GOLD/10000, SILVER/15000, ZINC/10000
                            </Text>
                        </View>
                    </>
                ))}

                {renderCard('Comex: Trading', (
                    <>
                        {renderDetailRow('Brokerage', 'per crore')}
                        {renderDetailRow('Margin Intraday', 'Turnover /')}
                        {renderDetailRow('Margin Holding', 'Turnover /', true)}
                    </>
                ))}

                {renderCard('Forex: Trading', (
                    <>
                        {renderDetailRow('Brokerage', 'per crore')}
                        {renderDetailRow('Margin Intraday', 'Turnover /')}
                        {renderDetailRow('Margin Holding', 'Turnover /', true)}
                    </>
                ))}

            </ScrollView>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    backBtn: {
        marginRight: 8,
        marginLeft: -8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    cardWrapper: {
        marginBottom: 25,
        paddingHorizontal: 16,
    },
    cardHeader: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: 'rgba(28, 28, 30, 0.85)', // Semi-transparent for premium look
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#38383a',
    },
    label: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
    },
    value: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    commoditiesText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
        lineHeight: 18,
    }
});

export default ProfileDetailsScreen;
