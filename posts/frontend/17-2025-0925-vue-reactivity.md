---
title: "Vue 数据响应式原理与双向绑定实现"
date: "2025-09-25"
description: "深入解析 Vue 数据响应式系统的底层实现原理，包括 Object.defineProperty、Proxy、依赖收集、派发更新和双向绑定机制"
tags: ["Vue", "响应式", "双向绑定", "Proxy", "Object.defineProperty", "依赖收集"]
---

# Vue 数据响应式原理与双向绑定实现

## 响应式系统概述

### 什么是响应式

**响应式编程的核心思想**:
```javascript
// 传统命令式编程
let a = 1;
let b = 2;
let c = a + b; // c = 3

a = 2;
console.log(c); // 仍然是 3，需要手动更新

// 响应式编程
let a = ref(1);
let b = ref(2);
let c = computed(() => a.value + b.value); // c = 3

a.value = 2;
console.log(c.value); // 自动更新为 4

/*
响应式系统的核心特征：
1. 数据变化时，依赖该数据的计算会自动重新执行
2. 视图会自动更新以反映数据的变化
3. 开发者只需关注数据本身，不需要手动管理更新
*/
```

### Vue 响应式系统架构

```javascript
// Vue 响应式系统的核心组件
/*
┌─────────────────────────────────────────────────────────┐
│                    Vue 响应式系统                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Observer  │    │   Watcher   │    │   Compiler  │  │
│  │  数据劫持    │    │  依赖收集    │    │  模板编译    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                   │                   │        │
│         ▼                   ▼                   ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │defineProperty│    │    Dep     │    │  Directive  │  │
│  │   / Proxy   │    │  依赖管理    │    │   指令系统   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────┘

工作流程：
1. Observer 劫持数据的 getter/setter
2. Compiler 编译模板，创建 Watcher
3. Watcher 访问数据时触发 getter，进行依赖收集
4. 数据变化时触发 setter，通知所有依赖更新
*/

// 响应式系统的基本实现
class ReactiveSystem {
  constructor() {
    this.targetMap = new WeakMap(); // 存储依赖关系
    this.activeEffect = null;       // 当前活跃的副作用函数
  }
  
  // 创建响应式对象
  reactive(target) {
    return new Proxy(target, {
      get: (target, key, receiver) => {
        // 依赖收集
        this.track(target, key);
        return Reflect.get(target, key, receiver);
      },
      
      set: (target, key, value, receiver) => {
        const result = Reflect.set(target, key, value, receiver);
        // 派发更新
        this.trigger(target, key);
        return result;
      }
    });
  }
  
  // 依赖收集
  track(target, key) {
    if (!this.activeEffect) return;
    
    let depsMap = this.targetMap.get(target);
    if (!depsMap) {
      this.targetMap.set(target, (depsMap = new Map()));
    }
    
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    
    dep.add(this.activeEffect);
  }
  
  // 派发更新
  trigger(target, key) {
    const depsMap = this.targetMap.get(target);
    if (!depsMap) return;
    
    const dep = depsMap.get(key);
    if (dep) {
      dep.forEach(effect => effect());
    }
  }
  
  // 副作用函数
  effect(fn) {
    this.activeEffect = fn;
    fn(); // 立即执行，触发依赖收集
    this.activeEffect = null;
  }
}
```

## Vue 2 响应式实现

### Object.defineProperty 实现

