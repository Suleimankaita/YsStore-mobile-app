import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
const GetItem = async(name) => {
    try{
        console.log("name: ",name)
    const data=await AsyncStorage.getItem(name)
    
            if(data){

                return JSON.parse(data);
            }else{
                return [];
            }
        }catch(err){
            alert(err.message)
        }

}

export default GetItem
