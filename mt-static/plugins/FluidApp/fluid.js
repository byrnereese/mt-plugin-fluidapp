(function () {
  var DEBUG = 0;
  if (typeof fluid == 'undefined') return;

  var updateTimer    = null;
  var updateInterval = 60000;
  var lastQuery      = null;
  
  fluid.dockBadge = '';

  window.updateMT = function(action, method, id, target, callback) {
    log('updateMT is called');
    TC.Client.call({
      'load': function(r) {
        var data = eval('(' + r.responseText + ')');
        if (window.fluid) {
          fluid.dockBadge = data.result.count;
          lastQuery = data.result.since;
          if (data.result.growls) {
            for (var i = 0; i < data.result.growls.length; i++) {
              var g = data.result.growls[i];
              fluid.showGrowlNotification({
                title: g.title,
                description: g.description,
                sticky: false
              });
            }
          }
        }
        setTimer(updateInterval);
      },
      'method': 'POST',
      'uri': ScriptURI,
      'arguments': {
        '__mode' : 'fluid_update',
        'since' : (lastQuery == undefined ? '' : lastQuery)
      }
    });
  };

  function update() {
    updateTimer = null;
    var url = 'mt.cgi?__mode=fluid_update&blog_id=3' + (lastQuery == undefined ? '': '&since=' + lastQuery);
    updateMT(url, "get");
  }


  function setTimer(updateInterval) {
    if (typeof window.updateInterval != 'undefined') clearInterval(window.updateInterval);
    if (updateTimer) clearTimeout(updateTimer);
    updateTimer = setTimeout(update, updateInterval);
  }

  setTimer(1000);

  //--============================================================================
  //-- Logger
  //--============================================================================
  function log(str) {
    if (!DEBUG) return;
    if ((typeof console != 'undefined') && (typeof console.log == 'function')) console.log(str);
  }
  function error(str) {
    if ((typeof console != 'undefined') && (typeof console.error == 'function')) console.error(str);
  }
  function warn(str) {
    if ((typeof console != 'undefined') && (typeof console.warn == 'function')) console.warn(str);
  }
})();
