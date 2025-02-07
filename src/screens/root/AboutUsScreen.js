import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import ApplicationCard from '../../components/common/ApplicationCard';
import {Header} from '../../components/headers';

const AboutUsScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="About us" />
      <View style={{flex: 1, padding: 10}}>
        <ApplicationCard
          onCall={() => console.log('call')}
          onLocation={() => console.log('location')}
          onStart={() => console.log('start')}
        />
      </View>
    </View>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
});
