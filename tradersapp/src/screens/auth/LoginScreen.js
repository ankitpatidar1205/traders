import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Dimensions,
    ImageBackground,
    ActivityIndicator,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Leaf, Eye, EyeOff } from 'lucide-react-native';

import ScreenWrapper from '../../components/ScreenWrapper';
import LoginSuccessPopup from '../../components/LoginSuccessPopup';
import * as api from '../../services/api';
import { useTrades } from '../../context/TradeContext';

const LoginScreen = ({ navigation }) => {
    const { fetchInitialData } = useTrades();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoginSuccessVisible, setIsLoginSuccessVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert("Required", "Please enter both Username and Password.");
            return;
        }

        setLoading(true);
        try {
            await api.login(username, password, {
                deviceInfo: `${Platform.OS === 'android' ? 'Android' : 'iOS'} (${Platform.Version})`,
                os: Platform.OS === 'android' ? 'Android' : 'iOS',
                location: 'Mobile App (Virtual)',
                riskScore: Math.floor(Math.random() * 20)
            });
            await fetchInitialData();
            Alert.alert("Success", "login successfully");
            setIsLoginSuccessVisible(true);
        } catch (err) {
            Alert.alert("Login Failed", "invalid credials");
        } finally {
            setLoading(false);
        }
    };

    const handleModalConfirm = () => {
        setIsLoginSuccessVisible(false);
        navigation.replace('Main');
    };

    return (
        <ScreenWrapper>
            <View style={styles.mainWrapper}>
                {/* Top/Center Content */}
                <View style={styles.centerContent}>
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Leaf size={40} color="#4ADE80" fill="#4ADE80" />
                            <View style={styles.logoTextInner}>
                                <Text style={styles.logoTextSmall}>VTRKM</Text>
                                <Text style={styles.logoTextTiny}>THAT NEVER ENDS</Text>
                            </View>
                        </View>
                        <Text style={styles.appTitle}>VTRKM</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="User Name"
                                placeholderTextColor="#75a1cb"
                                cursorColor="#7ba6a9"
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor="#75a1cb"
                                secureTextEntry={!showPassword}
                                cursorColor="#7ba6a9"
                                underlineColorAndroid="transparent"
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#75a1cb" />
                                ) : (
                                    <Eye size={20} color="#75a1cb" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <Text style={styles.loginButtonText}>LOG IN</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Disclaimer Section */}
                    <View style={styles.disclaimerSection}>
                        <Text style={styles.disclaimerText}>
                            <Text style={{ fontWeight: 'bold' }}>No real money involved.</Text> This is a Virtual Trading Application which has all the features to trade.
                        </Text>
                        <Text style={styles.disclaimerTextTight}>
                            This Application is used for exchanging views on markets for individual students for training purpose only.
                        </Text>
                    </View>
                </View>

                {/* Bottom Content */}
                <View style={styles.bottomContent}>
                    <TouchableOpacity style={styles.contactContainer} activeOpacity={0.7}>
                        <Text style={styles.contactText}>
                            Got any questions? <Text style={styles.contactUsText}>Contact Us</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <LoginSuccessPopup
                visible={isLoginSuccessVisible}
                onConfirm={handleModalConfirm}
            />
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a2a2b',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    mainWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
    logoCircle: {
        width: 105,
        height: 105,
        borderRadius: 52.5,
        borderWidth: 2,
        borderColor: '#ffffff',
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    logoIcon: {
        width: 45,
        height: 45,
    },
    logoTextInner: {
        alignItems: 'center',
        marginTop: 2,
    },
    logoTextSmall: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    logoTextTiny: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 4.5,
        letterSpacing: 0.5,
        marginTop: -3,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
    },
    formContainer: {
        width: '100%',
        marginBottom: 2,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    inputLabel: {
        color: '#75a1cb',
        fontSize: 18,
        marginBottom: -5,
    },
    input: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(123, 166, 169, 0.5)',
        color: 'white',
        fontSize: 18,
        paddingBottom: 2,
        paddingRight: 35, // Space for the eye icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        bottom: 10,
        padding: 5,
    },
    loginButton: {
        backgroundColor: 'white',
        height: 50,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    disclaimerSection: {
        marginTop: 2,
    },
    disclaimerText: {
        color: 'white',
        fontSize: 15,
        textAlign: 'left',
        marginBottom: 8,
        lineHeight: 20,
    },
    disclaimerTextTight: {
        color: 'white',
        fontSize: 15,
        textAlign: 'left',
        lineHeight: 20,
    },
    bottomContent: {
        paddingBottom: 20,
    },
    contactContainer: {
        alignItems: 'center',
    },
    contactText: {
        color: '#ffffff',
        fontSize: 16,
    },
    contactUsText: {
        color: '#ffffff',
        fontWeight: '900',
    }
});

export default LoginScreen;
