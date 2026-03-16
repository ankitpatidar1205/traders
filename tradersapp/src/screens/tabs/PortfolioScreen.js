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
            {/* Centered Portfolio Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Portfolio</Text>
            </View>

            {/* Exact Stats Layout from Screenshot */}
            <View style={styles.contentContainer}>

                {/* Row 1: Ledger & Margin */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Ledger Balance</Text>
                        <Text style={styles.statValue}>{ledgerBalance.toFixed(0)}</Text>
                    </View>
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
        paddingVertical: 10, // Even more compact
        marginBottom: 5,
    },
    headerTitle: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12, // Increased for more space
    },
    statBox: {
        flex: 1,
    },
    statLabel: {
        color: 'white',
        fontSize: 14, // Reduced from 16
        fontWeight: '500',
        marginBottom: 4,
        opacity: 0.8,
    },
    statValue: {
        color: 'white',
        fontSize: 24, // Reduced from 28
        fontWeight: 'bold',
    },
    divider: {
        height: 1.2, // Thicker
        backgroundColor: 'rgba(255,255,255,0.25)', // Slightly more visible
        width: '100%',
        marginVertical: 0,
    },
});

export default PortfolioScreen;
