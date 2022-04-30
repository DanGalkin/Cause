import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
} from 'react-native';

const AddNoteScreen = ( {navigation} ) => {
    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Here you will add notes</Text>
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