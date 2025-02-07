import {View, StyleSheet, ScrollView} from 'react-native';
import {Subheading, Text} from 'react-native-paper';
import React from 'react';

const Land = () => {
  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.txt}>
          Application No:
          <Subheading style={styles.subheading}>{'  '} ABCDEF</Subheading>
        </Text>
        <Text style={styles.txt}>
          Applicant Name:
          <Subheading style={styles.subheading}>{'  '} Jenish</Subheading>
        </Text>
        <Text style={styles.txt}>
          Ward No:
          <Subheading style={styles.subheading}>{'  '} 1</Subheading>
        </Text>

        <Text style={[styles.txt, {marginTop: 15}]}>
          Mapsheet Number:
          <Subheading style={styles.subheading}>{'  '} 1 ka</Subheading>
        </Text>
        <Text style={styles.txt}>
          Parcel Number:
          <Subheading style={styles.subheading}>{'  '} 1849/1818</Subheading>
        </Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={[styles.txt, {paddingTop: 10}]}>Area:</Text>
          <View>
            <Subheading style={styles.subheading}>
              {'  '} 10 sq meter
            </Subheading>
            <Subheading style={styles.subheading}>
              {'  '} 200 sq feet
            </Subheading>
            <Subheading style={styles.subheading}>
              {'  '} 0-6-0-2 Ropani
            </Subheading>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    paddingHorizontal: 17,
    marginBottom: 10,
  },
  subheading: {
    fontWeight: '700',
  },
  txt: {
    fontWeight: '600',
    marginBottom: 5,
  },
  title: {
    marginTop: 15,
    marginBottom: 10,
  },
});

export default Land;
