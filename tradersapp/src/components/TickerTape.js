import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useTrades } from '../context/TradeContext';

const { width } = Dimensions.get('window');

const TickerTape = () => {
    const { indices, adminNotifications } = useTrades();
    const scrollX = useRef(new Animated.Value(width)).current;

    // Filter unacknowledged alerts to show in ticker
    const items = useMemo(() => {
        let list = [];

        // 1. Add Indices
        indices.forEach(ind => {
            list.push({
                type: 'index',
                label: ind.name,
                value: ind.ltp,
                pct: ind.pct,
                isUp: parseFloat(ind.pct) >= 0
            });
        });

        // 2. Add LATEST ALERT if any
        const alert = adminNotifications.find(n => !n.acknowledged);
        if (alert) {
            list.push({
                type: 'alert',
                label: '⚠️ ALERT',
                value: alert.message
            });
        }

        return list;
    }, [indices, adminNotifications]);

    useEffect(() => {
        if (items.length === 0) return;

        // Simple and robust animation
        // Move from right-edge to far-left
        const startAnim = () => {
            scrollX.setValue(width);
            Animated.timing(scrollX, {
                toValue: -width * 5, // Far enough to clear very long alerts
                duration: 25000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) startAnim();
            });
        };

        const anim = startAnim();
        return () => scrollX.stopAnimation();
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.tickerContent,
                    { transform: [{ translateX: scrollX }] }
                ]}
            >
                {/* Single map, no complex mashup logic */}
                {items.map((item, idx) => (
                    <View key={idx} style={styles.item}>
                        {item.type === 'alert' ? (
                            <View style={styles.alertBox}>
                                <Text style={styles.alertLabel}>{item.label}: </Text>
                                <Text style={styles.alertValue}>{item.value}</Text>
                            </View>
                        ) : (
                            <View style={styles.indexBox}>
                                <Text style={styles.indexLabel}>{item.label}</Text>
                                <Text style={styles.indexValue}>{item.value}</Text>
                                <Text style={[styles.indexPct, { color: item.isUp ? '#48BB78' : '#F56565' }]}>
                                    {item.isUp ? '▲' : '▼'} {item.pct}%
                                </Text>
                            </View>
                        )}
                        {/* Huge gap after each item to prevent overlap */}
                        <View style={styles.spacer} />
                    </View>
                ))}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 32,
        backgroundColor: '#050a12',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(99,179,237,0.2)',
        overflow: 'hidden',
        justifyContent: 'center',
    },
    tickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        // Important: never allow wrapping
        flexWrap: 'nowrap',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
    indexBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
    indexLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '900',
        marginRight: 6,
    },
    indexValue: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    indexPct: {
        fontSize: 11,
        fontWeight: '900',
        marginLeft: 6,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(99,179,237,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(99,179,237,0.3)',
        flexWrap: 'nowrap',
    },
    alertLabel: {
        color: '#63B3ED',
        fontSize: 11,
        fontWeight: 'bold',
    },
    alertValue: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    spacer: {
        width: 150, // Massive fixed space to stop "mashup"
    }
});

export default TickerTape;
