import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import React, { act, useEffect, useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { FIRESTORE } from '@/firebaseConfig';
import { collection, addDoc, onSnapshot, query, where, GeoPoint } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { jobPost } from '../(tabs)';
import { parse } from '@babel/core';
import MapView, { MapPressEvent, Marker, Circle } from 'react-native-maps';

/* Filter interface definition */
/* all of them are optional... */
export interface filter {
    fromDate?: Date;
    toDate?: Date;
    minPrice?: string;
    maxPrice?: string;
    minRating?: number;
    maxRating?: number;
    filterName?: string;
    location?: GeoPoint | null;
    locationRadius?: number;
    address?: string | null;
}

interface location {
    longitude: number;
    latitude: number;
}

/* TODO: wrap other functions inside try-catch */
async function saveFilter(filter: filter) {
    try {
        const collectionRef = collection(FIRESTORE, "presetFilter");

        /* To dynamically store only defined values */
        const parsedFilter: any = { filterName: filter.filterName };

        if (filter.minRating !== undefined && filter.minRating > 0) parsedFilter.minRating = filter.minRating;
        if (filter.maxRating !== undefined && filter.maxRating > 0) parsedFilter.maxRating = filter.maxRating;

        if (filter.minPrice !== undefined && filter.minPrice !== "") parsedFilter.minPrice = filter.minPrice;
        if (filter.maxPrice !== undefined && filter.maxPrice !== "") parsedFilter.maxPrice = filter.maxPrice;

        if (filter.fromDate !== undefined) parsedFilter.fromDate = filter.fromDate;
        if (filter.toDate !== undefined) parsedFilter.toDate = filter.toDate;
        if (filter.location !== undefined && filter.location !== null) parsedFilter.location = filter.location;
        if (filter.location !== null && filter.locationRadius !== undefined && filter.locationRadius > 0) parsedFilter.locationRadius = filter.locationRadius;
        if (filter.address !== null && filter.address !== "") parsedFilter.address = filter.address;

        await addDoc(collectionRef, parsedFilter);
    } catch(error){
        console.log("error while saving filter: ", error);
    }
}

const filterPage = () => {
    const router = useRouter();
    const { category } = useLocalSearchParams<{ category: string }>();
    const [minRatingSliderVal, setMinRatingSliderVal] = useState<number>(0);
    const [maxRatingSliderVal, setMaxRatingSliderVal] = useState<number>(0);
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [fromPrice, setFromPrice] = useState<string>("");
    const [toPrice, setToPrice] = useState<string>("");
    const [filter, setFilter] = useState<filter>();
    const [today] = useState(new Date());
    const [filterName, setFilterName] = useState<string>("");
    const [modalVis, setModalVis] = useState<boolean>(false);

    const [matchedFilterName, setMatchedFilterName] = useState<string | undefined>("");

    const [fNameExists, setFNameExists] = useState<boolean>(false);

    const [activeSubScr, setActiveSubScr] = useState<string>("filters"); // "filters" for basic form or "map" for a map view
    const [mapRadius, setMapRadius] = useState<number>(0);
    const [mapLocation, setMapLocation] = useState<GeoPoint | null>(null);
    const [mapAddr, setMapAddr] = useState<string | null>(null);

    /* check for duplicite filter names */
    useEffect(() => {
        // fetch the filters from the database
        const collectionRef = collection(FIRESTORE, "presetFilter");
        const queryQ = query(collectionRef, where("filterName", "==", filterName));
        setFNameExists(false);
        const end = onSnapshot(queryQ, (sshot) => {
            sshot.docs.forEach((data) => {
                if(data.data()?.filterName === filterName) {
                    // console.log(data.data()?.filterName);
                    setFNameExists(true);
                }
            })
        });
        return () => end();
    }, ([filterName]));

    const mapBtncolor = activeSubScr === "map" ? "#52812F" : "#D9D9D9";
    const filterBtncolor = activeSubScr === "filters" ? "#52812F" : "#D9D9D9";

    const mapRef = React.useRef<MapView>(null);

    const updateLocation = async (location: MapPressEvent) => {
        location.persist(); // to handle 'nativeEvent' error
        if (mapRef.current) {
            const {latitude, longitude} = location.nativeEvent.coordinate;
            const address = await mapRef.current.addressForCoordinate({ longitude, latitude });
            setMapLocation(new GeoPoint(location.nativeEvent.coordinate.latitude, location.nativeEvent.coordinate.longitude))
            setMapAddr(address.locality + ", " + address.countryCode);
        }
    }

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
                    {fNameExists && (
                        <Text style={[styles.subText, { color: "red", margin: 5 }]}>Filter name already exists!!!</Text>
                    )}
                    {!fNameExists && (
                        <Text style={[styles.subText, { color: "white", margin: 5 }]}>Filter name already exists!!!</Text>
                    )}

                    <View style={styles.modalBtns}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVis(false)}>
                        <Text style={styles.fBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    {!fNameExists && (<TouchableOpacity style={styles.submitBtn} onPress={() => {const filter = {
                        fromDate: fromDate,
                        toDate: toDate,
                        minPrice: fromPrice,
                        maxPrice: toPrice,
                        minRating: minRatingSliderVal,
                        maxRating: maxRatingSliderVal,
                        filterName: filterName,
                        locationRadius: mapRadius,
                        location: mapLocation,
                        address: mapAddr
                    }
                    saveFilter(filter);
                    setModalVis(false);
                    router.back();}}>
                        <Text style={styles.fBtnText}>Save</Text>
                    </TouchableOpacity>)}
                    </View>
                </View>
                </Modal>
            <ScrollView>

                <View style={styles.OuterView}>

                    <View style={styles.contextChangeView}>
                        <TouchableOpacity style={[styles.contextChangeBtn, { backgroundColor: filterBtncolor }]} onPress={() => setActiveSubScr("filters")}>
                            <Text style={styles.contextChanheBtnText}>Form</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.contextChangeBtn, { backgroundColor: mapBtncolor }]} onPress={() => setActiveSubScr("map")}>
                            <Text style={styles.contextChanheBtnText}>Map</Text>
                        </TouchableOpacity>
                    </View>

                    {activeSubScr === "filters" ? (<View>
                    <Text style={styles.MainText}>Filters</Text>

                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <Text style={styles.subText}>Price</Text>

                    <View style={styles.subView}>
                        <Text style={styles.subsubText}>From</Text>
                        <TextInput style={[styles.priceInput, { marginRight: 30 }]}
                            placeholder='min price'
                            placeholderTextColor="gray"
                            maxLength={10}
                            onChangeText={(price) => setFromPrice(price)}
                            />
                        <Text style={styles.subsubText}>To</Text>
                        <TextInput style={styles.priceInput}
                            placeholder='max price'
                            placeholderTextColor="gray"
                            maxLength={10}
                            onChangeText={(price) => setToPrice(price)}
                            />
                    </View>

                    <View style={{ height: 2, backgroundColor: "black", width: "100%", margin: 5, marginBottom: 8, alignSelf: "center" }}></View>
                    <Text style={styles.subText}>Date</Text>
                        <Text style={styles.subsubText}>From</Text>
                        <DateTimePicker
                            style={styles.datetimepicker}
                            value={filter?.fromDate || today}
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
                            value={filter?.toDate || today}
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
                    onValueChange={(value) => {setMaxRatingSliderVal(value)}}
                    />
                    </View>): (
                        <View style={{ flex: 1 }}>
                            {/* Implement searchbar */}
                            <Text style={[styles.MainText, {marginVertical: 20}]}>Map</Text>
                                <Text style={[styles.ratingText, {alignSelf: "center", marginVertical: 15}]}>Radius: { mapRadius } km</Text>
                                <Slider
                                    style={styles.evalSlider}
                                    minimumValue={0}
                                    maximumValue={300}
                                    step={1}
                                    maximumTrackTintColor="#000000"
                                    minimumTrackTintColor="green"
                                    onValueChange={(value) => setMapRadius(value)} // conversion to meters
                                />
                            <View style={styles.mapView}>
                                <MapView
                                ref={mapRef}
                                onPress={(location) => {updateLocation(location)}}
                                style={styles.map}
                                >
                                    {mapLocation && (
                                        <>
                                        <Marker
                                            coordinate={{ latitude: mapLocation.latitude, longitude: mapLocation.longitude }}
                                            pinColor='green'
                                            />
                                        <Circle
                                            center={{ latitude: mapLocation.latitude, longitude: mapLocation.longitude }}
                                            radius={mapRadius * 1000}
                                            strokeColor='#52812F'
                                            fillColor='rgba(118, 185, 67, 0.25)'
                                            />
                                        </>
                                    )}
                                </MapView>
                            </View>

                        </View>
                    )}

                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.fButton} onPress={() => setModalVis(true)}>
                        <Text style={styles.fBtnText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.fButton} onPress={() => {
                                                                        const filter = {
                                                                            fromDate: fromDate,
                                                                            toDate: toDate,
                                                                            minPrice: fromPrice,
                                                                            maxPrice: toPrice,
                                                                            minRating: minRatingSliderVal,
                                                                            maxRating: maxRatingSliderVal,
                                                                            locationRadius: mapRadius,
                                                                            location: mapLocation,
                                                                            address: mapAddr
                                                                        }
                                                                        setFilter(filter);
                                                                        router.back();
                                                                        setTimeout(() =>
                                                                            router.replace({ pathname: "/(modals)/posts",
                                                                                params: {category: category, filter: JSON.stringify(filter)}})
                                                                            , 150);}}>
                        <Text style={styles.fBtnText}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
    tasklinkLogo: {
        fontSize: 18,
        fontFamily: 'modernaRegular',
        color: '#888888',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        position: "absolute",
        top: 750,
        alignSelf: "center"
    },
    OtherBtn: {
        width: 30,
        height: 30,
        shadowColor: '#DEDEDE',
        backgroundColor: "white",
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    OuterView: {
        width: "95%",
        height: "auto",
        backgroundColor: "#FCFFFB",
        alignSelf: "center",
        alignItems: "center",
        borderRadius: 20,
        margin: 8,
        padding: 10
    },
    MainText: {
        alignSelf: "center",
        fontSize: 28,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        marginLeft: 5
    },
    subText: {
        alignSelf: "center",
        fontSize: 20,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        marginLeft: 5
    },
    CategView: {
        flexDirection: "row",
        alignItems: "center"
    },
    evalSlider: {
        marginTop: 10,
        marginBottom: 30,
        width: 290,
        alignSelf: "center"
    },
    rating: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    ratingText: {
        marginTop: 2,
        fontFamily: 'mon-b',
        justifyContent: "center",
        alignItems: "center",
        fontSize: 20
    },
    priceInput: {
        width: 80,
        height: 40,
        borderWidth: 2,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1},
        fontFamily: 'mon-b',
        justifyContent: "center"
    },
    subView: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    subsubText: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontFamily: 'mon-b',
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        marginLeft: 5
    },
    datetimepicker: {
        width: "90%",
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#DEDEDE',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1}
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: 80,
        backgroundColor: "white"
    },
    fButton: {
        width: 100,
        height: 40,
        backgroundColor: "green",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 30
    },
    fBtnText: {
        fontFamily: 'mon-b',
        color: "white"
    },
    cancelBtn: {
        width: 80,
        height: 30,
        backgroundColor: "#D2122E",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 30
    },
    submitBtn: {
        width: 80,
        height: 30,
        backgroundColor: "green",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 30
    },
    modal: {
        flex: 1,
        alignSelf: "center",
        backgroundColor: "white",
        alignContent: "center",
        borderRadius: 30,
        borderColor: "gray",
        borderWidth: 2
    },
    modalBtns: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20
    },
    modalView: {
        position: "absolute",
        top: 215,
        width: "80%",
        height: 250,
        alignSelf: "center",
        backgroundColor: "white",
        alignContent: "center",
        justifyContent: "center",
        borderRadius: 30,
        borderColor: "gray",
        borderWidth: 2
    },
    contextChangeView: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    contextChangeBtn: {
        width: 100,
        height: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    contextChanheBtnText: {
        fontFamily: 'mon-b',
    },
    mapView: {
        flex: 1,
        height: 400,
        alignItems: "center",
        justifyContent: "center"
    },
    map: {
        width: '120%',
        height: '88%',
        borderBlockColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
    }
})

export default filterPage;
