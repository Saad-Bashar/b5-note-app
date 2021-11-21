
import * as React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/home';
import Create from './src/screens/create';
import Update from './src/screens/update';
import Login from './src/screens/login';
import Signup from './src/screens/signup';
import { firebase } from './src/config'
import FlashMessage from "react-native-flash-message";


const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white'
  },
};


const Stack = createNativeStackNavigator();

function App() {
  const [loading, setLoading] = React.useState(true);
  const [user , setUser] = React.useState(false);

  function authStateChanged(user) {
    setUser(user);
    setLoading(false);
  }

  React.useEffect(() => {
    const subscribe = firebase.auth().onAuthStateChanged(authStateChanged);
    return subscribe;
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator>
      {
        user ? (
          <>
            <Stack.Screen name="Home"  options={{ headerShown: false }}>
              {props => <Home {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Create">
              {props => <Create {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Update" component={Update} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )
      }
      </Stack.Navigator>
      <FlashMessage position="top" /> 
    </NavigationContainer>
  );
}

export default App;