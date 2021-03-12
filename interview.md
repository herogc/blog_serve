[toc]
[掘金](https://juejin.cn/post/6844903885488783374)
[掘金](https://juejin.cn/post/6844903830887366670#heading-20)
# 第一题： 什么是防抖和节流？有什么区别？如何实现？
### 1. 防抖
> 触发高频事件后n秒内函数只会执行一次，如果n秒内高频事件再次被触发，则重新计算时间
* 思路：
> 每次触发事件时都取消之前的延时调用方法
```js
    function debounce(fn) {
      let timeout = null; // 创建一个标记用来存放定时器的返回值
      return function () {
        clearTimeout(timeout); // 每当用户输入的时候把前一个 setTimeout clear 掉
        timeout = setTimeout(() => { 
          // 然后又创建一个新的 setTimeout, 这样就能保证输入字符后的 interval 间隔内如果还有字符输的话， 就不会执行 fn 函数
          fn.apply(this, arguments);
        }, 500);
      };
    }
    function sayHi() {
      console.log('防抖成功');
    }
    var inp = document.getElementById('inp');
    inp.addEventListener('input', debounce(sayHi)); // 防抖
```
### 2. 节流
> 触发高频事件后n秒内函数只会执行一次，如果n秒内高频事件再次被触发，则重新计算时间
* 思路：
> 每次触发事件时都判断当前是否有等待执行的延时函数
```js
    function throttle(fn) {
      let canRun = true; // 通过闭包保存一个标记
      return function () {
        if (!canRun) return; // 在函数开头判断标记是否为true，不为true则return
        canRun = false; // 立即设置为false
        setTimeout(() => { // 将外部传入的函数的执行放在setTimeout中
          fn.apply(this, arguments);
          // 最后在setTimeout执行完毕后再把标记设置为true(关键)表示可以执行下一次循环了。当定时器没有执行的时候标记永远是false，开头被  return掉
          canRun = true;
        }, 500);
      };
    }
    function sayHi(e) {
      console.log(e.target.innerWidth, e.target.innerHeight);
    }
    window.addEventListener('resize', throttle(sayHi));
```
# 第二题： setTimeout、Promise、Async/Await 的区别
* 考察这三者在事件循环中的区别，事件循环中分为宏任务队列和微任务队列。
* 其中settimeout的回调函数放到宏任务队列里，等到执行栈清空以后执行；
* promise.then里的回调函数会放到相应宏任务的微任务队列里，等宏任务里面的同步代码执行完再执行；
* async函数表示函数里面可能会有异步方法，await后面跟一个表达式，async方法执行时，遇到await会立即执行表达式，然后把表达式后面的代码放到微任务队列里，让出执行栈让同步代码先执行。
### 1. setTimeout
```js
    console.log('script start')	//1. 打印 script start
    setTimeout(function(){
        console.log('settimeout')	// 4. 打印 settimeout
    })	// 2. 调用 setTimeout 函数，并定义其完成后执行的回调函数
    console.log('script end')	//3. 打印 script start
    // 输出顺序：script start -> script end -> settimeout
```
### 2. Promise
Promise本身是同步的立即执行函数， 当在executor中执行resolve或者reject的时候, 此时是异步操作， 会先执行then/catch等，当主栈完成后，才会去调用resolve/reject中存放的方法执行，打印p的时候，是打印的返回结果，一个Promise实例。
```js
    console.log('script start')
    let promise1 = new Promise(function (resolve) {
        console.log('promise1')
        resolve()
        console.log('promise1 end')
    }).then(function () {
        console.log('promise2')
    })
    setTimeout(function(){
        console.log('settimeout')
    })
    console.log('script end')
    // 输出顺序: script start -> promise1 -> promise1 end -> script end->promise2->settimeout
```
当JS主线程执行到Promise对象时，
* promise1.then() 的回调就是一个 task
* promise1 是 resolved或rejected: 那这个 task 就会放入当前事件循环回合的 microtask queue
* promise1 是 pending: 这个 task 就会放入 事件循环的未来的某个(可能下一个)回合的 microtask queue 中
* setTimeout 的回调也是个 task ，它会被放入 macrotask queue 即使是 0ms 的情况
### 3. async/await
```js
    async function async1(){
        console.log('async1 start');
        await async2();
        console.log('async1 end')
    }
    async function async2(){
        console.log('async2')
    }

    console.log('script start');
    async1();
    console.log('script end')

    // 输出顺序：script start->async1 start->async2->script end->async1 end
```
* async 函数返回一个 Promise 对象，当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再执行函数体内后面的语句。可以理解为，是让出了线程，跳出了 async 函数体。
* 实际上await是一个让出线程的标志。await后面的函数会先执行一遍，然后就会跳出整个async函数来执行后面js栈。等本轮事件循环执行完了之后又会跳回到async函数中等待await
举个例子：
```js
    async function func1() {
        return 1
    }

    console.log(func1())
```
> await的含义为等待，也就是 async 函数需要等待await后的函数执行完成并且有了返回结果（Promise对象）之后，才能继续执行下面的代码。await通过返回一个Promise对象来实现同步的效果。

```js
// {1}
setTimeout(function() {
  new Promise(function(resolve) {
    console.log(0);
    resolve();
    console.log(1);
  }).then(function() { // {2}
    console.log(2);
  });

  console.log(3);
});

// {3}
new Promise(function(resolve) {
  console.log(4);
  resolve();
  console.log(5);
}).then(function() { // {4}
  console.log(6);
  // {5}
  Promise.resolve().then(function() {
    console.log(7);
  }).then(function() { // {6}
    Promise.resolve().then(function() { // {7}
      console.log(8);
    })
  })
});

console.log(9);
4 -> 5 -> 9 -> 6 -> 7 -> 8 -> 0 -> 1 -> 3 -> 2

setTimeout(function(){
    console.log(1)
},0);
new Promise(function(resolve){
    console.log(2)
    for( var i=0 ; i<10000 ; i++ ){
        i==9999 && resolve()
    }
    console.log(3)
}).then(function(){
    console.log(4)
});
console.log(5);

2 -> 3 -> 5 -> 4 -> 1

setTimeout(function() {
    console.log(111)
}, 0);
setTimeout(function() {
    console.log(333)
}, 1000);
new Promise(function(resolve){
    console.log(444);
    resolve();
    console.log(555);
}).then(function(){
    console.log(666);
});
console.log(777);
async function test1() {
    console.log("test1");
    await test2();
    console.log("test1 last");
}
async function test2() {
    console.log("test2");
}
test1();

444 555 777 test1 test2 666 test1 last 111 333

async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}

console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');

script start -> async1 start -> async2 -> promise1 -> script end -> async1 end -> promise2 -> setTimeout
```

# 第三题： 数组有哪些方法? 哪些会改变原数组?
### 会改变原数组的方法      
* pop           (移除最后一个数组元素)                                      
* push          (数组中添加新元素)
* shift         (把数组的第一个元素从其中删除，并返回元素的值)
* unshift       (向数组的开头添加一个或更多元素，并返回新的长度)
* reverse       (数组翻转)
* sort          (数组的元素进行排序)
* splice        (添加或删除数组中的元素)
* copyWithin    (从数组的指定位置拷贝元素到数组的另一个指定位置中)
* fill          (将一个固定值替换数组的元素)
### 不会改变原数组的方法 
* concat        (数组合并)
* join          (数组分割成字符串)
* slice         (数组截取)
* toString      (把数组转换为字符串，并返回结果 , 分割)
* indexOf       (搜索数组中的元素，并返回它所在的位置)
* lastIndexOf   (搜索数组中的元素，并返回它最后出现的位置)
* includes      (判断一个数组是否包含一个指定的值)
# 第四题： 介绍下 npm 模块安装机制，为什么输入 npm install 就可以自动安装对应的模块？
* 1、发出npm install命令；
* 2、npm 向 registry 查询模块压缩包的网址；
* 3、下载压缩包，存放在~/.npm目录；
* 4、解压压缩包到当前项目的node_modules目录；
# 第五题： 变量和类型
### 1.JavaScript中的变量在内存中的具体存储形式  
[csdn](https://blog.csdn.net/qq_41534913/article/details/102955100)
javascript中的变量类型分为：基本类型和引用类型
> 基本数据类型： number,string,null,undefined,boolean,symbol
> 引用数据类型： Object Array
* 基本类型是保存在栈内存中的简单数据段，它们的值都有固定的大小，保存在栈空间，通过按值访问
* 引用数据类型值指保存在堆内存中的对象。也就是，变量中保存的实际上的只是一个指针，这个指针指向内存中的另一个位置，该位置保存着对象。访问方式是按引用访问。读写它们时需要先从栈中读取堆内存地址，然后找到保存在堆内存中的值。
#### 栈内存
![memory](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy81OTk1ODQtYjEyZmVmMzA4MDNhMGM1My5wbmc?x-oss-process=image/format,png "栈内存")
越在上面的球一定是余额后面放进去的，所以总是最先被使用，想使用最下面的球就要将上面的球取出来。
> 这就是栈内存的特点： 先进后出， 后进先出
#### 堆内存
* 堆通常是一个可以被看做一棵树的数组对象。堆总是满足下列性质：①堆中某个节点的值总是不大于或不小于其父节点的值 ②堆总是一棵完全二叉树。
> 堆内存的特点：无序，堆内存根据引用取值。
#### 队列
> 队列是一种先进先出（FIFO）的数据结构。正如排队过安检一样，排在队伍前面的人一定是最先过检的人。
#### 堆栈存储
```js
    let a1 = 0; // 栈内存
	let a2 = "this is string" // 栈内存
	let a3 = null; // 栈内存
	let b = { x: 10 }; // 变量b存在于栈中(引用)，{ x: 10 }作为对象存在于堆中
	let c = [1, 2, 3]; // 变量c存在于栈中（引用），[1, 2, 3]作为对象存在于堆中
```
![memory](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xMjY2NTYzNy1iNzg3ODA2NDQxMWRmNTZhLnBuZw?x-oss-process=image/format,png)
#### 堆栈对比
![memory](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xMjY2NTYzNy1hYTg2MjYzOGExZTI2YWU1LnBuZw?x-oss-process=image/format,png "堆内存")
### 2.null和undefined的区别
在 if 语句中 null 和 undefined 都会转为false两者用相等运算符比较也是相等
```js
    console.log(null==undefined);    //true  因为两者都默认转换成了false
    console.log(typeof undefined);    //"undefined"  
    console.log(typeof null);       //"object"  
    console.log(null===undefined);    //false   "==="表示绝对相等，null和undefined类型是不一样的，所以输出“false
```
> null表示没有对象，即该处不应该有值
* 作为函数的参数，表示该函数的参数不是对象
* 作为对象原型链的终点
> undefined表示缺少值，即此处应该有值，但没有定义
* 定义了形参，没有传实参，显示undefined
* 对象属性名不存在时，显示undefine* 
* 函数没有写返回值，即没有写return，拿到的是undefine* 
* 写了return，但没有赋值，拿到的是undefined
* null和undefined转换成number数据类型
* null 默认转成 0
* undefined 默认转成 NaN
### 3.出现小数精度丢失的原因，JavaScript可以存储的最大数字、最大安全数字，JavaScript处理大数字的方法、避免精度丢失的方法
```js
    0.1 + 0.2 != 0.3 // true    
```
* 原因：计算机的二进制实现和位数限制有些数无法有限表示。就像一些无理数不能有限表示，如 圆周率 3.1415926...，1.3333... 等。JS 遵循 IEEE 754 规范，采用双精度存储（double precision），占用 64 bit。采用“ 四舍五入法 ”（逢1进，逢0舍）。
#### JavaScript可以存储的最大数字、最大安全数字
js的number类型有个最大值（安全值）。即2的53次方，为9007199254740992。如果超过这个值，那么js会出现不精确的问题。这个值为16位。
#### JavaScript处理大数字的方法、避免精度丢失的方法
> 解决方案：
* 对于整数，前端出现问题的几率可能比较低，毕竟很少有业务需要需要用到超大整数，只要运算结果不超过 Math.pow(2, 53) 就不会丢失精度。
* 对于小数，前端出现问题的几率还是很多的，尤其在一些电商网站涉及到金额等数据。解决方式：把小数放到位整数（乘倍数），再缩小回原来倍数（除倍数）
# 第六题： 原型和原型链
### 1. prototype
* 定义： 每一个javascript对象(除null外)创建的时候，就会与之关联另一个对象，这个对象就是我们所说的原型。
* 在JavaScript中，每个函数都有一个prototype属性，这个属性指向函数的原型对象。
```js
    function Person(age) {
        this.age = age       
    }
    Person.prototype.name = 'kavin'
    var person1 = new Person()
    var person2 = new Person()
    console.log(person1.name) //kavin
    console.log(person2.name)  //kavin
```
### 2. \__proto__
* 这是每个对象(除null外)都会有的属性，叫做 \__proto__ ，这个属性会指向该对象的原型。
```js
    function Person() {

    }
    var person = new Person();
    console.log(person.__proto__ === Person.prototype); // true
```
### 3. 原型链
var obj = { name: 'obj' } 
![proto](https://pic1.zhimg.com/80/v2-2f2c7e830223d2c16f450c2054c4d164_720w.png "__proto__")

* 我们发现 console.dir(obj) 打出来的结果是：

1. obj 本身有一个属性 name（这是我们给它加的）
2. obj 还有一个属性叫做 \__proto__（它是一个对象）
3. obj.\__proto__ 有很多属性，包括 valueOf、toString、constructor 等
4. obj.\__proto__ 其实也有一个叫做 \__proto__ 的属性（console.log 没有显示），值为 null

* 当我们「读取」 obj.toString 时，JS 引擎会做下面的事情：

1. 看看 obj 对象本身有没有 toString 属性。没有就走到下一步。
2. 看看 obj.\__proto__ 对象有没有 toString 属性，发现 obj.\__proto__ 有 toString 属性，于是找到了所以 obj.toString 实际上就是第 2 步中找到的 obj.\__proto__.toString。
3. 可以想象，如果 obj.\__proto__ 没有，那么浏览器会继续查看 obj.\__proto__.\__proto__
4. 如果 obj.\__proto__.\__proto__ 也没有，那么浏览器会继续查看 obj.\__proto__.\__proto__.proto__
5. 直到找到 toString 或者 \__proto__ 为 null。

上面的过程，就是「读」属性的「搜索过程」。
而这个「搜索过程」，是连着由 \__proto__ 组成的链子一直走的。
这个链子，就叫做「原型链」。

# 第七题： axios
### 1. axios
> 基于promise用于浏览器和node.js的http客户端
* 特点
* 支持浏览器和node.js
* 支持promise
* 能拦截请求和响应  
(instance.interceptors.request 请求 ---- 登录验证，token等,instance.interceptors.response 响应 ---- 处理错误响应)
* 能转换请求和响应数据
* 能取消请求
* 自动转换JSON数据
* 浏览器端支持防止CSRF(跨站请求伪造)

# 第八题：同步异步，事件循环
> js执行顺序 ————————> [简书](https://www.jianshu.com/p/62c7d633a879)
* 因为单线程，所以代码自上而下执行，所有代码被放到执行栈中执行；
* 遇到异步函数将回调函数添加到一个任务队列里面；
* 当执行栈中的代码执行完以后，会去循环任务队列里的函数;
* 将任务队列里的函数放到执行栈中执行;
* 如此往复，称为事件循环。

### 1. 任务队列：宏任务，微任务
> 宏队列与微队列组成了任务队列;任务队列将任务放入执行栈中执行
* 宏任务：setTimeout,setInterval
* 微任务：Promise
> 一次完整的事件循环
1. 执行全局Script同步代码，这些同步代码有一些是同步语句，有一些是异步语句（比如setTimeout等）；
2. 全局Script代码执行完毕后，执行栈会清空；
3. 从微队列中取出位于队首的回调任务，放入执行栈中执行，执行完后微队列长度减1；
4. 继续循环取出位于微队列的任务，放入执行栈中执行，以此类推，直到直到把微任务执行完毕。注意，如果
5. 在执行微任务的过程中，又产生了微任务，那么会加入到微队列的末尾，也会在这个周期被调用执行；
6. 微队列中的所有微任务都执行完毕，此时微队列为空队列，执行栈也为空；
7. 取出宏队列中的任务，放入执行栈中执行；
8. 执行完毕后，执行栈为空；
9. 重复第3-7个步骤；

# 第九题：this指向
```js
function fun(n, o) {
    console.log(o);
    return {
        fun(m) {
            return fun(m, n);
        }
    }
}

var a = fun(0); // ?
a.fun(1); // ?
a.fun(2); // ?
a.fun(3); // ?
var b = fun(0).fun(1).fun(2).fun(3); // ?
var c = fun(0).fun(1); // ?
c.fun(2); // ?
c.fun(3); // ?

```
# 第十题：数组去重
```js
let arr = [1,2,3,4,4,5,3,3,2,1]
let arrFilter = arr.filter((item,i) => {
    if( arr.indexOf(item) == i){
        return item
    }
})
console.log(arrFilter)
```
