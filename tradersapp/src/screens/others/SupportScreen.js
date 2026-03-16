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
    ChevronRight,
    Send,
    CheckCircle2
} from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const SupportScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'support'

    const [tickets, setTickets] = useState([
        { id: '1', title: 'Withdrawal not reflecting', date: '2026-03-12', status: 'In Progress', priority: 'High' },
        { id: '2', title: 'KYC Verification Query', date: '2026-03-10', status: 'Resolved', priority: 'Medium' },
    ]);

    const StatusBadge = ({ status }) => {
        let bgColor = '#FFE0E0';
        let textColor = '#C64756';

        if (status === 'In Progress') {
            bgColor = 'rgba(255, 235, 59, 0.2)';
            textColor = '#F1C40F';
        } else if (status === 'Resolved') {
            bgColor = 'rgba(76, 175, 80, 0.2)';
            textColor = '#4CAF50';
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Text style={[styles.statusBadgeText, { color: textColor }]}>
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
                <Text style={styles.priorityText}>
                    Priority: <Text style={{ fontWeight: '600' }}>{item.priority}</Text>
                </Text>
            </View>
        </View>
    );

    const SupportAction = ({ icon: Icon, title, sub, onPress }) => (
        <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.actionIconContainer}>
                <Icon size={24} color="white" />
            </View>
            <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>{title}</Text>
                <Text style={styles.actionSub}>{sub}</Text>
            </View>
            <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
    );

    const MyTicketsView = () => (
        <FlatList
            data={tickets}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TicketItem item={item} />}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
        />
    );

    const ClientSupportView = () => (
        <View style={styles.clientSupportContainer}>
            <View style={styles.dedicatedCard}>
                <Headset size={40} color="white" style={{ marginBottom: 10 }} />
                <Text style={styles.dedicatedTitle}>Dedicated Support Team</Text>
                <Text style={styles.dedicatedSub}>Our team is available 24/7 to assist you with your trading needs.</Text>
            </View>

            <View style={styles.actionList}>
                <SupportAction 
                    icon={Send} 
                    title="Live Chat" 
                    sub="Average response time: 5 mins" 
                    onPress={() => {}} 
                />
                <SupportAction 
                    icon={CheckCircle2} 
                    title="Email Support" 
                    sub="support@tradersapp.com" 
                    onPress={() => {}} 
                />
            </View>

            <TouchableOpacity style={styles.raiseLargeBtn}>
                <Text style={styles.raiseLargeBtnText}>Raise a New Ticket</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support Center</Text>
                <View style={{ width: 30 }} />
            </View>

            <View style={styles.tabBarContainer}>
                <View style={styles.tabBar}>
                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'tickets' && styles.activeTabItem]} 
                        onPress={() => setActiveTab('tickets')}
                    >
                        <Ticket size={20} color={activeTab === 'tickets' ? 'white' : '#757575'} style={{ marginRight: 8 }} />
                        <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>My Tickets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'support' && styles.activeTabItem]} 
                        onPress={() => setActiveTab('support')}
                    >
                        <Headset size={20} color={activeTab === 'support' ? 'white' : '#757575'} style={{ marginRight: 8 }} />
                        <Text style={[styles.tabText, activeTab === 'support' && styles.activeTabText]}>Client Support</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {activeTab === 'tickets' ? <MyTicketsView /> : <ClientSupportView />}
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
    tabBarContainer: {
        paddingHorizontal: 15,
        marginVertical: 15,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        padding: 4,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 6,
    },
    activeTabItem: {
        backgroundColor: '#2D3748',
    },
    tabText: {
        color: '#757575',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: 'white',
    },
    container: {
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
    listContainer: {
        gap: 15,
    },
    ticketItem: {
        backgroundColor: '#CFD1C4',
        padding: 18,
        borderRadius: 12,
        marginBottom: 10,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketTitle: {
        color: '#333',
        fontSize: 17,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
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
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 10,
    },
    ticketInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ticketInfoText: {
        color: '#666',
        fontSize: 13,
        marginLeft: 6,
    },
    priorityText: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
    },
    clientSupportContainer: {
        gap: 20,
    },
    dedicatedCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dedicatedTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dedicatedSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionList: {
        gap: 12,
    },
    actionCard: {
        backgroundColor: '#CFD1C4',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
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
        fontSize: 13,
    },
    raiseLargeBtn: {
        backgroundColor: '#10B981',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    raiseLargeBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SupportScreen;
