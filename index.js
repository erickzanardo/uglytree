var blessed = require('blessed');


function UglyTree() {
  this._onEscape = null;
  this._onSelectFile = null;
};

UglyTree.prototype.onEscape = function(callback) {
  this._onEscape = callback;
};

UglyTree.prototype.onSelectFile = function(callback) {
  this._onSelectFile = callback;
};

UglyTree.prototype._triggerEscape = function() {
  if(this._onEscape) this._onEscape();
};

UglyTree.prototype._triggerSelectFile = function(file) {
  if(this._onSelectFile) this._onSelectFile(file);
};

UglyTree.prototype.init = function(screen) {
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
  
  // Quit on Escape, q, or Control-C.
  list.key(['escape', 'q', 'C-c'], function(ch, key) {
    this._triggerEscape();
  }.bind(this));
  
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
  
  list.key('space', function() {
    var node = nodes[index];
    var path = node.path;
  
    fs.stat(path, function(err, stat) {
      if(err) throw err;
      if(stat.isDirectory()) {
        if(node.open) {
  
          var removeSize = node.childrens;
  
          var c = 0;
          while(c < removeSize) {
            var i = c + index + 1;
            if(nodes[i].open) {
              removeSize += nodes[i].childrens;
              nodes[i].childrens = 0;
              nodes[i].open = false;
            }
            c++;
          }
  
          nodes.splice(index + 1, removeSize); 
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
        this._triggerSelectFile(path);
      }
    }.bind(this));
  }.bind(this));
  return list;
};


module.exports = UglyTree;
