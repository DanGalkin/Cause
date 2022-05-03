import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    TextInput,
    Text,
    StyleSheet,
} from 'react-native';



export const ListFormer = ({ returnListArray }) => {
    const [itemInput, setItemInput] = useState(null);
    const [listArray, setListArray] = useState([]);
    const itemInputRef = React.useRef();
    
    return (
        <View>
            <Text style={styles.label}>Edit the list of possible values</Text>
            <View style={styles.row}>
                {listArray.map((listItem, index) => (
                    <View
                        style={styles.listItem}
                        key={index}
                    >
                        <Text>{listItem}  </Text>
                        <TouchableOpacity
                            onPress={() => {
                                let newListArray = [...listArray];
                                newListArray.splice(index, 1);

                                setListArray(newListArray);

                                if(returnListArray) {
                                    returnListArray(newListArray);
                                }
                            }}
                        >
                            <Text>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder='name the new item'
                    ref={itemInputRef}
                    onChangeText={value => setItemInput(value)}
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        if(itemInput){
                            let newListArray = [...listArray, itemInput]
                            setListArray(newListArray);
    
                            if(returnListArray) {
                                returnListArray(newListArray);
                            }
    
                            itemInputRef.current.clear();
                            setItemInput('');
                        }
                    }}
                >
                    <Text>+ Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'white',
        margin: 12,
        padding: 10,
    },
    listItem: {
        borderRadius: 4,
        borderColor: 'green',
        borderWidth: 1,
        padding: 5,
        marginHorizontal: '1%',
        marginVertical: 10,
        flexDirection: 'row',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    addButton: {
        height: 40,
        borderRadius: 4,
        borderColor: 'black',
        borderWidth: 1,
        margin: 12,
        padding: 3,
    },
    label: {
        padding:10,
    },
})