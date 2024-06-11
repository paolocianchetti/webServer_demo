// media-types.mjs

const types = {
  'text/html': ['html', 'htm'],
  'text/plain': ['txt', 'text'],
  'text/css': ['css'],
  'application/javascript': ['js', 'mjs'],
  'application/json': ['json'],
  'image/jpeg': ['jpeg', 'jpg'],
  'image/x-icon': ['ico'],
  'audio/mpeg': ['mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a'],
  'video/mp4': ['mp4', 'mp4v', 'mpg4'],
  'video/mpeg': ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
  'video/x-matroska': ['mkv', 'mk3d', 'mks'],
  'video/x-msvideo': ['avi'],
};

const typesMap = new Map();

for (let [type, extensions] of Object.entries(types)) {
  for (let extension of extensions) {
    typesMap.set(`.${extension}`, type);
  }
}

export default typesMap;
