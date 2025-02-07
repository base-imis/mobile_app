import React, {useState} from 'react';
import {View, Button, StyleSheet, Dimensions} from 'react-native';
import MapView, {Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {Picker} from '@react-native-picker/picker';

const ADrawingTest = () => {
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [shape, setShape] = useState('square');

  const handlePress = e => {
    if (drawing) {
      const newCoordinate = e.nativeEvent.coordinate;
      if (currentPolygon.length === 0) {
        setCurrentPolygon([newCoordinate]);
      } else if (currentPolygon.length === 1) {
        const startCoordinate = currentPolygon[0];
        const coordinates = calculateShapeCoordinates(
          startCoordinate,
          newCoordinate,
        );
        setCurrentPolygon(coordinates);
      }
    }
  };

  const calculateShapeCoordinates = (start, end) => {
    if (shape === 'square') {
      const sideLength = Math.max(
        Math.abs(start.latitude - end.latitude),
        Math.abs(start.longitude - end.longitude),
      );
      return [
        start,
        {latitude: start.latitude, longitude: start.longitude + sideLength},
        {
          latitude: start.latitude + sideLength,
          longitude: start.longitude + sideLength,
        },
        {latitude: start.latitude + sideLength, longitude: start.longitude},
        start,
      ];
    } else if (shape === 'rectangle') {
      return [
        start,
        {latitude: start.latitude, longitude: end.longitude},
        end,
        {latitude: end.latitude, longitude: start.longitude},
        start,
      ];
    }
  };

  const startDrawing = () => {
    setDrawing(true);
    setCurrentPolygon([]);
  };

  const finishDrawing = () => {
    setDrawing(false);
    if (currentPolygon.length > 2) {
      setPolygons([...polygons, currentPolygon]);
    }
    setCurrentPolygon([]);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onPress={handlePress}>
        {polygons.map((polygon, index) => (
          <Polygon
            key={index}
            coordinates={polygon}
            strokeWidth={2}
            strokeColor="red"
            fillColor="rgba(255,0,0,0.3)"
          />
        ))}
        {drawing && currentPolygon.length > 0 && (
          <Polygon
            coordinates={currentPolygon}
            strokeWidth={2}
            strokeColor="blue"
            fillColor="rgba(0,0,255,0.3)"
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <Picker
          selectedValue={shape}
          style={styles.picker}
          onValueChange={itemValue => setShape(itemValue)}>
          <Picker.Item label="Square" value="square" />
          <Picker.Item label="Rectangle" value="rectangle" />
        </Picker>
        <Button title="Start Drawing" onPress={startDrawing} />
        <Button title="Finish Drawing" onPress={finishDrawing} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    height: 50,
    width: 150,
  },
});

export default ADrawingTest;
