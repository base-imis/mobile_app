import React from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

import {footerLines, linkSegments} from '../../utils/footer';

// Labels made tappable wherever they appear in the footer text
const LINKS = {
  'CC BY-NC-SA 4.0':
    'https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1',
  'Innovative Solution Pvt. Ltd.': 'https://www.innovativesolution.com.np',
};

// Used until GET api/footer answers, or if it fails
const fallbackText = () =>
  `Base IMIS © 2022-${new Date().getFullYear()} by ISPL & GWSC-AIT ` +
  'is licensed under CC BY-NC-SA 4.0';

const HomeFooter = ({text}) => {
  const theme = useTheme();
  const lines = footerLines(text || fallbackText());

  return (
    <View style={styles.container}>
      <View
        style={[styles.divider, {backgroundColor: theme.colors.outlineVariant}]}
      />
      {lines.map((line, index) => (
        <Text
          key={index}
          variant="bodySmall"
          style={[styles.line, {color: theme.colors.onSurfaceVariant}]}>
          {linkSegments(line, Object.keys(LINKS)).map((segment, i) =>
            segment.link ? (
              <Text
                key={i}
                variant="bodySmall"
                onPress={() => Linking.openURL(LINKS[segment.link])}
                style={[styles.link, {color: theme.colors.primary}]}>
                {segment.text}
              </Text>
            ) : (
              segment.text
            ),
          )}
        </Text>
      ))}
    </View>
  );
};

export default HomeFooter;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 4,
  },
  divider: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  line: {
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
