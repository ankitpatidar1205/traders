import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    TextInput,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, Square } from 'lucide-react-native';
import { useTrades } from '../../context/TradeContext';

import ScreenWrapper from '../../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }) => {
    const { watchlist, toggleWatchlist, globalSearchData } = useTrades();
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredData(globalSearchData);
        } else {
            const lowerFilter = searchText.toLowerCase();
            const filtered = globalSearchData.filter(item =>
                item.name.toLowerCase().includes(lowerFilter)
            );
            setFilteredData(filtered);
        }
    }, [searchText, globalSearchData]);

    const isAdded = (name) => watchlist.some(item => item.name === name);

    const renderItem = ({ item }) => {
        const added = isAdded(item.name);
        const isNegative = parseFloat(item.change || '0') < 0;
        const boxColor = isNegative ? '#C64756' : '#2D864D';

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={styles.itemRow}
                    activeOpacity={0.7}
                    onPress={() => toggleWatchlist(item)}
                >
                    <View style={styles.leftCol}>
                        <Text style={styles.symbolName}>{item.name.toUpperCase()}</Text>
                        <Text style={styles.subText}>{item.date || '2026-02-27'}</Text>
                        <Text style={styles.labelValueText}>
                            Chg:{item.change || '0.00'} H:{item.high || '0.00'}
                        </Text>
                    </View>

                    <View style={styles.priceCol}>
                        <View style={[styles.priceBox, { backgroundColor: boxColor }]}>
                            <Text style={styles.priceValText}>{item.ltp}</Text>
                        </View>
                        <Text style={styles.labelValueText}>L: {item.low || '0.00'}</Text>
                    </View>

                    <View style={styles.priceCol}>
                        <View style={[styles.priceBox, { backgroundColor: boxColor }]}>
                            <Text style={styles.priceValText}>{item.price2 || item.open}</Text>
                        </View>
                        <Text style={styles.labelValueText}>O: {item.open || '0.00'}</Text>
                    </View>

                    <View style={styles.checkCol}>
                        {added ? (
                            <View style={[styles.checkSquare, { backgroundColor: '#4CAF50' }]}>
                                <Check size={14} color="white" strokeWidth={3} />
                            </View>
                        ) : (
                            <Square size={22} color="white" opacity={0.8} />
                        )}
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} />
            </View>
        );
    };

    return (
        <ScreenWrapper>
            {/* Header (Exact UI) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={30} color="white" />
                </TouchableOpacity>

                <TextInput
                    style={styles.headerInput}
                    placeholder="Search & add"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus={true}
                    cursorColor="white"
                />

                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            />
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    backBtn: {
        marginRight: 10,
    },
    headerInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    clearBtnText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'flex-start',
    },
    leftCol: {
        flex: 1.4,
        justifyContent: 'center',
    },
    priceCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    checkCol: {
        width: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    symbolName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    subText: {
        color: 'white',
        fontSize: 11,
        opacity: 0.8,
        marginBottom: 2,
    },
    labelValueText: {
        color: 'white',
        fontSize: 11,
        opacity: 0.8,
        fontWeight: '500',
    },
    priceBox: {
        paddingHorizontal: 0,
        paddingVertical: 8,
        borderRadius: 6,
        width: '90%',
        maxWidth: 100,
        alignItems: 'center',
        marginBottom: 6,
    },
    priceValText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    checkSquare: {
        width: 20,
        height: 20,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 15,
    }
});

export default SearchScreen;
