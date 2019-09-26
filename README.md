# request-monitor

## 特性
* 监控 http 请求参数和返回数据

## 安装

```bash
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

```js
errorMonitor(listener)
```

|参数名|  默认值 |类型|描述|
|---|---|---|----
|listener|null| Function |需要监听的函数


## listener 函数参数 Info 结构

```js
{
   __type: "fetch",  // 使用底层库类型，有 fetch 和 xhr
   url: "",
   method: "",
   params: {},
   responseHeaders: {}, // 响应数据 headers 信息
   responseStatus: 200,  
   responseStatusText: "ok",
   responseJson: {"code": 0},
   responseText: "{"code": 0}",
   requestTime: 100,  请求花费时间，单位为 ms
}



```

## fetch 超时监控

```js
fetch(apipath, options = {timeout: 60})
```
> 超过 60s ，中断请求
