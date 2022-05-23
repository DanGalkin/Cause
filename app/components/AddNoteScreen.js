import React, { useState, useContext, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Button,
    TextInput,
} from 'react-native';

import database from '@react-native-firebase/database';
import DatePicker from 'react-native-date-picker';

import { UserIdContext } from './Contexts.js';
import SelectionButtons from '../utilities/SelectionButtons.js';

const AddNoteScreen = ({ route, navigation }) => {
    

    const { paramId } = route.params;
    const userId = useContext(UserIdContext);

    const [param, setParam] = useState();
    
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [pickedTime, setPickedTime] = useState();
    const [noteValue, setNoteValue] = useState({'value': true});

    

    //get the param props from the DB on load
    useEffect(() => {
        database()
            .ref(`/users/${userId}/params/${paramId}`)
            .once('value')
            .then(snapshot => {
                setParam(snapshot.val());
            });
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.label}>
                Add a new note for <Text style={{fontWeight: 'bold'}}>{param ? param.name : ``}</Text>
            </Text>
            <TimePicker
                durationType={param ? param.durationType : null}
                setPickedTime={setPickedTime}
            />
            {/*There is a value input*/}
            <NoteValueInput
                param={param}
                setNoteValue={setNoteValue}
            />
            {/*Submit button*/}
            <View style={{ flex: 1, flexDirection: 'column-reverse'}}>
                <View style={{marginBottom: 30}}>
                    <Button
                        title='Submit this note'
                        disabled={submitButtonDisabled}
                        onPress={() => {
                            console.log('debugging Submit');
                            console.log(`paramId is: ${paramId}`);
                            console.log(`pickedTime is: ${JSON.stringify(pickedTime)}`);
                            console.log(`noteValue is: ${JSON.stringify(noteValue)}`);
                            setSubmitButtonDisabled(true);
                            const noteObject = {
                                'paramId' : paramId,
                                ...pickedTime,
                                ...noteValue
                            };

                            console.log(`noteObject is: ${JSON.stringify(noteObject)}`);

                            const newNoteReference = database().ref(`/users/${userId}/data/${Date.now()}`);
                            newNoteReference.set(noteObject);
                        }}
                    />
                </View>
            
            {/*Edit button*/  }
                <View style={{marginBottom: 30}}>
                    <Button
                        title='Edit this param'
                        onPress={() => navigation.navigate('EditParam', { param: param, paramId: paramId })}
                    />
                </View>
            </View>
        </View>
    );
}

const TimePicker = ({ durationType, setPickedTime }) => {
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
    const [selectedMomentTime, setSelectedMomentTime] = useState(new Date(Date.now()));
    const [selectedStartTime, setSelectedStartTime] = useState();
    const [selectedEndTime, setSelectedEndTime] = useState();

    //changes a time after button selection
    useEffect(() => {
        if(fastTimeChoise) {
            setSelectedMomentTime(new Date(Date.now() - 60000 * fastTimeChoises[fastTimeChoise]));
            setPickedTime({'moment': (new Date(Date.now() - 60000 * fastTimeChoises[fastTimeChoise])).valueOf()});
        }
    }, [fastTimeChoise]);

    //if we don't know yet the param props, timepicker can't know what to display
    if (!durationType) return null;

    //the case when we input time for the moment
    if (durationType === 'moment') {
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
                                {selectedMomentTime.toLocaleTimeString()}
                            </Text>   (Click to edit)
                        </Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={pickModalOpen}
                        date={new Date()}
                        onConfirm={(date) => {
                            setSelectedMomentTime(date)
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
    if (durationType === 'duration') {
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
                                {selectedStartTime ? selectedStartTime.toLocaleTimeString() : `START TIME`}
                            </Text>   (Click to edit)
                        </Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={pickModalStartOpen}
                        date={new Date()}
                        onConfirm={(date) => {
                            setPickModalStartOpen(false);
                            setSelectedStartTime(date);
                            setPickedTime({'duration': {
                                'startTime': date.valueOf(),
                                'endTime': selectedEndTime ? selectedEndTime.valueOf() : null
                            }});
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
                                {selectedEndTime ? selectedEndTime.toLocaleTimeString() : `END TIME`}
                            </Text>   (Click to edit)
                        </Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={pickModalEndOpen}
                        date={new Date()}
                        onConfirm={(date) => {
                            setPickModalEndOpen(false);
                            setSelectedEndTime(date);
                            setPickedTime({'duration': {
                                'startTime': selectedStartTime ? selectedStartTime.valueOf() : null,
                                'endTime': date.valueOf()
                            }});
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
})

export default AddNoteScreen;