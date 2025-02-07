import {createSlice} from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import {MAP_TYPES} from '../../core/constants/map';

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    buildingCoords: [],
    buildingsData: [],
    containmentCoords: null,
    containmentData: [],
    mapType: MAP_TYPES.STANDARD,
    sewageData: [],
  },
  reducers: {
    addToBuildingCoords: (state, {payload}) => {
      state.buildingCoords.push(payload);
    },

    removeFromBuildingCoords: (state, {payload}) => {
      const filteredCoords = state.buildingCoords.filter(
        (_, i) => i !== payload,
      );
      state.buildingCoords = filteredCoords;
    },
    addBuildingCoordsData: (state, action) => {
      console.log('Action.Payload!!', action.payload);
      state.buildingCoords = action.payload;
    },

    updateBuildingCoord: (state, {payload}) => {
      const {index, coords} = payload;
      const filteredCoords = state.buildingCoords.map((item, i) => {
        if (i === index) {
          return coords;
        }

        return item;
      });

      state.buildingCoords = filteredCoords;
    },

    resetBuildingCoords: state => {
      state.buildingCoords = [];
    },

    toogleMapType: state => {
      if (state.mapType === MAP_TYPES.STANDARD) {
        state.mapType = MAP_TYPES.HYBRID;
      } else {
        state.mapType = MAP_TYPES.STANDARD;
      }
    },

    addBuildingsData: (state, {payload}) => {
      const created_date = dayjs().format('MM-DD-YYYY, h:mm:ss a');
      const data = {...payload, created_date};
      state.buildingsData.push(data);
    },

    removeBuildingData: (state, {payload}) => {
      const filteredData = state.buildingsData.filter((_, i) => i !== payload);
      state.buildingsData = filteredData;
    },

    storeContainmentCoords: (state, {payload}) => {
      console.log('payload', payload);
      state.containmentCoords = payload;
    },

    addContainmentData: (state, {payload}) => {
      console.log('containment ', payload);
      const created_date = dayjs().format('MM-DD-YYYY, h:mm:ss a');
      const data = {...payload, created_date};
      state.containmentData.push(data);
    },

    removeContainmentData: (state, {payload}) => {
      const filteredData = state.containmentData.filter(
        (_, i) => i !== payload,
      );
      state.containmentData = filteredData;
    },

    removeContainmentCoords: state => {
      state.containmentCoords = null;
    },
    addSewageData: (state, {payload}) => {
      const created_date = dayjs().format('MM-DD-YYYY, h:mm:ss a');
      const data = {...payload, created_date};
      state.sewageData.push(data);
    },
    removeSewageData: (state, {payload}) => {
      const filteredData = state.sewageData.filter((_, i) => i !== payload);
      state.sewageData = filteredData;
    },
  },
});

export const {
  toogleMapType,
  removeFromBuildingCoords,
  updateBuildingCoord,
  addToBuildingCoords,
  resetBuildingCoords,
  storeContainmentCoords,
  removeContainmentCoords,
  addBuildingsData,
  addDistanceData,
  removeBuildingData,
  addContainmentData,
  removeContainmentData,
  addSewageData,
  removeSewageData,
  addBuildingCoordsData,
} = mapSlice.actions;

export default mapSlice.reducer;
