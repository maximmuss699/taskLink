import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from "@/constants/Colors";
import MapView, { PROVIDER_GOOGLE, MapPressEvent, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useForm } from '../context/FormContext';

/**
 * Initial region for Brno, Czech Republic.
 */
const INITIAL_REGION = {
    latitude: 49.193665,
    longitude: 16.605479,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

/**
 * Custom bottom button for navigating to the next screen
 */
export const BottomButton: React.FC<{ title: string; onPress?: () => void; disabled: boolean }> = ({ title, onPress, disabled }) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const MapScreen = () => {
    const navigation = useNavigation();
    const { formData, setFormData } = useForm();
    const mapRef = React.useRef<MapView>(null);

    const handleMapPress = async (event: MapPressEvent) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
    
        if (mapRef.current) {
            try {
                const addressResult = await mapRef.current.addressForCoordinate({ latitude, longitude });
                setFormData({ 
                    ...formData,
                    address: addressResult,
                    coordinates: { latitude, longitude }
                });
            } catch (error) {
                console.error('Error fetching address:', error);
                setFormData({ 
                    ...formData,
                    address: undefined,
                    coordinates: { latitude, longitude }
                });
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View>
                <Text style={[styles.upperText, {fontSize: 30}]}>Create new task</Text>
                <Text style={styles.upperText}>Address:</Text>
                <ScrollView horizontal={true} style={styles.addressContainer}>
                    {formData.address ? (
                        <Text style={styles.addressText} numberOfLines={1}>{formData.address.name}</Text>
                    ) : (
                        <Text style={[styles.addressText, { color: '#666666' }]}>Please choose your location on the map</Text>
                    )}
                </ScrollView>
            </View>
            <View style={styles.container}>
                <MapView
                    // provider={PROVIDER_GOOGLE}   // Does not work properly in the expo client
                    style={styles.map}
                    initialRegion={INITIAL_REGION}
                    showsUserLocation
                    showsMyLocationButton={true}
                    onPress={handleMapPress}
                    ref={mapRef}
                >
                    {formData.coordinates && (
                        <Marker coordinate={formData.coordinates} />
                    )}
                </MapView>
                <BottomButton
                    title="Next"
                    disabled={!formData.coordinates}
                    onPress={() => navigation.navigate('formScreen' as never)}  // The 'as never' is a slight workaround
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    map: {
        width: '90%',
        height: '88%',
        borderBlockColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    addressContainer: {
        width: '90%',
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
        alignSelf: 'center',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
    },
    addressText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        marginRight: 20,
    },
    upperText: {
        // alignSelf: 'flex-start',
        marginLeft: '5%',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
        marginTop: 10,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 10,
        marginRight: '5%',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    buttonDisabled: {
        backgroundColor: '#ABABAB',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
    },
});

export default MapScreen;