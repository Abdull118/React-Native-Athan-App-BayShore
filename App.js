import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const configuredWebUrl = process.env.EXPO_PUBLIC_ATHAN_WEB_URL?.trim();
const defaultCandidates = Platform.OS === 'android'
  ? ['http://localhost:5173', 'http://10.0.2.2:5173', 'http://127.0.0.1:5173', 'http://192.168.0.154:5173']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const WEB_CANDIDATE_URLS = [configuredWebUrl, ...defaultCandidates]
  .filter(Boolean)
  .filter((url, index, list) => list.indexOf(url) === index);

export default function App() {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [lastError, setLastError] = useState('');

  const activeIndex = Math.min(candidateIndex, WEB_CANDIDATE_URLS.length - 1);
  const activeUrl = WEB_CANDIDATE_URLS[activeIndex];
  const hasFallback = activeIndex < WEB_CANDIDATE_URLS.length - 1;

  const nextUrl = useMemo(
    () => (hasFallback ? WEB_CANDIDATE_URLS[activeIndex + 1] : ''),
    [activeIndex, hasFallback],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        key={activeUrl}
        source={{ uri: activeUrl }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        onError={(event) => {
          const message = event?.nativeEvent?.description || 'Unknown WebView error';
          setLastError(message);
        }}
        onHttpError={(event) => {
          const statusCode = event?.nativeEvent?.statusCode;
          setLastError(`HTTP ${statusCode || 'error'} while loading ${activeUrl}`);
        }}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText} numberOfLines={1}>
          {`Web Source: ${activeUrl}`}
        </Text>
        {lastError ? (
          <Text style={styles.errorText} numberOfLines={2}>
            {lastError}
          </Text>
        ) : null}
        {hasFallback ? (
          <Pressable
            onPress={() => {
              setLastError('');
              setCandidateIndex((value) => value + 1);
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{`Try Fallback (${nextUrl})`}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041422',
  },
  overlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 10,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 6,
  },
  errorText: {
    color: '#ff8e8e',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#007fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
