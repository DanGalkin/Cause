import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text
} from 'react-native';

const SelectionButtons = ({ values, setSelectedValue, selectedValue, direction = 'row', color = 'black', selectedColor = 'green' }) => (
    <View style={[styles.row, {flexDirection: direction}]}>
        {values.map((value) => (
            <TouchableOpacity
                key={value}
                onPress={() => setSelectedValue(value)}
                style={[
                    styles.button,
                    {borderColor: color},
                    selectedValue === value && {
                        backgroundColor: selectedColor,
                        borderColor: selectedColor,
                        borderWidth: 1
                        }
                ]}
            >
                <Text
                    style={[
                        styles.buttonLabel,
                        selectedValue === value && styles.selectedLabel
                    ]}
                >
                    {value}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
)

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        borderRadius: 4,
        borderWidth: 1,
        padding: 5,
        marginHorizontal: '1%',
        marginVertical: 3,
    },
    selected: {
        backgroundColor: 'green',
        borderColor: 'green',
        borderWidth: 1,
      },
    buttonLabel: {
        fontWeight: '500',
    },
    selectedLabel: {
        color: 'white',
    }
})

export default SelectionButtons;