```javascript
// Vue 2 响应式核心实现
class Vue2Observer {
  constructor(data) {
    this.data = data;
    this.walk(data);
  }
  
  // 遍历对象属性
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      this.defineReactive(obj, keys[i]);
    }
  }
  
  // 定义响应式属性
  defineReactive(obj, key, val) {
    const dep = new Dep(); // 每个属性对应一个依赖收集器
    
    // 递归处理嵌套对象
    val = val || obj[key];
    let childOb = this.observe(val);
    
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      
      get: function reactiveGetter() {
        console.log(`访问属性: ${key}`);
        
        // 依赖收集
        if (Dep.target) {
          dep.depend();
          
          // 嵌套对象的依赖收集
          if (childOb) {
            childOb.dep.depend();
            
            // 数组的特殊处理
            if (Array.isArray(val)) {
              this.dependArray(val);
            }
          }
        }
        
        return val;
      },
      
      set: function reactiveSetter(newVal) {
        console.log(`设置属性: ${key} = ${newVal}`);
        
        if (newVal === val) return;
        
        val = newVal;
        
        // 新值也需要观察
        childOb = this.observe(newVal);
        
        // 派发更新
        dep.notify();
      }
    });
  }
  
  // 观察值
  observe(value) {
    if (!value || typeof value !== 'object') {
      return;
    }
    
    let ob;
    if (value.__ob__ && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else {
      ob = new Observer(value);
    }
    
    return ob;
  }
  
  // 数组依赖收集
  dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        this.dependArray(e);
      }
    }
  }
}

// 依赖收集器
class Dep {
  constructor() {
    this.id = ++Dep.uid;
    this.subs = []; // 订阅者列表
  }
  
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }
  
  // 移除订阅者
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  
  // 依赖收集
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  
  // 通知更新
  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

Dep.target = null; // 当前正在收集依赖的 Watcher
Dep.uid = 0;

// 观察者 (Watcher)
class Watcher {
  constructor(vm, expOrFn, cb, options = {}) {
    this.vm = vm;
    this.cb = cb;
    this.id = ++Watcher.uid;
    this.active = true;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    
    // 解析表达式
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = this.parsePath(expOrFn);
    }
    
    this.value = this.get();
  }
  
  // 获取值并收集依赖
  get() {
    Dep.target = this; // 设置当前 Watcher
    
    let value;
    const vm = this.vm;
    
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      throw e;
    } finally {
      Dep.target = null; // 清除当前 Watcher
      this.cleanupDeps();
    }
    
    return value;
  }
  
  // 添加依赖
  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
  
  // 清理依赖
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }
  
  // 更新
  update() {
    const oldValue = this.value;
    this.value = this.get();
    
    if (this.value !== oldValue || 
        (typeof this.value === 'object' && this.value !== null)) {
      this.cb.call(this.vm, this.value, oldValue);
    }
  }
  
  // 解析路径
  parsePath(path) {
    const segments = path.split('.');
    return function(obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj) return;
        obj = obj[segments[i]];
      }
      return obj;
    };
  }
}

Watcher.uid = 0;
```

### 数组响应式处理

```javascript
// Vue 2 数组响应式实现
class ArrayObserver {
  constructor() {
    // 数组原型方法
    const arrayProto = Array.prototype;
    this.arrayMethods = Object.create(arrayProto);
    
    // 需要拦截的数组方法
    const methodsToPatch = [
      'push', 'pop', 'shift', 'unshift',
      'splice', 'sort', 'reverse'
    ];
    
    methodsToPatch.forEach(method => {
      this.patchArrayMethod(method);
    });
  }
  
  // 拦截数组方法
  patchArrayMethod(method) {
    const original = Array.prototype[method];
    
    Object.defineProperty(this.arrayMethods, method, {
      value: function mutator(...args) {
        console.log(`数组方法调用: ${method}`);
        
        // 执行原始方法
        const result = original.apply(this, args);
        
        // 获取观察者实例
        const ob = this.__ob__;
        let inserted;
        
        // 处理新增元素
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
            break;
        }
        
        // 观察新增元素
        if (inserted) ob.observeArray(inserted);
        
        // 派发更新
        ob.dep.notify();
        
        return result;
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  
  // 观察数组
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}

// 使用示例
const arrayObserver = new ArrayObserver();

function observe(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  
  if (Array.isArray(value)) {
    // 设置数组的原型
    value.__proto__ = arrayObserver.arrayMethods;
    arrayObserver.observeArray(value);
  } else {
    new Vue2Observer(value);
  }
}

// 测试数组响应式
const data = {
  list: [1, 2, 3]
};

observe(data);

// 创建 Watcher 监听数组变化
new Watcher(null, () => data.list, (newVal, oldVal) => {
  console.log('数组发生变化:', newVal);
});

data.list.push(4); // 触发更新
data.list.splice(1, 1, 'new'); // 触发更新
```

## Vue 3 响应式实现

### Proxy 实现

