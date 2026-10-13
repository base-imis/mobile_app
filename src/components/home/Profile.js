import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useSelector} from 'react-redux';

// "Ram Bahadur Thapa" -> "RT"; a single word gives one letter
const initialsOf = name => {
  const words = String(name ?? '').trim().split(/[\s-]+/).filter(Boolean);
  if (!words.length) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
};

// Hero block under the Home app bar. It continues the app bar colour and the
// dashboard sheet overlaps its bottom edge (see HomeScreen).
const Profile = () => {
  const {account, contentsLabel} = useSelector(state => state.auth);
  const theme = useTheme();
  const getLabel = key => contentsLabel?.[key] || key;
  // Login returns whichever organisation the user belongs to
  const organisation =
    account?.service_provider || account?.treatment_plant || account?.help_desk;

  return (
    <LinearGradient
      colors={[theme.colors.primary, 'rgb(41, 99, 150)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.hero}>
      <View style={[styles.bubble, styles.bubbleLarge]} />
      <View style={[styles.bubble, styles.bubbleSmall]} />
      <View style={styles.row}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={[styles.initials, {color: theme.colors.primary}]}>
              {initialsOf(account?.name)}
            </Text>
          </View>
        </View>
        <View style={styles.details}>
          <Text variant="labelLarge" style={styles.greeting}>
            {getLabel('Welcome')}
          </Text>
          <Text variant="titleLarge" numberOfLines={2} style={styles.name}>
            {account?.name}
          </Text>
          {!!organisation && (
            <View style={styles.orgChip}>
              <Icon
                name="office-building-outline"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text
                variant="labelMedium"
                numberOfLines={1}
                style={styles.orgText}>
                {organisation}
              </Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

export default Profile;

const AVATAR = 64;

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    // extra room for the dashboard sheet that overlaps by 16
    paddingBottom: 40,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bubbleLarge: {width: 180, height: 180, top: -70, right: -50},
  bubbleSmall: {width: 90, height: 90, bottom: -30, right: 90},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarRing: {
    padding: 3,
    borderRadius: AVATAR,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  name: {
    color: '#ffffff',
    fontWeight: '700',
  },
  orgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  orgText: {
    flexShrink: 1,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
