import React, { useEffect, useState } from 'react';
  
import {
    StyleSheet,
    View,
    processColor, //don't think I need it, should be refactored
    Text,
} from 'react-native';

import { CombinedChart } from 'react-native-charts-wrapper';

import moment from 'moment';
const era = moment(0);

const TimeChart = ({ chartData }) => {

    const [zoom, setZoom] = useState(1);
    const [limitLines, setLimitLines] = useState([]);
    const [limitLinesGroups, setlimitLinesGroups] = useState({});

    useEffect(() => {
        if(chartData) {
            console.log(`recalculating limitLinesGroups`);
            const {startMinute, endMinute} = getRangeMinutes(chartData);
            console.log(`startMinute is: ${startMinute}`);
            console.log(`endMinute is: ${endMinute}`);
            limitLinesGroupAfterZoom = chooseLimitLines(startMinute, endMinute, zoom)
            if (JSON.stringify(limitLinesGroups) !== JSON.stringify(limitLinesGroupAfterZoom)) {
                console.log(`newLimitLinesGroup: ${JSON.stringify(limitLinesGroupAfterZoom)}`);
                setlimitLinesGroups(limitLinesGroupAfterZoom);
            }
        }
    }, [chartData, zoom]);

    useEffect(() => {
        if(chartData) {
            const {startMinute, endMinute} = getRangeMinutes(chartData);
            setLimitLines(cookLimitLines(startMinute, endMinute, limitLinesGroups));
        }
    }, [limitLinesGroups])

    if(!chartData) {
        return(
            <View style={styles.altTextContainer}>
                <Text>Choose a param to draw 👇</Text>
            </View>
        )
    }

    const handleChange = (event) => {
        let nativeEvent = event.nativeEvent;
        if (nativeEvent.action == 'chartScaled') {
            let {scaleX, scaleY, centerX, centerY} = nativeEvent;
            console.log(`ChartScaled zoom is: ${scaleX}`);
            setZoom(scaleX);
        }
    }

    return(
        <CombinedChart
            style={{flex: 1}}
            data={chartData}
            onChange={(event) => handleChange(event)}
            legend={{enabled: false}}
            scaleYEnabled={false}
            xAxis={{
                drawLabels: true,
                labelRotationAngle: 360 - 45,
                position: 'BOTTOM',
                granularity: 1,
                labelCount: 5,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: 'dd-MM-YY HH:mm',
                since: 0,
                timeUnit: 'MINUTES',                           
                limitLines: limitLines,
                drawGridLines: false,
            }}
            yAxis={{
                left: {
                    drawLabels: false,
                    drawGridLines: false,
                    axisMinimum: -1,
                    axisMaximum: 4,
                },
                right: {
                    drawLabels: false,
                    drawGridLines: false,
                }
            }}
        />
    )
}

const chooseLimitLines = (startMinute, endMinute, zoom) => {
    const limitLinesLimit = 8;
    let limitLinesGroups = {};
    limitLinesGroups.drawHours = (endMinute - startMinute) / zoom < limitLinesLimit * 60;
    limitLinesGroups.draw6Hours = (endMinute - startMinute) / zoom < limitLinesLimit * 60 * 6;
    limitLinesGroups.draw12Hours = (endMinute - startMinute) / zoom < limitLinesLimit * 60 * 12;
    limitLinesGroups.drawDays = (endMinute - startMinute) / zoom < limitLinesLimit * 60 * 24;
    limitLinesGroups.draw5Days = (endMinute - startMinute) / zoom < limitLinesLimit * 60 * 24 * 5;
    limitLinesGroups.draw15Days = (endMinute - startMinute) / zoom < limitLinesLimit * 60 * 24 * 15;
    limitLinesGroups.drawMonths = (endMinute - startMinute) / zoom < limitLinesLimit * 60 * 24 * 30;

    return limitLinesGroups;
}