```javascript
// Vue 3 响应式核心实现
class Vue3Reactivity {
  constructor() {
    this.targetMap = new WeakMap();
    this.activeEffect = null;
    this.effectStack = [];
  }
  
  // 创建响应式对象
  reactive(target) {
    if (target && target.__v_isReactive) {
      return target;
    }
    
    return this.createReactiveObject(target, false, this.mutableHandlers);
  }
  
  // 创建只读响应式对象
  readonly(target) {
    return this.createReactiveObject(target, true, this.readonlyHandlers);
  }
  
  // 创建浅层响应式对象
  shallowReactive(target) {
    return this.createReactiveObject(target, false, this.shallowReactiveHandlers);
  }
  
  // 创建响应式对象的核心方法
  createReactiveObject(target, isReadonly, baseHandlers) {
    if (typeof target !== 'object' || target === null) {
      return target;
    }
    
    const proxy = new Proxy(target, baseHandlers);
    
    // 标记为响应式对象
    Object.defineProperty(proxy, '__v_isReactive', {
      value: !isReadonly,
      enumerable: false
    });
    
    Object.defineProperty(proxy, '__v_isReadonly', {
      value: isReadonly,
      enumerable: false
    });
    
    return proxy;
  }
  
  // 可变对象处理器
  get mutableHandlers() {
    return {
      get: (target, key, receiver) => {
        // 特殊 key 处理
        if (key === '__v_isReactive') return true;
        if (key === '__v_isReadonly') return false;
        if (key === '__v_raw') return target;
        
        const result = Reflect.get(target, key, receiver);
        
        // 依赖收集
        this.track(target, 'get', key);
        
        // 嵌套对象的响应式处理
        if (typeof result === 'object' && result !== null) {
          return this.reactive(result);
        }
        
        return result;
      },
      
      set: (target, key, value, receiver) => {
        const oldValue = target[key];
        const hadKey = Object.prototype.hasOwnProperty.call(target, key);
        const result = Reflect.set(target, key, value, receiver);
        
        // 避免原型链上的设置触发更新
        if (target === receiver.__v_raw) {
          if (!hadKey) {
            // 新增属性
            this.trigger(target, 'add', key, value);
          } else if (value !== oldValue) {
            // 修改属性
            this.trigger(target, 'set', key, value, oldValue);
          }
        }
        
        return result;
      },
      
      deleteProperty: (target, key) => {
        const hadKey = Object.prototype.hasOwnProperty.call(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);
        
        if (result && hadKey) {
          this.trigger(target, 'delete', key, undefined, oldValue);
        }
        
        return result;
      },
      
      has: (target, key) => {
        const result = Reflect.has(target, key);
        this.track(target, 'has', key);
        return result;
      },
      
      ownKeys: (target) => {
        this.track(target, 'iterate', Array.isArray(target) ? 'length' : Symbol('iterate'));
        return Reflect.ownKeys(target);
      }
    };
  }
  
  // 只读对象处理器
  get readonlyHandlers() {
    return {
      get: (target, key, receiver) => {
        if (key === '__v_isReactive') return false;
        if (key === '__v_isReadonly') return true;
        if (key === '__v_raw') return target;
        
        const result = Reflect.get(target, key, receiver);
        
        // 只读对象不需要依赖收集
        
        if (typeof result === 'object' && result !== null) {
          return this.readonly(result);
        }
        
        return result;
      },
      
      set: () => {
        console.warn('Set operation on key failed: target is readonly.');
        return true;
      },
      
      deleteProperty: () => {
        console.warn('Delete operation on key failed: target is readonly.');
        return true;
      }
    };
  }
  
  // 依赖收集
  track(target, type, key) {
    if (!this.activeEffect) return;
    
    let depsMap = this.targetMap.get(target);
    if (!depsMap) {
      this.targetMap.set(target, (depsMap = new Map()));
    }
    
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    
    if (!dep.has(this.activeEffect)) {
      dep.add(this.activeEffect);
      this.activeEffect.deps.push(dep);
    }
  }
  
  // 派发更新
  trigger(target, type, key, newValue, oldValue) {
    const depsMap = this.targetMap.get(target);
    if (!depsMap) return;
    
    const effects = new Set();
    
    // 收集需要执行的 effect
    const add = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach(effect => {
          if (effect !== this.activeEffect) {
            effects.add(effect);
          }
        });
      }
    };
    
    // 处理不同类型的操作
    if (type === 'clear') {
      depsMap.forEach(add);
    } else if (key === 'length' && Array.isArray(target)) {
      depsMap.forEach((dep, key) => {
        if (key === 'length' || key >= newValue) {
          add(dep);
        }
      });
    } else {
      // SET | ADD | DELETE
      if (key !== void 0) {
        add(depsMap.get(key));
      }
      
      // 处理迭代相关的依赖
      switch (type) {
        case 'add':
          if (!Array.isArray(target)) {
            add(depsMap.get(Symbol('iterate')));
          } else if (Number.isInteger(key)) {
            add(depsMap.get('length'));
          }
          break;
        case 'delete':
          if (!Array.isArray(target)) {
            add(depsMap.get(Symbol('iterate')));
          }
          break;
        case 'set':
          if (Array.isArray(target) && Number.isInteger(key)) {
            add(depsMap.get('length'));
          }
          break;
      }
    }
    
    // 执行所有 effect
    effects.forEach(effect => {
      if (effect.options.scheduler) {
        effect.options.scheduler(effect);
      } else {
        effect();
      }
    });
  }
  
  // 副作用函数
  effect(fn, options = {}) {
    const effect = this.createReactiveEffect(fn, options);
    
    if (!options.lazy) {
      effect();
    }
    
    return effect;
  }
  
  // 创建响应式副作用
  createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
      if (!effect.active) return;
      
      if (!this.effectStack.includes(effect)) {
        this.cleanup(effect);
        
        try {
          this.effectStack.push(effect);
          this.activeEffect = effect;
          return fn();
        } finally {
          this.effectStack.pop();
          this.activeEffect = this.effectStack[this.effectStack.length - 1];
        }
      }
    }.bind(this);
    
    effect.id = ++this.uid;
    effect.active = true;
    effect.deps = [];
    effect.options = options;
    
    return effect;
  }
  
  // 清理副作用的依赖
  cleanup(effect) {
    const { deps } = effect;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
      }
      deps.length = 0;
    }
  }
  
  // ref 实现
  ref(value) {
    return this.createRef(value, false);
  }
  
  // 浅层 ref
  shallowRef(value) {
    return this.createRef(value, true);
  }
  
  // 创建 ref 对象
  createRef(rawValue, shallow) {
    if (this.isRef(rawValue)) {
      return rawValue;
    }
    
    return new RefImpl(rawValue, shallow, this);
  }
  
  // 判断是否为 ref
  isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }
  
  // computed 实现
  computed(getterOrOptions) {
    let getter, setter;
    
    if (typeof getterOrOptions === 'function') {
      getter = getterOrOptions;
      setter = () => {
        console.warn('Write operation failed: computed value is readonly');
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    
    return new ComputedRefImpl(getter, setter, this);
  }
}

// Ref 实现
class RefImpl {
  constructor(value, shallow, reactivity) {
    this._shallow = shallow;
    this._reactivity = reactivity;
    this.__v_isRef = true;
    this._rawValue = shallow ? value : this.toRaw(value);
    this._value = shallow ? value : reactivity.reactive(value);
  }
  
  get value() {
    this._reactivity.track(this, 'get', 'value');
    return this._value;
  }
  
  set value(newVal) {
    newVal = this._shallow ? newVal : this.toRaw(newVal);
    if (newVal !== this._rawValue) {
      this._rawValue = newVal;
      this._value = this._shallow ? newVal : this._reactivity.reactive(newVal);
      this._reactivity.trigger(this, 'set', 'value', newVal);
    }
  }
  
  toRaw(observed) {
    return (observed && observed.__v_raw) || observed;
  }
}

// Computed 实现
class ComputedRefImpl {
  constructor(getter, setter, reactivity) {
    this._setter = setter;
    this._reactivity = reactivity;
    this.__v_isRef = true;
    this.__v_isReadonly = true;
    
    this._dirty = true;
    this._value = undefined;
    
    this.effect = reactivity.effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          reactivity.trigger(this, 'set', 'value');
        }
      }
    });
  }
  
  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }
    this._reactivity.track(this, 'get', 'value');
    return this._value;
  }
  
  set value(newValue) {
    this._setter(newValue);
  }
}
```

