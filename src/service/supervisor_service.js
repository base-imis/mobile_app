import client from "../axios";
import { URLS } from "../core/constants/urls";

// params: { page, per_page, search, is_anf } — all optional (see ANF & Multi-Trip spec §6)
export const emptyingService = async (params = {}) => {
  return await client.get(URLS.emptyingService, { params });
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
export const saveEmptyingServiceAPI = async (data) => {
  return await client.post(URLS.saveEmptyingService, data);
};

export const saveAssessmentServiceAPI = async (data) => {
  return await client.post(URLS.saveAssessment, data);
};

export const treatmentPlantsAPI = async () => {
  return await client.get(URLS.treatmentPlants);
};

export const vacutugTypesAPI = async () => {
  return await client.get(URLS.vacutugTypes);
};

//Language
export const getLanguagesList = async () => {
  return await client.get(URLS.getLanguages);
};
export const getContentsLabel = async (lang) => {
  return await client.get(`${URLS.getContentsLabel}/${lang}`);
};

// multi-trip emptying form
export const emptyingServiceFields = async (applicationId) => {
  return await client.get(`${URLS.emptyingServiceField}/${applicationId}`);
};

// sludge disposal (FSTP)
export const sludgeService = async () => {
  return await client.get(URLS.sludgeService);
};
export const sludgeServiceFields = async (applicationId) => {
  return await client.get(`${URLS.sludgeServiceField}/${applicationId}`);
};

// FSTP daily capacity
export const getTreatmentPlantCapacity = async () => {
  return await client.get(URLS.getTreatmentPlantCapacity);
};

// Footer text shown on the home screen
export const getFooterDetails = async () => {
  return await client.get(URLS.footerDetails);
};
