import { StyleSheet } from 'react-native';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function createStyles({ width, height }) {
  const panelWidth = width / 2;
  const sizeBase = Math.min(panelWidth, height);

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
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
      textAlign: 'center',
      width: '100%',
    },
    countDownLabel: {
      color: '#007FFF',
      fontSize: countDownLabelSize,
      marginBottom: clamp(Math.round(titleGap * 0.6), 6, 14),
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
      textAlign: 'center',
      width: '100%',
      letterSpacing: 0.5,
    },
    nextAthanMeta: {
      color: '#007FFF',
      fontSize: clamp(Math.round(countDownLabelSize * 0.82), 14, 40),
      marginBottom: clamp(Math.round(titleGap * 0.4), 4, 12),
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
      textAlign: 'center',
      width: '100%',
      opacity: 0.85,
    },
    countDown: {
      color: '#007FFF',
      fontSize: countDownSize,
      marginBottom: titleGap,
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
      textAlign: 'center',
      width: '100%',
    },
    date: {
      color: '#007FFF',
      fontSize: dateSize,
      marginBottom: clamp(Math.round(titleGap * 0.3), 4, 10),
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
      textAlign: 'center',
      width: '100%',
    },
    hijriDate: {
      color: '#007FFF',
      fontSize: hijriSize,
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
      textAlign: 'center',
      width: '100%',
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
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght',
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
