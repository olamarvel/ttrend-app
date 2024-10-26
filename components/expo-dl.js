import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { shareAsync } from "expo-sharing";
import * as SecureStore from 'expo-secure-store';
import { AndroidNotificationPriority } from "expo-notifications";
import { Platform } from "react-native";

const { StorageAccessFramework } = FileSystem;

const savePermissionUri = async (uri) => {
  await SecureStore.setItemAsync('permission_uri', uri);
};

const getPermissionUri = async () => {
  return await SecureStore.getItemAsync('permission_uri');
};

const ios = Platform.OS === "ios";
const imageFileExts = ["jpg", "jpeg", "tiff", "tif", "raw", "dng", "png", "gif", "bmp", "heic", "webp"];

export const EFDL_NotificationType = {
  notification: "managed" | "custom" | "none",
};

export const EDFL_NotificationContent = {
  downloading: Notifications.NotificationContentInput,
  finished: Notifications.NotificationContentInput,
  error: Notifications.NotificationContentInput,
};

export const EDFL_NotificationState = "downloading" | "finished" | "error";

const baseNotificationRequestInput = {
  identifier: "",
  content: {
    title: "",
    body: "",
    vibrate: [250],
    priority: AndroidNotificationPriority.HIGH,
    autoDismiss: true,
    sticky: false,
  },
  trigger: {
    channelId: "",
  },
};

function initBaseNotificationRequestInput(filename, channelId) {
  return {
    ...baseNotificationRequestInput,
    content: {
      ...baseNotificationRequestInput.content,
      title: filename,
    },
    trigger: {
      channelId,
      seconds: 1,
      repeats: false,
    },
  };
}

function getNotifParams(baseNotificationRI, nState, nContent) {
  let identifier = "";
  let body = "";
  let sticky = false;
  let customNotifContent = {};

  switch (nState) {
    case "downloading":
      identifier = `dl${baseNotificationRI.content.title}`;
      body = "Downloading...";
      sticky = true;
      customNotifContent = nContent?.downloading || {};
      break;
    case "finished":
      identifier = `fin${baseNotificationRI.content.title}`;
      body = "Completed!";
      sticky = false;
      customNotifContent = nContent?.finished || {};
      break;
    case "error":
      identifier = `err${baseNotificationRI.content.title}`;
      body = "Failed to download";
      sticky = false;
      customNotifContent = nContent?.error || {};
      break;
    default:
      break;
  }

  return {
    ...baseNotificationRI,
    identifier,
    content: {
      ...baseNotificationRI.content,
      body,
      sticky,
      ...customNotifContent,
    },
  };
}

async function dismissAndShowErr(notifToDismissId, errNotificationRI) {
  if (notifToDismissId !== undefined) {
    await Notifications.dismissNotificationAsync(notifToDismissId);
  }
  await Notifications.scheduleNotificationAsync(errNotificationRI);
  return;
}

async function downloadFile(uri, fileUri, downloadProgressCallback) {
  const downloadResumable = downloadProgressCallback
    ? FileSystem.createDownloadResumable(uri, fileUri, {}, downloadProgressCallback)
    : FileSystem.createDownloadResumable(uri, fileUri);

  return await downloadResumable.downloadAsync();
}

export async function downloadToFolder(uri, filename, folder, channelId, options) {
  const baseNotificationRI = initBaseNotificationRequestInput(filename, channelId);
  const customNotifContent =
    options?.notificationType?.notification === "custom" ? options.notificationContent : undefined;
  const skipNotifications = options?.notificationType?.notification === "none";

  const dlNotificationRI = getNotifParams(baseNotificationRI, "downloading", customNotifContent);
  const errNotificationRI = getNotifParams(baseNotificationRI, "error", customNotifContent);
  const finNotificationRI = getNotifParams(baseNotificationRI, "finished", customNotifContent);

  if (!skipNotifications) {
    await Notifications.scheduleNotificationAsync(dlNotificationRI);
  }

  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  const downloadedFile = await downloadFile(uri, fileUri, options?.downloadProgressCallback);

  if (downloadedFile.status !== 200) {
    if (!skipNotifications) {
      await dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI);
    }
    return false;
  }

  try {
    if (ios && !imageFileExts.some((ext) => downloadedFile.uri.toLocaleLowerCase().endsWith(ext))) {
      const UTI = "public.item";
      await shareAsync(downloadedFile.uri, { UTI });
    } else if (Platform.OS === "android") {
      await saveAndroidFile(downloadedFile.uri, filename);
    } else {
      // For iOS, you need to implement your logic here
      saveIosFile(downloadedFile.uri);
    }
  } catch (e) {
    console.error(`ERROR: ${e}`);
    if (!skipNotifications) {
      await dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI);
    }
    return false;
  }

  if (skipNotifications) {
    return true;
  } else {
    if (dlNotificationRI.identifier !== undefined) {
      await Notifications.dismissNotificationAsync(dlNotificationRI.identifier);
    }
    await Notifications.scheduleNotificationAsync(finNotificationRI);
    return true;
  }
}

async function saveAndroidFile(fileUri, fileName) {
  try {
    const fileString = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(await getPermissionUri());
    await savePermissionUri(permissions.directoryUri);

    if (!permissions.granted) {
      return;
    }

    try {
      await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "video/mp4"
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, fileString, {
            encoding: FileSystem.EncodingType.Base64,
          });
        })
        .catch((e) => {
          console.error(e);
        });
    } catch (e) {
      throw new Error(e);
    }
  } catch (err) {
    console.error(err);
  }
}

// Placeholder for iOS file handling
function saveIosFile(fileUri) {
  // Your iOS code for saving files
}
