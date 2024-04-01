import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import {useFonts} from 'expo-font';
import moment from 'moment/moment';
import styles from './styles';

export default function App() {

    const [soundObject, setSoundObject] = useState(null);
    const [soundObjectFajr, setSoundObjectFajr] = useState(null);
    const [fajrAthan ,setFajrAthan] = useState()
    const [dhurAthan, setDhurAthan] = useState()
    const [asrAthan, setAsrAthan] = useState()
    const [maghribAthan, setMaghribAthan] = useState()
    const [ishaAthan, setIshaAthan] = useState()

    const [fajrAthan2 ,setFajrAthan2] = useState()
    const [dhurAthan2, setDhurAthan2] = useState()
    const [asrAthan2, setAsrAthan2] = useState()
    const [maghribAthan2, setMaghribAthan2] = useState()
    const [ishaAthan2, setIshaAthan2] = useState()

    const [currentDate, setCurrentDate] = useState()
    const [momentDate, setMomentDate] = useState()
    const [currentHijriDay, setCurrentHijriDay] = useState()
    const [currentHijriMonth, setCurrentHijriMonth] = useState()
    const [currentHijriYear, setCurrentHijriYear] = useState()
    const [currentTime, setCurrentTime] = useState(new Date());

    
  
    const formatTime = (time) => {
      let hours = time.getHours();
      let minutes = time.getMinutes();
      let seconds = time.getSeconds();
      let ampm = hours >= 12 ? 'PM' : 'AM';
    
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;
    
      return `${hours}:${minutes}:${seconds} ${ampm}`;
    };
 
    const formatTime2 = (time) => {
      let hours = time.getHours();
      let minutes = time.getMinutes();
      let ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? `0${minutes}` : minutes;

      return `${hours}:${minutes} ${ampm}`;
    };

  const getAthan = async () => {
      try {
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=BayShore&country=USA&method=2`);
      const json = await response.json();
      setFajrAthan(convertTo12HourWithoutSeconds(json.data.timings.Fajr))
      setDhurAthan(convertTo12HourWithoutSeconds(json.data.timings.Dhuhr))
      setAsrAthan(convertTo12HourWithoutSeconds(json.data.timings.Asr))
      setMaghribAthan(convertTo12HourWithoutSeconds(json.data.timings.Maghrib))
      setIshaAthan(convertTo12HourWithoutSeconds(json.data.timings.Isha))

      setFajrAthan2(convertTo12HourWithSeconds(json.data.timings.Fajr))
      setDhurAthan2(convertTo12HourWithSeconds(json.data.timings.Dhuhr))
      setAsrAthan2(convertTo12HourWithSeconds(json.data.timings.Asr))
      setMaghribAthan2(convertTo12HourWithSeconds(json.data.timings.Maghrib))
      setIshaAthan2(convertTo12HourWithSeconds(json.data.timings.Isha))
    } catch (error) {
      console.log(error);
    }
  }

  const getHijriDate = async () => {
    try {
     const response = await fetch(`https://api.aladhan.com/v1/gToH?=${currentDate}`);
     const json = await response.json();
     setCurrentHijriDay(json.data.hijri.day)
     setCurrentHijriMonth(json.data.hijri.month.ar)
     setCurrentHijriYear(json.data.hijri.year)
   } catch (error) {
     console.log(error)
   }
 }

 function convertTo12HourWithoutSeconds(time24Hour) {
  const [hours, minutes] = time24Hour.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleString('en-US', options);
}

function convertTo12HourWithSeconds(time24Hour) {
  const [hours, minutes] = time24Hour.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
  return date.toLocaleString('en-US', options);
}

  const getDate = () => {
    var today = new Date(),
    date = (today.getMonth() + 1)  + '-' + today.getDate() + '-' + today.getFullYear();
    setCurrentDate(date)
  };

  const momentGetDate = () =>{
    setMomentDate(moment().format('dddd MMMM D YYYY'))
  }

    const playSound = async () => {
      if (soundObject) {
        await soundObject.replayAsync();
        console.log('huh')
      } else {
        const mySound = new Audio.Sound();
        await mySound.loadAsync(require('./assets/sounds/athan.mp3'));
        await mySound.playAsync();
        setSoundObject(mySound);
        console.log('worked')
      }
    }

    const playSoundFajr = async () => {
      if (soundObjectFajr) {
        await soundObjectFajr.replayAsync(); 
      } else {
        const mySound = new Audio.Sound();
        await mySound.loadAsync(require('./assets/sounds/athanFajr.m4a'));
        await mySound.playAsync();
        setSoundObjectFajr(mySound);
        console.log('worked')
      }
    }
    
 

  useKeepAwake();

  useEffect(() => {
    getAthan()
    getHijriDate()
    getDate()
    momentGetDate()
    
}, []);

useEffect(() => {
  const intervalId = setInterval(() => {
    const now = new Date();

    setCurrentTime(now);
   
  }, 1000);

  return () => {
    clearInterval(intervalId);
  }
}, []);

useEffect(()=>{
    if (formatTime(currentTime) === fajrAthan2 ) {
      playSoundFajr();
    }else if(formatTime(currentTime) ===  dhurAthan2){
      playSound();
    }else if(formatTime(currentTime) === asrAthan2 ){
      playSound();
    }else if(formatTime(currentTime) === maghribAthan2 ){
      playSound();
    }else if(formatTime(currentTime) === ishaAthan2){
    playSound();
    }
 
}, [currentTime])




let[fontsLoaded] = useFonts({ 
  'YanoneKaffeesatz-VariableFont_wght': require('./assets/fonts/YanoneKaffeesatz-VariableFont_wght.ttf'),
});
const [countdownTimeHr, setCountdownTimeHr] = useState("");
const [countdownTimeMn, setCountdownTimeMn] = useState("");
const [countDownTimeSec, setCountdownTimeSec] = useState(""); // State for seconds
const [upcomingPrayerName, setUpcomingPrayerName] = useState("");

// Function to update prayer styles
const updatePrayer = () => {
  const now = new Date();
  const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); // Current time in seconds

  // Convert prayer times to seconds for comparison
  const times = {
    fajr: convertTimeToSeconds(fajrAthan),
    dhur: convertTimeToSeconds(dhurAthan),
    asr: convertTimeToSeconds(asrAthan),
    maghrib: convertTimeToSeconds(maghribAthan),
    isha: convertTimeToSeconds(ishaAthan),
  };

  // Determine the next prayer
  let nextPrayer = Object.keys(times).reduce((next, prayer) => {
    if (times[prayer] > currentTime && (next === null || times[prayer] < times[next])) {
      return prayer;
    }
    return next;
  }, null);

  // Update the upcoming prayer name and countdown time
  if (nextPrayer) {
    const timeDifference = times[nextPrayer] - currentTime;
    const hours = Math.floor(timeDifference / 3600);
    const minutes = Math.floor((timeDifference % 3600) / 60);
    const seconds = timeDifference % 60;
    setCountdownTimeHr(`${hours}`);
    setCountdownTimeMn(`${minutes}`);
    setCountdownTimeSec(`${seconds}`); // Set seconds
  } else {
    setCountdownTimeHr("");
    setCountdownTimeMn("");
    setCountdownTimeSec("");
  }
};

