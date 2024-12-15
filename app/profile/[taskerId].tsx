/**
 * @file [taskerId].tsx
 * @author Maksim Samusevich (xsamus00)
 * @author Vojtěch Tichý (xtichy33) -- added the ability to contact the tasker
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
    doc,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { openChat } from '../(modals)/job_post';


// Interface for Review object
interface Review {
    commId: string;
    comment: string;
    postId: string;
    rating: number;
    username: string;
    taskerId: string;
    reviewerAvatar: string;
    reviewerFullName: string;
}

const TaskerProfile = () => {
    const router = useRouter();
    const { taskerId } = useLocalSearchParams<{ taskerId: string }>();

    const [tasker, setTasker] = useState<any>(null);
    const [taskerDocId, setTaskerDocId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isFavourite, setIsFavourite] = useState<boolean>(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState<boolean>(true);

    // Fetch tasker data
    useEffect(() => {
        const fetchTasker = async () => {
            setIsLoaded(false);
            try {
                const taskersCollection = collection(FIRESTORE, "taskers");
                const q = query(taskersCollection, where("taskerId", "==", taskerId));
                const taskerSnapshot = await getDocs(q);
                if (!taskerSnapshot.empty) {
                    const taskerDoc = taskerSnapshot.docs[0];
                    const taskerData = taskerDoc.data();
                    setTasker(taskerData);
                    setTaskerDocId(taskerDoc.id);
                    setIsLoaded(true);
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
                const favDocRef = doc(FIRESTORE, 'favourites', taskerId);
                const favDocSnap = await getDoc(favDocRef);
                setIsFavourite(favDocSnap.exists());
            }
        };
        checkIfFavourite();
    }, [taskerId]);

    // Fetch reviews for the tasker
    useEffect(() => {
        const fetchReviews = async () => {
            if (!tasker) return;
            setLoadingReviews(true);
            try {
                const postsCollection = collection(FIRESTORE, "posts");
                const postsQuery = query(postsCollection, where("username", "==", tasker.fullName));
                const postsSnapshot = await getDocs(postsQuery);

                const postIds = postsSnapshot.docs.map(doc => doc.id);

                if (postIds.length === 0) {
                    setReviews([]);
                    setLoadingReviews(false);
                    return;
                }

                const chunkSize = 10;
                const chunks = [];
                for (let i = 0; i < postIds.length; i += chunkSize) {
                    chunks.push(postIds.slice(i, i + chunkSize));
                }

                let allReviews: Review[] = [];

                for (const chunk of chunks) {
                    const jobEvalCollection = collection(FIRESTORE, "jobEval");
                    const jobEvalQuery = query(jobEvalCollection, where('postId', 'in', chunk));
                    const jobEvalSnapshot = await getDocs(jobEvalQuery);

                    for (const evalDoc of jobEvalSnapshot.docs) {
                        const evalData = evalDoc.data();

                        const reviewerUsername = evalData.username;
                        let reviewerAvatar = 'https://via.placeholder.com/50';
                        let reviewerFullName = reviewerUsername;

                        // Search reviewer in taskers
                        const taskersCollection = collection(FIRESTORE, "taskers");
                        const tQuery = query(taskersCollection, where("fullName", "==", reviewerUsername));
                        const tSnapshot = await getDocs(tQuery);

                        if (!tSnapshot.empty) {
                            const tData = tSnapshot.docs[0].data();
                            reviewerAvatar = tData.profilePicture || reviewerAvatar;
                            reviewerFullName = tData.fullName || reviewerUsername;
                        } else {
                            // Search reviewer in users
                            const usersCollection = collection(FIRESTORE, "users");
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

                        const ratingValue = typeof evalData.rating === 'number' ? evalData.rating : parseFloat(evalData.rating);
                        allReviews.push({
                            commId: evalDoc.id,
                            comment: evalData.comment,
                            postId: evalData.postId,
                            rating: isNaN(ratingValue) ? 0 : ratingValue,
                            username: evalData.username,
                            taskerId: evalData.taskerId,
                            reviewerAvatar,
                            reviewerFullName,
                        });
                    }
                }

                setReviews(allReviews);
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
    }, [tasker]);

    // Calculate and update tasker rating
    useEffect(() => {
        const calculateAndUpdateTaskerRating = async () => {
            if (!taskerDocId) return;

            // If there are no reviews, don't update the rating
            if (reviews.length === 0) {
                return;
            }

            let averageRating = 0;
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            averageRating = totalRating / reviews.length;

            // Convert to string
            const ratingStr = averageRating.toString();

            // Control actual rating
            const currentRatingStr = tasker?.rating;
            const currentRatingNum = parseFloat(currentRatingStr);
            const newRatingNum = parseFloat(ratingStr);

            // If the new rating is the same as the current rating, don't update
            if (!isNaN(currentRatingNum) && !isNaN(newRatingNum) && currentRatingNum === newRatingNum) {
                return;
            }

            try {
                const taskerRef = doc(FIRESTORE, 'taskers', taskerDocId);
                await updateDoc(taskerRef, {
                    rating: ratingStr,
                });


                // Update state to show the new rating
                setTasker((prev: any) => ({
                    ...prev,
                    rating: ratingStr,
                }));
            } catch (error) {
                console.error("Error updating tasker rating:", error);
                Alert.alert('Error', 'Failed to update tasker rating.');
            }
        };

        calculateAndUpdateTaskerRating();
    }, [reviews, taskerDocId, tasker]);

    // Add tasker to favourites
    const addToFavourites = async () => {
        try {
            if (isFavourite) {
                Alert.alert('Notice', 'Tasker is already in favourites!');
                return;
            }

            if (taskerId && tasker) {
                const favDocRef = doc(FIRESTORE, 'favourites', taskerId);
                const ratingNumber = parseFloat(tasker.rating);
                const safeRating = isNaN(ratingNumber) ? "0" : tasker.rating;

                await setDoc(favDocRef, {
                    taskerId,
                    fullName: tasker.fullName,
                    email: tasker.email,
                    profilePicture: tasker.profilePicture,
                    workArea: tasker.workArea,
                    location: tasker.location,
                    rating: safeRating,
                });
                setIsFavourite(true);
                Alert.alert('Success', 'Tasker added to favourites!');
            }
        } catch (error) {
            console.error('Error adding to favourites:', error);
            Alert.alert('Error', 'Failed to add tasker to favourites.');
        }
    };

    // Display rating with 2 decimal places
    const getDisplayRating = () => {
        if (!tasker || tasker.rating === undefined) return '0';
        const ratingNumber = parseFloat(tasker.rating);
        return isNaN(ratingNumber) ? '0' : ratingNumber.toFixed(2);
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
                {isLoaded && tasker && (
                    <View style={styles.card}>
                        <Image
                            source={{ uri: tasker.profilePicture || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.name}>{tasker.fullName}</Text>
                        <Text style={styles.email}>{tasker.email}</Text>
                        <Text style={styles.details}>
                            Tasker rating: {getDisplayRating()}
                        </Text>
                        <Text style={styles.details}>Work area: {tasker.workArea}</Text>
                        <Text style={styles.details}>{tasker.location}</Text>
                        <Text style={styles.details}>Since {tasker.joinedDate ? tasker.joinedDate.toDate().toLocaleDateString() : 'Unknown'}</Text>
                    </View>
                )}

                {/* About Section */}
                {tasker && tasker.about && (
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