import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import { useFonts } from 'expo-font';
import moment from 'moment/moment';
import createStyles from './styles';

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

const FALLBACK_TIME = '--:--';

function padUnit(value) {
  return String(value).padStart(2, '0');
}

function formatTime(time) {
  let hours = time.getHours();
  const minutes = padUnit(time.getMinutes());
  const seconds = padUnit(time.getSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours || 12;

  return `${hours}:${minutes}:${seconds} ${ampm}`;
}

function parse24HourTime(time24Hour) {
  if (!time24Hour) {
    return null;
  }

  const [hoursRaw, minutesRaw] = time24Hour.split(':');
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return { hours, minutes };
}

function convertTo12HourWithoutSeconds(time24Hour) {
  const parsedTime = parse24HourTime(time24Hour);
  if (!parsedTime) {
    return FALLBACK_TIME;
  }

  const date = new Date();
  date.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function convertTo12HourWithSeconds(time24Hour) {
  const parsedTime = parse24HourTime(time24Hour);
  if (!parsedTime) {
    return '--:--:--';
  }

  const date = new Date();
  date.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function convert24HourToSeconds(time24Hour) {
  const parsedTime = parse24HourTime(time24Hour);
  if (!parsedTime) {
    return null;
  }
  return (parsedTime.hours * 60 * 60) + (parsedTime.minutes * 60);
}

function GeometricPattern({ width, height, color, opacity, dense = false }) {
  const motifSize = dense
    ? Math.max(18, Math.round(Math.min(width, height) * 0.055))
    : Math.max(24, Math.round(Math.min(width, height) * 0.07));
  const horizontalStep = motifSize * 1.45;
  const verticalStep = motifSize * 1.2;
  const columns = Math.ceil(width / horizontalStep) + 1;
  const rows = Math.ceil(height / verticalStep) + 1;
  const motifs = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const leftOffset = (row % 2 === 0 ? 0 : horizontalStep / 2);
      motifs.push(
        <View
          key={`${row}-${column}`}
          style={{
            position: 'absolute',
            width: motifSize,
            height: motifSize,
            borderWidth: Math.max(1, motifSize * 0.05),
            borderColor: color,
            opacity,
            left: (column * horizontalStep) + leftOffset,
            top: row * verticalStep,
            transform: [{ rotate: '45deg' }],
          }}
        />,
      );
    }
  }

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      {motifs}
    </View>
  );
}

