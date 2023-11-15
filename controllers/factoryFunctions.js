const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/errorHandle');
const features = require('../utils/features');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppErr('Unable to find and delete document', 404));
    }

    res.status(204).json({
      status: 'success',
      data: {
        doc: 'null',
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc) {
      return next(new AppErr('Unable to find and update document', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    let doc = await Model.create(req.body);
    if (!doc) {
      return next(new AppErr('Unable create document', 400));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateObj) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateObj) query = query.populate(populateObj);
    const doc = await query;
    if (!doc) {
      return next(new AppErr('No document found with this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    let doc = new features(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    const document = await doc.query;
    res.status(200).json({
      status: 'success',
      result: document.length,
      data: {
        data: document,
      },
    });
  });
