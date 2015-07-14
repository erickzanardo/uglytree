var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  autoPadding: true,
  smartCSR: true
});

screen.title = 'Ugly Tree';

var list = blessed.list({
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: '#0000ff'
    },
    hover: {
      bg: 'green'
    },
    selected: {
      bg: '#0000ff'
    }
  }
});

function Node(path, level) {
  this.path = path;
  this.level = level;

  var parts = path.split('/');
  this.name = parts[parts.length - 1];
  this.open = false;
  this.childrens = 0;

  var i = 0;
  while(i < level) {
    this.name = ' ' + this.name;
    i++;
  }
};

Node.prototype.getContent = function() { return this.name };

// Append our box to the screen.
screen.append(list);

list.focus();

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


var cwd = process.cwd();
var fs = require('fs');
var _path = require('path');

var nodes = [];

var index = 0;

var treeChanged = function() {
  list.clearItems();
  nodes.forEach(function(node) {
    list.addItem(node);
  });
  list.select(index);
  screen.render();
};

fs.readdir(cwd, function(err, files) {
  files.forEach(function(item) {
    var n = new Node(_path.join(cwd, item), 0)
    nodes.push(n);
  });
  treeChanged();
});

list.key('j', function() {
  if(index < list.items.length - 1) {
    index++;
    list.select(index);
    screen.render();
  }
});


list.key('k', function() {
  if(index > 0) {
    index--;
    list.select(index);
    screen.render();
  }
});

var cp = require('child_process');
list.key('space', function() {
  var node = nodes[index];
  var path = node.path;

  fs.stat(path, function(err, stat) {
    if(err) throw err;
    if(stat.isDirectory()) {
      if(node.open) {
        nodes.splice(index + 1, node.childrens); 
        node.childrens = 0;
        node.open = false;
        treeChanged();
      } else {
        fs.readdir(path, function(err, files) {
          var count = 1;
          files.forEach(function(item) {
            var n = new Node(_path.join(path, item), node.level + 1)
            nodes.splice(index + count, 0, n); 
            node.childrens++;
            count++;
          });
          node.open = true;
          treeChanged();
        });
      }
    } else {
      cp.spawn('terminator', ['-x', 'vim', path]);
    }
  });
});
