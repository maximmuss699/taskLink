import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { BottomButton } from './mapScreen';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';
import Colors from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const PictureScreen = () => {
    const navigation = useNavigation();
    const { formData, setFormData } = useForm();

    // Function to capture images from the gallery
    const onCaptureImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Error', 'You need permission.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const newImages = [...(formData.images || []), ...result.assets.map(asset => asset.uri)];
            setFormData({ ...formData, images: newImages });
        }
    };

    const onRemoveImage = (uri: string) => {
        const newImages = (formData.images || []).filter(image => image !== uri);
        setFormData({ ...formData, images: newImages });
    };

    const onNext = () => {
        navigation.navigate('finalScreen' as never);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
            </View>
            <Text style={styles.upperText}>{'Please choose relevant pictures\n(Long press a picture to remove it)'}</Text>

            <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 15}}>
                <View style={styles.imageRow}>
                    <FlatList
                        data={[...(formData.images || []), 'plus-button']}
                        renderItem={({ item }) =>
                            item === 'plus-button' ? (
                                <TouchableOpacity onPress={onCaptureImage} style={{marginLeft: 7, marginRight: 7}}>
                                    <FontAwesome5 name="plus-square" size={110} color={Colors.dark}/>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onLongPress={() => onRemoveImage(item)}>
                                    <Image source={{ uri: item }} style={styles.image} />
                                </TouchableOpacity>
                            )
                        }
                        keyExtractor={(index) => index.toString()}
                        numColumns={3}
                        style={{ maxHeight: '100%' }}
                        contentContainerStyle={styles.flatListContent}
                    />
                </View>
            </View>
            <View style={styles.bottomButtonContainer}>
                <BottomButton
                    title="Next"
                    onPress={onNext}
                    disabled={false}
                />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    upperText: {
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
    },
    imageRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderRadius: 10,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: 'white',
        width: '90%',
        maxHeight: '99%',
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 5,
    },
    flatListContent: {
        alignItems: 'flex-start',
        paddingLeft: 10,
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

export default PictureScreen;
