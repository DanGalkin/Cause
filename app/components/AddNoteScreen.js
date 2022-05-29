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

import database from '@react-native-firebase/database';
import DatePicker from 'react-native-date-picker';

import { UserIdContext } from './Contexts.js';
import SelectionButtons from '../utilities/SelectionButtons.js';
import { CommonActions } from '@react-navigation/native';

const AddNoteScreen = ({ route, navigation }) => {
    

    const { paramId, isChild } = route.params;
    const parentName = route.params.parentName || '';

    const userId = useContext(UserIdContext);

    const [param, setParam] = useState();
    
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [pickedTime, setPickedTime] = useState();
    const [noteValue, setNoteValue] = useState({'value': true});
    const [childrenSubmitted, setChildrenSubmitted] = useState({});
    const [fullName, setFullName] = useState();

    const updateParamProps = () => {
        database()
            .ref(`/users/${userId}/params/${paramId}`)
            .once('value')
            .then(snapshot => {
                setParam(snapshot.val());
            });
    }

    //get the param props from the DB on load
    useEffect(() => {
        updateParamProps();
    }, []);

    useEffect(() => {

        if(!param) return;

        console.log('debug updating childs time');
        console.log(`param is: ${JSON.stringify(param)}`);
        console.log(`parentTime is: ${JSON.stringify(route.params.parentTime)}`)
        console.log(`durInheritance is: ${JSON.stringify(param['durationInheritance'])}`);

        if(!isChild) {
            setFullName(`${param['name']}`);
        }

        if(isChild) {
            setFullName(`${parentName} : ${param['name']}`);
        }

        if(isChild && !param['durationInheritance']) {
            setPickedTime(route.params.parentTime);
            console.log(`picked time is 1 option: ${JSON.stringify(route.params.parentTime)}`) //DEBUG
        }

        if(isChild && param['durationInheritance'] === 'start') {
            setPickedTime({'moment': route.params.parentTime['duration']['startTime']})
            console.log(`picked time is 2 option: ${JSON.stringify({'moment': route.params.parentTime['duration']['startTime']})}`) //DEBUG
        }

        if(isChild && param['durationInheritance'] === 'end') {
            setPickedTime({'moment': route.params.parentTime['duration']['endTime']})
            console.log(`picked time is 3 option: ${JSON.stringify({'moment': route.params.parentTime['duration']['endTime']})}`) //DEBUG
        }
    }, [param])

    const setChildItemSubmitted = (childId) => {
        console.log(`updating submitted children: ${JSON.stringify(childrenSubmitted)}`); //DEBUG
        console.log(`with this ChildID: ${childId}`); //DEBUG

        setChildrenSubmitted({
            ...childrenSubmitted,
            [childId] : true
        })
    }

    return (  
        <View style={{ flex: 1 }}>
            <Text style={styles.label}>
                Add a new note for <Text style={{fontWeight: 'bold'}}>{fullName || ``}</Text>
            </Text>
            {/*UI to pick a time*/}
            <TimePicker
                durationType={param ? param.durationType : null}
                pickedTime={pickedTime}
                setPickedTime={setPickedTime}
                disabled={!param}
            />
            {/*UI to input value*/}
            { // Simple value input
            <NoteValueInput
                param={param}
                setNoteValue={setNoteValue}
            />}
            {// Complex input: list of child params to add value of
            param && param.complexityType === 'complex' &&
                <ScrollView>
                    <View style={{flexDirection: 'row', marginVertical: 12}}>
                        {Object.keys(param.children).map(key => {
                            return(
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.childItem, childrenSubmitted[param.children[key]['paramId']] && styles.submitted]}
                                    onPress={() => {
                                        navigation.push('AddNote', {paramId: param.children[key]['paramId'], parentTime: pickedTime, parentName: fullName, isChild: true, updateChildrenSubmitted: setChildItemSubmitted})
                                    }}
                                >
                                    <Text style={childrenSubmitted[param.children[key]['paramId']] && {color: 'white'}}>{param.children[key]['name']}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>
            }
            {/*Submit button*/}
            <View style={{ flex: 1, flexDirection: 'column-reverse'}}>
                <View style={{marginBottom: 30}}>
                    <Button
                        title='Submit this note'
                        disabled={submitButtonDisabled}
                        onPress={() => {
                            console.log('debugging Submit'); // DEBUG
                            console.log(`paramId is: ${paramId}`); // DEBUG
                            console.log(`pickedTime is: ${JSON.stringify(pickedTime)}`); // DEBUG
                            console.log(`noteValue is: ${JSON.stringify(noteValue)}`); // DEBUG
                            console.log(`isChild: ${JSON.stringify(isChild)}`); // DEBUG
                            setSubmitButtonDisabled(true);
                            const noteObject = {
                                'paramId' : paramId,
                                'name': fullName,
                                ...pickedTime,
                                ...noteValue
                            };

                            console.log(`noteObject is: ${JSON.stringify(noteObject)}`);

                            const newNoteReference = database().ref(`/users/${userId}/data/${Date.now().valueOf()}`);
                            newNoteReference.set(noteObject);

                            if(isChild) {
                                route.params.updateChildrenSubmitted(paramId);
                                navigation.dispatch(CommonActions.goBack());
                            }
                        }}
                    />
                </View>
            
            {/*Edit button*/  }
                <View style={{marginBottom: 30}}>
                    <Button
                        title='Edit this param'
                        onPress={() => {
                            navigation.navigate('EditParam', { param: param, paramId: paramId, isNew: false, refreshOnBack: updateParamProps })
                        }}
                    />
                </View>
            </View>
        </View>
    );
}

// TODO refactor timepicker, so it sets and gets picked time, and don't use it's own state variables to save it
const TimePicker = ({ durationType, pickedTime, setPickedTime, disabled = false }) => {

    if(disabled) return null;

    const fastTimeChoises ={
        'now': 0,
        '5 min ago': 5,
        '30 min ago': 30,
        '1 hour ago': 60
    }

    const [fastTimeChoise, setFastTimeChoise] = useState(Object.keys(fastTimeChoises)[0]);
    const [pickModalStartOpen, setPickModalStartOpen] = useState(false);
    const [pickModalEndOpen, setPickModalEndOpen] = useState(false);
    const [pickModalOpen, setPickModalOpen] = useState(false);

    //changes a time after button selection
    useEffect(() => {
        if(fastTimeChoise && durationType === 'moment') {
            setPickedTime({'moment': (new Date(Date.now() - 60000 * fastTimeChoises[fastTimeChoise])).valueOf()});
        }
    }, [fastTimeChoise]);

    //if we don't know yet the param props, timepicker can't know what to display
    if (!durationType) return null;

    //the case when we input time for the moment
    if (durationType === 'moment' && !pickedTime) {
        console.log(`setting duration pickedTime to null`) //DEBUG
        const nowTime = new Date(Date.now());
        setPickedTime({'moment': nowTime.valueOf()});
        return null;
    }

    if (durationType === 'moment' && pickedTime) {
        const displayPickedTime = new Date(pickedTime['moment']);

        return (
            <View>
                <Text style={styles.label}>
                    Choose time:
                </Text>
                <SelectionButtons
                    values={Object.keys(fastTimeChoises)}
                    selectedValue={fastTimeChoise}
                    setSelectedValue={setFastTimeChoise}
                    selectedColor='blue'
                />
                <View style={{margin: 10}}>
                    <TouchableOpacity
                        onPress={() => setPickModalOpen(true)}
                    >
                        <Text>
                            <Text style={styles.time}>
                                {displayPickedTime.toLocaleTimeString()}
                            </Text>   (Click to edit)
                        </Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={pickModalOpen}
                        date={new Date()}
                        onConfirm={(date) => {
                            setPickModalOpen(false)
                            setFastTimeChoise(null)
                            setPickedTime({'moment': date.valueOf()})
                        }}
                        onCancel={() => {
                            setPickModalOpen(false)
                        }}
                    />
                </View>
            </View>
        );
    }

    //the case when we input time for the moment
    
    if (durationType === 'duration' && !pickedTime) {
        console.log(`setting duration pickedTime to null`) //DEBUG
        setPickedTime({
            'duration': {
                'startTime': null,
                'endTime': null
            }
        })
        
        return null;
    }
    
    if (durationType === 'duration' && pickedTime) {

        const displayStartTime = pickedTime['duration']['startTime'] ? new Date(pickedTime['duration']['startTime']) : null;
        const displayEndTime = pickedTime['duration']['endTime'] ? new Date(pickedTime['duration']['endTime']) : null;

        return (
            <View>
                <Text style={styles.label}>
                    Choose duration:
                </Text>
                <View style={{margin: 10}}>
                    <Text style={styles.label}>
                        Start time:
                    </Text>
                    <TouchableOpacity
                        onPress={() => setPickModalStartOpen(true)}
                    >
                        <Text>
                            <Text style={styles.time}>
                                {displayStartTime ? displayStartTime.toLocaleTimeString() : `START TIME`}
                            </Text>   (Click to edit)
                        </Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={pickModalStartOpen}
                        date={new Date()}
                        onConfirm={(date) => {
                            setPickModalStartOpen(false);
                            setPickedTime({
                                'duration':{
                                    ...pickedTime['duration'],
                                    'startTime': date.valueOf()
                                }
                            });
                        }}
                        onCancel={() => {
                            setPickModalStartOpen(false)
                        }}
                    />
                </View>

                <View style={{margin: 10}}>
                    <Text style={styles.label}>
                        End time:
                    </Text>
                    <TouchableOpacity
                        onPress={() => setPickModalEndOpen(true)}
                    >
                        <Text>
                            <Text style={styles.time}>
                                {displayEndTime ? displayEndTime.toLocaleTimeString() : `END TIME`}
                            </Text>   (Click to edit)
                        </Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={pickModalEndOpen}
                        date={new Date()}
                        onConfirm={(date) => {
                            setPickModalEndOpen(false);
                            setPickedTime({
                                'duration':{
                                    ...pickedTime['duration'],
                                    'endTime': date.valueOf()
                                }
                            });
                        }}
                        onCancel={() => {
                            setPickModalEndOpen(false)
                        }}
                    />
                </View>

            </View>
        )
    }
}

const NoteValueInput = ({ param, setNoteValue }) => {
    const [selectedValue, setSelectedValue] = useState();
    
    //if we don't know yet the param props, NoteValueInput can't know what to display
    if(!param) return null;

    if(param && param.complexityType !== 'simple') return null;

    //the case for boolean value
    if(param.valueType === 'boolean') return (
        <View>
            <Text style={[styles.label, {fontWeight: 'bold'}]}>
                param value type is boolean so it records as TRUE
            </Text>
        </View>
    );
    
    //the case for quantity value
    if(param.valueType === 'quantity') return (
        <View>
            <TextInput
                style={styles.input}
                placeholder={`input the quantity in ${param.metric}`}
                onChangeText={value => (setNoteValue({'value': value}))}
            />
        </View>
    );

    //the case for value from list
    if(param.valueType === 'list') return (
        <View>
            <Text style={styles.label}>
                Choose a value from list:
            </Text>
            <SelectionButtons
                values={param.optionList}
                selectedValue={selectedValue}
                setSelectedValue={(value) => {
                    setSelectedValue(value);
                    setNoteValue({'value': value});
                }}
                direction='column'
            />
        </View>
    )
}

const ComplexParamInput = ({ param, parentTime, navigation }) => {
    if(!param) return null;

    if(param && param.complexityType !== 'complex') return null;

    const children = param.children;

    return(
        <ScrollView>
            <View style={{flexDirection: 'row', marginVertical: 12}}>
                {Object.keys(children).map(key => {
                    return(
                        <TouchableOpacity
                            key={key}
                            style={styles.childItem}
                            onPress={() => {
                                navigation.navigate('AddNote', {paramId: children[key]['paramId'], parentTime: parentTime})
                            }}
                        >
                            <Text>{children[key]['name']}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    label: {
        padding: 10,
    },
    time: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'white',
        margin: 12,
        padding: 10
    },
    childItem: {
        borderRadius: 4,
        borderColor: 'orange',
        borderWidth: 1,
        padding: 5,
        marginHorizontal: '1%',
        marginVertical: 10,
        flexDirection: 'row',
    },
    submitted: {
        backgroundColor: 'green',
        borderColor: 'green',
        borderWidth: 1,
    }
})

export default AddNoteScreen;