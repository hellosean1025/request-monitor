
/**
 * 
 * @param {*} listener 
 * 
http Info: {
   requestType: "fetch",  // 使用底层库类型，有 fetch 和 xhr
   url: "",
   method: "",
   params: {}, // 请求参数
   responseStatus: 200,
   responseStatusText: "ok",
   responseJson: {"code": 0},
   responseText: "{"code": 0}",
   requestTime: 100,  请求时间，单位为 ms
   errMessage: ""  // 错误消息，比如接口超时了或者网络连接失败，会有 errMessage 错误，该错误一般是因为服务端没有响应导致
}
 */

const listeners = {};
let id = 1;

function getId(){
  return id++;
}

module.exports = function requestMonitor(listener){
  listener = listener || (httpInfo => httpInfo);

  if(typeof listener !== 'function'){
    throw new Error(`The listener Type must be function`)
  }

  let _id = getId();
  listeners[_id] = listener

  function emit(info){
    Object.keys(info).forEach(key=>{
      if(typeof info[key] === 'undefined'){
        delete info[key]
      }
    })
    let endTime = new Date().getTime();
    info.requestTime = endTime - info.startTime;
    delete info.startTime;
    Object.keys(listeners).forEach(key=>{
      listeners[key](info)
    })
  }

  handleDefaultApi();

  return {
    cancel: ()=> {
      delete listeners[_id]
    }
  }

  function handleDefaultApi(){
    if(window._requestMonitorIsLoad)return;
    window._requestMonitorIsLoad = true;
    handleXhr();
    handleFetch();
  }

  function handleXhr(){
    let _open = XMLHttpRequest.prototype.open;
    let _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, async) {
      this._monitor = {
        __type: 'xhr',
        startTime: new Date().getTime()
      }
      _open.call(this, method, url, async);
      Object.assign (this._monitor, {
        method,
        url,
      });
    }
  
    XMLHttpRequest.prototype.send = function (...args) {
      _send.apply (this, args);
      try {
        if (args.length > 0 && typeof args[0] === 'string') {
          this._monitor.params = args[0];
        }
      } catch (err) {}
      this.addEventListener (
        'load',
        function () {
          
          try{
            let contentType = this.getResponseHeader('Content-Type').toLowerCase();
            if(contentType.indexOf('application/json') !== -1){
              this._monitor.responseText = this.responseText;
            }else if(contentType.indexOf('text/') !== -1){
              this._monitor.responseText = this.responseText;
              this._monitor.responseJson = JSON.parse(this.responseText);
            }
          }catch(e){}
          this._monitor.responseStatus = this.status;
          this._monitor.responseStatusText = this.statusText;
          emit(this._monitor)
        },
        false
      );
      this.addEventListener('error', ()=>{
        this._monitor.errMessage = '网络请求异常'
        emit(this._monitor)
      })
      this.addEventListener('timeout', ()=>{
        this._monitor.errMessage = '请求超时'
        emit(this._monitor)
      })
  
    }
  }

  function getParams(options){
    let params;
    try {
      if (options.body && typeof options.body === 'string') {
        params = options.body;
      }
    } catch (er) {}
    return params;
  }
  
  function handleFetch(){
    if (window.fetch) {
      const _fetch = window.fetch;
      function monitorFetch (url, options = {}) {
        const timeout = options.timeout || 60;
        delete options.timeout;
        
        const params = getParams(options);
        
        const _monitor = {
          __type: 'fetch',
          url,
          method: options.method || 'GET',
          params,
          startTime: new Date().getTime()
        };

        const fetchRequest = Promise.race([
          _fetch (url, options),
          new Promise((resolve, reject)=>{
            setTimeout(()=>{
              reject(new Error('请求超时'))
            }, timeout * 1000)
          })
        ]).then (response => {
          let _text = response.text;
          _monitor.responseStatus = response.status;
          _monitor.responseStatusText = response.statusText;
          response.json = ()=>{
            return new Promise( (resolve, reject)=>{
              _text.call(response).then(text => {
                try{
                  let json = JSON.parse(text)
                  _monitor.responseText = text;
                  _monitor.responseJson = json;
                  emit(_monitor)
                  resolve(json)
                }catch(e){
                  reject(e)
                }
              }).catch(err=>{
                reject(err)
              });
            })
          }
    
          response.text = ()=>{
            return new Promise( (resolve, reject)=>{
              _text.call(response).then(text => {
                try{
                  _monitor.responseText = text;
                  emit(_monitor)
                  resolve(text)
                }catch(e){
                  reject(e)
                }
              }).catch(err=>{
                reject(err)
              });
            })
          }

          return response;
          
        })

        return new Promise((resolve, reject)=>{
          fetchRequest.then(data=>{
            resolve(data)
          }).catch(err=>{
            _monitor.errMessage = err.message || '网络异常';
            emit(_monitor)
            reject(err)
          })
          return fetchRequest;
        })
      }
      window.fetch = monitorFetch;
    }
  }
}