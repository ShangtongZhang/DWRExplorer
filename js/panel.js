(function() {
  var dwrParserIframe = document.getElementById('dwr_parser_iframe');
  var dwrId = 0;
  var callbackCache = {};
  var parseDWR = function(dwrContent, callback) {
    dwrId++;
    callbackCache[dwrId] = callback;
    dwrParserIframe.contentWindow.postMessage({
      dwrContent: dwrContent,
      dwrId: dwrId
    }, '*');
  };
  window.addEventListener('message', function(event) {
    var data = event.data;
    callbackCache[data.dwrId](data.dwrObject);
  });

  var harId = 0;
  var escapeHTML = function(text, nl, empty) {
    nl = typeof nl === 'string' ? nl : '\n';
    empty = typeof empty === 'string' ? empty : '';

    return ((text || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&#39;').replace(/\n|\r\n?/g, nl)) || empty;
  };

  var showDWREntry = function(har) {
    if (har && har.request && /\.dwr$/.test(har.request.url)) {
      var currentHarId = harId;
      harId++;
      har.getContent(function(content) {
        var dwrContent = content.replace(/throw.*\r/, '')
          .replace(/dwr\.engine\.(_remoteHandleCallback|_remoteHandleException)\(('\d+'),('\d+'),(.*)\)/, 'result = $4');
        parseDWR(dwrContent, function(dwrObject) {
          console.log(dwrObject);
          $('.J_DWRList').append(
            '<li class="entry J_Entry" ' +
            'title="' + escapeHTML(har.request.url) + '" ' +
            'data-har-id="' + currentHarId + '" ' +
            '>' +
            escapeHTML(har.request.url) +
            '</li>'
          );
          var treeContainerId = "tree_" + harId;
          $('.J_DWRContent').append(
            '<div class="J_EntryDetail entry-detail" ' + 'data-har-id="' + currentHarId + '">' +
            '<div id="' + treeContainerId + '">' + '</div>' +
            '</div>'
          );
          new ObjectInspector($('#' + treeContainerId), dwrObject).show();
        });

      });
    }
  };
  chrome.devtools.network.getHAR(function(log) {
    $.each(log.entries, function(i, entry) {
      showDWREntry(entry);
    });
  });
  chrome.devtools.network.onRequestFinished.addListener(function(har) {
    showDWREntry(har);
  });
  $(function() {
    $('.J_DWRList').on('click', '.J_Entry', function() {
      var harId = $(this).attr('data-har-id');
      $('.J_EntryDetail[data-har-id="' + harId + '"]').show().siblings().hide();
    });
  });
  chrome.devtools.network.onNavigated.addListener(function() {
    dwrId = 0;
    callbackCache = {};
    $('.J_DWRList').empty();
    $('.J_DWRContent').empty();
    harId = 0;
  })
})();
