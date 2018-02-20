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

    try {
      if (this.options.ignored && this.options.ignored.test(file.path)) {
        const result = {
          data: file.data,
          map: file.map ? file.map.toString() : null,
        };
        return Promise.resolve(result);
      }
    } catch (e) {
      return Promise.reject(`error checking ignored files to uglify ${e}`);
    }

    if (file.map) {
      options.sourceMap = {
        content: JSON.stringify(file.map),
        url: `${file.path}.map`,
      };
    }

    delete options.ignored;
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
