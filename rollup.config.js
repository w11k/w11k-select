import nodeResolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";
import progress from "rollup-plugin-progress";
import sourcemaps from "rollup-plugin-sourcemaps";
import visualizer from "rollup-plugin-visualizer";
import copy from "rollup-plugin-copy";
import sass from "rollup-plugin-sass";

sass({
  output: 'dist/bundle.css',
  options: {
    file: "src/w11k-select.scss"
  }
});


var MINIFY = process.env.MINIFY;

var pkg = require('./package.json');
var banner = "/**";
banner += `
 * @version v${pkg.version}
 * @link ${pkg.homepage}
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */`;

var uglifyOpts = {output: {}};
// retain multiline comment with @license
uglifyOpts.output.comments = (node, comment) =>
comment.type === 'comment2' && /@license/i.test(comment.value);

var plugins = [
  nodeResolve({jsnext: true}),
  progress({clearLine: false}),
  sourcemaps(),
  copy({
    "src/w11k-select.tpl.html": "dist/w11k-select.tpl.html",
    "src/w11k-select-option/w11k-select-option.tpl.html": "dist/w11k-select-option.tpl.html",
    "src/w11k-select.css": "dist/w11k-select.css",
    "src/w11k-select.scss": "dist/w11k-select.scss",
    "src/w11k-select.less": "dist/w11k-select.less",
    "src/w11k-select-option/_w11k-select-options.scss": "dist/w11k-select-option/_w11k-select-options.scss",
    "src/w11k-select-option/_w11k-select-options.less": "dist/w11k-select-option/_w11k-select-options.less",
    "src/w11k-select-checkbox/_w11k-checkbox.directive.scss": "dist/w11k-select-checkbox/_w11k-checkbox.directive.scss",
    "src/w11k-select-checkbox/_w11k-checkbox.directive.less": "dist/w11k-select-checkbox/_w11k-checkbox.directive.less",
    verbose: true
  }),
  sass

];

if (MINIFY) plugins.push(uglify(uglifyOpts));
if (MINIFY) plugins.push(visualizer({sourcemap: true}));

var extension = MINIFY ? ".min.js" : ".js";

const BASE_CONFIG = {
  sourceMap: true,
  format: 'umd',
  exports: 'named',
  plugins: plugins,
  banner: banner,
};

const CONFIG = Object.assign({
  moduleName: 'w11k-select',
  entry: 'lib-esm/index.js',
  dest: 'dist/w11k-select' + extension,
  globals: {angular: 'angular'},
  external: ['angular'],
}, BASE_CONFIG);


export default CONFIG;
