import { View, Text} from 'react-native';
import React from 'react';
import {Tabs} from "expo-router";
import Colors from "../../constants/Colors";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';



const Layout = () => {
    return<Tabs screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarLabelStyle: {
            fontFamily: 'mon-sb',
        },
    }}>
        <Tabs.Screen name="index" options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color}) => <Entypo name="home" size={24} color={color} />
        }}/>
        <Tabs.Screen name="explore" options={{
        tabBarLabel: 'Explore',
        tabBarIcon: ({color}) => <Entypo name="globe" size={24} color={color} />
    }}/>
        <Tabs.Screen name="wishlist" options={{
            tabBarLabel: 'Favorites',
            tabBarIcon: ({color}) => <AntDesign name="hearto" size={24} color={color} />
        }}/>
        <Tabs.Screen name="inbox" options={{
            tabBarLabel: 'Chat',
            headerShown: false,
            tabBarIcon: ({color}) => <Fontisto name="hipchat" size={24} color={color} />
        }}/>
        <Tabs.Screen name="profile" options={{
            tabBarLabel: 'Profile',
            headerShown: false,
            tabBarIcon: ({color}) => <Ionicons name="person-circle-outline" size={24} color={color} />
        }}/>
    </Tabs>;
}

export default Layout;