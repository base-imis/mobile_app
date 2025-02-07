import client from '../axios';
import {URLS} from '../core/constants/urls';

export const emptyingService = async () => {
  return await client.get(URLS.emptyingService);
};
export const assessmentService = async () => {
  return await client.get(URLS.assessment);
};
export const driversAPI = async () => {
  return await client.get(URLS.drivers);
};
export const emptiersAPI = async () => {
  return await client.get(URLS.emptiers);
};
export const serviceProviderAPI = async () => {
  return await client.get(URLS.serviceProviders);
};
export const saveEmptyingServiceAPI = async data => {
  return await client.post(URLS.saveEmptyingService, data);
};

export const saveAssessmentServiceAPI = async data => {
  return await client.post(URLS.saveAssessment, data);
};

export const treatmentPlantsAPI = async () => {
  return await client.get(URLS.treatmentPlants);
};

export const vacutugTypesAPI = async () => {
  return await client.get(URLS.vacutugTypes);
};
