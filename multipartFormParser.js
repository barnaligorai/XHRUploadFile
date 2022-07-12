const TCRLF = new Buffer.from('\r\n\r\n');
const CRLF = new Buffer.from('\r\n');

const splitFormFields = (content, boundary) => {
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

const removeQuotes = (text) => {
  if (text.startsWith('\"') && text.endsWith('\"')) {
    return text.slice(1, -1);
  }
  return text;
};

const parseHeader = (text) => {
  const fields = {};
  const allFields = text.split(';');
  allFields.forEach(fieldString => {
    const [key, value] = fieldString.split(/[:=]/);
    fields[key.trim().toLowerCase()] = value;
  });
  return fields;
};

const getBoundary = (contentType) => {
  const { boundary } = parseHeader(contentType);
  return '--'.concat(boundary.trim());
};

const parseHeaders = (rawHeaders) => {
  const headersString = rawHeaders.trim().split(CRLF).join(';');
  const headers = parseHeader(headersString);
  for (const key in headers) {
    headers[key] = removeQuotes(headers[key]);
  }
  return headers;
};

const parseField = (rawField) => {
  const rawHeaders = rawField.slice(0, rawField.indexOf(TCRLF));
  const value = rawField.slice(rawHeaders.length + TCRLF.length, -CRLF.length);
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
  const fields = splitFormFields(req.body, boundaryBuffer);
  const parsedFields = fields.map(parseField);
  const body = {};

  parsedFields.forEach((field) => {
    body[field.headers.name] = field;
  });

  req.body = body;
  next();
};

module.exports = { multipartFormParser };
