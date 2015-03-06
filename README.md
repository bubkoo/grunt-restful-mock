# grunt-restful-mock

> 模拟 AJAX 请求返回的 JSON 数据，减少前端工程师对后端接口的依赖，在接口规范的基础之上，实现与后端并行开发。

**特性：**

- 基于数据模板生成随机数据
- 支持 RESTful 风格的 RUI
- 兼容 JSONP 请求
- 模拟 HTTPOnly 的 Cookie
- 模拟 HTTP 响应状态码，模拟请求超时，模拟网络延时
- 热重启，修改 mock 配置后自动重启服务
- 自定义数据模板占位符

**意义：**

使用过 [mockjax](https://github.com/appendto/jquery-mockjax) 的同学应该遇到过一个
苦恼的问题，那就是需要在业务代码中添加许多调试用的 mock 配置，上线时需要人肉删除这些 JS
代码，具有侵入性且容易出错，同时 mock 环境和测试环境的切换也不是很方便。作者在经历过这些痛点
之后，基于 grunt 开发了该插件。


## 开始使用

该插件需要 Grunt `~0.4.5`，如果你还没有使用过 [Grunt](http://gruntjs.com/)，请移步
 [Grunt 新手上路](http://gruntjs.com/getting-started)。

熟悉 Grunt 的运作之后，你可以使用如下命令来安装本插件：

```shell
npm install grunt-restful-mock --save-dev
```

加载插件：

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

#### options.host

Type: `String`

默认值: `"127.0.0.1"`

主机名，可设置为 `"127.0.0.1"`，`"localhost"` 或本机IP

#### options.delay

Type: `Integer`

默认值: `0`

网络延时（毫秒），默认值为 0（收到请求之后立即响应），在处理 AJAX 请求和响应时，可以
根据实际需要配置一定的网络延时，来模拟实际的网络环境。

#### options.statusCode

Type: `Integer`

默认值: `200`

响应的状态码，默认值为 200，表示成功的响应。

#### options.jsonp

Type: `String` 或 `Boolean`

默认值: `null`

定义该路由为 JSONP 请求，如果值为 `true`，将被转换为字符串 `callback`，该值指定了 url 参数中的参数名，例如：

```js
path/to/api?callback=show: {
    get:{
        jsonp: 'callback',
        data: {} // 这里定义数据模板
    }
}
```

将返回 `show(data)` 这样的 JavaScript 文本，前端收到响应后通过 `script` 标签嵌入到页面中。

#### options.debug

Type: `Boolean`

默认值: `false`

默认关闭调试模式，在终端中只显示每次请求的 API 路径；如果打开调试模式（`true`），将在终端中
显示每次请求和响应的详细信息，包括请求的 URL、参数，响应的状态码、Cookie、数据等。

#### options.watch

Type: `Array`

默认值: `[]`

监视的文件列表，当文件改动时，自动重启 mock 任务，关于路由文件后面会有详细介绍。默认会监视
`Gruntfile.js` 和 mock 配置节中指定的配置文件文件夹中的文件。

#### options.sensitive、options.strict 和 options.end

这三个选项是 `Path-to-RegExp` 组件的选项，本插件使用的是 `Path-to-RegExp` 来解
析 RESTful 的 URL，选项的含义可以[参看这里](https://github.com/component/path-to-regexp#usage)。

#### options.cookie

Type: `Object|Array`

默认值: `null`

全局级别的 cookie 设置，在 options 中的 cookie 设置将出现在每个 API 的响应结果中。
在某些情况下需要配置全局的 cookie，例如在需要在每次响应后，从 cookie 中取到用户的 token，
就可以在 options 中将该 cookie 配置为全局的。

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

- 数组格式：使用数组格式可以方便将一些 cookie 分类设置，分别设置不同的 Cookie 选项：

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



## 数据模板语法规则

数据模板的语法部分参考了 [mockjson](http://experiments.mennovanslooten.nl/2010/mockjson/)
和 [mockjs](http://mockjs.com/) 的设计，感谢原作者。

**数据模板中的每条数据由三部分构成：属性名、生成规则、属性值**

```js
'name|rule': value
// name  -> 属性名
// rule  -> 生成规则
// value -> 属性值
```

**注意：**

  - 属性名和生成规则 之间用 `|` 分隔
  - 生成规则是可选的
  - 生成规则有 7 种格式：
    - `'name|min-max': value`
    - `'name|count': value`
    - `'name|min-max.dmin-dmax': value`
    - `'name|min-max.dcount': value`
    - `'name|count.dmin-dmax': value`
    - `'name|count.dcount': value`
    - `'name|+step': value`
  - 生成规则的含义更具具体属性值才能确定
  - 属性值可以是 `@占位符`
  - 属性值指定了最终值的初始值和类型



### 生成规则和示例


#### 属性值是数字 **Number**

- `'name|1-100': 1` 
  
  生成一个随机整数，整数大于等于 `1` 小于等于 `100`，属性值 `1` 只用于确定数据类型。
  
- `'name|1-100.1-4': 1` 
  
  生成一个随机浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分长度为 `1` 到 `4` 位，小数部分随机生成。

- `'name|1-100.1-4': 1.23456` 
  
  生成一个随机浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分长度为 `1` 到 `4` 位，小数部分为原数字小数部分(`23456`)截取 `1` 到 `4` 之间的随机随机长度，所以小数部分只可能是：`2`、`23`、`234` 或 `2345`。

- `'name|1-100.1-4': 1.2` 
  
  生成一个随机浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分长度为 `1` 到 `4` 位，小数部分为原数字小数部分(`2`)截取 `1` 到 `4` 之间的随机长度，原小数位数不足时生成随机数补齐，所以小数部分为：`2`、`2x`、`2xx` 或 `2xxx`。注：`x` 表示随机数，下同。
  
- `'name|1-100.2': 1` 
  
  生成一个随机浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分长度为 `2` 位，小数部分随机生成。
 
- `'name|1-100.2': 1.23` 
  
  生成一个随机浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分长度为 `2` 位，小数部分为 `23`。

- `'name|1-100.2': 1.2` 
  
  生成一个随机浮点数，整数部分大于等于 `1` 小于等于 `100`，小数部分长度为 `2` 位，小数部分为 `2x`。
   
- `'name|100.1-4': 1` 
  
  生成一个浮点数，整数部分是 `100`，小数部分保留 `1` 到 `4` 位，小数部分随机生成。
    
- `'name|100.2': 1` 
  
  生成一个浮点数，整数部分大于等于 `100`，小数部分保留 `2` 位。
  
- `'name|+1': 100` 
  
  属性值自动加 `1`，初始值为 `100`。

  示例：
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



#### 属性值是字符串 **String**

- `'name|min-max': 'value'` 
  
  通过重复 `'value'` 生成一个字符串，重复次数大于等于 `min`，小于等于 `max`。
  
- `'name|count': 'value'` 

  通过重复 `'value'` 生成一个字符串，重复次数等于 `count`。



#### 属性值是布尔型 **Boolean**

- `'name|1': value`
 
  随机生成一个布尔值，值为 `true` 的概率是 `1/2`，值为 `false` 的概率是 `1/2`。
  
- `'name|min-max': value` 

  随机生成一个布尔值，值为 `value` 的概率是 `min / (min + max)`，值为 `!value` 的概率是 `max / (min + max)`。



#### 属性值是对象 **Object**

- `'name|min-max': {}` 

  从属性值 `{}` 对象中随机选取 `min` 到 `max` 个键值组合成一个新对象。

- `'name|count': {}` 

  从属性值 `{}` 对象中随机选取 `count` 个键值组合成一个新对象。



#### 属性值是数组 **Array**

- `'name|count': [{}, {} ...]` 
  
  通过重复属性值 `[{}, {} ...]` 生成一个新数组，重复次数为 `count`。

- `'name|min-max': [{}, {} ...]` 
  
  通过重复属性值 `[{}, {} ...]` 生成一个新数组，重复次数大于等于 `min`，小于等于 `max`。



#### 属性值是函数 **Function**

- `'name': function(){}` 

  执行函数 `function(){}`，将函数的返回值做进一步处理后返回，例如：
  
  
  ```js
  'function1|2': function () {
       return 'Mock';
  }
  
  // 等价于下面这样：
  'function1|2': "Mock"
  ```


#### 属性值是占位符

占位符只是在属性值字符串中占个位置，并不出现在最终的属性值中。占位符的格式为：

```js
name|rule: '@占位符'                           // 没有参数时可以省略括号
name|rule: '@占位符(参数 [, 参数])'             // 一个或多个参数
name|rule: '@占位符(参数, @占位符(参数，参数))'  // 嵌套使用
name|rule: 'something@占位符'                  // 字符串和占位符结合，返回结果为字符串
name|rule: 'something\\@占位符'                // 占位符转义，将直接返回 `'something@占位符'`
```
**注意：**
- 使用占位符与函数调用类似，参数格式与函数调用的参数格式一致
- 占位符和规则可以同时使用
- 占位符可以嵌套使用，内部占位符的返回值作为外部占位符的参数
- 属性值的类型由占位符的返回值决定（除了字符串和占位符结合使用的情况）
- 占位符不区分大小写，但是为了明确区分是占位符，**推荐**采用全大写的方式


## 内置占位符

  * [@int(min, max) 和 @integer(min, max)](#int-min-max-和-integer-min-max) 返回一个整数
  * [@natural(min, max)](#natural-min-max) 返回一个正整数
  * [@bool(min, max, cur) 和 @boolean(min, max, cur)](#bool-min-max-cur-和-boolean-min-max-cur) 返回一个布尔值
  * [@float(min, max, dMin, dMax)](#floatmin-max-dmin-dmax) 返回一个浮点数
  * [@char(pool) 和 @character(pool)](#charpool-和-characterpool) 返回一个字符
  * [@str(pool, min, max) 和 @string(pool, min, max)](#str-pool-min-max-和-string-pool-min-max) 返回一个字符串
  * [@capitalize(word)](#capitalize-word) 将 `word` 首字母大写
  * [@upper(str)](#upper-str) 转换为大写
  * [@lower(str)](#lower-str) 转换为小写
  * [@range(start, stop, step)](#range-start-stop-step) 生成一个数组
  * [@pickOne(arr)](#pickone-arr) 从数组或字符串中随机返回其中一个字符或数组项
  * [@pickSome(arr, count, shuffle)](#picksome-arr-count-shuffle) 从数组中随机选取 `count` 个返回
  * [@shuffle(arr)](#shuffle-arr) 随机打乱数组或字符串
  * [@randomDate(min, max)](#randomdate-min-max) 返回一个日期
  * [@formatDate(data, format)](#formatdate-data-format) 格式化日期时间
  * [@parseDate(...)](#parsedate)
  * [@date(date, format)](#date-date-format)
  * [@time(date, format)](#time-date-format)
  * [@datetime(date, format)](#datetime-date-format)
  * [@now(unit, format)](#now-unit-format)
  * [@color](#color) 返回一个颜色
  * [@maleFirstName](#malefirstname) 返回一个男性名
  * [@femaleFirstName](#femalefirstname) 返回一个女性名
  * [@lastName](#lastname) 返回一个姓
  * [@name(middleName)](#namemiddle-name) 返回一个名字
  * [@word(min, max)](#word-min-max) 返回一个单词
  * [@sentence(min, max)](#sentence-min-max) 返回一个句子
  * [@title(min, max)](#title-min-max) 返回一个标题
  * [@paragraph(min, max)](#paragraph-min-max) 返回一个段落
  * [@lorem](#lorem)
  * [@lorems](#lorems)
  * [@tld](#tld) 返回一个域名后缀
  * [@domain(tld)](#domain-tld) 返回一个域名
  * [@email(domain)](#email-domain) 返回一个邮箱
  * [@url](#url) 返回一个 URL
  * [@ip](#ip) 返回一个 IP
  * [@mobile](#mobile) 返回一个大陆手机号码
  * [@zip(len) 和 @zipcode(len)](#zip-len-和-zipcode-len) 返回一个邮政编码
  * [@lang 和 @language](#lang-和-language) 返回一个语言名称
  * [@d5](#d5)
  * [@d10](#d10)
  * [@d20](#d20)
  * [@d50](#d50)
  * [@d100](#d100)
  * [@d200](#d200)
  * [@d500](#d500)
  * [@d1000](#d1000)
  * [@guid](#guid) 生成一个 GUID
  * [@id](#id) 生成一个 ID
  * [@formItem(key)](#formitem-key) 返回提交的表单或 `QueryString` 中的项
  * [@fromFile(filepath)](#fromfilefilepath) 返回指定文件中的内容


### @int(min, max) 和 @integer(min, max)

在 `min` 和 `max` 之间生成一个随机整数，等价于 `name|min-max: 1`。

参数：
  
  - `min` 可选，缺省值 `-9007199254740992`
  - `max` 可选，缺省值 `9007199254740992`

  
### @natural(min, max)

在 `min` 和 `max` 之间生成一个随机正整数，等价于 `name|min-max: 1`。

参数：
  
  - `min` 可选，缺省值 `0`
  - `max` 可选，缺省值 `9007199254740992`

### @bool(min, max, cur) 和 @boolean(min, max, cur)

随机生成一个布尔值，值为 `cur` 的概率是 `min / (min + max)`，值为 `!cur` 的概率是 `max / (min + max)`，等价于 `'name|min-max': cur`。

参数：
  
  - `min` 可选，缺省值 `1`
  - `max` 可选，缺省值 `1`
  - `cur` 可选，省略时将随机产生一个 `bool` 值

### @float(min, max, dMin, dMax)

生成一个浮点数，整数部分大于等于 `min` 小于等于 `max`，小数部分保留 `dMin` 到 `dMax` 位，等价于 `'name|1-100.1-10': 100`。

参数：
  
  - `min`  可选，缺省值 `-9007199254740992`
  - `max`  可选，缺省值 `9007199254740992`
  - `dMin` 可选，缺省值 `0`
  - `dMax` 可选，缺省值 `17`
  
### @char(pool) 和 @character(pool)

从 `pool` 中随机选择一个字符作为返回的字符。

参数：
  
  - `pool` 预设字符，可选，预定义的 pool 有：
    
    - lower : 'abcdefghijklmnopqrstuvwxyz'
    - upper : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    - number: '0123456789'
    - symbol: '!@#$%^&*()[]'
    
    省略时的默认值是上述四种 pool 的组合。
  
示例：

```js
@char() // 使用默认值
@char('lower')
@char('upper')
@char('number')
@char('symbol')
@char('alpha') // alpha = lower + upper
@char('ABCDefgh') // 自定义的 pool
```

### @str(pool, min, max) 和 @string(pool, min, max)

从 `pool` 候选字符中，随机生成一个长度在 `min` 到 `max` 之间的字符串。
  
参数：

  - `pool` 同上
  - `min` 字符串的最小长度，可选，缺省值 `0`
  - `max` 字符串的最大长度，可选，缺省值 `9007199254740992`
  
### @capitalize(word)

将 `word` 首字母大写。

参数：

  - `word` 必选，被转换的字符串
  
### @upper(str)
  
将 `str` 中的字符转换为大写字母。

参数：

   - `str` 必选，被转换的字符串

### @lower(str)
  
将 `str` 中的字符转换为小写字母

  参数：

   - `str` 必选，被转换的字符串
   
### @range(start, stop, step)

从 `start` 开始，每次自增 `step`，直到 `stop` 结束，生成一个数组。

参数：

  - `start` 开始位置，可选，缺省值 `0`
  - `stop`  结束位置，必选
  - `step`  自增步长，可选，缺省值 `1`
  
### @pickOne(arr)

从数组或字符串中随机返回其中一个字符或数组项。

参数：

  - `arr` 必选，字符串或数组

### @pickSome(arr, count, shuffle)

从数组中随机选取 `count` 个返回。

参数：

  - `arr` 必选，源数组
  - `count` 可选，返回的数组长度，缺省时将随机产生一个 `0` 到 `arr.length - 1` 之间的一个数
  - `shuffle` 可选，是否随机顺序，为 `true` 时返回数组项的顺序将可能与源数组项的顺序同  
  

### @shuffle(arr)

随机打乱字符串或数组中的字符或数组项。

参数：

  - `arr` 必选，字符串或数组
  
### @randomDate(min, max)

从 `min` 到 `max` 之间随机产生一个日期。

参数：

  - `min` 可选，最小毫秒数，缺省值 `0`
  - `max` 可选，最大毫秒数，缺省值 `(new Date()).getTime()`
  
### @formatDate(data, format)

格式化日期或时间。

参数：

  - `date` 必选，将由 [moment](http://momentjs.com/) 格式化为日期格式，然后调用其 `format` 方法
  - `format` 必选，返回的日期时间格式
  
注意：两个参数具体的传值可以查看 [moment 官网](http://momentjs.com/)

### @parseDate(...)

返回 `moment(arguments)`，所以参数请参考 [moment 官网](http://momentjs.com/)。
  
### @date(date, format)

格式化日期为指定的日期格式。

参数：

  - `date` 可选，缺省时将由 `randomDate` 随机生成一个
  - `format` 可选，缺省值 `'YYYY-MM-DD'`，其他格式参考 [moment 官网](http://momentjs.com/)
  
### @time(date, format)

格式化日期为指定的时间格式。
 
参数：

  - `date` 可选，缺省时将由 `randomDate` 随机生成一个
  - `format` 可选，缺省值 `'HH:mm:ss'`，其他格式参考 [moment 官网](http://momentjs.com/)
  
### @datetime(date, format)

格式化日期为指定的日期时间格式。

参数：

  - `date` 可选，缺省时将由 `randomDate` 随机生成一个
  - `format` 可选，缺省值 `'YYYY-MM-DD HH:mm:ss'`，其他格式参考 [moment 官网](http://momentjs.com/)

### @now(unit, format)

按照指定格式返回当前时间。

参数：

  - `unit` 可选，参考 [moment 官网](http://momentjs.com/)
  - `format` 可选，缺省值 `'YYYY-MM-DD HH:mm:ss'`，其他格式参考 [moment 官网](http://momentjs.com/)
  

### @color

生成随机颜色值，例如：`'#080900'`。

### @maleFirstName
  
返回一个随机男性名。

### @femaleFirstName
  
返回一个随机女性名。

### @lastName

返回一个随机姓。
  
### @name(middleName)

返回一个随机名字。

参数：

  - `middleName` 可选

### @word(min, max)

返回长度为 `min` 到 `max` 之间的一个随机单词。

参数：

  - `min` 可选
  - `max` 可选
  
两个参数都省略时，返回长度为 `3` 到 `7` 之间的一个由随机字符组成的单词。
  
只有一个参数时，返回该参数长度的随机单词。
  
### @sentence(min, max)

返回长度为 `min` 到 `max` 个随机单词组成的句子。

参数：

  - `min` 可选
  - `max` 可选
  
两个参数都省略时，返回由 `3` 到 `7` 个随机单词组成的句子（首个单词首字母大写）
  
只有一个参数时，返回该参数个数的随机单词组成的句子
  
### @title(min, max)

返回长度为 `min` 到 `max` 个随机单词组成的标题（每个单词的首字母大写）。

参数：
 
  - `min` 可选
  - `max` 可选
  
两个参数都省略时，返回由 `3` 到 `7` 个随机单词组成的标题。
  
只有一个参数时，返回该参数个数的随机单词组成的标题。

### @paragraph(min, max)

返回长度为 `min` 到 `max` 个随机句子组成的段落。

参数：

  - `min` 可选
  - `max` 可选
  
两个参数都省略时，返回由 `3` 到 `7` 个随机句子组成的段落。
  
只有一个参数时，返回该参数个数的随机句子组成的段落。
  
### @lorem

返回一个 lorem 随机单词。

### @lorems

返回一个 lorem 随机段落。

### @tld

返回一个随机域名后缀 ( com、net、me、org... )。

### @domain(tld)

返回一个随机域名。

参数

  - `tld` 可选，省略时将随机产生一个域名后缀。
  
### @email(domain)

返回一个随机邮箱。

参数

  - `domain` 可选，省略时将随机产生一个域名。
  
### @url

随机生成一个 URL。
  
### @ip

随机生成一个 IP 地址。
  
### @mobile

随机生成一个大陆的手机号码。
  
### @zip(len) 和 @zipcode(len)

随机生成一个邮政编码。

参数：

  - `len` 可选，邮政编码的长度，缺省值为 `6`

### @lang 和 @language

随机返回一个语言的名称。

### @d5

返回 `1` 到 `5` 之间的随机数。

### @d10

返回 `1` 到 `10` 之间的随机数。
  
### @d20

返回 `1` 到 `20` 之间的随机数。

### @d50

返回 `1` 到 `50` 之间的随机数。

### @d100

返回 `1` 到 `100` 之间的随机数。

### @d200

返回 `1` 到 `200` 之间的随机数。

### @d500

返回 `1` 到 `500` 之间的随机数。
  
### @d1000

返回 `1` 到 `1000` 之间的随机数。

### @guid

随机生成一个 GUID。

### @id

随机生成一个 ID。

### @formItem(keys)

返回提交的表单或 QueryString 中的项。如果 `keys` 为字符串，则返回单项数据；如果 `keys` 为数组，则返回数据项数组，其他类型将直接返回 `keys`。

参数：
  - `keys` 字符串或数组，要返回数据的键

### @fromFile(filepath)

返回指定文件中的内容，支持 JSON 和 YAML 格式文件。

参数：
  - `filepath` 字符串，文件的绝对或相对（相对项目的根目录）路径

## 使用示例

### 基本使用示例

在 options 选项中定义 route 配置，留意配置文件中的注释。

```js
grunt.initConfig({
  mock: {
      your_target: {
          options: {
              // 在这里可以定义一些全局的选项
              // 比如网络延时，全局的 cookie 和 statusCode
              delay: 200, // 定义所有路由的延时为 200ms，可以在具体的路由中覆盖该定义
              cookie: {}, // 定义全局的 cookie
              // 定义路由规则
              route: {
                 // API 的路径
                 '/path/to/api1': {
                    // GET 请求
                    'get': {
                        // 定义该 API 的 get 请求延时 500ms，覆盖全局中的定义
                        delay: 500,
                        // 这里定义的 cookie 将与全局 cookie 进行合并，返回合并后的 cookie
                        cookie: {
                            // cookie 键值
                            id: 123,
                            username: 'bubkoo',
                            // cookie 选项，该选项将应用于以上的 cookie
                            options:{
                                // cookie 的有效期，这里是一小时
                                maxAge: 1000 * 60 * 60
                            }
                        },
                        // 返回的数据
                        data: {
                            code: 200,
                            username: 'bubkoo',
                            email: 'bubkoo@163.com'
                        }
                    },

                    // POST 请求
                    'post': {
                        // 对于该路由的 post 请求，采用全局选项中的设置

                        // 在 data 中使用数据模板
                        data:{
                            'count|100': 100,
                            'pageIndex|0-10': 100,
                            'items|0-30': [
                                {
                                    'username': '@name',
                                    'email': '@email',
                                    'gender': '@bool',
                                    'age|18-99': 100
                                }
                            ]
                        }
                    },

                    // DELETE 请求
                    'delete': {
                        // 这里定义 statusCode 为 403，访问该路由时直接返回 403 状态码
                        statusCode: 403
                    }
                    // 其他未定义的谓词都将返回 404
                 }
                 
                 // 其他未定义的路由都将返回 404
              }
          }
      }
   }
});
```

#### 数据模板

数据模板可以用在 cookie 和 data 上：

```js
'/path/to/api': {
  'get': {
     cookie: {
     	userId: '@id',
     	loginTime: '@now'
     },
     data: { 
     	'count|100': 100,
        'pageIndex|0-10': 100,
        'items|0-30': [
            {
                'username': '@name',
                'email': '@email',
                'gender': '@bool',
                'age|18-99': 100
            }
        ]
    }
}
```

返回的 data 为数组，可以这样定义：

```js
'/path/to/api': {
    'get': {
       'data|0-30': [
           {
              'username': '@name',
              'email': '@email',
              'gender': '@bool',
              'age|18-99': 100
           }
       ]
    }
}
```

#### 指定延时

在路由中指定的延时将覆盖全局定义的延时：

```js
'/path/to/api': {
    'get': {
     // 这里我定义该 API 的 get 请求延时 500ms，覆盖全局中的定义
     delay: 500,
     data: { }
}
```


#### 指定 Cookie

可以定义全局 cookie 和每条路由的 cookie，最终返回的 cookie 是两者合并后的结果，如果有相同项，路由下的 cookie 将覆盖全局。

全局 cookie 定义在 options 中，在 [options](#optionscookie) 中已作详细说明，下面看看路由中的 cookie：


```js
'/path/to/api': {
    'get': {
     // 路由中定义的 cookie 将与全局 cookie 进行合并，返回合并后的 cookie
     cookie: {
         // cookie 键值
         id: 123,
         username: 'bubkoo',
         // cookie 选项，该选项将应用于以上的 cookie
         options: {
             // cookie 的有效期，这里是一小时
             maxAge: 1000 * 60 * 60
         }
     },
     data: { }
}
```


#### 指定状态码

同样，路由中指定的状态码将覆盖全局定义：

```js
'/path/to/api': {
    'get': {
     // 定义 statusCode 为 403，访问该路由时直接返回 403 状态码
     statusCode: 403
     data: { }
}
```


#### 组合谓词

如果同一路由同时支持多个 HTTP 谓词，可以使用组合定义：

```js
'path/to/api': {
    // 共享 get 和 post 请求
    'get|post': { 
        data: {}
    }
}
```


#### 万能谓词

如果某路由支持所有 HTTP 谓词，可以定义万能谓词：

```js
'path/to/api': {
    '*': { 
        data: {}
    }
}
```

#### 共享路由

对于路由 `path/to/api?type=a` 和 `path/to/api?type=b`，MOCK 都将其识别为 `path/to/api`，所以为了根据参数不同而返回不同数据，可以定义共享路由：

```js
'path/to/api': {
    // 匹配 get: path/to/api?param1=value1
    'get[param1=value1]': {
        data: {}
    },
    
    // 匹配 get: path/to/api?param2=value2&param3=value3
    'get[param2=value2, param3=value3]': {
        data: {}
    },
    
    // 组合使用，同时匹配三种情况
    //   get : path/to/api
    //   post: path/to/api?param1=value1
    //   post: path/to/api?param2=value2&param3=value3
    'get|post[param1=value1]|post[param2=value2, param3=value3]': {
        data: {}
    }
}
```

#### 自定义占位符

虽然内置占位符可以满足一些常见需求，但不可能做到全面覆盖，所以开放了自定义占位符特性，通过自定义占位符可以返回任何你想要的结果，例如，查询数据库并返回查询结果。

占位符是键值组成的对象，是一系列函数的集合，占位符函数的 `this` 指向内部的 `random` 对象，该对象包含所有内置占位符函数和一个 `params` 对象，该对象保存具体某条路由的 URL 参数和 POST 的表单数据，在自定的占位符函数内部可以使用这些函数和 `params` 对象。

在 options 选项中定义占位符：

```js
mock: {
	mode: {
		options:{
			placeholders: {
            	hello: function (name) {
               		return 'hello ' + name;
                }
            }
		},
		route: {
			'demo/for/manual': {
				'data': {
				    // 使用占位符
					'hello': '@hello("bubkoo")'
				}
			}
		}
	}
}
```


在路由中定义占位符，路由内部定义的占位符只能在该路由内部使用：

```js
'demo/for/manual1': {
    'get': {
        // 路由内部定义的 placeholder 不共享
        'placeholders': {
            'foo': function () {
                // 使用内置占位符函数 `now`
                return 'foo: ' + this.now();
            }
        },
        'data': {
            // 使用全局 placeholder
            'hello': '@hello("bubkoo")',
            // 使用局部 placeholder
            'foo': '@foo', // 只能使用自身定义的局部占位符
            'bar': '@bar'  // 这里的占位符将出错
        }
    }
},
'demo/for/manual2': {
    'get': {
        // 路由内部定义的 placeholder 不共享
        'placeholders': {
            'bar': function () {
                return 'bar: ' + this.now();
            }
        },
        'data': {
            // 使用全局 placeholder
            'hello': '@hello("bubkoo")',
            // 使用局部 placeholder
            'foo': '@foo', // 这里的占位符将出错
            'bar': '@bar'  // 只能使用自身定义的局部占位符
        }
    }
}
```

#### 占位符转义

占位符 `@` 被赋予了特殊的含义，而某些时候我们需要输出包含 `@` 的字符串，如 `xxx@yyy.com` 或 `@int`，这时需要将 `@` 转义，可以这样配置，`xxx\\@yyy.com`，`\\@int`，将得到 `xxx@yyy.com` 和 `@int`。

### 在单独文件中定义路由规则

#### 设计原理

1. 增加路由规则的可维护性，例如将不同 domain 的路由规则放在不同的文件中
2. 协同开发，由每个开发者维护自身所关注的 API 的路由

**提示**：不推荐同时将路由规则同时放在 `Gruntfile` 和单独的文件中，虽然你可以这样做，否则将使得你的配置文件变得庞大，而越来越难以维护。

#### 如何配置

在上述配置的基础上，可以选择性地删除或保留 `route` 配置节，增加如下配置：

```js
grunt.initConfig({
  mock: {

      your_target1: {
          options: {
              delay: 200,
              statusCode: 200,
              cookie: {...},
              route: {...}
          },

          // 这里配置 route 所在的文件
          cwd: 'mock/target1',
          // 路由配置文件
          src: ['*.js', '*.yaml', '*.coffee', '*.json']
      },

      your_target2: {
          options: {
              delay: 200,
              statusCode: 200,
              cookie: {...},
              route: {...}
          },

          // 这里配置 route 所在的文件
          cwd: 'mock/target2',
          src: ['*.js', '*.yaml', '*.coffee', '*.json']
      }
  }
});
```

**注意：**

- 任务运行时，将合并这些文件中所定义的所有路由规则，包括 `Gruntfile` 中定义的
- 默认情况下，`Gruntfile` 和这里定义的路由配置文件都将被监视，一旦这些文件有修改，mock 将自动重启
- 虽然 `options` 中可以配置 `watch` 选项，但这个选项在一般情况下不需要配置，除非你想监视除开上述文件之外的文件的变化来触发 mock 的重启
- 路由文件支持 `JS`、`coffee`、`yaml`、`JSON` 格式

四种文件的格式分别如下：

#### JavaScript

  ```JS
  module.exports = {
      'path/to/API1':{...},
      'path/to/API2':{...},
  };
  ```
  或者像下面这样：

  ```JS
  module.exports = function(){
      return {
          'path/to/API1':{...},
          'path/to/API2':{...},
      }
  };
  ```

#### CoffeeScript

  ```coffee
  module.exports =
    '/path/to/API1':
      'get':
        data:
          'msg': 'success'
          'info':
            'email': '@EMAIL'
            'mobile': '@MOBILE'

    '/path/to/API2':
      'post':
        data:
          'msg': 'failed',
          'info':
            'username': 'John'
            'pwd':'NOZUONODIE'
  ```

#### Yaml

  ```yaml
  /path/to/API1:
    get:
      data:
        mag: success
        info:
          email: @EMAIL
          mobile: @MOBILE

  /path/to/API2
    post:
      data:
        msg: failed
        info:
          username: John
          pwd: NOZUONODIE
  ```

#### JSON

  ```json
  {
      "/path/to/API1": {
          "get": {
              "msg": "success",
              "info": {
                  "email": "@EMAIL",
                  "mobile": "@MOBILE"
              }
          }
      },

      "path/to/API2": {
          "post": {
              "data": {
                  "msg": "failed",
                  "info": {
                      "username": "John",
                      "pwd": "NOZUONODIE"
                  }
              }
          }
      }
  }
  ```

### 其他

#### 与 nginx 配合使用

mock 的本质就是在本地（127.0.0.1）的某个端口上开启了一个 HTTP Server 服务，但真实环境下 API 的 host 都不会是 127.0.0.1，这时可以借助 nginx 的代理功能了，具体如何配置 nginx 请参考网上的教程。另外，跨域的情况也可以借助 nginx 加 hosts 来解决掉。

#### 开启多个 mock 任务

mock 之所以设计为 Grunt 插件，是方便开发人员可以在开发环境下方便使用。同时，mock 开启之后将一直处于监听状态，所以要运行其他 Grunt 任务或者开启多个 mock，都需要新打开一个终端。这并不影响我们的使用，因为 mock 一旦开启，我们一般就不需要去理会它了。

## 历史

- 2015-03-03 增加 fromFile 占位符，支持从文件中获取 json 数据
- 2014-12-27 增加自定义占位符接口
- 2014-12-04 组合 HTTP 谓词（`get|post`），谓词混同参数（`get[param1=value1]`）
- 2014-12-03 更新 connect 到最新的 v3.3.3，修复一些被弃用的方法。
- 2014-12-02 重构 random，将 random 按类别分放在不同的文件中。