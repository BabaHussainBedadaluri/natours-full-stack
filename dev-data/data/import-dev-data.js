const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');
const dotenv = require('dotenv');
const { server } = require('./../../server');
// //console.log(process.env);

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('Db connection successful');
  });

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('💥 faced unhandledRejection');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log(' received SIGTERM command:- restarting the application');
  server.close(() => {
    console.log('process terminated');
  });
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    //console.log('data loaded successfully');
  } catch (err) {
    //console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deleted successfully');
  } catch (err) {
    //console.log(err);
  }
  process.exit();
};
if (process.argv[2] == '--import') importData();
if (process.argv[2] == '--delete') deleteData();
module.exports = null;
