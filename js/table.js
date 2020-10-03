var Table = {};
(function(){

// imitate jquery (迫真)
function $(str, children, namespace) {
  if (typeof(str) == 'string') {
    if (str[0] == '#')
      return document.getElementById(str.slice(1));
    if (str[0] == '.')
      return document.getElementsByClassName(str.slice(1));
    if (str[0] == '"' && str.slice(-1) == '"')
      return document.createTextNode(str.slice(1,-1));
    if (str[0] == '<' && str.slice(-1) == '>') {
      var elem;
      str = str.slice(1,-1);
      elem = document.createElement(str);
      if (!children)
        ;
      else if (typeof(children) == 'string')
        elem.appendChild(document.createTextNode(children));
      else if (children instanceof Node)
        elem.appendChild(children);
      else if (children instanceof Array)
        for (c of children)
          elem.appendChild(c);
      else // 数字等其他类型转为字符串
        elem.appendChild(document.createTextNode(children));
      return elem;
    }
    if (str.length > 0)
      return document.getElementsByTagName(str);
  } else if (typeof(str) == 'undefined') {
    return document.createDocumentFragment();
  }
}

/* config 的字段说明:
 * parent: 指定容器, 默认为 document.body
 * data: 数据源, 是对象的数组
 * columns: 字符串或函数的数组, 默认为 data 的第一行的 keys
 * heads: 表头文字, 默认为 columns
 * sortBy: 排序方式, 函数或字符串, 默认不排序
 */
Table.create = function(config) {
  // 排序
  var sortBy = config.sortBy;
  var data = config.data;
  if (typeof sortBy == 'function') {
    data.sort(sortBy);
  } else if (typeof sortBy != 'undefined') {
    data.sort(function(r1, r2) { return r1[sortBy]-r2[sortBy] });
  }

  var frag = $();

  // 表头
  var columns = config.columns || Object.keys(data[0]);
  var heads = config.heads || columns;
  var tr = $('<tr>', heads.map(function(h) { return $('<th>', h) }));
  frag.appendChild(tr);

  // 表体
  for (row of data) {
    tr = $('<tr>', columns.map(function(k) {
      return $('<td>', typeof k == 'function' ? k(row) : row[k] || '');
    }));
    frag.appendChild(tr);
  }

  (config.parent || document.body).append($('<table>', frag));
}

})();