const cookLimitLines = (startMinute, endMinute, limitLinesGroups) => {

    let limitLinesArray = [];

    const startMSec = startMinute * 60000;
    const endMSec = endMinute * 60000;

    const {drawHours, draw6Hours, draw12Hours, drawDays, draw5Days, draw15Days, drawMonths} = limitLinesGroups;

    // console.log(`drawHours ${drawHours}`)
    // console.log(`draw6Hours ${draw6Hours}`)
    // console.log(`draw12Hours ${draw12Hours}`)
    // console.log(`drawDays ${drawDays}`)
    // console.log(`draw5Days ${draw5Days}`)
    // console.log(`draw15Days ${draw15Days}`)
    // console.log(`drawMonths ${drawMonths}`)

    const cookPeriodLimitLines = (period, higherPeriod, frequency, labelFormat, lineFormat) => {
        console.log(`start cooking lines: ${period} of frequency ${frequency}`);
        const addToLimitLinesArray = [];
        const first = moment(startMSec).startOf(period);
        const last = moment(endMSec).startOf(period);
        const limitLinesQuantity = last.diff(first, period);

        let limitLineMinute;
        let limitLineLabel;
        let periodOfHigherPeriod;

        let validByFrequency = true;
        
        // if (period === 'd') {
        //     for( let i=1; i<frequency; i++ ) {
        //         console.log(`correcting days for: ${first.format('D-MMM')}`)
        //         if (((first.date()) % frequency) === 0) {
        //             break;
        //         }
        //         first.subtract(1, period);
        //     }
        // }

        // if (period === 'h') {
        //     for( let i=1; i<frequency; i++) {
        //         if ((first.hours() % frequency) === 0) {
        //             break;
        //         }
        //         first.subtract(1, period);
        //     }
        // }

        for (let limitLineNumber = 0; limitLineNumber < limitLinesQuantity; limitLineNumber++) {
            first.add(1, period); // it's mutated
            limitLineMinute = getIndexOfMinute(first);
            limitLineLabel = first.format(labelFormat);

            periodOfHigherPeriod = moment(first).startOf(higherPeriod);

            if(period === 'd') {
                validByFrequency = (((first.date()) % frequency) === 0) && !((frequency === 15 || frequency === 5) && first.date() === 30);
            }

            if(period === 'h') {
                validByFrequency = ((first.hours()) % frequency) === 0;
            }

            if((first.valueOf() !== periodOfHigherPeriod.valueOf()) && validByFrequency) {
                addToLimitLinesArray.push({
                    limit: limitLineMinute,
                    lineColor: processColor('grey'),
                    ...lineFormat,
                    label: limitLineLabel
                })
            }
        }  
        return addToLimitLinesArray;
    }

    if(drawMonths) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('M', 'y', 1, 'MMMM', {}));
    }

    if(draw15Days && !draw5Days && !drawDays) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('d', 'M', 15, 'D-MMM', {lineDashPhase: 2, lineDashLengths: [10,10]}));
    }

    if(draw5Days && !drawDays) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('d', 'M', 5, 'D-MMM', {lineDashPhase: 2, lineDashLengths: [10,10]}));
    }

    if(drawDays) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('d', 'M', 1, 'D-MMM', {lineDashPhase: 2, lineDashLengths: [10,10]}));
    }

    if(draw12Hours) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('h', 'd', 12, 'HH:mm', {lineDashPhase: 2, lineDashLengths: [10,30]}));
    }

    if(draw6Hours) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('h', 'd', 6, 'HH:mm', {lineDashPhase: 2, lineDashLengths: [10,30]}));
    }

    if(drawHours) {
        limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('h', 'd', 1, 'HH:mm', {lineDashPhase: 2, lineDashLengths: [10,30]}));
    }

    //draw month limitLines - actually incorrect, because broken oif through years
    // for (let monthOffset = 0 ; monthOffset < moment(endMSec).month() - moment(startMSec).month(); monthOffset++) {
    //     let momentToDraw = moment(endMSec).subtract(monthOffset, 'month').startOf('month');
    //     let limitLineMinute = getIndexOfMinute(momentToDraw);
    //     let limitLineLabel = momentToDraw.format('MMM YYYY');

    //     console.log(`this whould draw a line: ${limitLineLabel}`);
    //     console.log(`At coordinates: ${limitLineMinute}`)

    //     limitLinesArray.push({
    //         limit: limitLineMinute,
    //         lineColor: processColor('grey'),
    //         lineDashPhase: 2,
    //         lineDashLengths: [10,20],
    //         label: limitLineLabel
    //     })
    // }

    //draw months
    // let firstMonth = moment(startMSec).startOf('month');
    // let lastMonth = moment(endMSec).startOf('month');
    // const monthLimitLinesQuantity = lastMonth.diff(firstMonth, 'months');
    // for (let limitLineNumber = 0; limitLineNumber < monthLimitLinesQuantity; limitLineNumber++) {
    //     firstMonth.add(1, 'month');
    //     let limitLineMinute = getIndexOfMinute(firstMonth);
    //     let limitLineLabel = firstMonth.format('MMMM');

    //     limitLinesArray.push({
    //         limit: limitLineMinute,
    //         lineColor: processColor('grey'),
    //         //lineDashPhase: 2,
    //         //lineDashLengths: [10,2],
    //         label: limitLineLabel
    //     })
    // }

    //limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('M', 'y', 1, 'MMMM', {}));

    // //draw days
    // let firstDay = moment(startMSec).startOf('day');
    // let lastDay = moment(endMSec).startOf('day');
    // const dayLimitLinesQuantity = lastDay.diff(firstDay, 'days');
    // for (let limitLineNumber = 0; limitLineNumber < dayLimitLinesQuantity; limitLineNumber++) {
    //     firstDay.add(1, 'day');
    //     limitLineMinute = getIndexOfMinute(firstDay);
    //     limitLineLabel = firstDay.format('D-MMM');

    //     monthOfDay = moment(firstDay).startOf('month');
    //     if(firstDay.valueOf() !== monthOfDay.valueOf()) {
    //         limitLinesArray.push({
    //             limit: limitLineMinute,
    //             lineColor: processColor('grey'),
    //             lineDashPhase: 2,
    //             lineDashLengths: [10,10],
    //             label: limitLineLabel
    //         })
    //     }
    // }

    //limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('d', 'M', 1, 'D-MMM', {lineDashPhase: 2, lineDashLengths: [10,10]}));

    // //draw hours
    // const firstHour = moment(startMSec).startOf('hour');
    // const lastHour = moment(endMSec).startOf('hour');
    // const hourLimitLinesQuantity = lastHour.diff(firstHour, 'hours');
    // for (let limitLineNumber = 0; limitLineNumber < hourLimitLinesQuantity; limitLineNumber++) {
    //     firstHour.add(1, 'h'); // it's mutated
    //     limitLineMinute = getIndexOfMinute(firstHour);
    //     limitLineLabel = firstHour.format('HH:mm');

    //     dayOfHour = moment(firstHour).startOf('day');
    //     if(firstHour.valueOf() !== dayOfHour.valueOf()) {
    //         limitLinesArray.push({
    //             limit: limitLineMinute,
    //             lineColor: processColor('grey'),
    //             lineDashPhase: 2,
    //             lineDashLengths: [10,30],
    //             label: limitLineLabel
    //         })
    //     }
    // }
    
    
    //limitLinesArray = limitLinesArray.concat(cookPeriodLimitLines('h', 'd', 12, 'HH:mm', {lineDashPhase: 2, lineDashLengths: [10,30]}));


    


    return limitLinesArray;
}

const getRangeMinutes = (chartData) => {
    let allTimeStamps = [];

    chartData['scatterData']['dataSets'].forEach((set) => {
        set['values'].forEach((value) => {
            allTimeStamps.push(value['x']);
        });
    })

    chartData['lineData']['dataSets'].forEach((set) => {
        allTimeStamps.push(set['values'][0]['x']);
        allTimeStamps.push(set['values'][1]['x']);
    })

    return {startMinute: Math.min(...allTimeStamps), endMinute: Math.max(...allTimeStamps)};
}

//this is doubling with ChartsScreen TODO refactor later
const getIndexOfMinute = (unixMilliseconds) => {
    return moment(unixMilliseconds).diff(era, 'minutes');
}

const styles = StyleSheet.create({
    altTextContainer:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default TimeChart;