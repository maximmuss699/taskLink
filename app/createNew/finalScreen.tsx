/**
 * @file finalScreen.tsx
 * @author Jakub Zelenay (xzelen29)
 * @description Final screen of the create new task flow to review the details
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BottomButton } from './mapScreen';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';
import Colors from '@/constants/Colors';
import { collection, addDoc } from 'firebase/firestore';
import { FIRESTORE } from '@/firebaseConfig';
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import murmurhash from "murmurhash";
import lodash from "lodash";
import { SafeAreaView } from "react-native-safe-area-context";

const FinalScreen = () => {
    const navigation = useNavigation();
    // Define the form data and setFormData function for manipulating the form data context
    const { formData, setFormData } = useForm();
    // Define the loading, success, and error states
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    // Define the new image URLs and readyToUpload states
    const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
    const [readyToUpload, setReadyToUpload] = useState(false);

    // Get the storage reference
    const storage = getStorage();

    // Function to get the download URL of a photo
    const getPermalink = async (fileName : string) => {
        try {
            const fileRef = ref(storage, `${fileName}`);
        
            const downloadURL = await getDownloadURL(fileRef);
        
            return downloadURL;
        } catch (error) {
            console.error('Error getting download URL:', error);
            return null;
        }
    };

    // Function to publish the post
    const onPublish = async () => {
        setLoading(true);
        setError(false);

        const formDataHash = murmurhash.v3(JSON.stringify(formData)).toString();
        try {
            // Upload images to storage
            const images = formData.images || [];
            const imageRefs = await Promise.all(images.map(async (image, index) => {
                const imageRef = ref(storage, `${formData.title}-${formDataHash}-${index}`);
                const response = await fetch(image);
                const blob = await response.blob();
                await uploadBytes(imageRef, blob);
                return imageRef;
            }));
            // Get the image URLs
            const imageUrls = await Promise.all(imageRefs.map(async (imageRef) => {
                return await getPermalink(imageRef.name);
            }));
            // Set the new image URLs, this will trigger the next useEffect
            setNewImageUrls(imageUrls.filter((url): url is string => url !== null));
        } catch (error) {
            console.error("Error uploading post: ", error);
            setError(true);
            setLoading(false);
        }
    };

    // Update the form data with the new image URLs
    useEffect(() => {
        if (newImageUrls.length > 0) {
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData, images: newImageUrls };
                return updatedFormData;
            });
            // Set readyToUpload to true to trigger the upload useEffect
            setReadyToUpload(true);
        }
    }, [newImageUrls]);

    // Upload the post to Firestore
    useEffect(() => {
        if (readyToUpload && formData.images && lodash.isEqual(formData.images, newImageUrls)) {
            const uploadPost = async () => {
                try {
                    // Upload the post to Firestore
                    await addDoc(collection(FIRESTORE, 'posts'), formData);
                    setSuccess(true);
                    // Navigate back to the new task screen after 1 second and reset the form data
                    setTimeout(() => {
                        setFormData({});
                        navigation.navigate('new' as never);
                    }, 1000);
                } catch (error) {
                    console.error("Error uploading post: ", error);
                    setError(true);
                } finally {
                    setLoading(false);
                    setReadyToUpload(false);
                }
            };

            uploadPost();
        }
    }, [readyToUpload, formData]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
            </View>
            <Text style={styles.upperText}>Please review the details</Text>

            <View style={{flex: 1, justifyContent: 'flex-start', marginTop: 15, marginLeft:'5%'}}>
                <Text style={styles.text}>Username: {formData.username}</Text>
                <Text style={styles.text}>Title: {formData.title}</Text>
                <Text style={styles.text}>Price: {formData.price} EUR</Text>
                <Text style={styles.text}>Category: {formData.category}</Text>
                <Text style={styles.text}>Description: {formData.description}</Text>
                <Text style={styles.text}>Date: {formData.date?.toLocaleDateString()}</Text>
                <Text style={styles.text}>Address: {formData.address?.name}</Text>
                <Text style={styles.text}>Number of images: {formData.images?.length || 0}</Text>
            </View>

            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 15}}>
                {loading && <ActivityIndicator size='large' color={Colors.dark} />}
                {success && (
                    <View style={{alignItems: 'center'}}>
                        <FontAwesome5 name="check-circle" size={50} color="green" />
                        <Text style={styles.text}>Post uploaded successfully!</Text>
                    </View>
                )}
                {error && <Text style={styles.errorText}>{'Failed to upload post.\nPlease try again.'}</Text>}
            </View>
            <View style={styles.bottomButtonContainer}>
                <BottomButton
                    title="Publish"
                    onPress={onPublish}
                    disabled={loading || success}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    upperText: {
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
    },
    text: {
        color: Colors.dark,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        margin: 5,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        margin: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 10,
        fontSize: 24,
        fontFamily: 'mon-b',
    },
    backButton: {
        padding: 8,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 10,
    },
});

export default FinalScreen;