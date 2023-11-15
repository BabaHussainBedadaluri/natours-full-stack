import { login, logout } from './login';
import signin from './signin';
import { updateUser } from './updateUser';
import { bookTour } from './stripe';
import '@babel/polyfill';
const bookBtn = document.getElementById('book-tour');
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Prossesing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}

const formElement = document.querySelector('.form--login');
if (formElement) {
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
const formElementSignin = document.querySelector('.form--signin');
//nothing
if (formElementSignin) {
  formElementSignin.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirm-password').value;

    signin(name, undefined, email, password, passwordConfirm);
  });
}
const formUserElement = document.querySelector('.form-user-data');
if (formUserElement) {
  formUserElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // const photo = document.getElementById('photo').files[0];
    // console.log(form);
    updateUser(form, 'data');
  });
}
const formUserPassEle = document.querySelector('.form-user-settings');
if (formUserPassEle) {
  formUserPassEle.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent =
      'Updating password';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateUser(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password').value = '';
    document.getElementById('password-current').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
