import axios from 'axios';
import { showAlert } from './alert';
const singUpFn = async (name, role, email, password, passwordConfirm) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        email,
        name,
        role,
        password,
        passwordConfirm,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'account created in successfully');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default singUpFn;
