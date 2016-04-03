# grunt-restful-mock

![logo.svg](https://cdn.rawgit.com/bubkoo/grunt-restful-mock/master/logo.svg)


> 模拟 AJAX 请求返回的 JSON 数据，减少前端工程师对后端接口的依赖，在接口规范的基础之上并行开发。


[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/bubkoo/grunt-restful-mock/blob/master/LICENSE)
[![build:?](https://img.shields.io/travis/bubkoo/grunt-restful-mock/master.svg?style=flat-square)](https://travis-ci.org/bubkoo/grunt-restful-mock)


[![npm:](https://img.shields.io/npm/v/grunt-restful-mock.svg?style=flat-square)](https://www.npmjs.com/packages/grunt-restful-mock)
[![downloads:?](https://img.shields.io/npm/dm/grunt-restful-mock.svg?style=flat-square)](https://www.npmjs.com/packages/grunt-restful-mock)
[![dependencies:?](https://img.shields.io/david/bubkoo/grunt-restful-mock.svg?style=flat-square)](https://david-dm.org/bubkoo/grunt-restful-mock)



## 特性

- 基于数据模板生成随机数据
- 自定义数据模板占位符
- 支持 restful 接口
- 支持 JSONP 请求
- 模拟 HTTPOnly 的 Cookie
- 模拟 HTTP 响应状态码，模拟请求超时，模拟网络延时
- 热重启，修改 mock 配置后自动重启服务


## 使用

 - [开始使用](https://github.com/bubkoo/grunt-restful-mock/wiki/开始使用)
 - [使用示例](https://github.com/bubkoo/grunt-restful-mock/wiki/使用示例)
 - [数据模板语法规则](https://github.com/bubkoo/grunt-restful-mock/wiki/数据模板语法规则)
 - [内置占位符](https://github.com/bubkoo/grunt-restful-mock/wiki/内置占位符)


## 相关模块

- [restful-mock-server](https://github.com/bubkoo/restful-mock-server)
- [generate-random-data](https://github.com/bubkoo/generate-random-data)
- [json-from-template](https://github.com/bubkoo/json-from-template)

## 历史

### v0.2.1

- 添加 `logo.svg`
- 更新文档

### v0.2.0
- 重构，提取核心代码为独立的模块

### v0.1.21
- 增加自定义占位符接口
- 组合谓词（`get|post`），参数修饰谓词（`get[param1=value1]`）


