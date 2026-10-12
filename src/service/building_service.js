import client from '../axios';
import {URLS} from '../core/constants/urls';

export const uploadBuildingData = async data => {
  return await client.post(URLS.uploadBuildingData, data);
};

export const uploadContainmentData = async data => {
  return await client.post(URLS.uploadContainmentData, data);
};

export const getBuildingWmslink = async () => {
  return await client.get(URLS.wsBuildingLink);
};

export const getContainmentWmslink = async () => {
  return await client.get(URLS.wsContainmentLink);
};

export const getRoadWmsLink = async () => {
  return await client.get(URLS.wsRoadLink);
};

export const getWardWmsLink = async () => {
  return await client.get(URLS.wsWardLink);
};

export const getSewerWmsLink = async () => {
  return await client.get(URLS.wsSewerLink);
};

export const getBuildings = async () => {
  return await client.get(URLS.buildingCode);
};

export const getSewerCode = async () => {
  return await client.get(URLS.sewerCode);
};

// ---- ANF (Address Not Found) resolution ----

// Building and containments at a coordinate. Response: { found, building, containments }
export const getBuildingByPoint = async (lat, lng) => {
  return await client.get(URLS.buildingByPoint, {params: {lat, lng}});
};

export const getBuildingFormFields = async () => {
  return await client.get(URLS.buildingFormFields);
};

// Creates building + containment; resolves ANF when `id` (application id) is sent
export const saveBuildingData = async payload => {
  return await client.post(URLS.saveBuilding, payload);
};

export const getContainmentFormFields = async () => {
  return await client.get(URLS.containmentFormFields);
};

// Adds a containment to building `bin`; resolves ANF when `id` (application id) is sent
export const addContainmentData = async (bin, payload) => {
  return await client.post(`${URLS.addContainment}/${encodeURIComponent(bin)}`, payload);
};

// Sent as JSON: PHP does not parse multipart bodies on PATCH requests
export const resolveAnf = async (applicationId, {bin, containment_id}) => {
  return await client.patch(`applications/${applicationId}/${URLS.resolveAnf}`, {
    bin,
    containment_id,
  });
};