## 双向绑定实现

### v-model 原理

```javascript
// v-model 双向绑定实现
class VModelDirective {
  constructor(el, binding, vnode) {
    this.el = el;
    this.binding = binding;
    this.vnode = vnode;
    
    this.setupVModel();
  }
  
  setupVModel() {
    const tag = this.el.tagName.toLowerCase();
    
    switch (tag) {
      case 'input':
        this.setupInputVModel();
        break;
      case 'textarea':
        this.setupTextareaVModel();
        break;
      case 'select':
        this.setupSelectVModel();
        break;
      default:
        this.setupComponentVModel();
    }
  }
  
  // Input 元素的 v-model
  setupInputVModel() {
    const type = this.el.type;
    
    if (type === 'checkbox') {
      this.setupCheckboxVModel();
    } else if (type === 'radio') {
      this.setupRadioVModel();
    } else {
      this.setupTextInputVModel();
    }
  }
  
  // 文本输入框 v-model
  setupTextInputVModel() {
    const { value, callback } = this.binding;
    
    // 设置初始值
    this.el.value = value;
    
    // 监听输入事件
    const composing = { isComposing: false };
    
    this.el.addEventListener('compositionstart', () => {
      composing.isComposing = true;
    });
    
    this.el.addEventListener('compositionend', (e) => {
      composing.isComposing = false;
      this.handleInput(e, callback);
    });
    
    this.el.addEventListener('input', (e) => {
      if (!composing.isComposing) {
        this.handleInput(e, callback);
      }
    });
    
    // 处理修饰符
    if (this.binding.modifiers.lazy) {
      this.el.addEventListener('change', (e) => {
        this.handleInput(e, callback);
      });
    }
    
    if (this.binding.modifiers.trim) {
      this.el.addEventListener('blur', (e) => {
        this.el.value = this.el.value.trim();
        this.handleInput(e, callback);
      });
    }
  }
  
  // 处理输入事件
  handleInput(e, callback) {
    let value = e.target.value;
    
    // 处理修饰符
    if (this.binding.modifiers.number) {
      value = this.toNumber(value);
    }
    
    if (this.binding.modifiers.trim) {
      value = value.trim();
    }
    
    callback(value);
  }
  
  // 复选框 v-model
  setupCheckboxVModel() {
    const { value, callback } = this.binding;
    
    if (Array.isArray(value)) {
      // 多个复选框绑定到数组
      this.el.checked = value.includes(this.el.value);
      
      this.el.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const val = e.target.value;
        const newValue = [...value];
        
        if (checked) {
          if (!newValue.includes(val)) {
            newValue.push(val);
          }
        } else {
          const index = newValue.indexOf(val);
          if (index > -1) {
            newValue.splice(index, 1);
          }
        }
        
        callback(newValue);
      });
    } else {
      // 单个复选框绑定到布尔值
      this.el.checked = !!value;
      
      this.el.addEventListener('change', (e) => {
        callback(e.target.checked);
      });
    }
  }
  
  // 单选框 v-model
  setupRadioVModel() {
    const { value, callback } = this.binding;
    
    this.el.checked = value === this.el.value;
    
    this.el.addEventListener('change', (e) => {
      if (e.target.checked) {
        callback(e.target.value);
      }
    });
  }
  
  // 选择框 v-model
  setupSelectVModel() {
    const { value, callback } = this.binding;
    
    this.setSelectValue(value);
    
    this.el.addEventListener('change', (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions);
      
      if (this.el.multiple) {
        const values = selectedOptions.map(option => option.value);
        callback(values);
      } else {
        callback(selectedOptions[0] ? selectedOptions[0].value : '');
      }
    });
  }
  
  // 设置选择框的值
  setSelectValue(value) {
    const options = Array.from(this.el.options);
    
    if (this.el.multiple && Array.isArray(value)) {
      options.forEach(option => {
        option.selected = value.includes(option.value);
      });
    } else {
      options.forEach(option => {
        option.selected = option.value === value;
      });
    }
  }
  
  // 组件 v-model
  setupComponentVModel() {
    const { value, callback } = this.binding;
    const { componentInstance } = this.vnode;
    
    if (componentInstance) {
      // 设置 prop
      const prop = componentInstance.$options.model?.prop || 'value';
      componentInstance.$props[prop] = value;
      
      // 监听事件
      const event = componentInstance.$options.model?.event || 'input';
      componentInstance.$on(event, callback);
    }
  }
  
  // 转换为数字
  toNumber(val) {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  }
}

// 自定义组件的 v-model
class CustomComponent {
  constructor() {
    this.model = {
      prop: 'value',
      event: 'change'
    };
  }
  
  // 组件模板
  template() {
    return `
      <div class="custom-input">
        <input 
          :value="value" 
          @input="handleInput"
          @blur="handleBlur"
        />
      </div>
    `;
  }
  
  props() {
    return {
      value: {
        type: String,
        default: ''
      }
    };
  }
  
  methods() {
    return {
      handleInput(e) {
        // 实时更新
        this.$emit('input', e.target.value);
      },
      
      handleBlur(e) {
        // 失焦时触发 change 事件
        this.$emit('change', e.target.value);
      }
    };
  }
}

// 使用示例
/*
<template>
  <div>
    <!-- 基础用法 -->
    <input v-model="message" />
    
    <!-- 修饰符 -->
    <input v-model.lazy="message" />
    <input v-model.number="age" />
    <input v-model.trim="message" />
    
    <!-- 复选框 -->
    <input type="checkbox" v-model="checked" />
    <input type="checkbox" value="A" v-model="checkedNames" />
    <input type="checkbox" value="B" v-model="checkedNames" />
    
    <!-- 单选框 -->
    <input type="radio" value="A" v-model="picked" />
    <input type="radio" value="B" v-model="picked" />
    
    <!-- 选择框 -->
    <select v-model="selected">
      <option value="A">A</option>
      <option value="B">B</option>
    </select>
    
    <!-- 自定义组件 -->
    <custom-component v-model="customValue" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '',
      age: 0,
      checked: false,
      checkedNames: [],
      picked: '',
      selected: '',
      customValue: ''
    };
  }
};
</script>
*/
```

