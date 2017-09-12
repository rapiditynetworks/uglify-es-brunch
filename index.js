'use strict';

const uglify = require('uglify-es');

const formatError = function(error) {
  const err = new Error(`L${error.line}:${error.col} ${error.message}`);
  err.name = '';
  err.stack = error.stack;
  return err;
};

class UglifyESOptimizer {
  constructor(config) {
    this.options = Object.assign({
      sourceMap: !!config.sourceMaps,
    }, config.plugins.uglify);
  }

  optimize(file) {
    const options = Object.assign({}, this.options);
    if (file.map) {
      options.sourceMap = {
        content: JSON.stringify(file.map),
        url: `${file.path}.map`,
      };
    }

    const res = uglify.minify(file.data, options);
    if (res.error) throw formatError(res.error);
    if (!res.map) return {data: res.code};

    return {
      data: res.code.replace(/\/\/# sourceMappingURL=\S+$/, ''),
      map: res.map,
    };
  }
}

UglifyESOptimizer.prototype.brunchPlugin = true;
UglifyESOptimizer.prototype.type = 'javascript';

module.exports = UglifyESOptimizer;
