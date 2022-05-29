import React, { useEffect, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
} from 'react-native';

import database from '@react-native-firebase/database';
import Clipboard from '@react-native-clipboard/clipboard';

import { UserIdContext } from './Contexts.js';

const DisplayScreen = ( { navigation } ) => {

    const userId = React.useContext(UserIdContext);

    const [userEntries, setUserEntries] = useState();

    useEffect(() => {
        database()
            .ref(`/users/${userId}/data`)
            .once('value')
            .then(snapshot => {
                setUserEntries(snapshot.val());
                });
    }, []);

    if(!userEntries || !userParams) return(
        <View style={{ flex: 1 }}>
            <Text>Retrieving data from Database</Text>
            <View style={{ flexDirection: 'column-reverse', marginBottom: 30 }}>
                <Button
                    title='Back to param list'
                    onPress={() => navigation.navigate('ParamList')}
                />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.valueList}>
                {Object.keys(userEntries).map(entry => {
                    return(
                        <DisplayEntry
                            entryObject={userEntries[entry]}
                            key={entry}
                        />
                    );
                })}
            </ScrollView>

            <View style={{ flexDirection: 'column-reverse'}}>
                <View style={{ marginBottom: 30 }}>
                    <Button
                        title='Back to param list'
                        onPress={() => navigation.navigate('ParamList')}
                    />
                </View>
                <View style={{ marginBottom: 30 }}>
                    <Button
                        title='Copy your data in JSON to clipboard'
                        onPress={() => Clipboard.setString(JSON.stringify(userEntries))}
                    />
                </View>
            </View>
        </View>
    );
}

const DisplayEntry = ({ entryObject }) => {

    const paramName =entryObject['name'];
    const entryValue = entryObject['value'];
    const moment = entryObject['moment'] ? new Date(entryObject['moment']) : null;
    const startTime = entryObject['duration'] ? new Date(entryObject['duration']['startTime']) : null;
    const endTime = entryObject['duration'] ? new Date(entryObject['duration']['endTime']) : null;

    try {
        return(
            <View style={styles.entry}>
                <View style={styles.entryTime}>
                    <Text>
                        {entryObject['moment'] ? `${moment.toLocaleDateString()}` : `${endTime.toLocaleDateString('')}`}
                    </Text>
                    <Text style={{fontWeight: 'bold'}}>
                        {entryObject['moment'] ? `${moment.toLocaleTimeString()}` : `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`}
                    </Text>
                </View>
                <View  style={{width: 100}}>
                    <Text>
                        {paramName}
                    </Text>
                </View>
                <View  style={{width: 80}}>
                    <Text>
                        {entryValue}
                    </Text>
                </View>
            </View>
        )
    }

    catch {
        return(
            <View style={styles.entry}>
                <Text>
                    Ты где-то накосячил, поэтому запись не отображается
                </Text>
            </View>
        )
    } 
}

const styles = StyleSheet.create({
    valueList: {
        margin: 10,
        flex: 1,
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
    entry: {
        marginVertical: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    entryTime: {
        width: 150
    },
})

export default DisplayScreen;

