//review / ref to tour / tref to user / rating / createdAt

const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please provide your review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.createStats = async function (tour) {
  const stats = await this.aggregate([
    { $match: { tour } },
    {
      $group: {
        _id: '$tourId',
        nRatings: { $sum: 1 },
        AvgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tour, {
    ratingsAverage: stats[0].AvgRating,
    ratingQuantity: stats[0].nRatings,
  });
};
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.post('save', async function () {
  await this.constructor.createStats(this.tour);
});
reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.createStats(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
