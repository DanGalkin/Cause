// Cause app

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import { WEB_CLIENT_ID } from '@env';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginBar from './app/components/LoginBar';
import ParamListScreen from './app/components/ParamListScreen';
import AddNoteScreen from './app/components/AddNoteScreen';
import EditParamScreen from './app/components/EditParamScreen';
import DisplayScreen from './app/components/DisplayScreen';
import { UserIdContext } from './app/components/Contexts.js';

const Stack = createNativeStackNavigator();

const App = () => {

  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState();

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
  });

  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const logoutHandle = () => {
    console.log('logout button pressed'); //for debug
    auth()
      .signOut()
      .then(() => {console.log('Signed out')});
  }

  const onGoogleButtonPress = async () => {
    // Get the users ID token
    console.log('google signin Button pressed');
    const { idToken } = await GoogleSignin.signIn();
    console.log(`signed in with token ${idToken}`);
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  const anonymousLoginHandle = () => {
    console.log('login button pressed'); //for debug
    auth()
      .signInAnonymously()
      .then(() => {console.log('user signed in anonimously')})
      .catch(error => {
        if(error.code === 'auth/operation-not-allowed') {
          console.log('Enable anonymous in your firebase console');
        }
        console.error(error);
      })
  }

  if (initializing) return null;

  if (!user) { return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.centered}>
        <View style={styles.centered}>
          <Text>Please, sign-in:</Text>
          <GoogleSigninButton
            style={{ width: 350, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={onGoogleButtonPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  ); }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flex: 1 }}>
        <LoginBar 
          userName={user.displayName}
          logout={logoutHandle}/>
        <NavigationContainer>
          <UserIdContext.Provider value={user.uid}>
            <Stack.Navigator initialRouteName="ParamList">
              <Stack.Screen name='ParamList' component={ParamListScreen} />
              <Stack.Screen name='EditParam' component={EditParamScreen} />
              <Stack.Screen name='AddNote' component={AddNoteScreen} />
              <Stack.Screen name='Display' component={DisplayScreen} />
            </Stack.Navigator>
          </UserIdContext.Provider>
        </NavigationContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default App;
