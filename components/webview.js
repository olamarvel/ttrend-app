import * as React from 'react';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import { code as injectButton } from './inject';
import dvid from './vidDow.js'; 
import aiCode from './Ai.js';
import * as MediaLibrary from 'expo-media-library';

import * as Notifications from 'expo-notifications';
import { downloadToFolder } from './expo-dl.js';

const saveFile = async (url, name) => {
  // Request permission to access the camera roll
  const { status } = await MediaLibrary.requestPermissionsAsync();
  // Check if permission granted
  if (status === 'granted') {
    // Create a notification channel
    await Notifications.setNotificationChannelAsync('expo-file-dl', {
      name: 'expo-file-dl',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    // Set up a notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    // Download the file to a user-selected folder
    await downloadToFolder(url, name, 'TTrendVideo', {
      notificationType: { notification: 'custom' },
      notificationContent: {
        downloading: {
          title: 'Download In Progress',
        },
        finished: {
          title: 'Complete!',
        },
        error: {
          title: 'Oops!',
        },
      },
    });
  } else {
    alert('You must allow permission to save.');
  }
};

const WebViewComponent = () => {
  const handleWebViewNavigationStateChange = (newNavState) => {
    const isOnTwitter = newNavState.url.includes('twitter.com');

    if (isOnTwitter) {
      // mhget
    }
  };

  return ( 
    <WebView
      source={{ uri: 'https://twitter.com/' }}
      // ref={ref} // Replace with your actual URL
      injectedJavaScript={dvid + injectButton + aiCode}
      onNavigationStateChange={handleWebViewNavigationStateChange}
      onMessage={onMessage}
    />
  );
};

export default WebViewComponent;

function onMessage(event) {
  const data = event.nativeEvent.data;
  const texts = data.split('%');
  console.log(data);
  switch (texts[0]) {
    case 'copy':
      Clipboard.setString(texts[1]);
      break;
    case 'download':
      saveFile(texts[1], texts[2] + '.mp4');
      break;
    case 'ai':
      ai(texts[1])
      break;
    default:
      console.log('unable to decode message::: kindly check');
  }
}

// ai("imbadan,god,what is happing,bomb")

async function ai(trends) {
  try {
  console.log(trends)
    let headersList = {
      'Content-Type': 'application/json',
    };

    let bodyContent = JSON.stringify({ prompt: trends });
    alert('about fetching');
    // alert(trends.length);
    let response = await fetch('https://ttrendserver.onrender.com/api', {
      method: 'POST',
      body: bodyContent,
      headers: headersList,
    });
    console.log(response)
    console.log("fecthdone ")  
    let post = (await response.json()).response;
    alert(post);
    Clipboard.setString(post);
    return post;
  } catch (e) {
    alert(e);
  }
}
