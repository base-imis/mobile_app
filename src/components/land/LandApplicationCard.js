import {View, StyleSheet, Pressable} from 'react-native';
import {Subheading, Text} from 'react-native-paper';
import React from 'react';
import {COLORS} from '../../core/theme';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {useState} from 'react';
import {Menu, MenuItem} from 'react-native-material-menu';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../core/constants/routes';

const LandApplicationCard = ({item}) => {
  const [visible, setVisible] = useState(false);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Subheading>{item.name}</Subheading>
        <Text>{item.date}</Text>
      </View>
      <View style={styles.right}>
        <Menu
          visible={visible}
          onRequestClose={() => setVisible(false)}
          anchor={
            <Pressable onPress={() => setVisible(true)}>
              <View style={styles.picker_style}>
                <Text>Actions</Text>
                <AntIcon style={styles.icon} name="caretdown" />
              </View>
            </Pressable>
          }>
          <MenuItem onPress={() => navigation.navigate(ROUTES.land_detail)}>
            Detail
          </MenuItem>
          <MenuItem>Up to plinth level</MenuItem>
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
    backgroundColor: COLORS.light,
    marginBottom: 5,
    borderRadius: 10,
  },
  left: {
    flexDirection: 'column',
  },
  right: {
    flexDirection: 'column',
    alignSelf: 'center',
  },
  picker_style: {
    borderColor: '#888',
    elevation: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: COLORS.light,
    padding: 10,
    flexDirection: 'row',
  },
  icon: {padding: 5, marginLeft: 3},
});

export default LandApplicationCard;
