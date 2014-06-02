'use strict';

module.exports = function (grunt) {

  var pkg = require('./package.json');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-conventional-changelog');

  var bowerrc = grunt.file.exists('./.bowerrc') ? grunt.file.readJSON('./.bowerrc') : { 'json': 'bower.json' };

  var bumpFiles = [ 'package.json', '../w11k-select-bower/package.json' ];
  if (grunt.file.exists(bowerrc.json)) {
    bumpFiles.push(bowerrc.json);
  }

  grunt.initConfig({
    pkg: pkg,
    meta: {
      banner:
        '/**\n' +
          ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' * <%= pkg.homepage %>\n' +
          ' *\n' +
          ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
          ' */\n'
    },

    clean: {
      dist: 'dist/*'
    },
    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: '**.js'
        }]
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'dist/w11k-select.css': 'src/w11k-select.scss'
        }
      }
    },
    copy: {
      template: {
        src: 'src/w11k-select.tpl.html',
        dest: 'dist/w11k-select.tpl.html'
      },
      sass: {
        src: 'src/w11k-select.scss',
        dest: 'dist/w11k-select.scss'
      },
      release: {
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: '*',
            dest: '../w11k-select-bower/dist/'
          },
          {
            src: 'bower.json',
            dest: '../w11k-select-bower/'
          }
        ]
      }
    },
    concat: {
      code: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: 'src/w11k-select.js',
        dest: 'dist/w11k-select.js'
      }
    },
    html2js: {
      template: {
        options: {
          base: 'src/',
          module: 'w11k.select.template',
          quoteChar: '\'',
          htmlmin: {
            collapseWhitespace: true
          }
        },
        files: {
          'dist/w11k-select.tpl.js': 'src/w11k-select.tpl.html'
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      code: {
        files: [{
          'dist/w11k-select.min.js': 'src/w11k-select.js'
        }]
      }
    },
    bump: {
      options: {
        files: bumpFiles,
        commit: true,
        commitMessage: 'chore(project): bump version to %VERSION%',
        commitFiles: ['-a'],
        createTag: false,
        push: false
      }
    }
  });


  grunt.registerTask('default', ['build']);

  grunt.registerTask('build', ['clean', 'jshint:src', 'sass', 'copy:template', 'copy:sass', 'html2js', 'concat', 'uglify']);

  grunt.registerTask('release', ['build', 'copy:release']);

};
