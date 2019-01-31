import test from 'ava'
import requestMonitor from '../src/index'


test('check Api exist', t=>{
  t.is(typeof requestMonitor , 'function')
})

test('errorMonitor catch check', t=>{
  t.throws(()=> requestMonitor(1))
})

test.cb('fetch api:json', t=>{
  let info;
  let num = 0;
  requestMonitor((httpInfo)=>{
    num++;
    info = httpInfo;
  })
  window.fetch('https://registry.npmjs.org/yapi-vendor').then(res=>{
    res.json().then(data=>{
      t.is(num, 1)
      t.is(info.responseStatus, 200)
      t.deepEqual(info.responseJson, data)
      t.end()
      
    })
    
  })
})



