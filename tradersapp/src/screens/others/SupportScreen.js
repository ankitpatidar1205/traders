import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions
} from 'react-native';
import { 
    ChevronLeft, 
    Headset, 
    MessageCircle, 
    Mail, 
    Plus,
    Ticket,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const SupportScreen = ({ navigation }) => {
    const [tickets, setTickets] = useState([
        { id: '1', title: 'Withdrawal Pending', date: '2026-03-12', status: 'Open', priority: 'High' },
        { id: '2', title: 'Login Issue', date: '2026-03-10', status: 'Closed', priority: 'Medium' },
        { id: '3', title: 'KYC Verification', date: '2026-03-08', status: 'Closed', priority: 'Low' },
    ]);

    const StatusBadge = ({ status }) => {
        const isOpen = status === 'Open';
        return (
            <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#FFE0E0' : '#E0FFE0' }]}>
                <Text style={[styles.statusBadgeText, { color: isOpen ? '#C64756' : '#2D864D' }]}>
                    {status}
                </Text>
            </View>
        );
    };

    const TicketItem = ({ item }) => (
        <View style={styles.ticketItem}>
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{item.title}</Text>
                <StatusBadge status={item.status} />
            </View>
            <View style={styles.ticketFooter}>
                <View style={styles.ticketInfoRow}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.ticketInfoText}>{item.date}</Text>
                </View>
                <Text style={[styles.priorityText, { color: item.priority === 'High' ? '#C64756' : '#666' }]}>
                    Priority: {item.priority}
                </Text>
            </View>
        </View>
    );

    const SupportAction = ({ icon: Icon, title, sub, onPress }) => (
        <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.actionIconContainer}>
                <Icon size={24} color="#333" />
            </View>
            <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>{title}</Text>
                <Text style={styles.actionSub}>{sub}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Tickets Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ticket size={22} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>My Tickets</Text>
                        </View>
                        <TouchableOpacity style={styles.raiseBtn}>
                            <Plus size={18} color="black" strokeWidth={3} />
                            <Text style={styles.raiseBtnText}>RAISE TICKET</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={tickets}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TicketItem item={item} />}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContainer}
                    />
                </View>

                {/* Client Support Section */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Headset size={22} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Client Support</Text>
                    </View>

                    <View style={styles.actionList}>
                        <SupportAction 
                            icon={MessageCircle} 
                            title="Live Chat" 
                            sub="Talk to our experts now" 
                            onPress={() => {}} 
                        />
                        <SupportAction 
                            icon={Mail} 
                            title="Email Support" 
                            sub="support@traderapp.com" 
                            onPress={() => {}} 
                        />
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    container: {
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    raiseBtn: {
        backgroundColor: '#CFD1C4',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    raiseBtnText: {
        color: 'black',
        fontSize: 12,
        fontWeight: '900',
        marginLeft: 4,
    },
    listContainer: {
        gap: 10,
    },
    ticketItem: {
        backgroundColor: '#CFD1C4',
        padding: 15,
        borderRadius: 8,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    ticketTitle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ticketInfoText: {
        color: '#666',
        fontSize: 12,
        marginLeft: 5,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    actionList: {
        gap: 12,
        marginTop: 5,
    },
    actionCard: {
        backgroundColor: '#CFD1C4',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionSub: {
        color: '#666',
        fontSize: 14,
    }
});

export default SupportScreen;
