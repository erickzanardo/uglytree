#!/usr/bin/env node
var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  autoPadding: true,
  smartCSR: true
});

screen.title = 'Ugly Tree';

var UglyTree = require('./index.js'); 
var utree = new UglyTree();

var list = utree.init(screen);
utree.onEscape(function() {
  return process.exit(0);
});

var cp = require('child_process');
utree.onSelectFile(function(path) {
  cp.spawn('terminator', ['-x', 'vim', path]);
});

// Append our box to the screen.
screen.append(list);

list.focus();

