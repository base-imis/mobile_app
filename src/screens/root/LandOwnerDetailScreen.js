import {View, Text, useWindowDimensions, StyleSheet} from 'react-native';
import React from 'react';

import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Detail from '../../components/land/Detail';
import Land from '../../components/land/Land';
import Chakrila from '../../components/land/Chakrila';
import {Header} from '../../components/headers';

const renderScene = SceneMap({
  first: Detail,
  second: Land,
  third: Chakrila,
});

const LandOwnerDetailScreen = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Detail'},
    {key: 'second', title: 'Land'},
    {key: 'third', title: 'Charkila'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabBar}
      style={styles.tabIndicator}
    />
  );

  return (
    <View style={styles.container}>
      <Header title="Detail" />
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        style={styles.tabView}
      />
    </View>
  );
};

export default LandOwnerDetailScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 10,
  },
  tabBar: {
    backgroundColor: '#5D6061',
    height: '100%',
    padding: 10,
    borderRadius: 30,
  },
  tabIndicator: {marginHorizontal: 5, color: 'black', borderRadius: 50},
  tabView: {
    padding: 0,
    borderRadius: 10,
    marginTop: 10,
  },
});
