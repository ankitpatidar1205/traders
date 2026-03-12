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
import { useTrades } from '../context/TradeContext';

import ScreenWrapper from '../components/ScreenWrapper';

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

        // Colors from screenshot
        const boxColor = isNegative ? '#C64756' : '#2D864D';

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={styles.itemRow}
                    activeOpacity={0.7}
                    onPress={() => toggleWatchlist(item)}
                >
                    {/* Left Col: Symbol, Date, Lot */}
                    <View style={styles.leftCol}>
                        <Text style={styles.symbolName}>{item.name.toUpperCase()}</Text>
                        <Text style={styles.subText}>{item.date || '2026-02-27'}</Text>
                        <Text style={styles.subText}>Lot Size:{item.lot || '5000'}</Text>
                    </View>

                    {/* Middle Col: High Label */}
                    <View style={styles.midCol}>
                        <Text style={styles.labelValueText}>H:{item.high || '0.00'}</Text>
                        <View style={{ height: 28 }} />
                    </View>

                    {/* LTP Col: LTP Box + Low Label */}
                    <View style={styles.priceCol}>
                        <View style={[styles.priceBox, { backgroundColor: boxColor }]}>
                            <Text style={styles.priceValText}>{item.ltp}</Text>
                        </View>
                        <Text style={styles.labelValueText}>L: {item.low}</Text>
                    </View>

                    {/* Price2 Col: Price2 Box + Open Label */}
                    <View style={styles.priceCol}>
                        <View style={[styles.priceBox, { backgroundColor: boxColor }]}>
                            <Text style={styles.priceValText}>{item.price2 || item.open}</Text>
                        </View>
                        <Text style={styles.labelValueText}>O: {item.open}</Text>
                    </View>

                    {/* Checkbox Col */}
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
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    backBtn: {
        marginRight: 10,
    },
    headerInput: {
        flex: 1,
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },
    clearBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: 6, // Reduced from 12
        paddingHorizontal: 15,
        alignItems: 'flex-start',
    },
    leftCol: {
        flex: 1.5,
    },
    midCol: {
        flex: 0.8,
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    priceCol: {
        flex: 1,
        alignItems: 'flex-end',
        paddingRight: 8,
    },
    checkCol: {
        width: 30,
        alignItems: 'flex-end',
        paddingTop: 2,
    },
    symbolName: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subText: {
        color: 'white',
        fontSize: 13,
        opacity: 0.9,
    },
    labelValueText: {
        color: 'white',
        fontSize: 13,
        opacity: 0.9,
    },
    priceBox: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        minWidth: 70,
        alignItems: 'center',
        marginBottom: 4,
    },
    priceValText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
    checkSquare: {
        width: 20,
        height: 20,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 0.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 15,
    }
});

export default SearchScreen;
