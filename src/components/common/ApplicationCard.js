import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button, Card, Divider, Title, Subheading} from 'react-native-paper';

import {COLORS} from '../../core/theme';

export default function ApplicationCard({item, onCall, onLocation, onStart}) {
  const {applicants_name, contact_no, address, customer_name, ward, id} = item;

  return (
    <Card style={{marginBottom: 10}}>
      <Card.Title
        style={styles.cardTitle}
        titleStyle={{color: COLORS.primary}}
        title={`Application Id : #${id}`}
      />

      <Divider />
      <Card.Content>
        <View style={styles.row}>
          <Title style={styles.title_style}>Applicant's Name :</Title>
          <Subheading style={styles.subheading_style}>
            {applicants_name}
          </Subheading>
        </View>
        <View style={styles.row}>
          <Title style={styles.title_style}>Customer Name :</Title>
          <Subheading style={styles.subheading_style}>
            {customer_name}
          </Subheading>
        </View>

        <View style={styles.row}>
          <Title style={styles.title_style}>Address :</Title>
          <Subheading style={styles.subheading_style}>{address}</Subheading>
        </View>
        <View style={styles.row}>
          <Title style={styles.title_style}>Ward :</Title>
          <Subheading style={styles.subheading_style}>{ward}</Subheading>
        </View>
        <View style={styles.row}>
          <Title style={styles.title_style}>Contact no. :</Title>
          <Subheading style={styles.subheading_style}>{contact_no}</Subheading>
        </View>
      </Card.Content>
      <Divider />
      <Card.Actions style={{justifyContent: 'space-evenly'}}>
        <Button
          onPress={onCall}
          icon={() => <Icon name="call" size={17} color={COLORS.primary} />}
        />
        <Button
          onPress={onLocation}
          icon={() => <Icon name="map" size={17} color={COLORS.primary} />}
        />
        <Button
          onPress={onStart}
          icon={() => <Icon name="md-exit" size={17} color={COLORS.primary} />}
        />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },

  subheading_style: {
    marginLeft: 10,
    alignSelf: 'center',
  },

  title_style: {
    fontSize: 16,
  },
});
