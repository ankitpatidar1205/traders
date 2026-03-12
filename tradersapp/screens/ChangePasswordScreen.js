import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, ScrollView, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import ScreenWrapper from '../components/ScreenWrapper';

const ChangePasswordScreen = ({ navigation }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const handleUpdate = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }
        Alert.alert("Success", "Password updated successfully");
        navigation.goBack();
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Current Password"
                                placeholderTextColor="#B0BEC5"
                                secureTextEntry={true}
                                value={passwords.current}
                                onChangeText={(val) => setPasswords(prev => ({ ...prev, current: val }))}
                                cursorColor="white"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter New Password"
                                placeholderTextColor="#B0BEC5"
                                secureTextEntry={true}
                                value={passwords.new}
                                onChangeText={(val) => setPasswords(prev => ({ ...prev, new: val }))}
                                cursorColor="white"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Confirm New Password"
                                placeholderTextColor="#B0BEC5"
                                secureTextEntry={true}
                                value={passwords.confirm}
                                onChangeText={(val) => setPasswords(prev => ({ ...prev, confirm: val }))}
                                cursorColor="white"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
                        <Text style={styles.submitText}>CHANGE PASSWORD</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: 'black',
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    content: {
        padding: 15,
    },
    formContainer: {
        marginTop: 5,
    },
    inputGroup: {
        marginBottom: 10,
    },
    label: {
        color: '#B0BEC5',
        fontSize: 16,
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#597794', // Precise color provided by the user
        borderRadius: 2,
        paddingHorizontal: 15,
        height: 50,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        height: '100%',
    },
    submitBtn: {
        backgroundColor: '#EF4444',
        paddingVertical: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});

export default ChangePasswordScreen;
