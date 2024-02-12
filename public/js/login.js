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
  try {
    const result = await axios({
      method: 'GET',
      url: 'https://natours-79sq.onrender.com/api/v1/users/logout',
    });
    if (result.data.status == 'success') {
      location.reload(true);
      location.assign('/');
    }
  } catch (err) {
    console.log(err.message);
    showAlert('error', 'failed to logout');
  }
};
