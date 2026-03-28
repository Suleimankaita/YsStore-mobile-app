import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Stack from "../utils/Stack"
import { Provider } from 'react-redux'
import {store} from "../Features/Store"  
const _layout = () => {
  return (
    <Provider store={store}>
    <Stack/>
    </Provider>
)
}

export default _layout

const styles = StyleSheet.create({})