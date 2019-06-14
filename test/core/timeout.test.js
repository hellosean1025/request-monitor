import test from 'ava'
import requestMonitor from '../../src/index'


test.cb('timeout test', t=>{
  let info;
  requestMonitor((data)=>{
    info = data;
    t.true(info.requestTime > info.timeout)
    t.end()
  })
  window.fetch('http://registry.npm.taobao.org/yapi-vendor', {timeout: 1}).then(res=>{
    res.json().then(data=>{})
  }).catch(e=>{})
})

