// app/settings/personal-information.tsx

import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Platform,
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { Text } from "@gluestack-ui/themed";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get('window').width;

// Income Data
const incomeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            data: [150, 200, 100, 250, 300, 180, 220],
        },
    ],
};

// Expenses Data
const expensesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            data: [120, 180, 90, 200, 250, 150, 200],
        },
    ],
};

// Chart Configuration for Income (Green Bars)
const incomeChartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0, // Number of decimal places
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green Bar color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#4CAF50",
    },
    barPercentage: 1, // Increased bar width
};

// Chart Configuration for Expenses (Red Bars)
const expensesChartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0, // Number of decimal places
    color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Red Bar color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#F44336",
    },
    barPercentage: 1, // Increased bar width
};

const MyBarChart = () => {
    const router = useRouter();

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

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Income Chart Container */}
                <View style={styles.chartCard}>
                    {/* "Your Income" Label */}
                    <Text style={styles.chartLabel}>Your Income</Text>

                    {/* Horizontal ScrollView for Income BarChart */}
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
                            yAxisSuffix=""
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
                    {/* "Your Expenses" Label */}
                    <Text style={styles.chartLabel}>Your Expenses</Text>

                    {/* Horizontal ScrollView for Expenses BarChart */}
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
                            yAxisSuffix=""
                            chartConfig={expensesChartConfig}
                            verticalLabelRotation={0}
                            fromZero={true}
                            showValuesOnTopOfBars={true}
                            style={styles.chart}

                        />
                    </ScrollView>
                </View>

                {/* Additional Content */}
                <View style={styles.additionalContent}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>
                    <Text style={styles.sectionText}>
                        All statistics are based on your income and expenses from the past week.
                    </Text>
                    {/* Add more components or content as needed */}
                </View>

                {/* Footer Text */}
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
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 10,
        fontSize: 24,
        fontFamily: 'mon-b',
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
        paddingBottom: 100, // To ensure content is not hidden behind the footer
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        // Elevation for Android
        elevation: 5,
        marginBottom: 20,
        alignSelf: 'center',
        width: screenWidth - 32, // Container width with padding accounted
    },
    horizontalScroll: {
        // Optional: Add padding or margin if needed
    },
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
        fontFamily: 'modernaRegular', // Using the MuseoModerno font
        color: '#888888', // Gray text color
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 20, // Margin from the bottom of the screen
        alignSelf: 'center',
    },
});

export default MyBarChart;
