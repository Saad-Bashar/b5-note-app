import React from 'react'
import { View, Text, ActivityIndicator, Pressable, Image } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../components/button'
import Input from '../components/input'
import RadioInput from '../components/radio-input'
import { firebase } from '../config'
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons'; 


const OPTIONS = ['red', "green", 'blue']
export default function Create({ navigation, route, user }) {
    const [title, setTitle] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [noteColor, setNoteColor] = React.useState('white');
    const [loading, setLoading] = React.useState(false)
    const userId = user.uid
    const [image, setImage] = React.useState(null)
    const [imageUploading, setImageUploading] = React.useState(false)
    

    React.useEffect(() => {
        (async () => {
          if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need camera roll permissions to make this work!');
            }
          }
        })();
      }, [])

    const onSave = () => {
        // 0 - get the note collection ref
        const noteRef = firebase.firestore().collection('notes')

        // 1. set loading incdicator
        setLoading(true)

        // 2. create a timestamp
        const timestamp = firebase.firestore.FieldValue.serverTimestamp()

        // 3. create a note object
        const data = {
            title,
            description,
            noteColor,
            authorId: userId,
            createdAt: timestamp,
            image: image
        }

        // save the note to firestore
        noteRef
            .add(data)
            .then((_doc) => {
                setLoading(false)
                showMessage({
                    message: 'Note created successfully!',
                    type: 'success',
                })
                navigation.goBack()
            })
            .catch((error) => {
                console.log(error)
                setLoading(false)
            })
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
            setImageUploading(true)
            
            // Implement a new Blob promise with XMLHTTPRequest
            // Why are we using XMLHttpRequest? See:
            // https://github.com/expo/expo/issues/2402#issuecomment-443726662
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function () {
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", result.uri, true);
                xhr.send(null);
            });

            // get the ref
            const ref = firebase.storage().ref().child(new Date().getTime().toString());

            // upload the blob
            const snapshot = await ref.put(blob);

            // we are done, close the blob
            blob.close();

            // get the url
            const url = await snapshot.ref.getDownloadURL();
            
            // set the image url
            setImage(url)
            setImageUploading(false)

        }
      };

    

    return (
      <SafeAreaView style={{ marginHorizontal: 20, flex: 1 }}>
        {imageUploading ? (
          <ActivityIndicator />
        ) : (
          <Pressable
            onPress={pickImage}
            style={{
              alignSelf: "center",
              height: 100,
              width: 100,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: "#ccc",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 30,
            }}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ height: 100, width: 100, borderRadius: 50 }}
              />
            ) : (
              <AntDesign name="plus" size={36} color="#18B18D" />
            )}
          </Pressable>
        )}

        <Input
          onChangeText={(text) => setTitle(text)}
          placeholder="Set the title"
        />
        <Input
          placeholder="Set the description"
          onChangeText={(text) => setDescription(text)}
        />

        <View style={{ marginTop: 20 }}>
          <Text style={{ marginBottom: 15, fontSize: 18 }}>
            Select your note color
          </Text>
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

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Button
              onPress={onSave}
              title="Submit"
              customStyles={{ alignSelf: "center", margin: 20 }}
            />
          )}
        </View>
      </SafeAreaView>
    );
}
