import test from 'ava'
import requestMonitor from '../../src/index'


test.cb('fetch api:text not throw error', t=>{
  let text;
  let num = 0;
  requestMonitor((httpInfo)=>{
    num++;
    text = httpInfo;
    let a = 0;
    a.xx.bb = 1;
  })
  window.fetch('http://registry.npm.taobao.org/yapi-vendor').then(res=>{
    res.text().then(data=>{
      t.is(num, 1)
      t.is(text.responseStatus, 200)
      t.deepEqual(text.responseText, data)
      t.is(typeof text.responseJson, 'undefined')
      t.end()
    })
    
  })
})