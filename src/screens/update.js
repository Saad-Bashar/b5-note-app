import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../components/button'
import Input from '../components/input'
import RadioInput from '../components/radio-input'
import { firebase } from '../config'

const OPTIONS = ['red', "green", 'blue']
export default function Update({ navigation, route }) {
    const {title : routeTitle, description : routeDescription, noteColor: routeNoteColor, id} = route.params.note;
    
    const [title, setTitle] = React.useState(routeTitle)
    const [description, setDescription] = React.useState(routeDescription)
    const [noteColor, setNoteColor] = React.useState(routeNoteColor);
    const [loading, setLoading] = React.useState(false)
    const user = firebase.auth().currentUser;
    const noteRef = firebase.firestore().collection('notes')

    const onUpdate = () => {
        // 1. loading state true
        setLoading(true)

        // 2. update the existing note
        noteRef
            .doc(id)
            .update({ title, description, noteColor })
            .then(() => {
                setLoading(false)
                showMessage({
                    message: 'Note updated',
                    type: 'success',
                })
                navigation.goBack()
            })
            .catch(error => {
                console.log(error)
                setLoading(false)
                showMessage({
                    message: error.message,
                    type: 'danger',
                })
            })
    }

    return (
        <SafeAreaView style={{ marginHorizontal: 20, flex: 1  }}>
            <Input 
                onChangeText={(text) => setTitle(text)}
                placeholder="Set the title"
                value={title} 
            />
            <Input 
                placeholder="Set the description" 
                onChangeText={(text) => setDescription(text)}
                value={description}
            />

            <View style={{ marginTop: 20 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18 }}>Select your note color</Text>
                    {OPTIONS.map((option, index) => (
                        <RadioInput
                            key={index} 
                            label={option} 
                            value={noteColor}
                            setValue={setNoteColor}
                            size="big"
                        />
                    ))}
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                {loading ? ( <ActivityIndicator /> ) : (
                    <Button onPress={onUpdate} title="Submit" customStyles={{ alignSelf: 'center', margin: 20 }} />)
                }
            
            </View>    
        </SafeAreaView>
    )
}
