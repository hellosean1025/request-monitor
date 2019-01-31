# request-monitor

## 特性
* 监控 http 请求参数和返回数据

## 安装

```
npm i request-monitor

```

## 使用

```js
import requestMonitor from 'request-monitor'
requestMonitor(info=>{
  console.log(info)
})

```

## requestMonitor 参数 
errorMonitor.init(listener)

|参数名|默认值|类型|描述|
|---|---|---|----
|listener|null| Function |需要监听的函数

