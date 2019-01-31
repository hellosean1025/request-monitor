import test from 'ava'
import requestMonitor from '../src/index'


test.cb('timeout config', t=>{
  let info;
  requestMonitor((data)=>{
    info = data;
    t.is(info.errMessage, '请求超时')
    t.end()
  })
  window.fetch('https://registry.npmjs.org/yapi-vendor', {timeout: 0.1}).then(res=>{
    res.json().then(data=>{})
  }).catch(e=>{})
})

