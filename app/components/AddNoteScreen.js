import React, { useState, useContext, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
} from 'react-native';

import database from '@react-native-firebase/database';
import { UserIdContext } from './Contexts.js';

const AddNoteScreen = ( { route, navigation} ) => {
    const { paramId } = route.params;
    const userId = useContext(UserIdContext);
    const [param, setParam] = useState({});

    useEffect(() => {
        database()
            .ref(`/users/${userId}/params/${paramId}`)
            .once('value')
            .then(snapshot => {
                setParam(snapshot.val());
                });
    }, []);

    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Here you will add notes for a {param.name}</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('ParamList')} >
                <Text>Back to List</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate('EditParam')} >
                <Text>Edit this Param</Text>
            </TouchableOpacity>
        </View>
    );
}

export default AddNoteScreen;