#!/usr/bin/env node
// Build the UI's index.html file. Takes one argument, which is the path to the
// repository's root.
var child_process =  require('child_process');
var path = require('path');
var fs = require('fs');
var helpers = require('./helpers');

function mkdir(dir) {
    try {
        fs.mkdirSync(dir);
    } catch (e) {
        if (e.code != 'EEXIST') {
            console.log(e);
        }
    }
}

function buildUI() {
    if (helpers.isMultiArch(root_path)) {
        var output_path = path.join(root_path, 'build', '32', 'Release', 'resources', 'ui');
    } else {
        var output_path = path.join(root_path, 'build', 'Release', 'resources', 'ui');
    }

    // Ensure the output directory exists.
    mkdir(output_path);

    // Vulcanize.
    child_process.execFileSync('vulcanize.cmd', [
        '--inline',
        '--strip',
        '--config',
        path.join(root_path, 'scripts', 'vulcanize.config.json'),
        '-o',
        path.join(output_path, 'index.html'),
        path.join(root_path, 'src', 'gui', 'html', 'index.html')
    ]);
}

if (process.argv.length < 3) {
    var root_path = '.';
} else {
    var root_path = process.argv[2];
}

buildUI();
