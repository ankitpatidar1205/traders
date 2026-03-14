import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    TextInput, Modal, Switch, ScrollView, Alert,
} from 'react-native';
import {
    ChevronLeft, Bell, Plus, Trash2, RefreshCw,
    TrendingUp, TrendingDown, Clock, Zap, Target,
    CheckCircle, AlertTriangle
} from 'lucide-react-native';
import { useTrades } from '../../context/TradeContext';
import ScreenWrapper from '../../components/ScreenWrapper';

// ── Helpers ────────────────────────────────────────────────────────
const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// ── Main Screen ───────────────────────────────────────────────────
const AlertsScreen = ({ navigation }) => {
    const {
        userAlerts, addUserAlert, removeUserAlert, resetUserAlert,
        alertSettings, updateAlertSetting, watchlist,
    } = useTrades();

    const [activeTab, setActiveTab] = useState('alerts');
    const [showModal, setShowModal] = useState(false);
    const [newSymbol, setNewSymbol] = useState('');
    const [newType, setNewType] = useState('above');
    const [newPrice, setNewPrice] = useState('');

    const symbolList = [...new Set(watchlist.map(w => w.name))];

    const handleAdd = () => {
        if (!newSymbol) { Alert.alert('Error', 'Please select a symbol.'); return; }
        if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
            Alert.alert('Error', 'Enter a valid target price.');
            return;
        }
        addUserAlert({ symbol: newSymbol, type: newType, targetPrice: parseFloat(newPrice) });
        setShowModal(false);
        setNewSymbol(''); setNewPrice('');
    };

    // ── Alert Card ──────────────────────────────────────────────
    const renderAlert = ({ item }) => {
        const triggered = item.status === 'triggered';
        const TypeIcon = item.type === 'above' ? TrendingUp : TrendingDown;
        const typeColor = item.type === 'above' ? '#68D391' : '#FC8181';

        return (
            <View style={[styles.card, triggered && styles.cardDone]}>
                <View style={styles.cardLeft}>
                    <View style={[styles.cardIconBg, { backgroundColor: typeColor + '18' }]}>
                        <TypeIcon size={18} color={typeColor} />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardSymbol}>{item.symbol}</Text>
                        <Text style={[styles.cardTarget, { color: typeColor }]}>
                            {item.type === 'above' ? 'Above' : 'Below'} ₹{item.targetPrice.toLocaleString('en-IN')}
                        </Text>
                        {triggered ? (
                            <View style={styles.triggeredRow}>
                                <CheckCircle size={12} color="#68D391" />
                                <Text style={styles.triggeredText}>
                                    Triggered at {formatTime(item.triggeredAt)}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.watchingText}>⏳ Watching...</Text>
                        )}
                    </View>
                </View>

                <View style={styles.cardActions}>
                    {triggered && (
                        <TouchableOpacity style={styles.resetBtn} onPress={() => resetUserAlert(item.id)}>
                            <RefreshCw size={15} color="#63B3ED" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => removeUserAlert(item.id)}>
                        <Trash2 size={16} color="rgba(255,255,255,0.25)" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // ── Settings Row ────────────────────────────────────────────
    const SettingRow = ({ icon: Icon, title, subtitle, settingKey, color }) => (
        <View style={styles.settingRow}>
            <View style={[styles.settingIconBg, { backgroundColor: color + '18' }]}>
                <Icon size={18} color={color} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
            </View>
            <Switch
                value={!!alertSettings[settingKey]}
                onValueChange={val => updateAlertSetting(settingKey, val)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: color }}
                thumbColor="#fff"
            />
        </View>
    );

    const activeCount = userAlerts.filter(a => a.status === 'active').length;
    const triggeredCount = userAlerts.filter(a => a.status === 'triggered').length;

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Price Alerts</Text>
                {activeTab === 'alerts' ? (
                    <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
                        <Plus size={24} color="#CFD1C4" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 32 }} />
                )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>{activeCount}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#68D391' }]}>{triggeredCount}</Text>
                    <Text style={styles.statLabel}>Triggered</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#63B3ED' }]}>
                        {Object.values(alertSettings).filter(v => v === true).length}
                    </Text>
                    <Text style={styles.statLabel}>Categories ON</Text>
                </View>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {[['alerts', '🔔 My Alerts'], ['settings', '⚙️ Settings']].map(([key, label]) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.tabItem, activeTab === key && styles.tabActive]}
                        onPress={() => setActiveTab(key)}
                    >
                        <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Tab: My Alerts ── */}
            {activeTab === 'alerts' ? (
                <FlatList
                    data={userAlerts}
                    keyExtractor={item => item.id}
                    renderItem={renderAlert}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Bell size={52} color="rgba(255,255,255,0.12)" />
                            <Text style={styles.emptyTitle}>No Price Alerts Set</Text>
                            <Text style={styles.emptySub}>Tap + to create your first alert</Text>
                            <TouchableOpacity style={styles.emptyCreateBtn} onPress={() => setShowModal(true)}>
                                <Plus size={16} color="#1a1a2e" />
                                <Text style={styles.emptyCreateBtnText}>Create Alert</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            ) : (
                /* ── Tab: Settings ── */
                <ScrollView contentContainerStyle={styles.settingsScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.groupLabel}>ALERT CATEGORIES</Text>

                    <SettingRow
                        icon={Target} title="Price Level Alerts"
                        subtitle="Alert when stock crosses your target price"
                        settingKey="priceAlerts" color="#63B3ED"
                    />
                    <SettingRow
                        icon={TrendingUp} title="% Change Alerts"
                        subtitle={`Alert when stock moves ≥${alertSettings.percentThreshold || 2}% from open`}
                        settingKey="percentChange" color="#68D391"
                    />
                    <SettingRow
                        icon={Clock} title="Market Timing"
                        subtitle="Open (9:15), Closing Soon (3:15), Closed (3:30)"
                        settingKey="marketTiming" color="#F6AD55"
                    />
                    <SettingRow
                        icon={Zap} title="Technical Signals"
                        subtitle="RSI overbought / oversold based on price momentum"
                        settingKey="technical" color="#FC8181"
                    />
                    <SettingRow
                        icon={Bell} title="Trade Execution"
                        subtitle="Buy, Sell, Stop-Loss, Target hit alerts"
                        settingKey="tradeAlerts" color="#CFD1C4"
                    />

                    {/* % Change Threshold */}
                    <Text style={[styles.groupLabel, { marginTop: 24 }]}>% CHANGE THRESHOLD</Text>
                    <View style={styles.threshCard}>
                        <Text style={styles.threshLabel}>
                            Alert when stock moves this much from open:
                        </Text>
                        <View style={styles.threshBtns}>
                            {[1, 2, 3, 5].map(v => (
                                <TouchableOpacity
                                    key={v}
                                    style={[styles.threshBtn, alertSettings.percentThreshold === v && styles.threshBtnActive]}
                                    onPress={() => updateAlertSetting('percentThreshold', v)}
                                >
                                    <Text style={[styles.threshBtnText, alertSettings.percentThreshold === v && styles.threshBtnTextActive]}>
                                        {v}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <AlertTriangle size={16} color="#F6AD55" />
                        <Text style={styles.infoText}>
                            Market Timing alerts fire automatically at 9:15, 15:15, and 15:30 IST based on your device clock.
                        </Text>
                    </View>
                </ScrollView>
            )}

            {/* ── Add Alert Modal ── */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Set Price Alert</Text>

                        {/* Symbol picker */}
                        <Text style={styles.modalLabel}>Select Symbol</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                            {symbolList.map(sym => (
                                <TouchableOpacity
                                    key={sym}
                                    style={[styles.chip, newSymbol === sym && styles.chipActive]}
                                    onPress={() => setNewSymbol(sym)}
                                >
                                    <Text style={[styles.chipText, newSymbol === sym && styles.chipTextActive]}>
                                        {sym}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Alert type */}
                        <Text style={styles.modalLabel}>Alert When Price</Text>
                        <View style={styles.typeRow}>
                            {[['above', '📈 Goes Above', '#68D391'], ['below', '📉 Falls Below', '#FC8181']].map(([t, l, c]) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeBtn, newType === t && { borderColor: c, backgroundColor: c + '18' }]}
                                    onPress={() => setNewType(t)}
                                >
                                    <Text style={[styles.typeBtnText, newType === t && { color: c }]}>{l}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Price input */}
                        <Text style={styles.modalLabel}>Target Price (₹)</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="e.g. 5800"
                            placeholderTextColor="rgba(255,255,255,0.25)"
                            keyboardType="numeric"
                            value={newPrice}
                            onChangeText={setNewPrice}
                            cursorColor="white"
                        />
                        <View style={styles.inputLine} />

                        {/* Buttons */}
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowModal(false); setNewSymbol(''); setNewPrice(''); }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                                <Bell size={15} color="#1a1a2e" />
                                <Text style={styles.saveBtnText}>Set Alert</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12 },
    backBtn: { padding: 4 },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    addBtn: { padding: 4 },

    statsRow: { flexDirection: 'row', marginHorizontal: 15, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, marginBottom: 12, padding: 14 },
    statBox: { flex: 1, alignItems: 'center' },
    statNum: { color: '#CFD1C4', fontSize: 22, fontWeight: 'bold' },
    statLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

    tabBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', marginHorizontal: 15, borderRadius: 12, marginBottom: 12, padding: 4 },
    tabItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
    tabActive: { backgroundColor: '#CFD1C4' },
    tabText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
    tabTextActive: { color: '#1a1a2e', fontWeight: '700' },

    // Alert Card
    list: { paddingHorizontal: 15, paddingBottom: 40 },
    card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(207,209,196,0.08)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(99,179,237,0.2)' },
    cardDone: { backgroundColor: 'rgba(104,211,145,0.06)', borderColor: 'rgba(104,211,145,0.2)' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    cardIconBg: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardBody: { flex: 1 },
    cardSymbol: { color: 'white', fontSize: 16, fontWeight: '700' },
    cardTarget: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    triggeredRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    triggeredText: { color: '#68D391', fontSize: 11 },
    watchingText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3 },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    resetBtn: { padding: 8 },
    deleteBtn: { padding: 8 },

    emptyBox: { alignItems: 'center', marginTop: 70 },
    emptyTitle: { color: 'white', fontSize: 17, fontWeight: '700', marginTop: 14 },
    emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 },
    emptyCreateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#CFD1C4', paddingVertical: 11, paddingHorizontal: 22, borderRadius: 10, marginTop: 20 },
    emptyCreateBtnText: { color: '#1a1a2e', fontSize: 14, fontWeight: '800' },

    // Settings
    settingsScroll: { paddingHorizontal: 15, paddingBottom: 40 },
    groupLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
    settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(207,209,196,0.06)', borderRadius: 12, padding: 14, marginBottom: 10 },
    settingIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    settingInfo: { flex: 1 },
    settingTitle: { color: 'white', fontSize: 15, fontWeight: '600' },
    settingSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },

    threshCard: { backgroundColor: 'rgba(207,209,196,0.06)', borderRadius: 12, padding: 14, marginBottom: 14 },
    threshLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 12 },
    threshBtns: { flexDirection: 'row', gap: 10 },
    threshBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    threshBtnActive: { backgroundColor: 'rgba(207,209,196,0.15)', borderColor: '#CFD1C4' },
    threshBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '700' },
    threshBtnTextActive: { color: '#CFD1C4' },

    infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(246,173,85,0.08)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(246,173,85,0.2)' },
    infoText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18, flex: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#151c2b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    modalLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginTop: 16 },
    chipScroll: { marginBottom: 4 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
    chipActive: { backgroundColor: 'rgba(207,209,196,0.2)', borderColor: '#CFD1C4' },
    chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#CFD1C4' },
    typeRow: { flexDirection: 'row', gap: 10 },
    typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' },
    typeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
    priceInput: { color: 'white', fontSize: 28, fontWeight: 'bold', paddingVertical: 6 },
    inputLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 24 },
    modalBtns: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
    cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' },
    saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 10, backgroundColor: '#CFD1C4' },
    saveBtnText: { color: '#1a1a2e', fontSize: 15, fontWeight: '800' },
});

export default AlertsScreen;
