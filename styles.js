import { StyleSheet } from 'react-native';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function createStyles({ width, height, useCustomFont = true }) {
  const panelWidth = width / 2;
  const sizeBase = Math.min(panelWidth, height);
  const primaryFont = useCustomFont ? 'YanoneKaffeesatz-VariableFont_wght' : undefined;

  const panelPadding = clamp(Math.round(sizeBase * 0.06), 18, 58);
  const titleGap = clamp(Math.round(sizeBase * 0.022), 10, 24);
  const rowGap = clamp(Math.round(sizeBase * 0.02), 8, 20);
  const cornerRadius = clamp(Math.round(sizeBase * 0.03), 12, 28);

  const clockSize = clamp(Math.round(sizeBase * 0.17), 42, 128);
  const countDownLabelSize = clamp(Math.round(sizeBase * 0.07), 18, 52);
  const countDownSize = clamp(Math.round(sizeBase * 0.12), 28, 92);
  const dateSize = clamp(Math.round(sizeBase * 0.07), 20, 56);
  const hijriSize = clamp(Math.round(sizeBase * 0.065), 18, 50);
  const prayerSize = clamp(Math.round(sizeBase * 0.085), 20, 68);
  const rowMinHeight = clamp(Math.round(sizeBase * 0.12), 58, 108);

  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: '#007FFF',
    },
    leftPanel: {
      flex: 1,
      backgroundColor: '#f8f8f8',
      borderRightColor: '#dfdfdf',
      borderRightWidth: 1,
      overflow: 'hidden',
    },
    rightPanel: {
      flex: 1,
      backgroundColor: '#007FFF',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    leftContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: panelPadding,
      paddingHorizontal: panelPadding,
    },
    time: {
      color: '#007FFF',
      fontSize: clockSize,
      marginBottom: titleGap,
      fontFamily: primaryFont,
      textAlign: 'center',
      width: '100%',
    },
    countDownLabel: {
      color: '#007FFF',
      fontSize: countDownLabelSize,
      marginBottom: clamp(Math.round(titleGap * 0.6), 6, 14),
      fontFamily: primaryFont,
      textAlign: 'center',
      width: '100%',
      letterSpacing: 0.5,
    },
    nextAthanMeta: {
      color: '#007FFF',
      fontSize: clamp(Math.round(countDownLabelSize * 0.82), 14, 40),
      marginBottom: clamp(Math.round(titleGap * 0.4), 4, 12),
      fontFamily: primaryFont,
      textAlign: 'center',
      width: '100%',
      opacity: 0.85,
    },
    countDown: {
      color: '#007FFF',
      fontSize: countDownSize,
      marginBottom: titleGap,
      fontFamily: primaryFont,
      textAlign: 'center',
      width: '100%',
    },
    date: {
      color: '#007FFF',
      fontSize: dateSize,
      marginBottom: clamp(Math.round(titleGap * 0.3), 4, 10),
      fontFamily: primaryFont,
      textAlign: 'center',
      width: '100%',
    },
    hijriDate: {
      color: '#007FFF',
      fontSize: hijriSize,
      fontFamily: primaryFont,
      textAlign: 'center',
      width: '100%',
    },
    playButton: {
      marginTop: clamp(Math.round(titleGap * 0.8), 8, 18),
      backgroundColor: '#007FFF',
      borderRadius: clamp(Math.round(cornerRadius * 0.7), 10, 18),
      paddingVertical: clamp(Math.round(panelPadding * 0.22), 8, 16),
      paddingHorizontal: clamp(Math.round(panelPadding * 0.8), 20, 44),
      borderWidth: 1,
      borderColor: '#0067d6',
    },
    playButtonText: {
      color: '#ffffff',
      fontSize: clamp(Math.round(countDownLabelSize * 0.65), 14, 30),
      fontFamily: primaryFont,
      textAlign: 'center',
      letterSpacing: 0.4,
    },
    errorBanner: {
      marginTop: clamp(Math.round(titleGap * 0.6), 8, 16),
      width: '100%',
      borderRadius: clamp(Math.round(cornerRadius * 0.6), 8, 16),
      backgroundColor: '#b42318',
      borderColor: '#f04438',
      borderWidth: 1,
      paddingVertical: clamp(Math.round(panelPadding * 0.18), 6, 12),
      paddingHorizontal: clamp(Math.round(panelPadding * 0.22), 8, 14),
    },
    errorBannerText: {
      color: '#ffffff',
      fontSize: clamp(Math.round(countDownLabelSize * 0.45), 12, 24),
      fontFamily: primaryFont,
      textAlign: 'center',
    },
    audioDebugPanel: {
      marginTop: clamp(Math.round(titleGap * 0.55), 8, 14),
      width: '100%',
      borderRadius: clamp(Math.round(cornerRadius * 0.55), 8, 14),
      borderColor: 'rgba(0, 127, 255, 0.35)',
      borderWidth: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.70)',
      paddingVertical: clamp(Math.round(panelPadding * 0.14), 5, 10),
      paddingHorizontal: clamp(Math.round(panelPadding * 0.22), 8, 14),
    },
    audioDebugTitle: {
      color: '#005ec2',
      fontSize: clamp(Math.round(countDownLabelSize * 0.48), 12, 24),
      fontFamily: primaryFont,
      marginBottom: clamp(Math.round(titleGap * 0.2), 3, 8),
      textAlign: 'center',
    },
    audioDebugLine: {
      color: '#0b2e56',
      fontSize: clamp(Math.round(countDownLabelSize * 0.38), 11, 20),
      fontFamily: primaryFont,
      marginBottom: 2,
      textAlign: 'center',
      opacity: 0.95,
    },
    prayers: {
      paddingHorizontal: panelPadding,
      paddingVertical: panelPadding,
    },
    prayerRow: {
      minHeight: rowMinHeight,
      marginBottom: rowGap,
      borderRadius: cornerRadius,
      paddingHorizontal: clamp(Math.round(panelPadding * 0.55), 12, 34),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255, 255, 255, 0.10)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
    },
    lastPrayerRow: {
      marginBottom: 0,
    },
    prayerText: {
      color: '#ffffff',
      fontSize: prayerSize,
      fontFamily: primaryFont,
      flexShrink: 1,
    },
    prayerTimeText: {
      textAlign: 'right',
      paddingLeft: clamp(Math.round(panelPadding * 0.4), 8, 18),
    },
    upcomingPrayerRow: {
      backgroundColor: 'rgba(255, 255, 255, 0.24)',
      borderColor: 'rgba(255, 255, 255, 0.65)',
    },
    upcomingPrayerText: {
      color: '#ffffff',
      textShadowColor: 'rgba(0, 0, 0, 0.20)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });
}
