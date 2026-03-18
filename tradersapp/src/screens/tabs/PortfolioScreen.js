import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ImageBackground,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const PortfolioScreen = () => {
    const { activePL, marginAvailable, ledgerBalance, marginUsed } = useTrades();

    return (
        <ScreenWrapper>
            {/* Portfolio Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Portfolio</Text>
            </View>

            {/* Stats Layout */}
            <View style={styles.contentContainer}>

                {/* Row 1: Ledger & Margin */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Ledger Balance</Text>
                        <Text style={styles.statValue}>{ledgerBalance.toFixed(0)}</Text>
                    </View>
                    <View style={styles.spacer} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Margin Available</Text>
                        <Text style={styles.statValue}>{marginAvailable.toFixed(0)}</Text>
                    </View>
                </View>
                <View style={styles.divider} />

                {/* Row 2: Active P/L & M2M */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Active P/L</Text>
                        <Text style={[styles.statValue, { color: activePL >= 0 ? '#4CAF50' : '#FF5252' }]}>
                            {activePL.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.spacer} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>M2M</Text>
                        <Text style={[styles.statValue, { color: activePL >= 0 ? '#4CAF50' : '#FF5252' }]}>
                            {activePL.toFixed(2)}
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />

                {/* Row 3: Net Holding Margin */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Net Holding Margin Needed</Text>
                        <Text style={styles.statValue}>{marginUsed.toFixed(0)}</Text>
                    </View>
                </View>

            </View>
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
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingVertical: 10,
    },
    statBox: {
        flex: 1,
        paddingHorizontal: 8,
    },
    spacer: {
        width: 12,
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: '100%',
        marginVertical: 2,
    },
});

export default PortfolioScreen;
