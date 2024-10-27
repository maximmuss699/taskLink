import { View, Text} from 'react-native';
import React from 'react';
import { Link } from "expo-router";

const Page = () => {
    return (
        <View>
            <Text>Psge</Text>
            <Link href={'/(modals)/login'}>
            Login
            </Link>
            <Link href={'/(modals)/booking'}>
            Booking
            </Link>
            <Link href={'/listing/1337'}>
                Listing details
            </Link>
        </View>
    );
}

export default Page;