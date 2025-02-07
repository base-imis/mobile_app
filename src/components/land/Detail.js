import {View, StyleSheet, ScrollView} from 'react-native';
import {Subheading, Text, Title} from 'react-native-paper';
import React from 'react';

const Detail = () => {
  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.txt}>
          Application No:
          <Subheading style={styles.subheading}>{'  '} ABCDEF</Subheading>
        </Text>
        <Text style={styles.txt}>
          Submission date:
          <Subheading style={styles.subheading}>{'  '} 2077-01-01</Subheading>
        </Text>
        <Text style={styles.txt}>
          Building Purpose:
          <Subheading style={styles.subheading}>{'  '} Residental</Subheading>
        </Text>
        <Text style={styles.txt}>
          NBC Class:
          <Subheading style={styles.subheading}>
            {'  '} Class B Building
          </Subheading>
        </Text>
        <Title style={styles.title}>Applicant Detail</Title>
        <Text style={styles.txt}>
          Applicant name:
          <Subheading style={styles.subheading}>{'  '} Jenish</Subheading>
        </Text>
        <Text style={styles.txt}>
          Citizenship No:
          <Subheading style={styles.subheading}>{'  '} 2341</Subheading>
        </Text>
        <Text style={styles.txt}>
          Issued District:
          <Subheading style={styles.subheading}>{'  '} Lalitpur</Subheading>
        </Text>
        <Text style={styles.txt}>
          Contact Number:
          <Subheading style={styles.subheading}>{'  '} 123456789</Subheading>
        </Text>
        <Title style={styles.title}>Land owner detail</Title>
        <Text style={styles.txt}>
          Land owner name:
          <Subheading style={styles.subheading}>{'  '} Jenish</Subheading>
        </Text>
        <Text style={styles.txt}>
          Citizenship No:
          <Subheading style={styles.subheading}>{'  '} 2341</Subheading>
        </Text>
        <Text style={styles.txt}>
          Issued District:
          <Subheading style={styles.subheading}>{'  '} Lalitpur</Subheading>
        </Text>
        <Text style={styles.txt}>
          Contact Number:
          <Subheading style={styles.subheading}>{'  '} 123456789</Subheading>
        </Text>
        <Title style={styles.title}>House Owner Detail</Title>
        <Text style={styles.txt}>
          House owner name:
          <Subheading style={styles.subheading}>{'  '} Jenish</Subheading>
        </Text>
        <Text style={styles.txt}>
          Citizenship No:
          <Subheading style={styles.subheading}>{'  '} 2341</Subheading>
        </Text>
        <Text style={styles.txt}>
          Issued District:
          <Subheading style={styles.subheading}>{'  '} Lalitpur</Subheading>
        </Text>
        <Text style={styles.txt}>
          Contact Number:
          <Subheading style={styles.subheading}>{'  '} 123456789</Subheading>
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

export default Detail;
