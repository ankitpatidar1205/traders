import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing
} from 'react-native';
import {
    ChevronLeft,
    Send,
    Sparkles,
    User,
    Bot
} from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import CuteBot from '../../components/CuteBot';

const AiAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your AI Assistant. How may I help you today?', sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }).start();
    }, []);

    const handleSend = () => {
        if (input.trim() === '') return;
        
        const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages([...messages, userMsg]);
        setInput('');

        // Simulate AI thinking
        setTimeout(() => {
            const aiMsg = { 
                id: (Date.now() + 1).toString(), 
                text: "I'm currently in demo mode. I'll be able to help with your market analysis and trade queries soon!", 
                sender: 'ai' 
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    const MessageBubble = ({ item }) => {
        const isAi = item.sender === 'ai';
        return (
            <View style={[styles.messageRow, isAi ? styles.aiRow : styles.userRow]}>
                {isAi && (
                    <View style={styles.avatarContainer}>
                        <CuteBot size={40} />
                    </View>
                )}
                <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
                    <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
                        {item.text}
                    </Text>
                </View>
                {!isAi && (
                    <View style={styles.avatarUser}>
                        <User size={16} color="white" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <CuteBot size={28} />
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
                <ScrollView 
                    contentContainerStyle={styles.chatContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} item={msg} />
                    ))}
                </ScrollView>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View style={styles.inputSection}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="How may I help you..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={input}
                                onChangeText={setInput}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                                <Send size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
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
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    mainContainer: {
        flex: 1,
    },
    chatContainer: {
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    avatarContainer: {
        width: 44, // Increased from 36
        height: 44, // Increased from 36
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)', // Even more subtle
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        overflow: 'hidden'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    avatarUser: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#CFD1C4',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 20,
    },
    aiBubble: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: '#CFD1C4',
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    aiText: {
        color: 'white',
    },
    userText: {
        color: 'black',
        fontWeight: '500',
    },
    inputSection: {
        padding: 15,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    textInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        maxHeight: 100,
        paddingTop: Platform.OS === 'ios' ? 10 : 5,
        paddingBottom: Platform.OS === 'ios' ? 10 : 5,
    },
    sendBtn: {
        backgroundColor: '#CFD1C4',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    }
});

export default AiAssistantScreen;
