import data from './Data.json';
import WifiManager from "react-native-wifi-reborn";
import wifi from 'react-native-android-wifi';
import React from 'react';
import { PermissionsAndroid,Platform, Image, LogBox } from 'react-native';
//import firebase from 'react-native-firebase';
import firebase from 'firebase/database'

const getPermission =async()=>{
    if(Platform.OS=='android')
    {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission is required for WiFi connections',
          message:
            'This app needs location permission as this is required  ' +
            'to scan for wifi networks.',
          buttonNegative: 'DENY',
          buttonPositive: 'ALLOW',
        },
      );
      if(granted===PermissionsAndroid.RESULTS.GRANTED)
      {
        console.log('granted');
        return('OK');
      }
      else
      {
        console.log('denied');
        return('NG');
      }
    }
  };

const getwifiData =async()=>{
    try
    {
      console.log(getImageSize());
      let perm = await getPermission();
      if(perm=='OK')
      {
        let isConnect = await WifiManager.isEnabled();
        console.log(isConnect);
        if(!isConnect)
        {
          WifiManager.setEnabled(true);
          console.log(isConnect);
        }
        else if(isConnect)
        {
          let IP = await WifiManager.getIP();
          let current_ssid = await WifiManager.getCurrentWifiSSID();
          let current_RSSI = await WifiManager.getCurrentSignalStrength();
          var wifilist = await WifiManager.loadWifiList();
          
          console.log(IP, current_ssid, current_RSSI);
          console.log(wifilist);

          wifi.getFrequency((frequency) => {
            console.log('frequency:'+ frequency);
          });

          wifi.loadWifiList((wifiStringList) => {
            var wifiArray = JSON.parse(wifiStringList);
              console.log(wifiArray);
            },
            (error) => {
              console.log(error);
            }
          );
        }
        return(wifilist);

      }
      else
      {
        alert('no permission');
      }
      
    }
    catch(error)
    {
      alert(error);
    }

  };

  const weightedCentroid = () =>{
    var wifiList = [];
    for(let key in data.wifi_data)
    {
        console.log(data.wifi_data[key]['BSSID']);
    }
  };

  const test_firebase=()=>{
    const test_data = {'data': 'data'};
    let db_test= firebase.getDatabase();
    var ref_data = firebase.get(db_test, test_data);
  }

  
export default(
    {
        getwifiData, 
        getPermission,
        weightedCentroid, test_firebase
    });