'use strict';

var grunt = require('grunt');

module.exports = function () {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    clean: {
      release: ['./index.html', '*/*', '!node_modules/*']
    },
    copy: {
      release: {
        files: [{
          expand: true,
          cwd: './../w11k-select-page/build-output/compiled',
          src: ['**'],
          dest: './'
        }]
      }
    }
  });

  grunt.registerTask('release', ['clean:release', 'copy:release']);
};
