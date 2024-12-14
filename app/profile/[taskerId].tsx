/**
 * @file [taskerId].tsx
 * @author Maksim Samusevich (xsamus00)
 * @author Vojtěch Tichý (xtichy33)
 * @description Profile screen page.
 */


import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FIRESTORE } from '@/firebaseConfig';
import {
    collection,
    getDocs,
    query,
    where,
    getDoc,
    doc, setDoc,
} from 'firebase/firestore';
import { openChat } from '../(modals)/job_post';

const TaskerProfile = () => {
    const router = useRouter();
    const { taskerId } = useLocalSearchParams<{ taskerId: string }>();
    const [tasker, setTasker] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isFavourite, setIsFavourite] = useState<boolean>(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState<boolean>(true);

    // Load tasker info
    useEffect(() => {
        const fetchTasker = async () => {
            setIsLoaded(false);
            try {
                const collectionRef = collection(FIRESTORE, "taskers");
                const q = query(collectionRef, where("taskerId", "==", taskerId));
                const docSnap = await getDocs(q);
                if (!docSnap.empty) {
                    setIsLoaded(true);
                    setTasker(docSnap.docs[0].data());
                } else {
                    Alert.alert('Error', 'Tasker not found.');
                }
            } catch (error) {
                console.error("Error fetching tasker:", error);
                Alert.alert('Error', 'Failed to load tasker info.');
            }
        };
        fetchTasker();
    }, [taskerId]);

    // Check if tasker is in favourites
    useEffect(() => {
        const checkIfFavourite = async () => {
            if (taskerId) {
                const docRef = doc(FIRESTORE, 'favourites', taskerId);
                const docSnap = await getDoc(docRef);
                setIsFavourite(docSnap.exists());
            }
        };
        checkIfFavourite();
    }, [taskerId]);

    // Load reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!tasker) return;
            setLoadingReviews(true);
            try {
                // Find posts by tasker
                const postsCollection = collection(FIRESTORE, "posts");
                const postsQuery = query(postsCollection, where("username", "==", tasker.fullName));
                const postsSnapshot = await getDocs(postsQuery);

                const postIds = postsSnapshot.docs.map(doc => doc.id);

                // Find reviews for each post
                const jobEvalCollection = collection(FIRESTORE, "jobEval");
                let reviewsArray: any[] = [];

                for (const pId of postIds) {
                    const jobEvalQuery = query(jobEvalCollection, where("postId", "==", pId));
                    const jobEvalSnapshot = await getDocs(jobEvalQuery);

                    jobEvalSnapshot.forEach(evalDoc => {
                        const evalData = evalDoc.data();
                        // evalData: { comment, postId, rating, username }
                        reviewsArray.push(evalData);
                    });
                }

                // Find reviewer avatar and full name
                const updatedReviews = [];
                for (const review of reviewsArray) {
                    const reviewerUsername = review.username;
                    let reviewerAvatar = 'https://via.placeholder.com/50';
                    let reviewerFullName = reviewerUsername;

                    // Search in taskers
                    const taskersCollection = collection(FIRESTORE, "taskers");
                    const tQuery = query(taskersCollection, where("fullName", "==", reviewerUsername));
                    const tSnapshot = await getDocs(tQuery);

                    if (!tSnapshot.empty) {
                        const tData = tSnapshot.docs[0].data();
                        reviewerAvatar = tData.profilePicture || reviewerAvatar;
                        reviewerFullName = tData.fullName || reviewerUsername;
                    } else {
                        // If not found in taskers, try users
                        const usersCollection = collection(FIRESTORE, "users");

                        // Divide the username into first and last name
                        const nameParts = reviewerUsername.split(' ');
                        const firstName = nameParts[0];
                        const lastName = nameParts.slice(1).join(' ');

                        if (firstName && lastName) {
                            const uQuery = query(
                                usersCollection,
                                where("firstName", "==", firstName),
                                where("lastName", "==", lastName)
                            );
                            const uSnapshot = await getDocs(uQuery);

                            if (!uSnapshot.empty) {
                                const uData = uSnapshot.docs[0].data();
                                reviewerAvatar = uData.profilePicture || reviewerAvatar;
                                reviewerFullName = `${uData.firstName} ${uData.lastName}` || reviewerUsername;
                            }
                        }
                    }

                    updatedReviews.push({
                        ...review,
                        reviewerAvatar,
                        reviewerFullName,
                    });
                }

                setReviews(updatedReviews);
                setLoadingReviews(false);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                Alert.alert('Error', 'Failed to load reviews.');
                setLoadingReviews(false);
            }
        };
        if (tasker) {
            fetchReviews();
        }
    }, [tasker, taskerId]);

    // Add to Favourites
    const addToFavourites = async () => {
        try {
            if (isFavourite) {
                Alert.alert('Notice', 'Tasker is already in favourites!');
                return;
            }

            if (taskerId && tasker) {
                const docRef = doc(FIRESTORE, 'favourites', taskerId);
                await setDoc(docRef, {
                    taskerId,
                    fullName: tasker.fullName,
                    email: tasker.email,
                    profilePicture: tasker.profilePicture,
                    workArea: tasker.workArea,
                    location: tasker.location,
                    rating: tasker.rating,
                });
                setIsFavourite(true);
                Alert.alert('Success', 'Tasker added to favourites!');
            }
        } catch (error) {
            console.error('Error adding to favourites:', error);
            Alert.alert('Error', 'Failed to add tasker to favourites.');
        }
    };

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

                {/* Tasker Profile */}
                {tasker && (
                    <View style={styles.card}>
                        <Image
                            source={{ uri: tasker.profilePicture || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.name}>{tasker.fullName}</Text>
                        <Text style={styles.email}>{tasker.email}</Text>
                        <Text style={styles.details}>Tasker rating: {tasker.rating}</Text>
                        <Text style={styles.details}>Work area: {tasker.workArea}</Text>
                        <Text style={styles.details}>{tasker.location}</Text>
                        <Text style={styles.details}>Since 11/06/2022</Text>
                    </View>
                )}

                {/* About Section */}
                {tasker && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About me</Text>
                        <Text style={styles.sectionText}>{tasker.about}</Text>
                    </View>
                )}

                {/* Certificates Section */}
                {tasker && tasker.certificates && tasker.certificates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certificates</Text>
                        {tasker.certificates.map((cert: string, index: number) => (
                            <Text key={index}>{cert}</Text>
                        ))}
                    </View>
                )}

                {/* Reviews Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    {loadingReviews ? (
                        <ActivityIndicator size="large" color={Colors.primary} />
                    ) : reviews.length === 0 ? (
                        <Text style={styles.reviewText}>No reviews available.</Text>
                    ) : (
                        reviews.map((review, index) => (
                            <View key={index} style={styles.review}>
                                <Image
                                    source={{ uri: review.reviewerAvatar }}
                                    style={styles.reviewAvatar}
                                />
                                <View style={styles.reviewContent}>
                                    <Text style={styles.reviewName}>{review.reviewerFullName}</Text>
                                    <Text style={styles.reviewText}>{review.comment}</Text>
                                    <Text style={styles.reviewText}>Rating: {review.rating}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {tasker && (
                        <TouchableOpacity style={styles.contactButton} onPress={() => openChat(tasker.fullName, router)}>
                            <Text style={styles.contactButtonText}>Contact Tasker</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.favouriteButton, isFavourite && { backgroundColor: 'gray' }]}
                        onPress={addToFavourites}
                    >
                        <Text style={styles.favouriteButtonText}>
                            {isFavourite ? 'Added to Favourites' : 'Add to Favourites'}
                        </Text>
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
        alignItems: 'flex-start',
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
        marginTop: 4,
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
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 180,
    },
    footerText: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    favouriteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default TaskerProfile;
