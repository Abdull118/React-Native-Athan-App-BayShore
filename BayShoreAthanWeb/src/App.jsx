import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15000;
const ATHAN_TRIGGER_WINDOW_SECONDS = 45;
const FALLBACK_TIME = '--:--';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

const SOURCES = {
  regular: '/sounds/athan.mp3',
  fajr: '/sounds/athanFajr.mp3',
};

function padUnit(value) {
  return String(value).padStart(2, '0');
}

function formatClock(time) {
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatGregorianDate(time) {
  return time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function parse24HourTime(time24Hour) {
  if (!time24Hour) {
    return null;
  }

  const [hoursRaw, minutesRaw] = String(time24Hour).split(':');
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return { hours, minutes };
}

function convertTo12HourWithoutSeconds(time24Hour) {
  const parsed = parse24HourTime(time24Hour);
  if (!parsed) {
    return FALLBACK_TIME;
  }

  const date = new Date();
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function convert24HourToSeconds(time24Hour) {
  const parsed = parse24HourTime(time24Hour);
  if (!parsed) {
    return null;
  }

  return (parsed.hours * 3600) + (parsed.minutes * 60);
}

function getDateParam(date = new Date()) {
  return `${padUnit(date.getDate())}-${padUnit(date.getMonth() + 1)}-${date.getFullYear()}`;
}

async function fetchJson(url, label) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timeoutId = null;

  try {
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      ...(controller ? { signal: controller.signal } : {}),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${label} failed with ${response.status}: ${body.slice(0, 160)}`);
    }

    return await response.json();
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export default function App() {
  const regularAudioRef = useRef(null);
  const fajrAudioRef = useRef(null);
  const playedPrayerTrackerRef = useRef({ dateKey: '', keys: {} });
  const playbackAttemptRef = useRef(0);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState({ day: '', month: '', year: '' });
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: FALLBACK_TIME,
    dhuhr: FALLBACK_TIME,
    asr: FALLBACK_TIME,
    maghrib: FALLBACK_TIME,
    isha: FALLBACK_TIME,
  });
  const [prayerTimes24, setPrayerTimes24] = useState({
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: '',
  });
  const [countdown, setCountdown] = useState({ hours: '--', minutes: '--', seconds: '--' });
  const [upcomingPrayer, setUpcomingPrayer] = useState({ key: '', label: '--', time: FALLBACK_TIME });

  const [audioError, setAudioError] = useState('');

  const appendAudioDebug = useCallback((type, message, details = '') => {
    const now = new Date();
    const timestamp = `${padUnit(now.getHours())}:${padUnit(now.getMinutes())}:${padUnit(now.getSeconds())}`;
    const suffix = details ? ` | ${details}` : '';
    const line = `[${timestamp}] ${type}: ${message}${suffix}`;
    console.log('[ATHAN_DEBUG]', line);
  }, []);

  const reportAudioError = useCallback((message, errorOrMessage) => {
    const detail = typeof errorOrMessage === 'string'
      ? errorOrMessage
      : errorOrMessage?.message || String(errorOrMessage || 'Unknown error');

    const formatted = `${message}: ${detail}`;
    console.error('[ATHAN_ERROR]', formatted, errorOrMessage);
    setAudioError(formatted);
    appendAudioDebug('ERROR', message, detail);
  }, [appendAudioDebug]);

  const cleanupAudioRef = useCallback((audioRef) => {
    if (!audioRef.current) {
      return;
    }

    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } catch {
      // No-op.
    }

    audioRef.current = null;
  }, []);

  const playAthanSource = useCallback(async (audioRef, source, label, triggerReason = 'unknown') => {
    const attempt = playbackAttemptRef.current + 1;
    playbackAttemptRef.current = attempt;

    appendAudioDebug('PLAY_ATTEMPT', `${label} athan`, `attempt=${attempt} trigger=${triggerReason}`);

    if (audioRef.current) {
      try {
        appendAudioDebug(
          'SOUND_STATUS',
          `${label} cached sound`,
          `paused=${String(audioRef.current.paused)} ended=${String(audioRef.current.ended)}`,
        );
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        appendAudioDebug('PLAY_SUCCESS', `${label} athan replayed`, `attempt=${attempt}`);
        return;
      } catch (error) {
        reportAudioError(`Cached ${label} athan replay failed`, error);
        cleanupAudioRef(audioRef);
      }
    }

    const audio = new Audio(source);
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      reportAudioError(`${label} athan element error`, 'Audio element emitted error event');
    });

    try {
      appendAudioDebug('LOAD_START', `${label} athan`, `attempt=${attempt}`);
      await audio.play();
      appendAudioDebug('PLAY_SUCCESS', `${label} athan started`, `attempt=${attempt}`);
    } catch (error) {
      reportAudioError(`Failed to play ${label} athan`, error);
      cleanupAudioRef(audioRef);
    }
  }, [appendAudioDebug, cleanupAudioRef, reportAudioError]);

  const playRegular = useCallback((triggerReason) => {
    playAthanSource(regularAudioRef, SOURCES.regular, 'regular', triggerReason);
  }, [playAthanSource]);

  const playFajr = useCallback((triggerReason) => {
    playAthanSource(fajrAudioRef, SOURCES.fajr, 'fajr', triggerReason);
  }, [playAthanSource]);

  const handleManualAthanPlay = useCallback(() => {
    setAudioError('');
    appendAudioDebug('MANUAL_TRIGGER', 'Play Athan button pressed', `upcoming=${upcomingPrayer.key || 'none'}`);

    if (upcomingPrayer.key === 'fajr') {
      playFajr('manual-button');
      return;
    }

    playRegular('manual-button');
  }, [appendAudioDebug, playFajr, playRegular, upcomingPrayer.key]);

  useEffect(() => {
    const preloadAsset = (source, label) => {
      const audio = new Audio(source);
      audio.preload = 'auto';

      const onCanPlay = () => {
        appendAudioDebug('ASSET_CHECK', `${label} athan asset`, 'ready');
      };
      const onError = () => {
        reportAudioError(`Athan asset check failed for ${label}`, 'Audio preload error event');
      };

      audio.addEventListener('canplaythrough', onCanPlay, { once: true });
      audio.addEventListener('error', onError, { once: true });
      audio.load();
    };

    preloadAsset(SOURCES.regular, 'regular');
    preloadAsset(SOURCES.fajr, 'fajr');
  }, [appendAudioDebug, reportAudioError]);

  useEffect(() => {
    const getAthan = async () => {
      try {
        const json = await fetchJson(
          'https://api.aladhan.com/v1/timingsByCity?city=BayShore&country=USA&method=2',
          'timingsByCity',
        );

        const timings = json?.data?.timings;
        if (!timings) {
          throw new Error('timingsByCity payload missing timings');
        }

        setPrayerTimes({
          fajr: convertTo12HourWithoutSeconds(timings.Fajr),
          dhuhr: convertTo12HourWithoutSeconds(timings.Dhuhr),
          asr: convertTo12HourWithoutSeconds(timings.Asr),
          maghrib: convertTo12HourWithoutSeconds(timings.Maghrib),
          isha: convertTo12HourWithoutSeconds(timings.Isha),
        });

        setPrayerTimes24({
          fajr: timings.Fajr,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        });
      } catch (error) {
        appendAudioDebug('DATA_ERROR', 'Failed fetching prayer times', error?.message || String(error));
      }
    };

    const getHijriDate = async () => {
      try {
        const json = await fetchJson(`https://api.aladhan.com/v1/gToH?date=${getDateParam()}`, 'gToH');
        const hijri = json?.data?.hijri;
        if (!hijri) {
          throw new Error('gToH payload missing hijri');
        }

        setHijriDate({
          day: hijri.day,
          month: hijri.month.ar,
          year: hijri.year,
        });
      } catch (error) {
        appendAudioDebug('DATA_ERROR', 'Failed fetching hijri date', error?.message || String(error));
      }
    };

    const refreshAllData = async () => {
      await Promise.all([getAthan(), getHijriDate()]);
    };

    refreshAllData();
    const refreshInterval = setInterval(refreshAllData, REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshInterval);
  }, [appendAudioDebug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => {
    cleanupAudioRef(regularAudioRef);
    cleanupAudioRef(fajrAudioRef);
  }, [cleanupAudioRef]);

  useEffect(() => {
    const now = currentTime;
    const nowInSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    const todayKey = `${now.getFullYear()}-${padUnit(now.getMonth() + 1)}-${padUnit(now.getDate())}`;

    if (playedPrayerTrackerRef.current.dateKey !== todayKey) {
      playedPrayerTrackerRef.current = { dateKey: todayKey, keys: {} };
    }

    PRAYERS.forEach(({ key }) => {
      const prayerSecond = convert24HourToSeconds(prayerTimes24[key]);
      if (prayerSecond === null) {
        return;
      }

      const withinTriggerWindow =
        nowInSeconds >= prayerSecond && nowInSeconds < prayerSecond + ATHAN_TRIGGER_WINDOW_SECONDS;
      const alreadyPlayed = Boolean(playedPrayerTrackerRef.current.keys[key]);

      if (!withinTriggerWindow || alreadyPlayed) {
        return;
      }

      appendAudioDebug('AUTO_TRIGGER', `${key} athan window matched`, `clock=${formatClock(now)}`);

      if (key === 'fajr') {
        playFajr('auto-schedule');
      } else {
        playRegular('auto-schedule');
      }

      playedPrayerTrackerRef.current.keys[key] = true;
    });
  }, [appendAudioDebug, currentTime, playFajr, playRegular, prayerTimes24]);

  useEffect(() => {
    const allLoaded = PRAYERS.every(({ key }) => prayerTimes[key] !== FALLBACK_TIME && prayerTimes24[key]);

    if (!allLoaded) {
      setUpcomingPrayer({ key: '', label: '--', time: FALLBACK_TIME });
      setCountdown({ hours: '--', minutes: '--', seconds: '--' });
      return;
    }

    const nowInSeconds = (currentTime.getHours() * 3600) + (currentTime.getMinutes() * 60) + currentTime.getSeconds();
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
      deltaSeconds = (24 * 3600) - nowInSeconds + nextPrayer.seconds;
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
  }, [currentTime, prayerTimes, prayerTimes24]);

  const prayerRows = useMemo(
    () => PRAYERS.map(({ key, label }) => ({
      key,
      label,
      time: prayerTimes[key],
      isUpcoming: upcomingPrayer.key === key,
    })),
    [prayerTimes, upcomingPrayer.key],
  );

  return (
    <div className="app-root">
      <section className="left-panel patterned-light">
        <div className="left-content">
          <h1 className="clock">{formatClock(currentTime)}</h1>
          <p className="next-label">{`Next Athan (${upcomingPrayer.label}) in`}</p>
          <p className="next-meta">{`at ${upcomingPrayer.time}`}</p>
          <p className="countdown">{`${countdown.hours}:${countdown.minutes}:${countdown.seconds}`}</p>
          <p className="date">{formatGregorianDate(currentTime)}</p>
          <p className="hijri-date">
            {hijriDate.day ? `${hijriDate.day} ${hijriDate.month} ${hijriDate.year}` : 'Loading Hijri date...'}
          </p>

          <button type="button" className="play-button" onClick={handleManualAthanPlay}>Play Athan</button>

          {audioError ? (
            <div className="error-banner">{audioError}</div>
          ) : null}
        </div>
      </section>

      <section className="right-panel patterned-blue">
        <div className="prayer-list">
          {prayerRows.map((row) => (
            <div key={row.key} className={`prayer-row ${row.isUpcoming ? 'upcoming' : ''}`}>
              <span>{row.label}</span>
              <span>{row.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
