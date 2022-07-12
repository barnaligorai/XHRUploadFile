const fs = require('fs');

const dataHandler = (req, res, next) => {
  if (req.matches('POST', '/data')) {
    const fileData = req.body.file;
    const { headers, value } = fileData;
    if (headers.filename) {
      fs.writeFileSync(headers.filename, value);
      res.statusCode = 200;
      res.end('added : ' + headers.filename);
      return;
    }

    res.statusCode = 400;
    res.end('provide file');

    return;
  }

  next();
};

module.exports = { dataHandler };
