import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Button,
} from 'react-native';

import database from '@react-native-firebase/database';
import { CommonActions } from '@react-navigation/native';

import { ListFormer } from './EditParamUtilities';
import { UserIdContext } from './Contexts.js';
import SelectionButtons from '../utilities/SelectionButtons';

const EditParamScreen = ( { route, navigation } ) => {

    const [paramName, setParamName] = useState();
    const [durationType, setDurationType] = useState();
    const [complexityType, setComplexityType] = useState();
    const [valueType, setValueType] = useState();
    const [metric, setMetric] = useState();
    const [optionList, setOptionList] = useState();
    const [finishButtonDisabled, setFinishButtonDisabled] = useState(false);

    //if editing existing param, set values of this param
    useEffect(() => {
        if(route.params) {
            const paramToEdit = route.params.param;

            setParamName(paramToEdit.name);
            setDurationType(paramToEdit.durationType);
            setComplexityType(paramToEdit.complexityType);
            setValueType(paramToEdit.valueType);
            setMetric(paramToEdit.metric ? paramToEdit.metric : null);
            setOptionList(paramToEdit.optionList ? paramToEdit.optionList : null);
        }
    }, [])

    const userId = React.useContext(UserIdContext);

    return(
        <View style={styles.container}>
            <Text style={styles.label}>{route.params ? `Edit the param: ${route.params.param.name}` : `Create a new param`}</Text>
            <TextInput
                style={styles.input}
                placeholder="Name the param"
                value={paramName || null}
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
                metric={metric}
                setMetric={setMetric}
                optionList={optionList}
                setOptionList={setOptionList}
            />
            <View style={{margin: 10}}>
                <Button
                    title='Finish editing'
                    disabled={finishButtonDisabled}
                    onPress={() => {
                        setFinishButtonDisabled(true);
                        let paramObject = {};
                        paramObject['durationType'] = durationType;
                        paramObject['name'] = paramName;
                        paramObject['complexityType'] = complexityType;
                        paramObject['valueType'] = valueType;
                        paramObject['metric'] = metric;
                        paramObject['optionList'] = optionList;

                        //create new item if it's creating a new param
                        if(!route.params) {
                            const newParamReference = database().ref(`/users/${userId}/params`).push();
                            newParamReference.set(paramObject);
                        }
                        
                        //save to existing param if it's editing
                        if(route.params) {
                            database().ref(`/users/${userId}/params/${route.params.paramId}`).set(paramObject);
                            route.params.refreshOnBack();
                            navigation.dispatch(CommonActions.goBack());
                            //TODO: Deal with the warning: "Non-serializable values were found in the navigation state"
                        }
                    }}
                />
            </View>
        </View>
    );
}

const ValueTypeOptions = ({ option, metric, setMetric, optionList, setOptionList }) => {
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
                    value={metric || null}
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
                optionList={optionList || []}
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