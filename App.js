// Cause app

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import auth from '@react-native-firebase/auth';

const App = () => {

  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState();

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

  const loginHandle = () => {
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
          <TouchableOpacity onPress={loginHandle}>
            <Text style={{textDecorationLine: 'underline'}}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  ); }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.centered}>
        <View style={styles.centered}>
          <Text>You are logged in as {user.uid}</Text>
          <TouchableOpacity onPress={logoutHandle}>
            <Text style={{textDecorationLine: 'underline'}}>Log out</Text>
          </TouchableOpacity>
        </View>
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
