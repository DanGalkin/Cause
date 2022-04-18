The app is in development.
Functionality: store repetitive structured datapoints to check for correlations between them.

Stack:
React-native
Firebase (authorisation and database)

To start messing around (Android setup):

1. Fork and download and 'npm install'
2. create your Firebase Project
3. create an Android app in Firebase Console
4. Save provided file 'google-services.json' to the './android/app/'
5. Get SHA-1 for your machine: https://stackoverflow.com/questions/51845559/generate-sha-1-for-flutter-react-native-android-native-app and put into Android app settings in Firebase the

To enable Google signin: 6. create an .env file in root of your Project and add a variable WEB_CLIENT_ID=XXX, where XXX can be found in the android/app/google-services.json file as the client/oauth_client/client_id property (the id ends with .apps.googleusercontent.com). Make sure to pick the client_id with client_type: 3 7. Enable Google authorization in Firebase Console of your app

8. run 'npx react-native start' and 'npx react-native run-android'
