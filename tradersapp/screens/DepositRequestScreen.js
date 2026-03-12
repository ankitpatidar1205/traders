import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTrades } from '../context/TradeContext';

import ScreenWrapper from '../components/ScreenWrapper';

const DepositRequestScreen = ({ navigation }) => {
    const { addNotification } = useTrades();
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
        if (!image) {
            Alert.alert("Error", "Please select a screenshot first.");
            return;
        }

        setIsUploading(true);

        // Simulate upload
        setTimeout(() => {
            // Add Notification
            addNotification({
                title: 'Deposit Screenshot Uploaded',
                message: 'Your payment screenshot has been submitted. Funds will be added after verification.',
                type: 'info'
            });

            setIsUploading(false);
            setImage(null);
            Alert.alert("Success", "Screenshot uploaded successfully! Funds will be added shortly.");
            navigation.goBack();
        }, 2000);
    };


    const handleSelectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Deposit Request</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.centerContainer}>
                    <TouchableOpacity
                        style={styles.addFundsBtn}
                        onPress={() => Alert.alert("Redirecting", "Connecting to Payment Gateway...")}
                    >
                        <Text style={styles.addFundsBtnText}>Add funds online</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.uploadBox}
                        onPress={handleSelectImage}
                    >
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.uploadBoxText}>Attach</Text>
                                <Text style={styles.uploadBoxText}>Screenshot</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.uploadBtn, isUploading && { opacity: 0.7 }]}
                        onPress={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.uploadBtnText}>UPLOAD SCREENSHOT</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    content: {
        flexGrow: 1,
        padding: 15,
    },
    centerContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    addFundsBtn: {
        backgroundColor: '#66bb6a',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 4,
        marginBottom: 20, // Reduced
        width: '85%',
        alignItems: 'center',
    },
    addFundsBtnText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    uploadBox: {
        backgroundColor: '#CFD1C4', // beige like account
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, // Reduced
        borderRadius: 6,
        overflow: 'hidden',
    },
    uploadBoxText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadBtn: {
        backgroundColor: '#EF4444',
        paddingVertical: 15,
        width: '100%',
        borderRadius: 4,
        alignItems: 'center',
    },
    uploadBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});

export default DepositRequestScreen;
