import React from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'

export default function Input({ placeholder, onChangeText, secureTextEntry = false, value }) {
    return (
        <TextInput 
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            autoCorrect={false}
            secureTextEntry={secureTextEntry}
            value={value}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        marginBottom: 20
    }
})
