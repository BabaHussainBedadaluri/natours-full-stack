import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51Nbgy6SCjrh5PRdFuykyGD4XXSoylzYRaTlAFzFLsqq7c5neKF408qADKrk6glEg0w3mxIvq3RiFWVFrop8M4Nnf00UcXiZ00E'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
