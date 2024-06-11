// server.mjs

import http from 'http';
import typesMap from './media-types.mjs';
import { extname } from 'path';
import { createGzip } from 'zlib';
import { hrtime } from 'process';
import {
  isStringTrue,
  exitIfNotDir,
  tryOpenFile,
  generateLog,
} from './utils.mjs';

const host = process.env.WEB_HOST || '127.0.0.1';
const port = process.env.WEB_PORT || 3000;
const root = process.env.WEB_ROOT || 'files';
const index = isStringTrue(process.env.WEB_INDEX) || false;

await exitIfNotDir(root);

const server = http.createServer();

server.on('request', async (req, res) => {
  const startTime = hrtime.bigint();

  const [isGET, isHEAD] = [req.method === 'GET', req.method === 'HEAD'];
  if (!isGET && !isHEAD) {
    res.statusCode = 405;
    res.end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const localPath = `${root}${pathname}`;

  res.on('finish', () => {
    generateLog(req, res, pathname, startTime);
  });

  const { found, fh, fileStat } = await tryOpenFile(localPath, index);
  if (!found) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const fileType = typesMap.get(extname(pathname));

  if (fileType) {
    res.setHeader('Content-Type', fileType);
  }

  const fileStream = fh.createReadStream();
  const gzipTransform = createGzip();

  const handlerError = (err) => {
    console.error(err);

    if (fileType !== 'video/mp4') {
      fileStream.destroy();
      gzipTransform.destroy();
    } else fileStream.destroy();

    res.statusCode = 500;
  };

  if (isHEAD) {
    res.setHeader('Content-Length', fileStat.size);
    res.statusCode = 200;
    res.end();
    await fh.close();
    return;
  }

  if (fileType !== 'video/mp4') {
    res.setHeader('Content-Encoding', 'gzip');
    fileStream
      .on('error', handlerError)
      .pipe(gzipTransform)
      .on('error', handlerError)
      .pipe(res);
  } else {
    gzipTransform.destroy();
    fileStream.on('error', handlerError).pipe(res);
  }
});

server.listen(port, host, () => {
  console.log(`Web server running at http://${host}:${port}/`);
});
