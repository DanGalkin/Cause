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
    const [processList, setProcessList] = useState([]);

    const userId = useContext(UserIdContext);

    const updateParamData = () => {
        database()
            .ref(`/users/${userId}/params`)
            .once('value')
            .then(snapshot => {
                setParamsList(snapshot.val());
                });

        database()
            .ref(`/users/${userId}/processes`)
            .once('value')
            .then(snapshot => {
                setProcessList(snapshot.val());
                });
    }

    //fetch param data on load and refresh on focus
    useEffect(() => {
        updateParamData();

        const willFocusSubscription = navigation.addListener('focus', () => {
            updateParamData();
        })

        return willFocusSubscription;
    }, []);

    //Set a listener for DB changes and update
    useEffect(() => {
        const onUserDataChange = database()
            .ref(`/users/${userId}`)
            .on('value', () => {
                updateParamData();
            });

        return () => database().ref(`/users/${userId}`).off('value', onUserDataChange);
    }, [userId])



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

    //TODO Doubling functon with AddNoteScreen - refactor
    const killProcess = (processId) => {
        const killProcessReference = database().ref(`/users/${userId}/processes/${processId}`);
        killProcessReference.remove();
    }
    
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
                                <Text>{paramList[key]['name']}{paramList[key]['durationType'] === 'duration' ? ' 🕒' : ''}</Text>
                            </TouchableOpacity>
                        )})}
                    </View>
                </ScrollView>}
            </View>
            <View style={{ flexDirection: 'column-reverse'}}>
                <View style={{ marginBottom: 30 }}>
                    <Button
                        title='Show Charts'
                        onPress={() => navigation.navigate('Charts')} />
                </View>
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
                {/* List of live processes */}
                { processList &&
                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.label}>⏳ Live processes:</Text>
                    <View style={styles.row}>
                            {Object.keys(processList).map(key => {
                                const timeStarted = new Date(processList[key]['timeStarted']);
                                
                                return(
                                    <View style={styles.processItem}>
                                        <TouchableOpacity
                                            key={key}
                                            style={{marginRight: 10 }}
                                            onPress={() => {
                                                navigation.push('AddNote', {paramId: processList[key]['paramId'], processId: key, process: processList[key] /*isChild: true, */})
                                            }}>
                                            <Text>{processList[key]['paramName']}: {timeStarted.toLocaleTimeString()}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            key={key+'0'}
                                            onPress={() => {
                                                killProcess(key);
                                            }}>
                                            <Text style={{color: 'red'}}>X</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                    </View>
                </View> }
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
    processItem: {
        borderRadius: 4,
        borderColor: 'darkmagenta',
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