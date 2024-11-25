import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, setDoc, doc, getDoc, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles, filter } from '../filters/filterMain';

/* Filter interface definition */
/* all of them are optional... */

/* TODO: wrap other functions inside try-catch */
async function saveFilter(filter: filter, filterId: string) {

    try {
        /* To dynamically store only defined values */
        const parsedFilter: any = { filterName: filter.filterName };

        if (filter.minRating !== undefined && filter.minRating > 0) parsedFilter.minRating = filter.minRating;
        if (filter.maxRating !== undefined && filter.maxRating > 0) parsedFilter.maxRating = filter.maxRating;

        if (filter.minPrice !== undefined && filter.minPrice !== "") parsedFilter.minPrice = filter.minPrice;
        if (filter.maxPrice !== undefined && filter.maxPrice !== "") parsedFilter.maxPrice = filter.maxPrice;

        if (filter.fromDate !== undefined) parsedFilter.fromDate = filter.fromDate;
        if (filter.toDate !== undefined) parsedFilter.toDate = filter.toDate;

        const docRef = doc(collection(FIRESTORE, "presetFilter"), filterId);
        await setDoc(docRef, parsedFilter);
    } catch(error){
        console.log("error while saving filter: ", error);
    }
}

const filterPage = () => {
    const router = useRouter();
    const { filterId } = useLocalSearchParams<{ filterId: string }>();

    const [minRatingSliderVal, setMinRatingSliderVal] = useState<number>(0);
    const [maxRatingSliderVal, setMaxRatingSliderVal] = useState<number>(0);

    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    const [fromPrice, setFromPrice] = useState<string>("");
    const [toPrice, setToPrice] = useState<string>("");

    const [filter, setFilter] = useState<filter>();
    const [today] = useState(new Date());

    const [modalVis, setModalVis] = useState<boolean>(false);
    const [filterName, setFilterName] = useState<string>("");

    const [fNameExists, setFNameExists] = useState<boolean>(false);

    useEffect(() => {
        // fetch the filters from firebase and let the user modify it
        const func = async () => {
            const collectionRef = collection(FIRESTORE, "presetFilter");
            const docToLoad = doc(collectionRef, filterId);
            const loadedData = await getDoc(docToLoad);

            // set the loaded initial values
            setFromPrice(loadedData.data()?.minPrice || "");
            setToPrice(loadedData.data()?.maxPrice || "");

            setFromDate(loadedData.data()?.fromDate?.toDate() || today);
            setToDate(loadedData.data()?.toDate?.toDate() || today);
            setMinRatingSliderVal(loadedData.data()?.minRating || 0);
            setMaxRatingSliderVal(loadedData.data()?.maxRating || 0);
            setFilterName(loadedData.data()?.filterName || "");
        }
        func();
    }, ([]));

    /* check for duplicite filter names */
    useEffect(() => {
        // fetch the filters from the database
        const collectionRef = collection(FIRESTORE, "presetFilter");
        const queryQ = query(collectionRef, where("filterName", "==", filterName));
        setFNameExists(false);
        const end = onSnapshot(queryQ, (sshot) => {
            sshot.docs.forEach((data) => {
                if(data.data()?.filterName === filterName && data.id !== filterId) {
                    console.log(data.data()?.filterName);
                    setFNameExists(true);
                }
            })
        });
        return () => end();
    }, ([filterName]));

    return (
        <SafeAreaView>
            <TouchableOpacity style={[styles.OtherBtn, {marginLeft: 10}]} onPress={() => router.back()}>
                <Ionicons name='close-outline' size={25}/>
            </TouchableOpacity>

                <Modal
                  style={styles.modal}
                  animationType="slide"
                  transparent={true}
                  visible={modalVis}>
                <View style={styles.modalView}>

                    <Text style={styles.subText}>Name your filter preset</Text>
                    <TextInput style={[styles.priceInput, {width: 150, alignSelf: "center", marginTop: 20}]}
                        placeholder='Enter filter name...'
                        placeholderTextColor="gray"
                        maxLength={30}
                        onChangeText={(name) => setFilterName(name)}
                        />
                    <View style={styles.modalBtns}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVis(false)}>
                        <Text style={styles.fBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={() => {const filter = {
                        fromDate: fromDate,
                        toDate: toDate,
                        minPrice: fromPrice,
                        maxPrice: toPrice,
                        minRating: minRatingSliderVal,
                        maxRating: maxRatingSliderVal,
                        filterName: filterName
                    }
                    setModalVis(false);
                    router.back();}}>
                        <Text style={styles.fBtnText}>Save</Text>
                    </TouchableOpacity>
                    </View>
                </View>
                </Modal>
            <ScrollView>

                <View style={styles.OuterView}>

                    <Text style={styles.MainText}>Edit Filter</Text>

                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <View style={[styles.subView, { flexDirection: "column" }]}>
                        <Text style={styles.subText}>Filter name</Text>
                        <TextInput style={[styles.priceInput, { width: 150 }]}
                            placeholder='filter name'
                            placeholderTextColor="gray"
                            maxLength={20}
                            value={filterName}
                            onChangeText={(name) => setFilterName(name)}
                        />
                        {fNameExists && (
                        <Text style={[styles.subText, { color: "red", margin: 5 }]}>Filter name already exists!!!</Text>
                        )}
                        {!fNameExists && (
                            <Text style={[styles.subText, { color: "white", margin: 5 }]}>Filter name already exists!!!</Text>
                        )}
                    </View>
                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <Text style={styles.subText}>Price</Text>

                    <View style={styles.subView}>
                        <Text style={styles.subsubText}>From</Text>
                        <TextInput style={[styles.priceInput, { marginRight: 30 }]}
                            placeholder='min price'
                            placeholderTextColor="gray"
                            maxLength={10}
                            value={fromPrice}
                            onChangeText={(price) => setFromPrice(price)}
                            />
                        <Text style={styles.subsubText}>To</Text>
                        <TextInput style={styles.priceInput}
                            placeholder='max price'
                            placeholderTextColor="gray"
                            maxLength={10}
                            value={toPrice}
                            onChangeText={(price) => setToPrice(price)}
                            />
                    </View>

                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <Text style={styles.subText}>Date</Text>
                        <Text style={styles.subsubText}>From</Text>
                        <DateTimePicker
                            style={styles.datetimepicker}
                            value={fromDate || today}
                            minimumDate={new Date()}
                            accentColor={Colors.primary}
                            themeVariant='light'
                            mode="date"
                            display="spinner"
                            onChange={(ev, date) => setFromDate(date || undefined)}
                        />
                        <Text style={styles.subsubText}>To</Text>
                        <DateTimePicker
                            style={styles.datetimepicker}
                            value={toDate || today}
                            minimumDate={new Date()}
                            accentColor={Colors.primary}
                            themeVariant='light'
                            mode="date"
                            display="spinner"
                            onChange={(ev, date) => setToDate(date || undefined)}
                        />

                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={25}/>
                        <Text style={styles.ratingText}> {minRatingSliderVal}</Text>
                    </View>
                    <Text style={styles.subText}>Minimal Rating</Text>
                    <Slider
                        style={styles.evalSlider}
                        minimumValue={0}
                        maximumValue={5}
                        step={1}
                        maximumTrackTintColor="#000000"
                        minimumTrackTintColor="green"
                        value={minRatingSliderVal}
                        onValueChange={(value) => {setMinRatingSliderVal(value)}}
                    />
                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={25}/>
                        <Text style={styles.ratingText}> {maxRatingSliderVal}</Text>
                    </View>
                    <Text style={styles.subText}>Maximal Rating</Text>
                    <Slider
                    style={styles.evalSlider}
                    minimumValue={0}
                    maximumValue={5}
                    step={1}
                    maximumTrackTintColor="#000000"
                    minimumTrackTintColor="green"
                    value={maxRatingSliderVal}
                    onValueChange={(value) => {setMaxRatingSliderVal(value)}}
                    />
                </View>

                <View style={styles.buttonRow}>

                    {!fNameExists && (<TouchableOpacity style={styles.fButton} onPress={() => {
                                                                        const filter = {
                                                                            fromDate: fromDate,
                                                                            toDate: toDate,
                                                                            minPrice: fromPrice,
                                                                            maxPrice: toPrice,
                                                                            minRating: minRatingSliderVal,
                                                                            maxRating: maxRatingSliderVal,
                                                                            filterName: filterName
                                                                        }
                                                                        setFilter(filter);
                                                                        saveFilter(filter, filterId);
                                                                        router.back();
                                                                    }}>
                        <Text style={styles.fBtnText}>Save</Text>
                    </TouchableOpacity>)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default filterPage;
