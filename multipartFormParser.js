const getBoundary = (contentType) => {
  const [, boundaryString] = contentType.split(';');
  const [, boundary] = boundaryString.split('=');
  return '--'.concat(boundary.trim());
};

const splitFields = (content, boundary) => {
  const fields = [];
  let boundaryStart = content.indexOf(boundary);
  while (boundaryStart != -1) {
    const fieldStart = boundaryStart + boundary.length;
    boundaryStart = content.indexOf(boundary, fieldStart);

    const field = content.slice(fieldStart, boundaryStart);
    fields.push(field);
  }

  return fields.slice(0, -1);
};

const parseDispositions = (dispositionString) => {
  const dispositions = dispositionString.split(';').slice(1);
  return dispositions.reduce((parsedDisp, disposition) => {
    const [key, value] = disposition.split('=');
    parsedDisp[key.trim()] = value.trim().slice(1, -1);
    return parsedDisp;
  }, {});
};

const parseHeaders = (rawHeaders) => {
  const headers = {};

  const headerStrings = rawHeaders.trim().split('\r\n');
  headerStrings.forEach(headerString => {

    const [name, value] = headerString.split(':');
    headers[name.trim()] = value.trim();
  });

  const parsedDisp = parseDispositions(headers['Content-Disposition']);
  Object.entries(parsedDisp).forEach(([key, value]) => {
    headers[key] = value;
  });

  return headers;
};


const parseField = (rawField) => {
  const EOL = new Buffer.from('\r\n\r\n');
  const rawHeaders = rawField.slice(0, rawField.indexOf(EOL));
  const value = rawField.slice(rawHeaders.length + EOL.length, -2);
  const headers = parseHeaders(rawHeaders.toString());
  return { headers, value };
};

const multipartFormParser = (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    next();
    return;
  }

  const boundary = getBoundary(contentType);
  const boundaryBuffer = new Buffer.from(boundary, 'utf-8');
  const fields = splitFields(req.body, boundaryBuffer);
  const parsedFields = fields.map(parseField);

  const body = {};

  parsedFields.forEach((field) => {
    body[field.headers.name] = field;
  });

  req.body = body;
  next();
};

module.exports = { multipartFormParser };
