const Tour = require('./../model/tourModel');
const features = require('./../utils/features');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/errorHandle');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('../controllers/factoryFunctions');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppErr('uploaded file is not a image! Please try again.', 401),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (ele, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(ele.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTour = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,difficulty,duration,summary,ratingsAverage,price';
  next();
};

exports.readAllTours = getAll(Tour);
exports.tourStats = catchAsync(async (req, res) => {
  let stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numQuantity: { $sum: 'ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        avgDuration: { $avg: '$duration' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    result: stats.length,
    data: {
      tour: stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  let year = req.params.year * 1;
  let plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTour: { $sum: 1 },
        tourName: { $push: '$name' },
      },
    },
    {
      $sort: { numTour: 1 },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $limit: 5,
    },
  ]);
  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: {
      plan: plan,
    },
  });
});

exports.toursWithin = catchAsync(async (req, res, next) => {
  //./tours-distance/:distance/center/:latlog/unit/:unit

  const { distance, latlog, unit } = req.params;
  const [lat, log] = latlog.split(',');
  const radius = unit == 'km' ? distance / 6378.1 : distance / 3963.2;

  if (!lat || !log)
    next(
      new AppErr(
        'Please provide latitude, longitude information in same order as we mentioned',
        400
      )
    );

  const filter = {
    startLocation: { $geoWithin: { $centerSphere: [[log, lat], radius] } },
  };

  const tours = await Tour.find(filter);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlog, unit } = req.params;
  const [lat, log] = latlog.split(',');
  // const radius = unit == 'km' ? distance / 6378.1 : distance / 3963.2;

  if (!lat || !log)
    next(
      new AppErr(
        'Please provide latitude, longitude information in same order as we mentioned',
        400
      )
    );

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [log * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.readOneTours = getOne(Tour, { path: 'reviews' });

exports.updateTour = updateOne(Tour);

exports.deleteTour = deleteOne(Tour);

exports.createTour = createOne(Tour);
