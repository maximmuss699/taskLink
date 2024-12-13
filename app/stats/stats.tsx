import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Alert,
    ActivityIndicator,
    Text,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { BarChart } from "react-native-chart-kit";
import { FIRESTORE } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const incomeChartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#4CAF50",
    },
    barPercentage: 1,
};

const expensesChartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#F44336",
    },
    barPercentage: 1,
};

interface Transaction {
    amount: string;
    date: any;
    taskerId: string;
    // другие поля при необходимости
}

const MyBarChart = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [incomeData, setIncomeData] = useState({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [0,0,0,0,0,0,0] }]
    });
    const [expensesData, setExpensesData] = useState({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [0,0,0,0,0,0,0] }]
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            // Load payments and payouts from Firestore
            const paymentsSnapshot = await getDocs(collection(FIRESTORE, 'payments'));
            const payoutsSnapshot = await getDocs(collection(FIRESTORE, 'payouts'));

            // Extract data from snapshots
            const paymentsData: Transaction[] = paymentsSnapshot.docs.map(doc => doc.data() as Transaction);
            const payoutsData: Transaction[] = payoutsSnapshot.docs.map(doc => doc.data() as Transaction);

            // Returns the day index (0-6) for a given date
            const getDayIndex = (date: Date) => {
                // 0 - Sunday, 1 - Monday, ..., 6 - Saturday
                const day = date.getDay();
                return (day + 6) % 7;
            };

            // Arrays to store income and expenses per day
            const incomePerDay = [0,0,0,0,0,0,0];
            const expensesPerDay = [0,0,0,0,0,0,0];

            // Process payments (income)
            for (const pay of paymentsData) {
                if (!pay.date?.seconds) continue; // Skip invalid dates
                const d = new Date(pay.date.seconds * 1000);
                const dayIndex = getDayIndex(d);
                const amount = parseFloat(pay.amount || "0");
                expensesPerDay[dayIndex] += amount;
            }

            // Process payouts (expenses)
            for (const payout of payoutsData) {
                if (!payout.date?.seconds) continue;
                const d = new Date(payout.date.seconds * 1000);
                const dayIndex = getDayIndex(d);
                const amount = parseFloat(payout.amount || "0");
                incomePerDay[dayIndex] += amount;
            }

            // Update the state with the new data
            setIncomeData({
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ data: incomePerDay }]
            });

            setExpensesData({
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ data: expensesPerDay }]
            });

        } catch (error) {
            console.error("Error loading statistics:", error);
            Alert.alert("Error", "Unable to load statistics.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Your Statistics</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Income Chart Container */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartLabel}>Your Income</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        <BarChart
                            data={incomeData}
                            width={screenWidth * 2}
                            height={220}
                            yAxisLabel="€"
                            yAxisSuffix={""}
                            chartConfig={incomeChartConfig}
                            verticalLabelRotation={0}
                            fromZero={true}
                            showValuesOnTopOfBars={true}
                            style={styles.chart}
                        />
                    </ScrollView>
                </View>

                {/* Expenses Chart Container */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartLabel}>Your Expenses</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        <BarChart
                            data={expensesData}
                            width={screenWidth * 2}
                            height={220}
                            yAxisLabel="€"
                            yAxisSuffix={""}
                            chartConfig={expensesChartConfig}
                            verticalLabelRotation={0}
                            fromZero={true}
                            showValuesOnTopOfBars={true}
                            style={styles.chart}
                        />
                    </ScrollView>
                </View>

                <View style={styles.additionalContent}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>
                    <Text style={styles.sectionText}>
                        All statistics are based on your income and expenses from the past week.
                    </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333333',
        textAlign: 'left',
        fontFamily: 'mon-b',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 20,
        alignSelf: 'center',
        width: screenWidth - 32,
    },
    horizontalScroll: {},
    chart: {
        borderRadius: 15,
    },
    chartLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 10,
        textAlign: 'left',
        fontFamily: 'mon-b',
    },
    additionalContent: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 22,
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
});

export default MyBarChart;
