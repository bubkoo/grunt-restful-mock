# grunt-restful-mock

> 模拟 AJAX 请求返回的 JSON 数据，帮助前端工程师减少对后端接口的依赖，在接口规范的基础之上，实现与后端并行开发。

主要有以下特性：

- 根据数据模板随机生产数据
- 支持 RESTful 风格的 API
- 模拟 HTTPOnly 的 Cookie
- 模拟 HTTP 响应的状态码
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

#### options.cookie
Type: `Object|Array`
默认值: `null`

全局级别的 cookie 设置，在 options 中的 cookie 设置将出现在每个 API 的响应结果中。在某些情况下需要配置全局的 cookie，例如在需要在每次响应后，从 cookie 中取到用户的 ID，就可以在 options 中将该 cookie 配置为全局的。

cookie 中的 options 选项可以[请参考](https://github.com/defunctzombie/node-cookie#more)。

cookie 项可以是一个对象或数组，下面分别看看两种配置：

- 对象格式：

```js
cookie: {
    // 下面是 cookie 名和对应的值
    id: 123,
    name: 'John',

    // cookie 的选项，可选项
    // 注意：这里的设置将用于上面两个 cookie
    // 如果对不同的 cookie 想使用不同的设置，可以使用后面介绍的数组格式
    options:{
        // cookie 的有效期，这里是一小时
        maxAge: 1000 * 60 * 60,
        domain: 'some.com',
        path: '/cookie/path'
    }
}
```
- 数组格式：使用数组格式可以方便将一些 cookie 分类设置，分别设置不同的选项

```js
cookie: [
    {
        id: 123,
        options: {
            maxAge: 1000 * 60 * 60,
            domain: 'some.com',
            path: '/cookie/path'
        }
    },
    {
        name: 'John'
    }
]
```



#### options.route
Type: `Object`
默认值: `null`

定义 API 的路由以及返回数据的模板。


### 数据模板的语法规范

数据模板部分参考了 [mockjs](http://mockjs.com/) 的设计。

**数据模板中的每条数据由三部分构成：属性名、生成规则、属性值**

```js
// 属性名   name
// 生成规则 rule
// 属性值   value
'name|rule': value
```

注意：
  - 属性名 和 生成规则 之间用 `|` 分隔
  - 生成规则 是可选的
  - 生成规则 有 7 种格式：
    
    1. `'name|min-max': value`    
    2. `'name|count': value`
    3. `'name|min-max.dmin-dmax': value`
    4. `'name|min-max.dcount': value`
    5. `'name|count.dmin-dmax': value`
    6. `'name|count.dcount': value`
    7. `'name|+step': value`
  - **生成规则 的 含义 需要依赖 属性值 才能确定**
  - 属性值 中可以含有 `@占位符`
  - 属性值 还指定了最终值的初始值和类型 

#### 生成规则和示例

##### 属性值是字符串 **String**

1. `'name|min-max': 'value'` 通过重复 `'value'` 生成一个字符串，重复次数大于等于 `min`，小于等于 `max`
2. `'name|count': 'value'` 通过重复 `'value'` 生成一个字符串，重复次数等于 `count`

##### 属性值是数字 **Number**

1. `'name|+1': 100` 属性值自动加 `1`，初始值为 `100`
2. `'name|1-100': 100` 生成一个大于等于 `1` 小于等于 `100` 的整数，属性值 `100` 只用来确定类型
3. `'name|1-100.1-10': 100` 生成一个浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分保留 `1` 到 `10` 位
4. `'name|1-100.2': 100` 生成一个浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分保留 `2` 位
5. `'name|100.1-10': 100` 生成一个浮点数，整数部分大于等于 `100`，小数部分保留 `1` 到 `10` 位
6. `'name|100.2': 100` 生成一个浮点数，整数部分大于等于 `100`，小数部分保留 `2` 位

  ```js
  {
     'number1|1-100.1-10': 1,
     'number2|123.1-10': 1,
     'number3|123.3': 1,
     'number4|123.10': 1.123
  }
  // =>
  {
     "number1": 12.92,
     "number2": 123.51,
     "number3": 123.777,
     "number4": 123.1231091814
  }
  ```

##### 属性值是布尔型 **Boolean**

1. `'name|1': value` 随机生成一个布尔值，值为 `true` 的概率是 `1/2`，值为 `false` 的概率是 `1/2`
2. `'name|min-max': value` 随机生成一个布尔值，值为 `value` 的概率是 `min / (min + max)`，值为 `!value` 的概率是 `max / (min + max)`

##### 属性值是对象 **Object**

1. `'name|min-max': {}` 从属性值 `{}` 中随机选取 `min` 到 `max` 个属性
2. `'name|count': {}` 从属性值 `{}` 中随机选取 `count` 个属性

##### 属性值是数组 **Array**

1. `'name|1': [{}, {} ...]` 从属性值 `[{}, {} ...]` 中随机选取 `1` 个元素，作为最终值
2. `'name|min-max': [{}, {} ...]` 通过重复属性值 `[{}, {} ...]` 生成一个新数组，重复次数大于等于 `min`，小于等于 `max`
3. `'name|count': [{}, {} ...]` 通过重复属性值 `[{}, {} ...]` 生成一个新数组，重复次数为 `count`

##### 属性值是函数 **Function**

`'name': function(){}` 执行函数 `function(){}`，取其返回值作为最终的属性值，上下文为 `'name'` 所在的对象

#### 数据占位符

占位符只是在属性值字符串中占个位置，并不出现在最终的属性值中。占位符的格式为：

```js
name|rule: @占位符
name|rule: @占位符(参数 [, 参数])
name|rule: @占位符(参数, @占位符(参数，参数)) // 嵌套使用
```
**注意：**
- 占位符和规则可以同时使用
- 占位符可以嵌套使用
- 属性值的类型由占位符的返回值决定


### 使用示例

#### 基本使用示例

在 options 选项中定义 route 配置。


```js
grunt.initConfig({
  mock: {
      your_target: {
          options: {
              // 定义路由规则
              route: {
                 // API 的路径
                 '/path/to/API': {
                    // 处理 get 请求
                    get: {
                        // 这里我定义该 API 的 get 请求延时 500ms
                        delay: 500,
                        // 返回的 cookie
                        cookie: {
                            // 返回 cookie 的键值
                            id: 123,
                            username: 'John',
                            // cookie 的选项，该选项将应用于以上的 cookie
                            options:{
                                // cookie 的有效期，这里是一小时
                                maxAge: 1000 * 60 * 60,

                            }
                        },
                        // 返回的数据
                        data: {
                            code: 200,
                            username: 'John',
                            email: 'John@company.com'
                        }
                    },
                    post: {

                        cookie:{
                        },
                        data:{
                        }
                    },
                    delete:{
                    },
                 }
              }
          }
      }
  }
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
