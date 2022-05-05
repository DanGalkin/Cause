import React, { useState } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Button,
} from 'react-native';

import { ListFormer } from './EditParamUtilities';
import { UserIdContext } from './Contexts.js';

const EditParamScreen = ( {navigation} ) => {
    const [paramName, setParamName] = useState();
    const [durationType, setDurationType] = useState();
    const [complexityType, setComplexityType] = useState();
    const [valueType, setValueType] = useState();
    const [metric, setMetric] = useState();
    const [optionList, setOptionList] = useState();

    const userId = React.useContext(UserIdContext);

    return(
        <View style={styles.container}>
            <Text style={styles.label}>Create a new param</Text>
            <TextInput
                style={styles.input}
                placeholder="Name the new param"
                onChangeText={value => (setParamName(value))}
            />
            <Text style={styles.label}>Select a DURATION type of a param</Text>
            <SelectionButtons
                values={["moment", "duration"]}
                selectedValue={durationType}
                setSelectedValue={setDurationType}
            />
            <Text style={styles.label}>Select a COMPLEXITY type of a param</Text>
            <SelectionButtons
                values={["simple", "complex"]}
                selectedValue={complexityType}
                setSelectedValue={setComplexityType}
            />
            <Text style={styles.label}>Select a VALUE type of a param</Text>
            <SelectionButtons
                values={["boolean", "quantity", "list"]}
                selectedValue={valueType}
                setSelectedValue={setValueType}
            />
            <ValueTypeOptions
                option={valueType}
                setMetric={setMetric}
                setOptionList={setOptionList}
            />
            <View style={{margin: 10}}>
                <Button
                    title='Finish editing'
                    onPress={() => {
                        let paramObject = {};
                        paramObject['durationType'] = durationType;
                        paramObject['name'] = paramName;
                        paramObject['complexityType'] = complexityType;
                        paramObject['valueType'] = valueType;
                        paramObject['metric'] = metric;
                        paramObject['optionList'] = optionList;
                        console.log(paramObject); // TODO: save the paramObject to Database
                    }}
                />
            </View>
        </View>
    );
}

const SelectionButtons = ({ values, selectedValue, setSelectedValue}) => (
    <View style={styles.row}>
        {values.map((value) => (
            <TouchableOpacity
                key={value}
                onPress={() => setSelectedValue(value)}
                style={[
                    styles.button,
                    selectedValue === value && styles.selected
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

const ValueTypeOptions = ({ option, setMetric, setOptionList }) => {
    if (!option) {
        return null;
    }

    if (option === 'boolean') {
        return null;
    }

    if (option === 'quantity') {
        return (
            <View>
                <Text style={styles.label}>How your param will be measured?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Name the metric for param (kg, sec, pcs, anything)"
                    onChangeText={value => setMetric(value)}
                />
            </View>
        )
    }

    if (option === 'list') {
        return (
            <ListFormer 
                returnListArray={setOptionList}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    label: {
        padding:10,
    },
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'white',
        margin: 12,
        padding: 10
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        borderRadius: 4,
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
        marginHorizontal: '1%',
    },
    selected: {
        backgroundColor: "green",
        borderWidth: 0,
      },
    buttonLabel: {
        fontWeight: '500',
    },
    selectedLabel: {
        color: 'white',
    }
})

export default EditParamScreen;