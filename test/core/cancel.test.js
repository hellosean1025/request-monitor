import test from 'ava'
import requestMonitor from '../../src/index'


test.cb('cancel listener', t=>{
  let text = null;
  let inst = requestMonitor((httpInfo)=>{
    text = httpInfo;
  })
  inst.cancel();
  window.fetch('http://registry.npm.taobao.org/yapi-vendor').then(res=>{
    res.text().then(data=>{
      setTimeout(()=>{
        t.is(text,null)
        t.end()
      },1000)
    })
    
  })
})