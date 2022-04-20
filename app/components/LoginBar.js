//Login Bar, that shows, when the person is logged in

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    } from 'react-native';

const LoginBar = (props) => {
    console.log('properties are:', props);
    const  { userName, logout } = props;
    return(
        <View style={styles.loginBar}>
            <Text>Hi, {userName || 'Fella'}!</Text>
            <TouchableOpacity onPress={logout}>
                <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    loginBar: {
        fontSize: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    logout: {
        textDecorationLine: 'underline',
        color: 'red',
    },
})

export default LoginBar;