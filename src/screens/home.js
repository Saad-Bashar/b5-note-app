import React from 'react'
import { View, Text, Pressable, Image, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { firebase } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import Button from '../components/button';
import { AntDesign } from '@expo/vector-icons'; 
import { showMessage } from 'react-native-flash-message';

const slides = [
    {
      key: 'one',
      title: 'Document',
      subtitle: 'Make yourself better',
      text: 'Learn new stuffs and get professional',
      image: require('../../assets/banner1.png'),
    },
    {
      key: 'two',
      title: 'Learn',
      subtitle: 'Learn and grow',
      text: 'You can earn professionally with our notes',
      image: require('../../assets/banner2.png'),
    },
    {
        key: 'three',
        title: 'Help',
        subtitle: 'Help others by educating',
        text: 'Create your own notes and help others',
        image: require('../../assets/banner3.png'),
      },
];

const Onboarding = ({ setOnboarded }) => {
    const makeOnboardingTrue = async () => {
        try {
            await AsyncStorage.setItem('onboarding', 'true')
        } catch (e) {
            console.log(e)
        }
        
        setOnboarded(true)
    }

    const renderItem = ({ item }) => {
        const {  title, subtitle, text, image } = item;
        return (
            <View style={{ flex: 1 }}>
                <Image 
                    source={image} 
                    style={{ width: '100%', height: 300 }} 
                    resizeMode="contain" 
                />

                <View style={{ marginTop: 30 }}>
                    <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: 'bold', color: "#18B18D" }}>
                        {title}
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 22, color: "#18B18D", marginTop: 20 }}>
                        {subtitle}
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20, marginHorizontal: 40 }}>
                        {text}
                    </Text>
                </View>
            </View>
        )
    }


    const renderDoneButton = () => {
        return (
            <View style={{ width: 30, height: 30, backgroundColor: 'green', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="check" size={24} color="white" />
            </View>
        )
    }

    return (
        <AppIntroSlider 
            renderItem={renderItem} 
            data={slides} 
            onDone={makeOnboardingTrue}
            keyExtractor={item => item.key}
            activeDotStyle={{ backgroundColor: 'green' }}
            renderDoneButton={renderDoneButton}
            
        />
    )


}

export default function Home({ navigation, route, user }) {
    const [checking, setChecking] = React.useState(true)
    const [onboarded, setOnboarded] = React.useState(false)
    const [notes, setNotes] = React.useState([])
    const noteRef = firebase.firestore().collection('notes')
    
    React.useEffect(() => {
        const subsriber = noteRef.where('authorId', '==', user.uid).onSnapshot(snapshot => {
            // creating any empty array to collect the notes
            const newNotes = [];
            snapshot.forEach(doc => {
                newNotes.push({
                    id: doc.id,
                    ...doc.data()
                })
            }) 
            setNotes(newNotes)
        })

        return subsriber;
    }, [])

    React.useEffect(() => {
        const getOnboardingValue = async () => { 
            try {
                const value = await AsyncStorage.getItem('onboarding')
                if (value !== null) {
                    setOnboarded(true)
                } 
                setChecking(false)
            } catch (e) {
                console.log(e)
                setChecking(false)
            }
        }

        getOnboardingValue()
    }, []);

    if(checking) {
        return null
    }

    if(!onboarded) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Onboarding setOnboarded={setOnboarded} />
            </SafeAreaView>
        )
    }

    const renderNote = ({ item }) => {
        const {title, description, noteColor, id, image} = item;
        return (
            <>
            {image && <Image style={{ height: 150, width: '100%' }} source={{ uri: image }} />}
          <View
            style={{
              borderRadius: 12,
              backgroundColor: noteColor,
              padding: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 15
            }}
          >
            
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, color: "white" }}>{title}</Text>
                <Text numberOfLines={2} style={{ fontSize: 14, color: "white" }}>{description}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable 
                    onPress={() => {
                        navigation.navigate("Update", {note: item})
                    }} 
                    style={{ marginRight: 20 }}
                >
                    <AntDesign name="edit" size={24} color="white" />
                </Pressable>

                <Pressable onPress={() => {
                    noteRef.doc(id).delete()
                    showMessage({
                        message: 'Note Deleted',
                        type: 'danger'
                    })
                }}>
                    <AntDesign name="delete" size={24} color="white" />
                </Pressable>
                
            </View>
            
          </View>
          </>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20  }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18B18D' }}>
                    My Notes
                </Text>
                <Pressable onPress={() => navigation.navigate('Create')}>
                    <AntDesign name="pluscircle" size={24} color="#18B18D" />
                </Pressable>
            </View>

            {notes.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../../assets/empty-state.png')} />
                        <Text style={{ fontSize: 18, marginTop: 20 }}>
                            You don't have any notes yet.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notes}
                        keyExtractor={item => item.id}
                        renderItem={renderNote}
                        contentContainerStyle={{ paddingTop: 40, paddingHorizontal: 20 }}

                    />
                )
            }
        </SafeAreaView>
    )
}
