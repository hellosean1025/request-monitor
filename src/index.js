/**
 * 
 * @param {*} listener 
 * 
http Info: {
   __type: "fetch",  // 使用底层库类型，有 fetch 和 xhr
   url: "",
   method: "",
   timeout: 0, // 超时时间
   params: {}, // 请求参数
   responseStatus: 200,  // 如果是 -1 ，代表网络异常
   responseStatusText: "ok",
   responseJson: {"code": 0},
   responseText: "{"code": 0}",
   requestTime: 100,  请求时间，单位为 ms
}
 */

const listeners = {};
let id = 1;

function getId () {
  return id++;
}

function handleEndTime(info){
  let endTime = new Date ().getTime ();
  info.requestTime = endTime - info.startTime;
  delete info.startTime;
}


function handleDefaultApi (emit) {
  if (window._requestMonitorIsLoad) return null;
  window._requestMonitorIsLoad = true;
  handleXhr (emit);
  handleFetch (emit);
  return true;
}

function handleXhr (emit) {
  let _open = XMLHttpRequest.prototype.open;
  let _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (...args) {
    const method = args[0];
    const url = args[1];
    this._monitor = {
      __type: 'xhr',
    };
    _open.apply (this, args);
    Object.assign (this._monitor, {
      method,
      url,
    });
  };

  XMLHttpRequest.prototype.send = function (...args) {
    _send.apply (this, args);
    this._monitor.startTime = new Date ().getTime ();
    this._monitor.timeout = this.timeout || 0;
    try {
      if (args.length > 0 && typeof args[0] === 'string') {
        this._monitor.params = args[0];
      }
    } catch (err) {}
    this.addEventListener (
      'load',
      function () {
        let contentType = this.getResponseHeader (
          'Content-Type'
        );
        contentType = contentType || '';
        contentType = contentType.toLowerCase ();
        if (contentType.indexOf ('application/json') !== -1) {
          this._monitor.responseText = this.responseText;
          try{
            this._monitor.responseJson = JSON.parse (this.responseText);
          }catch(e){}
          
        } else if (contentType.indexOf ('text/plain') !== -1) {
          this._monitor.responseText = this.responseText;
        }
        this._monitor.responseStatus = this.status;
        this._monitor.responseStatusText = this.statusText;
        emit (this._monitor);
      },
      false
    );
    this.addEventListener ('error', () => {
      this._monitor.responseStatusText = 'Xhr Network request exception';
      this._monitor.responseStatus = -1;
      emit (this._monitor);
    });

    this.addEventListener ('timeout', () => {
      emit (this._monitor);
    });

  };
}

function getParams (options) {
  let params;
  try {
    if (options.body && typeof options.body === 'string') {
      params = options.body;
    }
  } catch (er) {}
  return params;
}

function handleFetch (emit) {
  if (window.fetch) {
    const _Promise = window.fetch.Promise || Promise;
    const _fetch = window.fetch;
    function monitorFetch (url, options = {}) {
      const params = getParams (options);

      const _monitor = {
        __type: 'fetch',
        url,
        method: options.method || 'GET',
        params,
        startTime: new Date ().getTime (),
        timeout: options.timeout || 0
      };

      const fetchRequest = 
        // _Promise
        // .race ([
          
        //   new _Promise ((resolve, reject) => {
        //     setTimeout (() => {
        //       let err = new Error ('前端fetch Network request timeout: ' + options.timeout);
        //       err.status = 504;
        //       reject (err);
        //     }, timeout);
        //   }),
        // ])
        _fetch (url, options)
        .then (response => {
          let _text = response.text;
          _monitor.responseStatus = response.status;
          _monitor.responseStatusText = response.statusText;
          response.json = () => {
            return new _Promise ((resolve, reject) => {
              _text
                .call (response)
                .then (text => {
                  try {
                    let json = JSON.parse (text);
                    _monitor.responseText = text;
                    _monitor.responseJson = json;
                    emit (_monitor);
                    resolve (json);
                  } catch (e) {
                    e.type = 'invalid-json';
                    _monitor.responseText = text;
                    emit(_monitor);
                    reject (e);
                  }
                })
                .catch (err => {
                  reject (err);
                });
            });
          };

          response.text = () => {
            return new _Promise ((resolve, reject) => {
              _text
                .call (response)
                .then (text => {
                  try {
                    _monitor.responseText = text;
                    emit (_monitor);
                    resolve (text);
                  } catch (e) {
                    reject (e);
                  }
                })
                .catch (err => {
                  reject (err);
                });
            });
          };

          return response;
        });

      return new _Promise ((resolve, reject) => {
        fetchRequest
          .then (data => {
            resolve (data);
          })
          .catch (err => {
            _monitor.responseStatus = err.status || -1;
            _monitor.responseText = err.message || 'Fetch Network request exception';
            emit (_monitor);
            reject (err);
          });
        return fetchRequest;
      });
    }

    monitorFetch.Promise = _Promise;

    Object.defineProperty (monitorFetch, 'Promise', {
      set (value) {
        // monitorFetch.Promise = value;
        _fetch.Promise = value;
      },
      get () {
        return _fetch.Promise;
      },
    });

    window.fetch = monitorFetch;
  }
}

function emit (info) {
  handleEndTime(info)
  try{
    Object.keys (info).forEach (key => {
      if (typeof info[key] === 'undefined') {
        delete info[key];
      }
    });
    Object.keys (listeners).forEach (key => {
      setTimeout(()=> {
        try{
          listeners[key] (info)
        }catch(err){
          console.error(err)
        }
      })
    });
  }catch(e){
    console.error(e)
  }
}

module.exports = requestMonitor;

function requestMonitor (listener) {
  listener = listener || (httpInfo => httpInfo);

  if (typeof listener !== 'function') {
    throw new Error (`The listener Type must be function`);
  }

  let _id = getId ();
  listeners[_id] = listener;
  handleDefaultApi (emit);

  return {
    cancel: () => {
      delete listeners[_id];
    },
  };
}

requestMonitor.handleDefaultApi = handleDefaultApi;
