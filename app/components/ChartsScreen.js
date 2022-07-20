import React, { useEffect, useState } from 'react';  
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    processColor,
} from 'react-native';

import TimeChart from './TimeChart.js';


import database from '@react-native-firebase/database';
import { UserIdContext } from './Contexts.js';

import moment from 'moment';
const era = moment(0);

const ChartsScreen = ({ route, navigation }) => {

    const userId = React.useContext(UserIdContext);

    const [userEntries, setUserEntries] = useState();
    const [userParams, setUserParams] = useState();

    const [firstParamIdToDraw, setFirstParamIdToDraw] = useState();
    const [secondParamIdToDraw, setSecondParamIdToDraw] = useState();

    const [chartData, setChartData] = useState();


    useEffect(() => {
        database()
            .ref(`/users/${userId}/data`)
            .once('value')
            .then(snapshot => {
                    setUserEntries(snapshot.val());
                });
        
        database()
            .ref(`/users/${userId}/params`)
            .once('value')
            .then(snapshot => {
                    setUserParams(snapshot.val());
                });
    }, []);

    useEffect(() => {
        if (userParams && userEntries) {
            setChartData(cookDataForChart(firstParamIdToDraw, secondParamIdToDraw, 'red', 'purple', userEntries, userParams));
        };
    }, [firstParamIdToDraw, secondParamIdToDraw])

    if(!userEntries || !userParams) return(
        <View style={{ flex: 1, margin: 40 }}>
            <Text>Loading data from Database (or there is no data for your userId)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            
            <TimeChart
                chartData={chartData}
            />

            <ScrollView style={{flex: 1}}>
                <SelectDrawOptions
                    navigation={navigation}
                    userParams={userParams}
                    value={firstParamIdToDraw}
                    setSelectedParam={setFirstParamIdToDraw}
                    selectedColor={'red'}
                />
                <SelectDrawOptions
                    navigation={navigation}
                    userParams={userParams}
                    value={secondParamIdToDraw}
                    setSelectedParam={setSecondParamIdToDraw}
                    selectedColor={'purple'}
                />
            </ScrollView>
        </View>
    );
};

const SelectDrawOptions = ({ navigation, userParams, value, setSelectedParam, selectedColor }) => {
    
    return (
        <View>
            <TouchableOpacity
                style={[styles.selectParamButton, value && {backgroundColor: selectedColor}]}
                onPress={() => {
                    navigation.push('ParamSelector', {userParams, setSelectedParam, paramId: null})
                }}
            >
                <Text style={value && {color: 'white'}}>{value ? userParams[value]['name'] : `Choose a param to display`}</Text>
            </TouchableOpacity>
        </View>
    )
}

const cookDataForChart = (paramId1, paramId2, color1, color2, userEntries, userParams) => {
    let data = {scatterData:{dataSets: []}, lineData: {dataSets: []}};
    const param1DurationType = userParams[paramId1] ? userParams[paramId1]['durationType'] : null;
    const param2DurationType = userParams[paramId2] ? userParams[paramId2]['durationType'] : null;
    let values1 = [];
    let values2 = [];

    if (param1DurationType === 'moment') {
        values1 = cookDataForMomentParam(paramId1, userEntries, 1);
        
        data['scatterData']['dataSets'].push({
            values: values1,
            label: '',
            config: {
                colors: [processColor(color1)],
                drawValues: false,
                scatterShape: 'SQUARE',
            }
        });
    }

    if (param2DurationType === 'moment') {
        values2 = cookDataForMomentParam(paramId2, userEntries, 2);
        data['scatterData']['dataSets'].push({
            values: values2,
            label: '',
            config: {
                colors: [processColor(color2)],
                drawValues: false,
                scatterShape: 'SQUARE',
            }
        });
    }

    if (param1DurationType === 'duration') {
        values1 = cookDataForDurationParam(paramId1, userEntries, 1);
        values1.forEach((entry) => {
            data['lineData']['dataSets'].push({
                values: entry,
                label: '',
                config: {
                    drawValues: false,
                    colors: [processColor(color1)],
                    drawCircles: false,
                    lineWidth: 9,
                }
            })
        })
    }

    if (param2DurationType === 'duration') {
        values2 = cookDataForDurationParam(paramId2, userEntries, 2);
        values2.forEach((entry) => {
            data['lineData']['dataSets'].push({
                values: entry,
                label: '',
                config: {
                    drawValues: false,
                    colors: [processColor(color2)],
                    drawCircles: false,
                    lineWidth: 9,
                }
            })
        })
    }

    console.log(`new ChartData is cooked: ${JSON.stringify(data)}`); // Debug
    return data;

}

const cookDataForMomentParam = (paramId, userEntries, drawIndex) => {
    let sortableParamEntries = [];
    const values = [];

    for (let entry in userEntries) {

        if(userEntries[entry]['paramId'] === paramId) {
            sortableParamEntries.push(userEntries[entry]);
        }
    }

    sortableParamEntries.sort((a, b) => a['moment'] - b['moment'])
                        .forEach((entry) => {
                            values.push({x: getIndexOfMinute(entry['moment']), y: drawIndex});
                        });

    return values;
}

const cookDataForDurationParam = (paramId, userEntries, drawIndex) => {
    let sortableParamEntries = [];
    const values = [];

    for (let entry in userEntries) {

        if(userEntries[entry]['paramId'] === paramId) {
            sortableParamEntries.push(userEntries[entry]);
        }
    }

    sortableParamEntries.sort((a, b) => a['duration']['endTime'] - b['duration']['endTime'])
                        .forEach((entry) => {
                            values.push([{x: getIndexOfMinute(entry['duration']['startTime']), y: drawIndex}, {x: getIndexOfMinute(entry['duration']['endTime']), y: drawIndex}]);
                        });
    return values;
}

const getIndexOfMinute = (unixMilliseconds) => {
    return moment(unixMilliseconds).diff(era, 'minutes');
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    selectParamButton: {
        borderRadius: 4,
        borderColor: 'orange',
        borderWidth: 1,
        padding: 5,
        marginHorizontal: '1%',
        marginVertical: 10,
        flexDirection: 'row',
    }
})

export default ChartsScreen;