useEffect(() => {
  if (fajrAthan && dhurAthan && asrAthan && maghribAthan && ishaAthan) {
    updatePrayer();
    const interval = setInterval(updatePrayer, 1000);
    return () => clearInterval(interval);
  }
}, [fajrAthan, dhurAthan, asrAthan, maghribAthan, ishaAthan]);

// Convert 12-hour time format to total seconds for comparison
function convertTimeToSeconds(timeStr) {
  let [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) {
    hours = 0;
  }
  if (modifier === 'PM') {
    hours += 12;
  }
  return hours * 3600 + minutes * 60;
}
 
if (!fontsLoaded) {
  return null; // Or some other loading indicator
} else {
  return<View style={styles.container}>
 
<View style={styles.header}>
<Text style={styles.time}>{formatTime(currentTime)}</Text>
<Text style={styles.countDown}>Next Athan in: -{countdownTimeHr}:{countdownTimeMn}:{countDownTimeSec}</Text>
<Text style={styles.date}>{momentDate}</Text>
<Text style={styles.date}>{currentHijriDay} {currentHijriMonth} {currentHijriYear}</Text>
</View>

      <View style={styles.prayers}>
      <View style={styles.prayer}>
      <Text style={styles.text}>Fajr</Text>
      <Text style={styles.text}>{fajrAthan}</Text>
      </View>

      <View style={styles.prayer}>
      <Text style={styles.text}>Dhuhr</Text>
      <Text style={styles.text}>{dhurAthan}</Text>
      </View>

      <View style={styles.prayer}>
      <Text style={styles.text}>Asr</Text>
      <Text style={styles.text}>{asrAthan}</Text>
      </View>

      <View style={styles.prayer}>
      <Text style={styles.text}>Maghrib</Text>
      <Text style={styles.text}>{maghribAthan}</Text>
      </View>

      <View style={styles.prayer}>
      <Text style={styles.text}>Isha</Text>
      <Text style={styles.text}>{ishaAthan}</Text>
      </View>
      </View> 
    </View>
  ;
}


}
