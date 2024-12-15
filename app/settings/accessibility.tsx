/**
 * @file Accessibility.tsx
 * @author Maksim Samusevich (xsamus00)
 * @description Accessibility settings screen
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView, Switch,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

export interface PersonalInfoProps {
    testID?: string,
}

const Accessibility: React.FC<PersonalInfoProps> = (props) => {
    const router = useRouter();
    const [isEnabled, setIsEnabled] = useState(false);

    // Just toggle without any actual functionality
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);





    return (
        <SafeAreaView style={styles.container} testID={props.testID ?? "personal-info"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Accessibility</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Dark Mode</Text>
                    <Switch
                        value={isEnabled}
                        onValueChange={toggleSwitch}
                        trackColor={{ false: '#d3d3d3', true: '#34C759' }}
                        thumbColor={isEnabled ? '#ffffff' : '#f4f3f4'}
                        ios_backgroundColor="#d3d3d3"
                        style={styles.iosSwitch}
                    />
                </View>
                <Text style={styles.description}>
                    Turn on Dark Mode toggle to activate dark theme.
                </Text>
            </View>


            <Text style={styles.footerText}>taskLink</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 16,
        fontFamily: 'mon-b',
        fontSize: 24,
        flexDirection: 'row',
    },
    backButton: {
        padding: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000',
        textAlign: 'left',
        fontFamily: 'mon-b',
    },
    placeholder: {
        width: 32,
    },
    content: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    labelContainer: {
        flex: 2,
    },
    label: {
        fontSize: 22,
        fontWeight: '200',
        color: '#333333',
        fontFamily: 'mon-b',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginTop: 1,
    },
    valueContainer: {
        flex: 3,
    },
    value: {
        fontSize: 16,
        color: '#666666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        padding: 8,
        fontSize: 16,
        color: '#000000',
    },
    disabledInput: {
        backgroundColor: '#F5F5F5',
        color: '#A0A0A0',
    },
    iconContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    iconButton: {
        marginLeft: 8,
    },
    footer: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    iosSwitch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], // Makes the switch a bit larger to mimic iOS style
    },

});

export default Accessibility;
