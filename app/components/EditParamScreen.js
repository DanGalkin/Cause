import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
} from 'react-native';

const EditParamScreen = ( {navigation} ) => {
    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Here you will create or edit a param</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('ParamList')} >
                <Text>Back to param list</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate('AddNote')} >
                <Text>Add note for created param</Text>
            </TouchableOpacity>
        </View>
    );
}

export default EditParamScreen;