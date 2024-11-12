import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

const TaskerProfile = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tasker Profile</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.card}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/100' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.name}>Thomas Muller</Text>
                    <Text style={styles.email}>thomasMuller@gmail.com</Text>
                    <Text style={styles.details}>Tasker rating: 4.92</Text>
                    <Text style={styles.details}>Work area: Moving, garden and IT</Text>
                    <Text style={styles.details}>Brno, Czech Republic</Text>
                    <Text style={styles.details}>Since 11/06/2022</Text>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About me</Text>
                    <Text style={styles.sectionText}>
                        I am a trained gardener with 10 years of experience in landscaping and garden maintenance.
                    </Text>
                </View>

                {/* Certificates Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certificates</Text>
                    {/* Certificates would go here if needed */}
                </View>

                {/* Reviews Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <View style={styles.review}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/50' }}
                            style={styles.reviewAvatar}
                        />
                        <View style={styles.reviewContent}>
                            <Text style={styles.reviewName}>Anna</Text>
                            <Text style={styles.reviewText}>Everything was perfect!!!</Text>
                        </View>
                    </View>
                    <View style={styles.review}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/50' }}
                            style={styles.reviewAvatar}
                        />
                        <View style={styles.reviewContent}>
                            <Text style={styles.reviewName}>Thomas</Text>
                            <Text style={styles.reviewText}>Amazing help, repaired my old PC. Thanks a lot!</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>Contact Tasker</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.favouriteButton}>
                        <Text style={styles.favouriteButtonText}>Add to Favourites</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>taskLink</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 8,
        fontFamily: 'mon-b',
    },


    card: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        marginHorizontal: 24,
        marginTop: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 1, height: 2 },
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 16,
        color: '#666',
    },
    review: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    reviewAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    reviewContent: {
        flex: 1,
    },
    reviewName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 5,
        paddingVertical: 60,
    },
    contactButton: {
        backgroundColor: '#000',
        paddingVertical: 14,
        paddingHorizontal: 26,
        borderRadius: 8,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '300',
        fontFamily: 'mon-sb',
    },
    favouriteButton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    favouriteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '300',
        fontFamily: 'mon-sb',
    },
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default TaskerProfile;
