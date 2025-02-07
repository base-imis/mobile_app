import React from 'react';
import {StyleSheet, FlatList, Alert} from 'react-native';
import {Button, Caption, Card, Divider, Text} from 'react-native-paper';

import {useDispatch, useSelector} from 'react-redux';
import HorizontalSpacer from '../../components/common/HorizontalSpacer';
import VerticalSpacer from '../../components/common/VerticalSpacer';

import {COLORS, SPACINGS} from '../../core/theme';
import {removeContainmentData} from '../../store/slices/map.slice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {useState} from 'react';
import {uploadContainmentData} from '../../service/building_service';
import {ROUTES} from '../../core/constants/routes';
import {resetToken} from '../../store/slices/auth.slice';
import {ErrorMessage} from '../../components/errorComponent';
import {Header} from '../../components/headers';

const ContainmentDataScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {containmentData} = useSelector(state => state.map);
  const [loading, setLoading] = useState(false);

  const convertDate = date => {
    let newDate = date.split('-').reverse();
    let temp = newDate[2];
    newDate[2] = newDate[1];
    newDate[1] = temp;
    newDate = newDate.join('-');
    return newDate;
  };

  const deleteContainmentData = index => {
    Alert.alert(
      'Confirm delete',
      'Are you sure you want to delete this containment information?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            dispatch(removeContainmentData(index));
          },
        },
      ],
    );
  };

  const onUpload = (item, index) => {
    setLoading(true);
    let date = item.created_date.split(',')[0];

    let collected_date = convertDate(date);

    const data = new FormData();

    let json = [
      {
        containcd: item.containcd,
        longitude: item.longitude.toFixed(5),
        latitude: item.latitude.toFixed(5),
        collected_date: collected_date,
      },
    ];

    data.append('json', JSON.stringify(json));

    uploadContainmentData(data)
      .then(response => {
        const {success, error, data, status, message} = response.data;

        if (success || status) {
          Alert.alert('Uploaded', message);
          dispatch(removeContainmentData(index));
        } else {
          if (error?.assessment) {
            console.log('assessment', JSON.stringify(error));
            error.assessment.map(err => {
              if (err[0] === 'The containment code is already registered') {
                Alert.alert(
                  'Error',
                  'The containment code is already registered, deleting this list',
                );
                dispatch(removeContainmentData(index));
              } else {
                Alert.alert('Error', err[0]);
              }
            });
          }
        }
      })
      .catch(err => {
        console.log('Error', err);
        if (err?.response?.status === 500) {
          Alert.alert(
            '500',
            'Something is wrong, please try again or at a later time.',
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderContainmentItems = ({item, index}) => {
    return (
      <Card style={styles.singleData}>
        <Card.Content>
          <Caption>Containment code</Caption>
          <Text>{item.containcd}</Text>

          <Caption>Latitude</Caption>
          <Text>{item.latitude.toFixed(5)}</Text>

          <Caption>Longitude</Caption>
          <Text>{item.longitude.toFixed(5)}</Text>

          <Caption>Collected date</Caption>
          <Text>{item.created_date}</Text>
        </Card.Content>
        <VerticalSpacer />
        <Divider />
        <VerticalSpacer size={2} />
        <Card.Actions>
          <Button
            compact
            mode="outlined"
            onPress={() => deleteContainmentData(index)}>
            Delete
          </Button>
          <HorizontalSpacer size={20} />
          <Button
            compact
            mode="contained"
            contentStyle={styles.btnContent}
            onPress={() => onUpload(item, index)}>
            Upload
          </Button>
          <HorizontalSpacer size={20} />
          <Button
            compact
            mode="contained"
            contentStyle={styles.btnContent}
            onPress={() =>
              navigation.navigate(ROUTES.containment_viewer, {item})
            }>
            View on map
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Header title="Containments Data" />
      {containmentData.length > 0 ? (
        <>
          <LoadingSpinner isVisible={loading} title="Uploading" />
          <FlatList
            data={containmentData}
            contentContainerStyle={styles.contentContainer}
            renderItem={renderContainmentItems}
            keyExtractor={(_, index) => index}
            ItemSeparatorComponent={VerticalSpacer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <ErrorMessage
          message={'You have not added any containment data into this device'}
        />
      )}
    </View>
  );
};

export default ContainmentDataScreen;

const styles = StyleSheet.create({
  singleData: {
    elevation: 1,
  },

  contentContainer: {
    padding: SPACINGS.xs,
    paddingBottom: SPACINGS.lg,
  },

  btnContent: {
    backgroundColor: COLORS.primary,
  },

  deleteBtn: {
    backgroundColor: COLORS.error,
  },
});
