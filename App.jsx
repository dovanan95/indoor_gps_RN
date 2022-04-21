import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    PermissionsAndroid,
    Picker,
    TouchableOpacity,
    Platform,
    Image,
    LogBox
} from 'react-native';
import WifiManager from "react-native-wifi-reborn";
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import ImageMarker, { ImageFormat } from 'react-native-image-marker';
import img from './src/asset/map7th_floor.png';
import data from './src/Data.json';
import helper from './src/helper';

import { getDatabase, ref, get, set, onValue } from 'firebase/database';
import firebaseApp from './src/firebase_config';

import {
    accelerometer,
    gyroscope,
    setUpdateIntervalForType,
    SensorTypes,
    magnetometer
  } from "react-native-sensors";
  import { map, filter } from "rxjs/operators";

export default function App() {
    const [wifilist, setWifiList] = useState([]);
    const [x_coo, setX] = useState(0);
    const [y_coo, setY] = useState(0);
    const [uri_IMG, setURI_IMG] = useState('');
    const [image, setImage] = useState(imageURI);
    const [mode, setMode] = useState('RSSI');
    const [imu_state, setImu_state]= useState(0);

    useEffect(() => {
        async function requestPermission() {

        };
        requestPermission();
    }, [])

    LogBox.ignoreAllLogs();

    const imageURI = './src/asset/map7th_floor.png';
    const imageImport = Image.resolveAssetSource(img).uri;

    const Mode = [{ 'mode': 'AP', 'value': 'Scan AP Location' }, { 'mode': 'RSSI', 'value': 'Scan RSSI' }, { 'mode': 'POS', 'value': 'Positioning' }];

    const getImageSize = () => {
        let height_r, width_r;

        width_r = Image.resolveAssetSource(require(imageURI)).width;
        height_r = Image.resolveAssetSource(require(imageURI)).height;

        return ({ height_r, width_r });
    }

    const scaling_input_x = (x) => {
        var img_x = getImageSize().width_r;
        var real_x = data.map_size.Width;
        var scale = img_x / real_x;
        var x_onMap = x * scale;
        return x_onMap;
    }

    const scaling_input_y = (y) => {
        var img_y = getImageSize().height_r;
        var real_y = data.map_size.Height;
        var scale = img_y / real_y;
        var y_onMap = (real_y - y) * scale;
        return y_onMap;
    }

    const getPermission = async() => {
        if (Platform.OS == 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                    title: 'Location permission is required for WiFi connections',
                    message: 'This app needs location permission as this is required  ' +
                        'to scan for wifi networks.',
                    buttonNegative: 'DENY',
                    buttonPositive: 'ALLOW',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('granted');
                return ('OK');
            } else {
                console.log('denied');
                return ('NG');
            }
        }
    };