export default function App() {
  const [soundObject, setSoundObject] = useState(null);
  const [soundObjectFajr, setSoundObjectFajr] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState({ day: '', month: '', year: '' });
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: FALLBACK_TIME,
    dhuhr: FALLBACK_TIME,
    asr: FALLBACK_TIME,
    maghrib: FALLBACK_TIME,
    isha: FALLBACK_TIME,
  });
  const [prayerTimesWithSeconds, setPrayerTimesWithSeconds] = useState({
    fajr: '--:--:--',
    dhuhr: '--:--:--',
    asr: '--:--:--',
    maghrib: '--:--:--',
    isha: '--:--:--',
  });
  const [prayerTimes24, setPrayerTimes24] = useState({
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: '',
  });
  const [countdown, setCountdown] = useState({
    hours: '--',
    minutes: '--',
    seconds: '--',
  });
  const [upcomingPrayer, setUpcomingPrayer] = useState({
    key: '',
    label: '--',
    time: FALLBACK_TIME,
  });

  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles({ width, height }), [width, height]);
  const halfWidth = width / 2;
  const gregorianDate = moment(currentTime).format('dddd MMMM D YYYY');

  useKeepAwake();

  const [fontsLoaded] = useFonts({
    'YanoneKaffeesatz-VariableFont_wght': require('./assets/fonts/YanoneKaffeesatz-VariableFont_wght.ttf'),
  });

  const playSound = async () => {
    if (soundObject) {
      await soundObject.replayAsync();
      return;
    }

    const mySound = new Audio.Sound();
    await mySound.loadAsync(require('./assets/sounds/athan.mp3'));
    await mySound.playAsync();
    setSoundObject(mySound);
  };

  const playSoundFajr = async () => {
    if (soundObjectFajr) {
      await soundObjectFajr.replayAsync();
      return;
    }

    const mySound = new Audio.Sound();
    await mySound.loadAsync(require('./assets/sounds/athanFajr.mp3'));
    await mySound.playAsync();
    setSoundObjectFajr(mySound);
  };

  const getAthan = async () => {
    try {
      const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=BayShore&country=USA&method=2');
      const json = await response.json();
      const timings = json?.data?.timings;

      if (!timings) {
        return;
      }

      setPrayerTimes({
        fajr: convertTo12HourWithoutSeconds(timings.Fajr),
        dhuhr: convertTo12HourWithoutSeconds(timings.Dhuhr),
        asr: convertTo12HourWithoutSeconds(timings.Asr),
        maghrib: convertTo12HourWithoutSeconds(timings.Maghrib),
        isha: convertTo12HourWithoutSeconds(timings.Isha),
      });

      setPrayerTimesWithSeconds({
        fajr: convertTo12HourWithSeconds(timings.Fajr),
        dhuhr: convertTo12HourWithSeconds(timings.Dhuhr),
        asr: convertTo12HourWithSeconds(timings.Asr),
        maghrib: convertTo12HourWithSeconds(timings.Maghrib),
        isha: convertTo12HourWithSeconds(timings.Isha),
      });

      setPrayerTimes24({
        fajr: timings.Fajr,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getHijriDate = async (dateParam) => {
    try {
      const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${dateParam}`);
      const json = await response.json();
      const hijri = json?.data?.hijri;
      if (!hijri) {
        return;
      }

      setHijriDate({
        day: hijri.day,
        month: hijri.month.ar,
        year: hijri.year,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const refreshAllData = async () => {
      const dateParam = moment().format('DD-MM-YYYY');
      await Promise.all([getAthan(), getHijriDate(dateParam)]);
    };

    refreshAllData();
    const refreshInterval = setInterval(refreshAllData, REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
      if (soundObjectFajr) {
        soundObjectFajr.unloadAsync();
      }
    };
  }, [soundObject, soundObjectFajr]);

  useEffect(() => {
    const nowFormatted = formatTime(currentTime);
    if (nowFormatted === prayerTimesWithSeconds.fajr) {
      playSoundFajr();
      return;
    }
    if (
      nowFormatted === prayerTimesWithSeconds.dhuhr ||
      nowFormatted === prayerTimesWithSeconds.asr ||
      nowFormatted === prayerTimesWithSeconds.maghrib ||
      nowFormatted === prayerTimesWithSeconds.isha
    ) {
      playSound();
    }
  }, [currentTime, prayerTimesWithSeconds]);

  useEffect(() => {
    const allLoaded = PRAYERS.every(({ key }) => prayerTimes[key] !== FALLBACK_TIME && prayerTimes24[key]);
    if (!allLoaded) {
      setUpcomingPrayer({ key: '', label: '--', time: FALLBACK_TIME });
      setCountdown({ hours: '--', minutes: '--', seconds: '--' });
      return;
    }

    const updateNextPrayer = () => {
      const now = new Date();
      const nowInSeconds = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();
      const schedule = PRAYERS
        .map(({ key, label }) => ({
          key,
          label,
          seconds: convert24HourToSeconds(prayerTimes24[key]),
        }))
        .filter((entry) => typeof entry.seconds === 'number');

      if (!schedule.length) {
        setUpcomingPrayer({ key: '', label: '--', time: FALLBACK_TIME });
        setCountdown({ hours: '--', minutes: '--', seconds: '--' });
        return;
      }

      let nextPrayer = schedule.find((entry) => entry.seconds > nowInSeconds);
      let deltaSeconds = 0;

      if (nextPrayer) {
        deltaSeconds = nextPrayer.seconds - nowInSeconds;
      } else {
        nextPrayer = schedule[0];
        deltaSeconds = (24 * 60 * 60) - nowInSeconds + nextPrayer.seconds;
      }

      setUpcomingPrayer({
        key: nextPrayer.key,
        label: nextPrayer.label,
        time: prayerTimes[nextPrayer.key] || FALLBACK_TIME,
      });
      setCountdown({
        hours: padUnit(Math.floor(deltaSeconds / 3600)),
        minutes: padUnit(Math.floor((deltaSeconds % 3600) / 60)),
        seconds: padUnit(deltaSeconds % 60),
      });
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, prayerTimes24]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.leftPanel}>
        <GeometricPattern width={halfWidth} height={height} color="#007FFF" opacity={0.08} />
        <View style={styles.leftContent}>
          <Text style={styles.time} adjustsFontSizeToFit minimumFontScale={0.55} numberOfLines={1}>
            {formatTime(currentTime)}
          </Text>
          <Text style={styles.countDownLabel} adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={2}>
            {`Next Athan (${upcomingPrayer.label}) in`}
          </Text>
          <Text style={styles.nextAthanMeta} adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1}>
            {`at ${upcomingPrayer.time}`}
          </Text>
          <Text style={styles.countDown} adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1}>
            {`${countdown.hours}:${countdown.minutes}:${countdown.seconds}`}
          </Text>
          <Text style={styles.date} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={2}>
            {gregorianDate}
          </Text>
          <Text style={styles.hijriDate} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={2}>
            {hijriDate.day ? `${hijriDate.day} ${hijriDate.month} ${hijriDate.year}` : 'Loading Hijri date...'}
          </Text>
        </View>
      </View>

      <View style={styles.rightPanel}>
        <GeometricPattern width={halfWidth} height={height} color="#FFFFFF" opacity={0.09} dense />
        <View style={styles.prayers}>
          {PRAYERS.map(({ key, label }, index) => {
            const isUpcoming = upcomingPrayer.key === key;
            const isLast = index === PRAYERS.length - 1;
            return (
              <View key={key} style={[styles.prayerRow, isLast && styles.lastPrayerRow, isUpcoming && styles.upcomingPrayerRow]}>
                <Text style={[styles.prayerText, isUpcoming && styles.upcomingPrayerText]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                  {label}
                </Text>
                <Text style={[styles.prayerText, styles.prayerTimeText, isUpcoming && styles.upcomingPrayerText]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                  {prayerTimes[key]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
