import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Button,
    TouchableOpacity,
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
    const [children, setChildren] = useState([]); // This must be updated when editing
    const [durationInheritance, setDurationInheritance] = useState();

    const [finishButtonDisabled, setFinishButtonDisabled] = useState(false);
    const [newParamReference, setNewParamReference] = useState();

    const userId = React.useContext(UserIdContext);
    
    const isNew = route.params.isNew;
    const isChild = route.params.isChild;

    
    useEffect(() => {
        if(isNew) {
            //create a new entry in DB and get the new paramId to use it later
            const newParamReference = database().ref(`/users/${userId}/params`).push();
            setNewParamReference(newParamReference);
        }

        if(isChild && route.params.parentDurationType === 'moment') {
            setDurationType('moment');
        }

        if(!isNew) {
            //if editing existing param, set values of this param
            const paramToEdit = route.params.param;

            setParamName(paramToEdit.name);
            setDurationType(paramToEdit.durationType);
            setComplexityType(paramToEdit.complexityType);
            setValueType(paramToEdit.valueType);
            setMetric(paramToEdit.metric ? paramToEdit.metric : null);
            setOptionList(paramToEdit.optionList ? paramToEdit.optionList : null);
        }

        if(!isNew && route.params.param.complexityType === 'complex') {
            setChildren(route.params.param.children || [] );
        }
    }, [])



    const addChild = (child) => {
        let newChildrenList = [...children, child];
        setChildren(newChildrenList);
    }

    return(
        <View style={styles.container}>
            <Text style={styles.label}>{!isNew ? `Edit the param: ${paramName}` : `Create a new param`}</Text>
            <TextInput
                style={styles.input}
                placeholder="Name the param"
                value={paramName || null}
                onChangeText={value => (setParamName(value))}
            />
            
            { // show duration options if NOT a child param
            !isChild &&
            <View>
                <Text style={styles.label}>Select a DURATION type of a param</Text>
                <SelectionButtons
                    values={["moment", "duration"]}
                    selectedValue={durationType}
                    setSelectedValue={setDurationType}
                />
            </View>}

            { // show duration options if IS a child param
            // parental durationType is moment => childs is moment too
            isChild && route.params.parentDurationType === 'moment' && (
            <View>
                <Text style={styles.label}>Only Moment is available, because a parent has Moment duration type</Text>
                <SelectionButtons
                    values={["moment"]}
                    selectedValue={durationType}
                    setSelectedValue={setDurationType}
                />
            </View>)}
            { // show duration options if IS a child param
            // parental durationType is duration => there are options for a child
            isChild && route.params.parentDurationType === 'duration' && (
                <View>
                    <Text style={styles.label}>Duration will match parents' duration, for moment there are options</Text>
                    <SelectionButtons
                        values={["moment", "duration"]}
                        selectedValue={durationType}
                        setSelectedValue={setDurationType}
                    />
                    {durationType === 'moment' &&
                    <View>
                        <Text style={styles.label}>Moment may match start or end of a parents' duration</Text>
                        <SelectionButtons
                            values={['start', 'end']}
                            selectedValue={durationInheritance}
                            setSelectedValue={setDurationInheritance}
                        />
                    </View>
                    }
                </View>)
            }

            <Text style={styles.label}>Select a COMPLEXITY type of a param</Text>
            <SelectionButtons
                values={["simple", "complex"]}
                selectedValue={complexityType}
                setSelectedValue={setComplexityType}
            />
            
            { // show valueType and value props imput only if the param is simple
            (complexityType === 'simple') &&
            <View>
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
            </View>
            }
            { // show param adder if the param is complex
            (complexityType === 'complex') &&
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12}}>
                {Object.keys(children).map(key => {
                    return(
                    <TouchableOpacity
                        key={key}
                        style={styles.paramItem}
                    >
                        <Text>{children[key]['name']}</Text>
                    </TouchableOpacity>
                )})}
                <TouchableOpacity
                    onPress={() => {
                        //go to creating a new child param with additional info
                        navigation.push('EditParam',
                            {isChild: true,
                            parentId: isNew ? newParamReference.key : route.params.paramId,
                            parentDurationType: durationType,
                            isNew: true,
                            addAsChildToParent: addChild})
                    }}
                    style={styles.button}
                >
                   <Text>+ Add child</Text>
                </TouchableOpacity>
            </View>
            }
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
                        paramObject['children'] = children;
                        paramObject['parentId'] = isChild ? route.params.parentId : null;
                        paramObject['durationInheritance'] = durationInheritance;

                        if(isNew && !isChild) {
                            newParamReference.set(paramObject);
                        }
                        
                        if(isNew && isChild) {
                            newParamReference.set(paramObject);
                            //get back to parent adding current paramId and name to parents' children list
                            route.params.addAsChildToParent({paramId: newParamReference.key, name: paramName});
                            navigation.dispatch(CommonActions.goBack());
                        }

                        //save to existing param if it's editing
                        if(!isNew) {
                            database()
                                .ref(`/users/${userId}/params/${route.params.paramId}`)
                                .set(paramObject)
                                .then(() => route.params.refreshOnBack());
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
        flexDirection: 'row',
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
})

export default EditParamScreen;