//imu sensor data collection
    var subscription_acc;
    var subscription_gyr;
    var subscription_mag;
    const db = getDatabase(firebaseApp.app)
    const sensor_data_start = async() =>{
        var x_acc; var y_acc; var z_acc;
        subscription_acc = accelerometer.subscribe(({ x, y, z, timestamp }) =>{
            console.log('acc: ', x, y, z, timestamp);
            set(ref(db, 'imu/'+timestamp), {
                'timestamp': timestamp,
                'x_acc': x,
                'y_acc': y,
                'z_acc': z,
            })
        });
     
        var x_gyr; var y_gyr; var z_gyr;
        subscription_gyr = gyroscope.subscribe(({x,y,z, timestamp})=>{
            console.log('gyr:', x, y, z,timestamp);
            set(ref(db, 'imu/'+timestamp), {
                'timestamp': timestamp,
                'x_gyr': x,
                'y_gyr': y,
                'z_gyr': z,
            })
        });
       
        var x_mag; var y_mag; var z_mag;
        subscription_mag = magnetometer.subscribe(({x,y,z,timestamp})=>{
            console.log('mag:', x,y,z,timestamp);
            set(ref(db, 'imu/'+timestamp), {
                'timestamp': timestamp,
                'x_mag': x,
                'y_mag': y,
                'z_mag': z,
            })
        });
     
    }
    const sensor_data_stop = () =>{
        subscription_acc.unsubscribe();
        subscription_gyr.unsubscribe();
        subscription_mag.unsubscribe();
    }
    

    const getwifiData = async() => {
        try {
            let perm = await getPermission();
            if (perm == 'OK') {
                let isConnect = await WifiManager.isEnabled();
                console.log(isConnect);
                if (!isConnect) {
                    WifiManager.setEnabled(true);
                    console.log(isConnect);
                } else if (isConnect) {
                    console.log(mode);
                    /*let IP = await WifiManager.getIP();
                    let current_ssid = await WifiManager.getCurrentWifiSSID();
                    let current_RSSI = await WifiManager.getCurrentSignalStrength();*/
                    let wifilist = await WifiManager.loadWifiList();

                    if (wifilist.length > 0) {
                        console.log(wifilist);
                        if (mode == 'AP') {
                            var closetAP = helper.getClosestAP(wifilist);
                            if (closetAP.length == 1) {
                                helper.writeAP_Location(closetAP[0]['bssid'], x_coo, y_coo, closetAP[0]['rssi']);
                                alert('AP gan nhat: ' + closetAP[0]['bssid']);
                            } else if (closetAP.length > 1) {
                                for (var index in closetAP) {
                                    helper.writeAP_Location(closetAP[index]['bssid'], x_coo, y_coo, closetAP[index]['rssi']);
                                }
                                alert('AP gan nhat: ' + closetAP[0]['bssid']);
                            } else if (closetAP.length == 0) {
                                alert('no data');
                            }
                        } else if (mode == 'RSSI') {
                            alert('RSSI: ' + wifilist[0].level);
                            helper.writeRSSI_data(wifilist, x_coo, y_coo);
                        } else if (mode == 'POS') {
                            console.log('POS');
                            helper.weightedCentroid();
                        }
                    } else if (wifilist.length == 0) {
                        alert('khong quet duoc');
                    }
                }

            } else {
                alert('no permission');
            }

        } catch (error) {
            console.log(error);
        }

    };

    const ImageCompon = () => {
        if (uri_IMG != '') {
            return ( <Image style = { styles.image } source = {{ uri: uri_IMG }} > </Image>)
        } else if (uri_IMG == '') {
            return ( <Image style = { styles.image }source = {{ uri: imageImport }} ></Image>)
        }

    }

    const markOnImage = () => {
        //helper.weightedCentroid();
        ImageMarker.markText({
            src: imageImport,
            text: 'X',
            X: parseInt(Math.floor(scaling_input_x(x_coo))),
            Y: parseInt(Math.floor(scaling_input_y(y_coo))),
            fontSize: 50,
            fontName: 'Arial',
            color: '#FF0000AA',
            quality: 100,
            scale: 1,
        }).then((path) => {
            //console.log(scaling_input_y(y_coo));
            setURI_IMG(Platform.OS === 'android' ? 'file://' + path : path, );
        }).catch((error) => {
            console.log(error);
        })
    }

    return ( 
    <View style = { styles.container } >
        <Text style = {{ color: 'blue' }}> PHAN MEM DINH VI </Text>  
        <TouchableOpacity onPress = {() => getwifiData()} >
            <Text>GET WIFI INFO</Text>  
        </TouchableOpacity>  
        <View style={styles.line}>
            <TouchableOpacity style={{backgroundColor:'#7ddc6c'}} onPress = {() => sensor_data_start() }>
                <Text> START IMU DATA </Text>  
            </TouchableOpacity>  
            <TouchableOpacity style={{backgroundColor:'red'}} onPress = {() => sensor_data_stop() }>
                <Text> STOP IMU DATA </Text>  
            </TouchableOpacity>  
        </View>
        
        <TouchableOpacity onPress = {() => { markOnImage() }}>
            <Text> MARK ON IMAGE </Text>  
        </TouchableOpacity>  
        <View>
            <TextInput style = { styles.text_input }
                placeholder = 'X'
                onChangeText = {(x) => {setX(x);}}
                value = { x_coo.toString() } > 
            </TextInput>  
            <TextInput style = { styles.text_input }
                placeholder = 'Y'
                onChangeText = {(y) => {setY(y)}}
                value = { y_coo.toString() } > 
            </TextInput> 
            {/* < Image style = { styles.image } source = { require(imageURI) } />*/} 
            { <ImageCompon/> } 
            <Text > X: { x_coo }, Y: { y_coo } </Text>  
            <Picker selectedValue = { mode }
                style = {{ height: 30, width: 200, alignItems: 'center', alignContent: 'center' }}
                onValueChange = {(itemValue, itemIndex) => { setMode(itemValue) }} > 
                {
                    Mode.map((item, key) => {
                        return <Picker.Item label = { item.value }
                        value = { item.mode }
                        key = { key }/>
                    })
                } 
            </Picker>
        </View>
        <StatusBar style = "auto" />
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
        width: 300,
        margin: 2,
        borderWidth: 0.5,
        padding: 5,
    },
    line:{
        display: 'flex',
        flexDirection:'row'
    }
});