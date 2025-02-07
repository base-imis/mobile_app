import {View, StyleSheet, ScrollView} from 'react-native';
import {Subheading, Text, Title} from 'react-native-paper';
import React from 'react';

const Chakrila = () => {
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
        <Title style={styles.title}>Chakrila</Title>
        <Text style={styles.txt}>
          Direction:
          <Subheading style={styles.subheading}>{'  '} East</Subheading>
        </Text>
        <Text style={styles.txt}>
          LandScape Type
          <Subheading style={styles.subheading}>{'  '} Road</Subheading>
        </Text>
        <Text style={styles.txt}>
          Row:
          <Subheading style={styles.subheading}>{'  '} 1</Subheading>
        </Text>
        <Text style={styles.txt}>
          Road width :
          <Subheading style={styles.subheading}>{'  '} 6</Subheading>
        </Text>
        <Text style={styles.txt}>
          Actual setback :
          <Subheading style={styles.subheading}>{'  '} 1.5</Subheading>
        </Text>
        <Text style={styles.txt}>
          Standard setback :
          <Subheading style={styles.subheading}>{'  '} 1.5</Subheading>
        </Text>

        <Text style={[styles.txt, {marginTop: 10}]}>
          Direction:
          <Subheading style={styles.subheading}>{'  '} West</Subheading>
        </Text>
        <Text style={styles.txt}>
          LandScape Type
          <Subheading style={styles.subheading}>{'  '} Land</Subheading>
        </Text>
        <Text style={styles.txt}>
          Row:
          <Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={styles.txt}>
          Road width :<Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={styles.txt}>
          Actual setback :
          <Subheading style={styles.subheading}>{'  '} 0</Subheading>
        </Text>
        <Text style={styles.txt}>
          Standard setback :
          <Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={[styles.txt, {marginTop: 10}]}>
          Direction:
          <Subheading style={styles.subheading}>{'  '} North</Subheading>
        </Text>
        <Text style={styles.txt}>
          LandScape Type
          <Subheading style={styles.subheading}>{'  '} Land</Subheading>
        </Text>
        <Text style={styles.txt}>
          Row:
          <Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={styles.txt}>
          Road width :<Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={styles.txt}>
          Actual setback :
          <Subheading style={styles.subheading}>{'  '} 0</Subheading>
        </Text>
        <Text style={styles.txt}>
          Standard setback :
          <Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={[styles.txt, {marginTop: 10}]}>
          Direction:
          <Subheading style={styles.subheading}>{'  '} South</Subheading>
        </Text>
        <Text style={styles.txt}>
          LandScape Type
          <Subheading style={styles.subheading}>{'  '} Land</Subheading>
        </Text>
        <Text style={styles.txt}>
          Row:
          <Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={styles.txt}>
          Road width :<Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
        <Text style={styles.txt}>
          Actual setback :
          <Subheading style={styles.subheading}>{'  '} 0</Subheading>
        </Text>
        <Text style={styles.txt}>
          Standard setback :
          <Subheading style={styles.subheading}>{'  '} </Subheading>
        </Text>
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

export default Chakrila;
