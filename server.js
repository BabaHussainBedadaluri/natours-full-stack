const app = require('./index.js');
const port = process.env.port || 3000;
const aabbcc = require('./dev-data/data/import-dev-data.js');
exports.server = app.listen(port, () => {
  console.log('server started...');
});

// export default server;
