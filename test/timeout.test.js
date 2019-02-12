import test from 'ava'
import requestMonitor from '../src/index'


test.cb('timeout test', t=>{
  let info;
  requestMonitor((data)=>{
    info = data;
    t.is(info.errMessage, '请求超时')
    t.end()
  })
  window.fetch('http://registry.npm.taobao.org/yapi-vendor', {timeout: 0.01}).then(res=>{
    res.json().then(data=>{})
  }).catch(e=>{})
})

