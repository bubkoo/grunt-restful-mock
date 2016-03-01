# grunt-restful-mock

> 模拟 AJAX 请求返回的 JSON 数据，减少前端工程师对后端接口的依赖，在接口规范的基础之上并行开发。


[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/bubkoo/grunt-restful-mock/blob/master/LICENSE)

[![npm:](https://img.shields.io/npm/v/grunt-restful-mock.svg?style=flat-square)](https://www.npmjs.com/packages/grunt-restful-mock)
[![downloads:?](https://img.shields.io/npm/dm/grunt-restful-mock.svg?style=flat-square)](https://www.npmjs.com/packages/grunt-restful-mock)
[![dependencies:?](https://img.shields.io/david/bubkoo/grunt-restful-mock.svg?style=flat-square)](https://david-dm.org/bubkoo/grunt-restful-mock)


## 特性

- 基于数据模板生成随机数据
- 支持 restful
- 支持 JSONP
- 模拟 HTTPOnly 的 Cookie
- 模拟 HTTP 响应状态码，模拟请求超时，模拟网络延时
- 热重启，修改 mock 配置后自动重启服务
- 自定义数据模板占位符方法


## 使用

 - [开始使用](https://github.com/bubkoo/grunt-restful-mock/wiki/开始使用)
 - [使用示例](https://github.com/bubkoo/grunt-restful-mock/wiki/使用示例)
 - [数据模板语法规则](https://github.com/bubkoo/grunt-restful-mock/wiki/数据模板语法规则)
 - [内置占位符](https://github.com/bubkoo/grunt-restful-mock/wiki/内置占位符)

## 历史

### v0.2.0
- 提取核心代码为独立的模块：[json-from-template](https://github.com/bubkoo/json-from-template),  [generate-random-data](https://github.com/bubkoo/generate-random-data)

### v0.1.21
- 增加自定义占位符接口
- 组合 HTTP 谓词（`get|post`），谓词混同参数（`get[param1=value1]`）
