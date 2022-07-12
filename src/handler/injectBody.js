const injectBody = (req, res, next) => {
  const { headers } = req;

  if (!headers['content-length']) {
    next();
    return;
  }

  const contentLength = +headers['content-length'];
  const chunkBuffer = Buffer.alloc(contentLength);
  let offset = 0;

  req.on('data', (chunk) => {
    chunkBuffer.fill(chunk, offset);
    offset += chunk.length;
  });

  req.on('end', () => {
    req.body = chunkBuffer;
    next();
  });
};

module.exports = { injectBody };
