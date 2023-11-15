const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
  createOne,
} = require('../controllers/factoryFunctions');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/errorHandle');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// const upload = multer({ storage: storage });

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

function filterFun(reqBody, ...allFeilds) {
  const obj = {};
  Object.keys(reqBody).forEach((ele) => {
    if (allFeilds.includes(ele)) {
      obj[ele] = reqBody[ele];
    }
  });

  return obj;
}
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1. if user try to change the data related to password, rise error
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppErr('You are not allowed to change password here', 500));
  //2. filter the unwanted fields in req body
  const filteredObj = filterFun(req.body, 'email', 'name');
  if (req.file) filteredObj.photo = req.file.filename;
  //3. update the user data
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: 'null',
  });
});

exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
exports.getAllUsers = getAll(User);
