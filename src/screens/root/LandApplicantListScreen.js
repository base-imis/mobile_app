import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import React from 'react';

import {useState} from 'react';
import {Picker} from '@react-native-picker/picker';
import {Button, Subheading, Title, Divider} from 'react-native-paper';
import {COLORS} from '../../core/theme';
import LandApplicationCard from '../../components/land/LandApplicationCard';
import {Header} from '../../components/headers';

const LandApplicantListScreen = ({navigation}) => {
  const [name, setName] = useState('');

  const [visible, setVisible] = useState(false);

  const [applications, setApplications] = useState([
    {
      name: 'Jenish',
      date: '2022-09-29',
    },
    {
      name: 'Prabhabi',
      date: '2022-09-29',
    },
  ]);

  return (
    <View style={{flex: 1}}>
      <Header title="Land" />
      <ScrollView style={{flex: 1}}>
        <View style={styles.container}>
          <View style={styles.top}>
            <Title style={styles.title}>Applicant's name</Title>
            <TextInput
              placeholder="Type here"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <Title style={styles.title}>Transaction</Title>
            <View style={styles.picker_style}>
              <Picker mode="dropdown">
                <Picker.Item label="Above plinth level" />
                <Picker.Item label="Below plinth level" />
              </Picker>
            </View>
          </View>
          <Button style={styles.btn} mode="contained">
            Search
          </Button>
          <View style={styles.section}>
            <Subheading style={styles.subheading}>
              Total applications: {applications.length}
            </Subheading>

            {applications.map(item => (
              <LandApplicationCard key={item.name} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  top: {
    width: '80%',
    marginTop: 10,
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'center',
  },
  input: {
    padding: 10,
    backgroundColor: COLORS.light,
    elevation: 3,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  picker_style: {
    borderColor: '#888',
    elevation: 3,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: COLORS.light,
  },
  btn: {
    width: '60%',
    alignSelf: 'center',
  },
  section: {
    marginTop: 10,
    padding: 5,
  },
  subheading: {
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LandApplicantListScreen;
