# grunt-restful-mock

> 模拟 AJAX 请求返回的 JSON 数据，帮助前端工程师减少对后端接口的依赖，在接口规范的基础之上，实现与后端并行开发。

主要有以下特性：

- 根据数据模板随机生产数据
- 支持 RESTful 风格的 API
- 模拟 HTTPOnly 的 Cookie
- 模拟 HTTP 相应的状态码
- 模拟 HTTP 请求的网络延时

## 开始使用

该插件需要 Grunt `~0.4.5`，如果你还没有使用过 [Grunt](http://gruntjs.com/)，请移步 [Grunt 新手上路](http://gruntjs.com/getting-started)。

熟悉 Grunt 的运作之后，你可以使用如下命令来安装本插件：

```shell
npm install grunt-restful-mock --save-dev
```

安装之后，通过下面代码来加载本插件：

```js
grunt.loadNpmTasks('grunt-restful-mock');
```

## "mock" 任务

### 综述
在你的项目的 Gruntfile 文件中，添加名为 `mock` 的配置节：

```js
grunt.initConfig({
  mock: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### 选项（Options）

#### options.protocol
Type: `String`
默认值: `"http"`

HTTP 请求的协议，可选值有：`"http"` 和 `"https"`

#### options.port
Type: `String`
默认值: `'6000'`

端口号

#### options.delay
Type: `Integer`
默认值: `0`

网络延时毫秒数，默认值为 0，收到请求之后立即响应，在处理 AJAX 请求和响应时，可以根据实际需要配置一定的网络延时。

#### options.statusCode
Type: `Integer`
默认值: `200`

响应的状态码，默认值为 200，表示成功的响应。

#### options.debug
Type: `Boolean`
默认值: `false`

默认关闭调试模式，在终端中只显示每次请求的 API 路径；如果打开调试模式（true），将在终端中显示每次请求和响应的详细信息，包括请求的 URL、参数，响应的状态码、Cookie、数据等。

#### options.watch
Type: `Array`
默认值: `[]`

监视的路由文件列表，当文件改动时，自动重启 mock 任务，关于路由文件后面会有详细介绍。

#### options.sensitive、options.strict 和 options.end

这三个选项是 `Path-to-RegExp` 组件的选项，本插件使用的是 `Path-to-RegExp` 来解析 RESTful 的 URL，选项的含义可以[参看这里](https://github.com/component/path-to-regexp#usage)



### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  restful_mock: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  restful_mock: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