### 表单验证与双向绑定

```javascript
// 表单验证与双向绑定结合
class FormValidator {
  constructor() {
    this.rules = new Map();
    this.errors = new Map();
    this.reactivity = new Vue3Reactivity();
  }
  
  // 创建表单字段
  createField(name, initialValue, rules = []) {
    const field = this.reactivity.ref(initialValue);
    
    // 存储验证规则
    this.rules.set(name, rules);
    this.errors.set(name, this.reactivity.ref([]));
    
    // 监听字段变化，自动验证
    this.reactivity.effect(() => {
      const value = field.value;
      this.validateField(name, value);
    });
    
    return {
      value: field,
      errors: this.errors.get(name),
      
      // 手动验证
      validate: () => this.validateField(name, field.value),
      
      // 清除错误
      clearErrors: () => {
        this.errors.get(name).value = [];
      }
    };
  }
  
  // 验证单个字段
  validateField(name, value) {
    const rules = this.rules.get(name) || [];
    const errors = [];
    
    for (const rule of rules) {
      const result = rule.validator(value);
      if (result !== true) {
        errors.push(result || rule.message);
      }
    }
    
    this.errors.get(name).value = errors;
    return errors.length === 0;
  }
  
  // 验证整个表单
  validateForm() {
    let isValid = true;
    
    for (const [name] of this.rules) {
      const fieldValid = this.validateField(name, this.getFieldValue(name));
      if (!fieldValid) {
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  // 获取字段值
  getFieldValue(name) {
    // 这里需要根据实际情况获取字段值
    return '';
  }
  
  // 预定义验证规则
  static rules = {
    required: (message = '此字段为必填项') => ({
      validator: (value) => {
        if (value === null || value === undefined || value === '') {
          return message;
        }
        return true;
      },
      message
    }),
    
    minLength: (min, message) => ({
      validator: (value) => {
        if (typeof value === 'string' && value.length < min) {
          return message || `最少需要 ${min} 个字符`;
        }
        return true;
      },
      message
    }),
    
    maxLength: (max, message) => ({
      validator: (value) => {
        if (typeof value === 'string' && value.length > max) {
          return message || `最多允许 ${max} 个字符`;
        }
        return true;
      },
      message
    }),
    
    email: (message = '请输入有效的邮箱地址') => ({
      validator: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return message;
        }
        return true;
      },
      message
    }),
    
    pattern: (regex, message) => ({
      validator: (value) => {
        if (value && !regex.test(value)) {
          return message;
        }
        return true;
      },
      message
    })
  };
}

// 使用示例
const validator = new FormValidator();

// 创建表单字段
const username = validator.createField('username', '', [
  FormValidator.rules.required(),
  FormValidator.rules.minLength(3),
  FormValidator.rules.maxLength(20)
]);

const email = validator.createField('email', '', [
  FormValidator.rules.required(),
  FormValidator.rules.email()
]);

const password = validator.createField('password', '', [
  FormValidator.rules.required(),
  FormValidator.rules.minLength(8),
  FormValidator.rules.pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '密码必须包含大小写字母和数字'
  )
]);

// 在组件中使用
/*
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <input 
        v-model="username.value.value" 
        placeholder="用户名"
        :class="{ error: username.errors.value.length > 0 }"
      />
      <div v-if="username.errors.value.length > 0" class="error-messages">
        <div v-for="error in username.errors.value" :key="error">
          {{ error }}
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <input 
        v-model="email.value.value" 
        type="email"
        placeholder="邮箱"
        :class="{ error: email.errors.value.length > 0 }"
      />
      <div v-if="email.errors.value.length > 0" class="error-messages">
        <div v-for="error in email.errors.value" :key="error">
          {{ error }}
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <input 
        v-model="password.value.value" 
        type="password"
        placeholder="密码"
        :class="{ error: password.errors.value.length > 0 }"
      />
      <div v-if="password.errors.value.length > 0" class="error-messages">
        <div v-for="error in password.errors.value" :key="error">
          {{ error }}
        </div>
      </div>
    </div>
    
    <button type="submit">提交</button>
  </form>
</template>

<script>
export default {
  setup() {
    const handleSubmit = () => {
      if (validator.validateForm()) {
        console.log('表单验证通过');
        // 提交表单
      } else {
        console.log('表单验证失败');
      }
    };
    
    return {
      username,
      email,
      password,
      handleSubmit
    };
  }
};
</script>
*/
```

