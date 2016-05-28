window.addEventListener('message', function(event) {
  var getDWRObject = function() {
    var result;
    try {
      eval(event.data.dwrContent);
    } catch (e) {
      console.log(e);
    }
    return result;
  } 
  window.parent.postMessage({
    dwrObject: getDWRObject(),
    dwrId: event.data.dwrId
  }, '*');
});