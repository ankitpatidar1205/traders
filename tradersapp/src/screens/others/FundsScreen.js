import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';

const FundsScreen = ({ navigation }) => {
    const { ledgerBalance } = useTrades();
    const [refreshing, setRefreshing] = useState(false);

    // Dynamic transaction list based on actual context balance
    const TRANSACTIONS = [
        { id: '1', date: '2026-02-23 00:00:00', amount: `+${ledgerBalance.toFixed(0)}`, type: 'credit' },
    ];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const renderItem = ({ item }) => {
        const isPositive = item.type === 'credit';
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.dateText}>{item.date}</Text>
                <View style={[
                    styles.amountBox,
                    { backgroundColor: isPositive ? '#2D864D' : '#E53935' }
                ]}>
                    <Text style={styles.amountText}>{item.amount}</Text>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Funds</Text>
            </View>

            {/* Current Balance Summary */}
            <View style={styles.balanceSummary}>
                <Text style={styles.balanceLabel}>Current Ledger Balance</Text>
                <Text style={styles.balanceValue}>₹ {ledgerBalance.toLocaleString()}</Text>
            </View>

            <FlatList
                data={TRANSACTIONS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="white"
                        colors={['#2D864D']}
                    />
                }
            />
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
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: 'black',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 12,
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    balanceSummary: {
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 15,
        marginTop: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    balanceLabel: {
        color: '#B0BEC5',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    balanceValue: {
        color: 'white',
        fontSize: 22,
        fontWeight: '700',
    },
    listContent: {
        paddingTop: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dateText: {
        color: '#B0BEC5',
        fontSize: 11,
        fontWeight: '500',
    },
    amountBox: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 2,
        minWidth: 80,
        alignItems: 'center',
    },
    amountText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 10,
    }
});

export default FundsScreen;
