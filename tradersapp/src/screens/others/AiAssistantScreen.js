import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
    Alert,
    ActivityIndicator
} from 'react-native';
import {
    ChevronLeft,
    Send,
    User,
    Mic,
    Square
} from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import CuteBot from '../../components/CuteBot';
import * as api from '../../services/api';
import { BASE_URL } from '../../constants/Config';
import { Audio } from 'expo-av';

const AiAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your AI Assistant. How may I help you today?', sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const recordingAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const recordingRef = useRef(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }).start();

        // Cleanup on unmount
        return async () => {
            if (recordingRef.current?.recording) {
                try {
                    await recordingRef.current.recording.stopAsync();
                } catch (error) {
                    console.error('Error stopping recording on unmount:', error);
                }
            }
        };
    }, []);

    const handleVoicePress = async () => {
        if (isRecording) {
            // Stop recording and transcribe
            await stopRecordingAndTranscribe();
        } else {
            // Start recording
            await startRecording();
        }
    };

    const startRecording = async () => {
        try {
            console.log('🎤 Starting recording...');

            // Set audio mode - this will prompt for permission on first use
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });

            console.log('✅ Audio mode set');

            // Create new recording
            const recording = new Audio.Recording();

            console.log('✅ Recording object created');

            // Prepare recording with high quality settings
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            console.log('✅ Recording prepared');

            // Start recording - permission dialog will appear here if not granted
            await recording.startAsync();

            console.log('✅ Recording started');

            recordingRef.current = {
                recording,
                startTime: Date.now()
            };

            setIsRecording(true);
            setTranscript('');
            animateRecording();

            console.log('🎤 Recording in progress...');

        } catch (error) {
            console.error('❌ Error starting recording:', error.message || error);

            // Check if it's a permission error
            if (error.message?.includes('Permission') || error.message?.includes('permission')) {
                Alert.alert(
                    '🎤 Microphone Permission',
                    'Please allow microphone access in settings to use voice recording.',
                    [
                        { text: 'Cancel', onPress: () => setIsRecording(false) },
                        { text: 'Try Again', onPress: () => startRecording() }
                    ]
                );
            } else {
                Alert.alert('Error', error.message || 'Failed to start recording');
                setIsRecording(false);
            }
        }
    };

    const stopRecordingAndTranscribe = async () => {
        try {
            setIsRecording(false);
            setIsTranscribing(true);

            if (!recordingRef.current?.recording) {
                Alert.alert('Error', 'No recording found.');
                setIsTranscribing(false);
                return;
            }

            const duration = Date.now() - recordingRef.current.startTime;

            if (duration < 500) {
                await recordingRef.current.recording.stopAndUnloadAsync();
                Alert.alert('Too Short', 'Please record for at least 1 second.');
                setIsTranscribing(false);
                return;
            }

            console.log('⏹️  Stopping recording...');

            // Stop recording
            await recordingRef.current.recording.stopAndUnloadAsync();
            const uri = recordingRef.current.recording.getURI();

            console.log('✅ Recording stopped, URI:', uri);

            if (!uri) {
                throw new Error('Failed to get recording URI');
            }

            // Prepare form data to send to backend
            const formData = new FormData();
            formData.append('audio', {
                uri,
                type: 'audio/m4a',
                name: `recording_${Date.now()}.m4a`
            });

            // Get auth headers
            const headers = await api.getHeaders();

            console.log('📤 Sending audio to transcription endpoint...');

            // Send to backend for transcription
            const response = await fetch(`${BASE_URL}/ai/transcribe-voice`, {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();

            console.log('✅ Transcription response:', data);

            if (data.success && data.transcript) {
                console.log('🎯 Transcript:', data.transcript);
                setTranscript(data.transcript);
                setInput(data.transcript);
                Alert.alert('✅ Success', 'Transcript: ' + data.transcript);
            } else {
                throw new Error(data.message || 'Failed to transcribe');
            }

        } catch (error) {
            console.error('❌ Error stopping recording:', error);
            Alert.alert('Error', error.message || 'Failed to transcribe audio. Please try again.');
        } finally {
            setIsTranscribing(false);
        }
    };

    const animateRecording = () => {
        recordingAnim.setValue(0);
        Animated.loop(
            Animated.timing(recordingAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            })
        ).start();
    };

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Get auth headers
            const headers = await api.getHeaders();

            console.log('Sending chat to:', `${BASE_URL}/ai/chat`);
            console.log('Headers:', headers);

            // Call the backend AI chat endpoint
            const response = await fetch(`${BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMsg.text }),
            });

            // Check response status and content type
            const contentType = response.headers.get('content-type');
            let data;

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP ${response.status}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            }

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                console.error('Non-JSON response received:', await response.text());
                throw new Error('Server returned non-JSON response');
            }

            if (data.success) {
                const aiMsg = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'ai'
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                const errorMsg = {
                    id: (Date.now() + 1).toString(),
                    text: 'Sorry, I encountered an error. Please try again.',
                    sender: 'ai'
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (err) {
            console.error('AI Chat Error:', err);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I could not connect to the AI service. Please check your connection.',
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            // Scroll to bottom
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
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
                    ref={scrollViewRef}
                    contentContainerStyle={styles.chatContainer}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} item={msg} />
                    ))}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4ADE80" />
                        </View>
                    )}
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

                            {/* Voice Button */}
                            <TouchableOpacity
                                style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
                                onPress={handleVoicePress}
                            >
                                <Animated.View style={{
                                    opacity: isRecording ? recordingAnim : 1,
                                    transform: [{
                                        scale: isRecording ? recordingAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 1.2]
                                        }) : 1
                                    }]
                                }}>
                                    {isRecording ? (
                                        <Square size={16} color="white" />
                                    ) : (
                                        <Mic size={16} color="rgba(255,255,255,0.6)" />
                                    )}
                                </Animated.View>
                            </TouchableOpacity>

                            {/* Send Button */}
                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                                <Send size={20} color="black" />
                            </TouchableOpacity>
                        </View>

                        {/* Transcript Display */}
                        {transcript && (
                            <View style={styles.transcriptContainer}>
                                <Text style={styles.transcriptLabel}>Transcribed:</Text>
                                <Text style={styles.transcriptText}>{transcript}</Text>
                            </View>
                        )}

                        {/* Recording indicator */}
                        {isRecording && (
                            <View style={styles.recordingIndicator}>
                                <View style={styles.recordingDot} />
                                <Text style={styles.recordingText}>Recording...</Text>
                            </View>
                        )}

                        {/* Transcribing indicator */}
                        {isTranscribing && (
                            <View style={styles.recordingIndicator}>
                                <ActivityIndicator size="small" color="#4ADE80" />
                                <Text style={styles.recordingText}>Transcribing...</Text>
                            </View>
                        )}
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
    voiceBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    voiceBtnActive: {
        backgroundColor: '#FF5252',
        borderColor: '#FF6B6B',
    },
    sendBtn: {
        backgroundColor: '#CFD1C4',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        marginRight: 8,
    },
    recordingText: {
        color: '#FF5252',
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    transcriptContainer: {
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#4ADE80',
    },
    transcriptLabel: {
        color: '#4ADE80',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    transcriptText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    }
});

export default AiAssistantScreen;
