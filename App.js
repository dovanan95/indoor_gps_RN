import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, PermissionsAndroid,ImageBackground,
   TouchableOpacity, Platform, Image, LogBox } from 'react-native';
import WifiManager from "react-native-wifi-reborn";
import wifi from 'react-native-android-wifi';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import ImageMarker,{ImageFormat} from 'react-native-image-marker';
import img from './src/asset/map7th_floor.png';
import data from './src/Data.json';
import helper from './src/helper';

export default function App() {
  const[wifilist, setWifiList]=useState([]);
  const[x_coo, setX]=useState(0);
  const[y_coo, setY]=useState(0);
  const[uri_IMG, setURI_IMG]=useState('');
  const[image, setImage]=useState(imageURI);

  useEffect(()=>{
    async function requestPermission()
    {
      
    };
    requestPermission();
  },[])

  LogBox.ignoreAllLogs();
  
  const imageURI ='./src/asset/map7th_floor.png';
  const imageImport = Image.resolveAssetSource(img).uri;

  const getImageSize = ()=>{
    let height_r, width_r;
    
    width_r = Image.resolveAssetSource(require(imageURI)).width;
    height_r = Image.resolveAssetSource(require(imageURI)).height;

    return({height_r, width_r});
  }

  const scaling_input_x = (x)=>{
    var img_x = getImageSize().width_r;
    var real_x = data.map_size.Width;
    var scale = img_x/real_x;
    var x_onMap = x*scale;
    return x_onMap;
  }

  const scaling_input_y = (y)=>{
    var img_y = getImageSize().height_r;
    var real_y = data.map_size.Height;
    var scale = img_y/real_y;
    var y_onMap = y*scale;
    return y_onMap;
  }

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
      helper.test_firebase();
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
            alert('RSSI: '+ wifilist[0].level);
  
          }
          else if(wifilist.length==0)
          {
            alert('khong quet duoc');
          }
      
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
  
  const ImageCompon = ()=>{
    if(uri_IMG != '')
    {
      return(
        <Image style={styles.image} source={{uri:uri_IMG}}></Image>
      )
    }
    else if(uri_IMG == '')
    {
      return(
        <Image style={styles.image} source={{uri: imageImport}}></Image>
      )
    }

  }

  const markOnImage = ()=>{
    helper.weightedCentroid();
    ImageMarker.markText({
      src: imageImport,
      text:'X',
      X: parseInt(Math.floor(scaling_input_x(x_coo))),
      Y: parseInt(Math.floor(scaling_input_y(y_coo))),
      fontSize:50,
      fontName:'Arial',
      color: '#FF0000AA',
      quality:100,
      scale:1,
    }).then((path)=>{
      //console.log(path);
      setURI_IMG(Platform.OS === 'android' ? 'file://' + path : path,);
    }).catch((error)=>{
      console.log(error);
    })
  }

  return (
    <View style={styles.container}>
      <Text style={{color:'blue'}}>PHAN MEM DINH VI</Text>
      <TouchableOpacity onPress={()=>getwifiData()}>
        <Text>GET WIFI INFO</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>{markOnImage()}}>
        <Text>MARK ON IMAGE</Text>
      </TouchableOpacity>
      <View>
        <TextInput style={styles.text_input}
        placeholder='X'
        onChangeText={(x)=> {
          setX(x);
        }}
        value={x_coo.toString()}></TextInput>
        <TextInput style={styles.text_input}
        placeholder='Y'
        onChangeText={(y)=>{
          setY(y)
        }}
        value={y_coo.toString()}></TextInput>
        {/*<Image style={styles.image} source={require(imageURI)} />*/}
        {<ImageCompon/>}
       
        <Text>X:{x_coo}, Y:{y_coo}</Text>
  
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    marginBottom: 40,
    width: 335,
    height: 200
  },
  text_input: {
    height: 25,
    width:300,
    margin: 2,
    borderWidth: 0.5,
    padding: 5,
},
});
