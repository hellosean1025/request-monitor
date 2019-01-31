import test from 'ava'
import requestMonitor from '../src/index'


test.cb('fetch api:text', t=>{
  let text;
  let num = 0;
  requestMonitor((httpInfo)=>{
    num++;
    text = httpInfo;
  })
  window.fetch('https://registry.npmjs.org/yapi-vendor').then(res=>{
    res.text().then(data=>{
      t.is(num, 1)
      t.is(text.responseStatus, 200)
      t.deepEqual(text.responseText, data)
      t.is(typeof text.responseJson, 'undefined')
      t.end()
    })
    
  })
})