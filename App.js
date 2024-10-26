// App.js
import React from 'react';
import { SafeAreaView } from 'react-native';
import WebViewComponent from './components/webview';
import FloatingButton from './components/navigation';

import  { MD3LightTheme,PaperProvider  } from 'react-native-paper';


const theme = {
  ...MD3LightTheme,
  colors: {
    // ...MD3LightTheme.colors,
    primary: '#007FFF',
    secondary: '#4169E1',
  },
};
const App = () => {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        // {/* <FloatingButton />*/}
        <WebViewComponent />
      </SafeAreaView>
    </PaperProvider>
  );
}; 

export default App;