## 性能优化

### 响应式性能优化

```javascript
// 响应式性能优化策略
class ReactivityOptimizer {
  constructor() {
    this.optimizations = {
      // 浅层响应式
      shallowReactive: true,
      
      // 只读优化
      readonly: true,
      
      // 标记非响应式
      markRaw: true,
      
      // 批量更新
      batchUpdates: true
    };
  }
  
  // 浅层响应式优化
  optimizeWithShallow(data) {
    // 对于大型对象，只对第一层属性进行响应式处理
    return shallowReactive({
      // 大量数据
      largeList: data.largeList, // 不会深度响应式
      
      // 需要响应式的字段
      activeItem: reactive(data.activeItem)
    });
  }
  
  // 只读优化
  optimizeWithReadonly(config) {
    // 配置数据通常不需要修改，使用 readonly 可以避免不必要的响应式开销
    return readonly(config);
  }
  
  // 标记非响应式数据
  optimizeWithMarkRaw(data) {
    return reactive({
      // 响应式数据
      count: 0,
      
      // 非响应式数据（如第三方库实例）
      chart: markRaw(new Chart()),
      
      // 大型不可变数据
      staticData: markRaw(data.staticData)
    });
  }
  
  // 批量更新优化
  batchUpdates(updates) {
    // Vue 3 自动批量更新，但可以手动控制
    nextTick(() => {
      updates.forEach(update => update());
    });
  }
  
  // 计算属性缓存优化
  optimizeComputed() {
    const expensiveData = ref([]);
    
    // 使用 computed 缓存昂贵的计算
    const processedData = computed(() => {
      console.log('执行昂贵的计算'); // 只在依赖变化时执行
      
      return expensiveData.value
        .filter(item => item.active)
        .map(item => ({
          ...item,
          processed: true
        }))
        .sort((a, b) => a.priority - b.priority);
    });
    
    return { expensiveData, processedData };
  }
  
  // 大列表优化
  optimizeLargeList() {
    const allItems = ref([]);
    const pageSize = 50;
    const currentPage = ref(0);
    
    // 虚拟滚动 - 只渲染可见项
    const visibleItems = computed(() => {
      const start = currentPage.value * pageSize;
      const end = start + pageSize;
      return allItems.value.slice(start, end);
    });
    
    // 分页加载
    const loadMore = () => {
      currentPage.value++;
    };
    
    return {
      allItems,
      visibleItems,
      loadMore,
      hasMore: computed(() => 
        (currentPage.value + 1) * pageSize < allItems.value.length
      )
    };
  }
}

// 内存泄漏防护
class MemoryLeakPrevention {
  constructor() {
    this.cleanupFunctions = new Set();
  }
  
  // 自动清理副作用
  autoCleanupEffect(effectFn) {
    const stop = effect(effectFn);
    
    // 组件卸载时自动清理
    onUnmounted(() => {
      stop();
    });
    
    return stop;
  }
  
  // 清理事件监听器
  setupEventListener(target, event, handler) {
    target.addEventListener(event, handler);
    
    const cleanup = () => {
      target.removeEventListener(event, handler);
    };
    
    this.cleanupFunctions.add(cleanup);
    
    onUnmounted(() => {
      cleanup();
      this.cleanupFunctions.delete(cleanup);
    });
    
    return cleanup;
  }
  
  // 清理定时器
  setupTimer(callback, delay) {
    const timerId = setInterval(callback, delay);
    
    const cleanup = () => {
      clearInterval(timerId);
    };
    
    this.cleanupFunctions.add(cleanup);
    
    onUnmounted(() => {
      cleanup();
      this.cleanupFunctions.delete(cleanup);
    });
    
    return cleanup;
  }
  
  // 手动清理所有资源
  cleanup() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions.clear();
  }
}
```

