import React, { useState, useContext, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Button,
    ScrollView,
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
            <View style={{ flex: 1 }}>
                {!paramList && <Text style={styles.label}>Wait for DB to synchronize or add new param</Text>}
                {paramList && <ScrollView style={{ flex: 1 }}>
                    <Text style={styles.label}>Click on param to add new note:</Text>
                    <View style={[styles.row]}>
                        {Object.keys(paramList).map(key => {

                            //don't show child params
                            if(paramList[key]['parentId']) return null;

                            return(
                            <TouchableOpacity
                                key={key}
                                style={styles.paramItem}
                                onPress={() => navigation.navigate('AddNote', { paramId: key, isChild: false })} >
                                <Text>{paramList[key]['name']}</Text>
                            </TouchableOpacity>
                        )})}
                    </View>
                </ScrollView>}
            </View>
            <View style={{ flexDirection: 'column-reverse'}}>
                <View style={{ marginBottom: 30 }}>
                    <Button
                        title='View recorded entries'
                        onPress={() => navigation.navigate('Display')} />
                </View>
                <View style={{ marginBottom: 30 }}>
                    <Button
                        title='Add new param'
                        onPress={() => navigation.navigate('EditParam', {isNew: true, isChild: false})} />
                </View>
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