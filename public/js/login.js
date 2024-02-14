import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  console.log('run logout in login.js file');
  try {
    const result = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (result.data.status == 'success') {
      // location.reload(true);
      // location.assign('/');
      console.log('run logout in login.js file');
    }
  } catch (err) {
    console.log(err.message);
    // showAlert('error', 'failed to logout -------');
  }
};
