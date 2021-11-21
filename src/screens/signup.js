import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../components/button'
import Input from '../components/input'
import RadioInput from '../components/radio-input'
import { firebase } from '../config'

const OPTIONS = ['Male', "Female"]

export default function Signup() {
    const [gender, setGender] = React.useState(null)
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [name, setName] = React.useState('')
    const [age, setAge] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const signup = () => {
        // 1. validate the form

        // 2. loading to true
        setLoading(true)

        // 3. create user in firebase
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((response) => {
                console.log("RESPONSE -- ", response)
                
                // first step -> get user id
                const uid = response.user.uid

                // second step -> create the profile data
                const userProfileData = {
                    id: uid,
                    name: name,
                    age: age,
                    email: email,
                    gender: gender,
                }

                // third step -> create users collection
                const userRef = firebase.firestore().collection("users");

                // fourth step -> add user profile to users collection
                userRef.doc(uid).set(userProfileData);

                setLoading(false)
                // 4. add user profile
            }).catch((error) => {
                setLoading(false)
                console.log('error ', error)
            }
        );
    

        // 5. loading to false + validate any errors
    }

    return (
        <SafeAreaView>
            <View style={{ margin: 25 }}> 
                <Input placeholder="Email" onChangeText={(text) => setEmail(text)} />
                <Input 
                    placeholder="Password"
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={true}
                />
                <Input placeholder="Full name" onChangeText={(text) => setName(text)} />
                <Input placeholder="Age" onChangeText={(text) => setAge(text)} />
                
                <View style={{ marginTop: 20 }}>
                    <Text style={{ marginBottom: 15 }}>Select your gender</Text>
                    {OPTIONS.map((option, index) => (
                        <RadioInput 
                            key={index} 
                            label={option} 
                            value={gender}
                            setValue={setGender}
                        />
                    ))}
                </View>
                {loading ? 
                    <ActivityIndicator />
                    : 
                    <Button 
                        title="Submit" 
                        customStyles={{ marginTop: 25, alignSelf: 'center' }}  
                        onPress={signup}
                    />
                }
               
            </View>
        </SafeAreaView>
    )
}
