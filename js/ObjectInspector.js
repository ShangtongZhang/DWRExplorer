function ObjectInspector($tree, obj) {
  this._$tree = $tree;
  this._obj = obj;
  this._id = 0;
  this._status = {};
  this._objCache = {};
  this.init();
}
ObjectInspector.prototype.init = function() {
  var me = this;
  this._$tree.bind('tree.click', function(event) {
    var node = event.node;
    me.loadNode(node);
    me._$tree.tree('toggle', node);
  });
  this._$tree.bind('tree.open', function(event) {
    me.loadNode(event.node);
  });
};
ObjectInspector.prototype.loadNode = function(node) {
  if (!node) {
    return;
  }
  if (this._status[node.id] === 'TO_OPEN') {
    if (node.children && node.children[0] && node.children[0].id === 'dummy') {
      this._$tree.tree('removeNode', node.children[0]);
    }
    var obj = this._objCache[node.id];
    if (this.hasSubNodes(obj)) {
      var subNodes = this.format(this._objCache[node.id]);
      for (var i = 0; i < subNodes.length; ++i) {
        var subNode = subNodes[i];
        this._$tree.tree('appendNode', subNode, node);
        if (subNode.children) {
          for (var j = 0; j < subNode.children.length; ++j) {
            this._$tree.tree('appendNode', subNode.children[j], this._$tree.tree('getNodeById', subNode.id));
          }
        }
      }
      this._status[node.id] = 'DONE';
    }
  }
};
ObjectInspector.prototype.show = function() {
  var children = [];
  var label = '';
  if (this.hasSubNodes(this._obj)) {
    children = this.format(this._obj);
    if ($.isPlainObject(this._obj)) {
      label = 'Object';
    } else if ($.isArray(this._obj)) {
      label = 'Array[' + this._obj.length + ']';
    }
  } else {
    if (typeof this._obj === 'string') {
      label = '"' + this._obj + '"';
    } else {
      label = String(this._obj);
    }
  }
  this._$tree.tree({
    data: [{
      label: '',
      tag: null,
      value: label,
      id: this.getId(),
      children: children
    }],
    autoOpen: false,
    onCreateLi: function(node, $li) {
      $nodeDiv = $li.children('div');
      $nodeDiv.addClass('objInsEntry');
      $tag = $nodeDiv.children('span');
      $sep = $tag.clone().css('margin-left', '0').addClass('objInsEntrySep');
      $value = $tag.clone().css('margin-left', '0').addClass('objInsEntryValue');
      if (node.type) {
        $value.attr('data-type', node.type);
      }
      $tag.addClass('objInsEntryTag');
      $sep.appendTo($nodeDiv);
      $value.appendTo($nodeDiv);
      if (node.tag === null) {
        $tag.text('');
        $sep.text('');
      } else {
        $tag.text(node.tag);
        $sep.text(': ');
      }
      $value.text(node.value);
    }
  });
};
ObjectInspector.prototype.getId = function() {
  this._id++;
  return this._id;
};
ObjectInspector.prototype.hasSubNodes = function(obj) {
  return $.isPlainObject(obj) || $.isArray(obj);
};
ObjectInspector.prototype.createLabel = function(obj, prop) {
  var label = {
    tag: String(prop)
  };
  if (!this.hasSubNodes(obj[prop])) {
    var valueStr;
    if (typeof obj[prop] === 'string') {
      valueStr = '"' + obj[prop] + '"';
    } else {
      valueStr = String(obj[prop]);
    }
    label.value = valueStr;
  } else {
    if ($.isPlainObject(obj[prop])) {
      label.value = 'Object';
    }
    if ($.isArray(obj[prop])) {
      label.value = 'Array[' + obj[prop].length + ']';
    }
  }
  return label;
};
ObjectInspector.prototype.format = function(obj) {
  var me = this;
  var propArr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var id = this.getId();
      var label = me.createLabel(obj, prop);
      var childNode = {
        label: '',
        id: id,
        tag: label.tag,
        value: label.value,
        type: typeof obj[prop]
      };
      if (this.hasSubNodes(obj[prop])) {
        childNode.children = [{
          label: '',
          id: 'dummy',
          tag: null,
          value: ''
        }];
      }
      propArr.push(childNode);
      me._status[id] = 'TO_OPEN';
      me._objCache[id] = obj[prop];
    }
  }
  return propArr;
};
