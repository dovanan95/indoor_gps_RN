import data from './Data.json';
import WifiManager from "react-native-wifi-reborn";
import wifi from 'react-native-android-wifi';
import React from 'react';
import { PermissionsAndroid,Platform, Image, LogBox } from 'react-native';
import{getDatabase, ref, get, set, onValue} from 'firebase/database';
import firebaseApp from './firebase_config';


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

const getwifiData =async(x_coo, y_coo)=>{
    try
    {
      //helper.test_firebase();
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
          let wifilist = await WifiManager.loadWifiList();
          
          console.log(IP, current_ssid, current_RSSI);
          if(wifilist.length>0)
          {
            console.log(wifilist);
            var closetAP = getClosestAP(wifilist);
            if(closetAP.length==1)
            {
              writeAP_Location(closetAP[0]['bssid'], x_coo, y_coo, closetAP[0]['rssi']);
            }
            else if(closetAP.length>1)
            {
              for(var index in closetAP)
              {
                writeAP_Location(closetAP[index]['bssid'], x_coo, y_coo, closetAP[index]['rssi']);
              }
            }
            alert('AP gan nhat: '+ closetAP[0]['bssid']);
            console.log('RSSI: '+ wifilist[0].level);

          }
          else if(wifilist.length==0)
          {
            alert('khong quet duoc');
          }
        }
        
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

  const getClosestAP = (listAP) =>{
    var rssi_collect = [];
    var bssid_closest = [];
    var threshold_level = -46;
    for(var item in listAP)
    {
      rssi_collect.push(listAP[item]['level']);
    }
    for(var i in rssi_collect)
    {
      if(Math.max(rssi_collect)==rssi_collect[i] && rssi_collect[i]>threshold_level)
      {
        bssid_closest.push({'bssid': listAP[i]['BSSID'], 'rssi': rssi_collect[i]});
      }
    }
    return(bssid_closest);
  }

  const weightedCentroid = () =>{
    var wifiList = [];
    for(let key in data.wifi_data)
    {
        console.log(data.wifi_data[key]['BSSID']);
    }
  };

  const test_firebase=async()=>{
    try
    {
      const db = getDatabase(firebaseApp.app);
      var data = ref(db, 'test/test1');
      onValue(data, (snapshot)=>{
        const dt = snapshot.val();
        console.log(dt);
      });
    }
    catch(error)
    {
      console.log(error);
    }
  }
  const writeAP_Location=async(bssid, x, y, rssi)=>{
    try
    {
      const db = getDatabase(firebaseApp.app);
      set(ref(db, 'AP_Location/'+Date.now()),
      {
        'bssid': bssid,
        'x_coor': x,
        'y_coor': y,
        'rssi': rssi
      })
    }
    catch(error)
    {
      alert(error);
    }
  }

  
export default(
    {
        getwifiData, writeAP_Location,
        getPermission, getClosestAP,
        weightedCentroid, test_firebase
    });