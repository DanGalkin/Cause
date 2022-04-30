import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
} from 'react-native';

const ParamListScreen = ( {navigation} ) => {
    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Here will be a list of params</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('EditParam')} >
                <Text>Add new param</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate('AddNote')} >
                <Text>Add new note</Text>
            </TouchableOpacity>
        </View>
    );
}

export default ParamListScreen;