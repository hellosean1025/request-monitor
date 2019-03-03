import test from 'ava'
import requestMonitor from '../../src/index'


test('timeout test', t=>{
  let result = requestMonitor.handleDefaultApi(p=> p)
  t.is(result, true)

  result = requestMonitor.handleDefaultApi(p=> p)
  t.is(result, null)
})

