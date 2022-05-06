import React, { useState, useContext, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Button,
} from 'react-native';

import database from '@react-native-firebase/database';
import { UserIdContext } from './Contexts.js';

const ParamListScreen = ( {navigation} ) => {
    const [paramList, setParamsList] = useState([]);

    const userId = useContext(UserIdContext);

    //fetch param data on load once
    useEffect(() => {
        database()
            .ref(`/users/${userId}/params`)
            .once('value')
            .then(snapshot => {
                setParamsList(snapshot.val());
                });
    }, []);

    //subscribe for listening DB changes
    useEffect(() => {
        const onValueChange = database()
          .ref(`/users/${userId}/params`)
          .on('value', snapshot => {
            setParamsList(snapshot.val());
          });
    
        // Stop listening for updates when no longer required
        return () => database().ref(`/users/${userId}/params`).off('value', onValueChange);
      }, [userId]);
    
    return(
        <View style={{ flex: 1 }}>
            <Text style={styles.label}>Click on param to add new value:</Text>
            <View style={styles.row}>
                {Object.keys(paramList).map(key => {
                    return(
                    <TouchableOpacity
                        key={key}
                        style={styles.paramItem}
                        onPress={() => navigation.navigate('AddNote', { paramId: key })} >
                        <Text>{paramList[key]['name']}</Text>
                    </TouchableOpacity>
                )})}
            </View>
            <View style={{ flex: 1, flexDirection: 'column-reverse', marginBottom: 30 }}>
                <Button
                    title='Add new param'
                    onPress={() => navigation.navigate('EditParam')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        padding: 10,
    },
    paramItem: {
        borderRadius: 4,
        borderColor: 'orange',
        borderWidth: 1,
        padding: 5,
        marginHorizontal: '1%',
        marginVertical: 10,
        flexDirection: 'row',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    }
})

export default ParamListScreen;