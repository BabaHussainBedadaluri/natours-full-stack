const catchAsync = require('../utils/catchAsync');
const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');
const stripe = require('stripe');
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require('../controllers/factoryFunctions');

const stripe = require('stripe')(
  'sk_test_51Nbgy6SCjrh5PRdF2oD1XlTpAaxtDFgYepIqq0jIQmJ0muZ3UIbIzjclhXVpC1xIEUw8mVZ8lo6Tlwp3mGLTxMC0008FbnITJi'
);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1.Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2.Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: 'payment',
  });

  // 3.Create session as a response

  res.status(200).json({
    status: 'success',
    session,
  });
});
const createBookingCheckout = async (session) => {
  let tour = session.client_reference_id;
  let price = session.line_items[0].price_data.unit_amount;
  let user = (await User.findOne({ email: session.customer_email })).id;
  await Booking.create({ tour, user, price });
};
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is temporory bacause it is unsecure
//   const { price, user, tour } = req.query;
//   if (!price && !user && !tour) return next();
//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`webhook error: ${err.message}`);
  }
  if (event.type == 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }
  res.status(200).json({ received: true });
};

exports.readBooking = getOne(Booking);
exports.deleteBooking = deleteOne(Booking);
exports.readAllBooking = getAll(Booking);
exports.updateBooking = updateOne(Booking);