## 最佳实践

### 响应式设计原则

```javascript
// 响应式系统最佳实践
const bestPractices = {
  // 1. 合理选择响应式 API
  chooseRightAPI: {
    // 基本数据类型使用 ref
    count: ref(0),
    message: ref(''),
    
    // 对象使用 reactive
    user: reactive({
      name: '',
      age: 0
    }),
    
    // 不需要修改的数据使用 readonly
    config: readonly({
      apiUrl: 'https://api.example.com'
    }),
    
    // 大型对象使用 shallowReactive
    largeData: shallowReactive({
      items: [] // 只有 items 本身是响应式的
    })
  },
  
  // 2. 避免不必要的响应式
  avoidUnnecessaryReactivity: {
    // ❌ 错误：对第三方库实例进行响应式处理
    // chart: reactive(new Chart())
    
    // ✅ 正确：使用 markRaw 标记
    chart: markRaw(new Chart()),
    
    // ❌ 错误：对大型静态数据进行响应式处理
    // staticData: reactive(largeStaticData)
    
    // ✅ 正确：使用 markRaw 或直接使用
    staticData: markRaw(largeStaticData)
  },
  
  // 3. 正确使用 computed
  useComputedCorrectly: {
    // ✅ 正确：缓存昂贵的计算
    expensiveComputed: computed(() => {
      return heavyCalculation(someReactiveData.value);
    }),
    
    // ❌ 错误：在 computed 中执行副作用
    // badComputed: computed(() => {
    //   console.log('side effect'); // 不应该有副作用
    //   return someValue.value;
    // })
    
    // ✅ 正确：使用 watchEffect 执行副作用
    sideEffect: watchEffect(() => {
      console.log('watching:', someValue.value);
    })
  },
  
  // 4. 合理使用 watch
  useWatchCorrectly: {
    // 监听单个值
    watchSingle: watch(count, (newVal, oldVal) => {
      console.log(`count changed from ${oldVal} to ${newVal}`);
    }),
    
    // 监听多个值
    watchMultiple: watch([count, message], ([newCount, newMessage]) => {
      console.log('Multiple values changed');
    }),
    
    // 深度监听
    watchDeep: watch(user, (newUser) => {
      console.log('User object changed');
    }, { deep: true }),
    
    // 立即执行
    watchImmediate: watch(count, (val) => {
      console.log('Current count:', val);
    }, { immediate: true })
  }
};

// 性能监控
class ReactivityPerformanceMonitor {
  constructor() {
    this.metrics = {
      effectCount: 0,
      triggerCount: 0,
      computedCacheHits: 0,
      computedCacheMisses: 0
    };
  }
  
  // 监控 effect 执行
  monitorEffect(effectFn) {
    return effect(() => {
      const start = performance.now();
      this.metrics.effectCount++;
      
      const result = effectFn();
      
      const duration = performance.now() - start;
      if (duration > 16) { // 超过一帧的时间
        console.warn(`Slow effect detected: ${duration}ms`);
      }
      
      return result;
    });
  }
  
  // 监控计算属性性能
  monitorComputed(computedFn) {
    let cached = false;
    
    return computed(() => {
      if (cached) {
        this.metrics.computedCacheHits++;
      } else {
        this.metrics.computedCacheMisses++;
        cached = true;
      }
      
      const start = performance.now();
      const result = computedFn();
      const duration = performance.now() - start;
      
      if (duration > 5) {
        console.warn(`Slow computed detected: ${duration}ms`);
      }
      
      return result;
    });
  }
  
  // 获取性能报告
  getPerformanceReport() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.computedCacheHits / 
        (this.metrics.computedCacheHits + this.metrics.computedCacheMisses)
    };
  }
}
```

## 总结

Vue 的数据响应式系统是其核心特性之一，经历了从 Vue 2 的 `Object.defineProperty` 到 Vue 3 的 `Proxy` 的重大升级：

### 核心特性
1. **自动依赖收集**: 无需手动管理依赖关系
2. **精确更新**: 只更新真正发生变化的部分
3. **双向绑定**: 数据与视图的自动同步
4. **性能优化**: 多种优化策略和 API

### Vue 2 vs Vue 3
- **Vue 2**: 基于 `Object.defineProperty`，有一定局限性
- **Vue 3**: 基于 `Proxy`，功能更强大，性能更好

### 最佳实践
1. **合理选择 API**: ref、reactive、readonly、shallowReactive
2. **避免过度响应式**: 使用 markRaw 标记非响应式数据
3. **性能优化**: 计算属性缓存、批量更新、虚拟滚动
4. **内存管理**: 及时清理副作用和事件监听器

Vue 的响应式系统让开发者能够专注于业务逻辑，而不需要关心数据变化的检测和视图更新，大大提升了开发效率和用户体验。