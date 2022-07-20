import React, { useState, useContext, useEffect } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Button,
    TextInput,
    ScrollView,
} from 'react-native';

const ParamSelectorScreen = ({ route, navigation }) => {
    const {userParams, setSelectedParam, paramId} = route.params;

    //show list of parents-params if it is a first screen
    if(paramId === null){
        return (
            <ScrollView style={{flex:1}}>
                <View style={styles.row}>
                    {Object.keys(userParams).map(key => {
                        //don't show child params
                        if(userParams[key]['parentId']) return null;

                        return(
                            <TouchableOpacity
                                key={key}
                                style={styles.paramItem}
                                onPress={() => navigation.push('ParamSelector', {userParams, setSelectedParam, paramId: key})}>
                                <Text>{userParams[key]['name']}</Text>
                            </TouchableOpacity>
                        )
                    })}
                    
                </View>
            </ScrollView>
        )
    }

    //show children of paramId
    return(
        <View style={{flex:1}}>
            <View style={styles.label}>
                <Text>{userParams[paramId]['name']}</Text>
            </View>
            {//show children for complex parameters
            userParams[paramId].complexityType === 'complex' &&
            <ScrollView style={{flex:1}}>
                <View style={styles.row}>
                    {Object.keys(userParams[paramId]['children']).map(key => {
                            return(
                                <TouchableOpacity
                                    key={key}
                                    style={styles.paramItem}
                                    onPress={() => navigation.push('ParamSelector', {userParams, setSelectedParam, paramId: userParams[paramId]['children'][key]['paramId']})}>
                                    <Text>{userParams[paramId]['children'][key]['name']}</Text>
                                </TouchableOpacity>
                            )
                        })}
                </View>
            </ScrollView>
            }
            <View style={{ flexDirection: 'column-reverse' }}>
                <View style={{marginBottom: 30}}>
                    <Button
                        title='Select this Param to Draw'
                        onPress={() => {
                            setSelectedParam(paramId);
                            navigation.navigate('Charts');
                        }}
                    />
                </View>
            </View>
        </View>
    ) 
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

export default ParamSelectorScreen;