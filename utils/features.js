class features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludes = ['page', 'fields', 'sort', 'limit'];
    excludes.forEach((ele) => delete queryObj[ele]);
    let queryStr = JSON.stringify(queryObj);
    let queryStr1 = queryStr.replace(
      /\b(lte|lt|gte|lte)\b/g,
      (match) => `$${match}`
    );
    let finalQueryObj = JSON.parse(queryStr1);
    this.query = this.query.find(finalQueryObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }
  fields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    if (this.queryString.page) {
      let page = Number(this.queryString.page);
      let limit = Number(this.queryString.limit);
      let skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}
module.exports = features;
