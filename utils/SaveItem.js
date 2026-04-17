import { View, Text } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import GetItem from './GetItem'
const SaveItem = async({ item,name, }) => {
    try{
        // await AsyncStorage.removeItem(name)
                    const data=await GetItem(name);
                    console.log({...item,quantity:1})                                         
                    console.log(data)                                         
                    if(data.length){
                        const find=data.find(i=>i.id===item.id);
                        console.log("Find:", find);
                        console.log("parsedata:", data);

                        if(find){
                            const update=data.map(i=>i.id===item.id?{...i,quantity:i.quantity+1,price:item.price*item?.quantity}:i)
                            const ms=await AsyncStorage.setItem(name,JSON.stringify(update))
                            console.log(ms)
                        }else{
                            await AsyncStorage.setItem(name,JSON.stringify([...data,{...item,quantity:1}]))
                        }
                    }else{
                        await AsyncStorage.setItem(name,JSON.stringify([{...item,quantity:1,price:item.price*item?.quantity}]))
                    }
            }catch(err){
                alert(err.message)
            }
        
}

export default SaveItem