import client from '../axios';
import {URLS} from '../core/constants/urls';

export const loginService = async data => {
  console.log('data', data);

  return await client.post(URLS.login, data);
};

export const logoutService = async () => {
  return await client.post(URLS.logout);
};
