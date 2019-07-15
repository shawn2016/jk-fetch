'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 基于[axios]{@link https://github.com/mzabriskie/axios}进行封装的ajax工具
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @example
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * // 引入
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * import * as fetch from 'path/to/promise-ajax';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @example
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * // 在项目的入口文件，根据项目需求，进行初始化
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * promiseAjax.init({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     setOptions(instance, isMock) {...},
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     onShowErrorTip(err, errorTip) {...},
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     onShowSuccessTip(response, successTip) {...},
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     isMock(url, data, method, options) {...},
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * })
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @example
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * // 发起get请求
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * this.setState({loading: true}); // 开始显示loading
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * const getAjax = promiseAjax.get('/users', {pageNum: 1, pageSize: 10});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * getAjax.then(res => console.log(res))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * .catch(err => console.log(err))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * .finally(() => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     this.setState({loading: false}); // 结束loading
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * // 可以打断请求
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * getAjax.cancel();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module ajax工具
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * */

// 扩展了 done 和 finally 方法


var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

require('./utils/promise-extends');

var _urlUtils = require('./utils/url-utils');

var _fetchDecorator = require('./fetchDecorator');

var _fetchDecorator2 = _interopRequireDefault(_fetchDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SxFetch = function () {
    function SxFetch() {
        _classCallCheck(this, SxFetch);

        this.singleGets = {};
        this.singlePosts = {};
        this.inject = _fetchDecorator2.default;

        /**
         * mockjs 使用的实例，可以与真实ajax请求实例区分开，
         * 用于正常请求和mock同时使用时，好区分；
         * 初始化init方法，通过isMock(url, data, method, options)函数，区分哪些请求需要mock，
         * 比如：url以约定'/mock'开头的请求，使用mock等方式。
         *
         * @example
         * // 配合mock使用
         * import MockAdapter from 'axios-mock-adapter';
         * import {mockInstance} from 'path/to/promise-ajax';
         * const mock = new MockAdapter(mockInstance);
         * mock.onGet('/success').reply(200, {
         *     msg: 'success',
         * });
         */
        this.axiosInstance = _axios2.default.create();
        this.mockInstance = _axios2.default.create();
        SxFetch._setOptions(this.axiosInstance);
        SxFetch._setOptions(this.mockInstance);

        this.defaults = this.axiosInstance.defaults;
        this.mockDefaults = this.mockInstance.defaults;
    }

    /**
     * 创建新的fetch实例，同时调用init方法初始化fetch配置。
     * @param  {Object} options 初始化配置
     * @return {SxFetch}  新的fetch实例
     */


    _createClass(SxFetch, [{
        key: 'create',
        value: function create() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var instance = new SxFetch();
            instance.init(options);
            return instance;
        }
    }, {
        key: '_onShowErrorTip',
        value: function _onShowErrorTip() {}
    }, {
        key: '_onShowSuccessTip',
        value: function _onShowSuccessTip() {}
    }, {
        key: '_isMock',
        value: function _isMock() {}
    }, {
        key: 'init',


        /**
         * 初始化promiseAjax，接受一个options参数，options的具体参数如下：
         *
         * @param {function} setOptions setOptions(instance[, isMock]){...} 设置axios实例属性，如果isMock为true，为mockInstance
         * @param {function} onShowErrorTip onShowErrorTip(err, errorTip){...} 如何显示errorTip
         * @param {function} onShowSuccessTip onShowSuccessTip(response, successTip){...} 如何显示successTip
         * @param {function} isMock isMock(url, data, method, options){...} 判断请求是否为mock请求
         */
        value: function init(_ref) {
            var _this = this;

            var _ref$setOptions = _ref.setOptions,
                setOptions = _ref$setOptions === undefined ? function () /* instance, isMock */{} : _ref$setOptions,
                _ref$onShowErrorTip = _ref.onShowErrorTip,
                onShowErrorTip = _ref$onShowErrorTip === undefined ? function () /* err, errorTip */{} : _ref$onShowErrorTip,
                _ref$onShowSuccessTip = _ref.onShowSuccessTip,
                onShowSuccessTip = _ref$onShowSuccessTip === undefined ? function () /* response, successTip */{} : _ref$onShowSuccessTip,
                _ref$isMock = _ref.isMock,
                isMock = _ref$isMock === undefined ? function () /* url, data, method, options */{} : _ref$isMock,
                _ref$headers = _ref.headers,
                headers = _ref$headers === undefined ? {} : _ref$headers,
                otherOptions = _objectWithoutProperties(_ref, ['setOptions', 'onShowErrorTip', 'onShowSuccessTip', 'isMock', 'headers']);

            setOptions(this.axiosInstance);
            setOptions(this.mockInstance, true); // isMock
            this._onShowErrorTip = onShowErrorTip;
            this._onShowSuccessTip = onShowSuccessTip;
            this._isMock = isMock;

            // 将其他axios配置添加到axios实例中。
            Object.keys(otherOptions).map(function (optKey) {
                _this.axiosInstance.defaults[optKey] = otherOptions[optKey];
                _this.mockInstance.defaults[optKey] = otherOptions[optKey];
            });

            // 将请求头配置添加到axios实例中。
            Object.keys(headers).map(function (headerKey) {
                _this.axiosInstance.defaults.headers[headerKey] = headers[headerKey];
                _this.mockInstance.defaults.headers[headerKey] = headers[headerKey];
            });
        }
    }, {
        key: 'fetch',
        value: function fetch(url, data) {
            var _this2 = this;

            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';
            var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var _options$successTip = options.successTip,
                successTip = _options$successTip === undefined ? false : _options$successTip,
                _options$errorTip = options.errorTip,
                errorTip = _options$errorTip === undefined ? method === 'get' ? '获取数据失败！' : '操作失败！' : _options$errorTip;

            var CancelToken = _axios2.default.CancelToken;
            var cancel = void 0;
            var isGet = method === 'get';
            var isMock = this._isMock(url, data, method, options);
            var axiosInstance = this.axiosInstance;

            if (isGet && !isMock) {
                url = (0, _urlUtils.mosaicUrl)(url, data);
                data = undefined;
            }
            if (isMock) {
                axiosInstance = this.mockInstance;
                axiosInstance.defaults.baseURL = '/';
            }
            var fetchPromise = new Promise(function (resolve, reject) {
                axiosInstance(_extends({
                    method: method,
                    url: url,
                    data: data,
                    cancelToken: new CancelToken(function (c) {
                        return cancel = c;
                    })
                }, options)).then(function (response) {
                    _this2._onShowSuccessTip(response, successTip);
                    resolve(response.data);
                }, function (err) {
                    var isCanceled = err && err.message && err.message.canceled;
                    if (isCanceled) return; // 如果是用户主动cancel，不做任何处理，不会触发任何函数
                    _this2._onShowErrorTip(err, errorTip);
                    reject(err);
                }).catch(function (error) {
                    reject(error);
                });
            });
            fetchPromise.cancel = function () {
                cancel({
                    canceled: true
                });
            };
            return fetchPromise;
        }

        /**
         * 发送一个get请求，一般用于查询操作
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据，正常请求会转换成query string 拼接到url后面
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */

    }, {
        key: 'get',
        value: function get(url, params, options) {
            return this.fetch(url, params, 'get', options);
        }

        /**
         * 发送一个post请求，一般用于添加操作
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */

    }, {
        key: 'post',
        value: function post(url, params, options) {
            return this.fetch(url, params, 'post', options);
        }

        /**
         * 发送一个put请求，一般用于更新操作
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */

    }, {
        key: 'put',
        value: function put(url, params, options) {
            return this.fetch(url, params, 'put', options);
        }

        /**
         * 发送一个patch请求，一般用于更新部分数据
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */

    }, {
        key: 'patch',
        value: function patch(url, params, options) {
            return this.fetch(url, params, 'patch', options);
        }

        /**
         * 发送一个delete请求，一般用于删除数据，params会被忽略（http协议中定义的）
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */

    }, {
        key: 'del',
        value: function del(url, params, options) {
            return this.fetch(url, params, 'delete', options);
        }
    }, {
        key: 'singleGet',

        /**
         * 发送新的相同url的get请求，历史未结束相同url请求就会被打断，同一个url请求，最终只会触发一次
         * 用于输入框，根据输入远程获取提示等场景
         *
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */
        value: function singleGet(url, params, options) {
            var oldFetch = this.singleGets[url];
            if (oldFetch) {
                oldFetch.cancel();
            }
            var singleFetch = this.fetch(url, params, 'get', options);
            this.singleGets[url] = singleFetch;
            return singleFetch;
        }
    }, {
        key: 'singlePost',

        /**
         * 发送新的相同url的post请求，历史未结束相同url请求就会被打断，同一个url请求，最终只会触发一次
         * 用于输入框，根据输入远程获取提示等场景
         *
         * @param {string} url 请求路径
         * @param {object} [params] 传输给后端的数据
         * @param {object} [options] axios 配置参数
         * @returns {Promise}
         */
        value: function singlePost(url, params, options) {
            var oldFetch = this.singlePosts[url];
            if (oldFetch) {
                oldFetch.cancel();
            }
            var singleFetch = this.fetch(url, params, 'post', options);
            this.singlePosts[url] = singleFetch;
            return singleFetch;
        }
        /**
         * 并发请求方法
         * @param  {Array} args fetch 请求数组
         * @return {Promise}
         */

    }, {
        key: 'all',
        value: function all(args) {
            return Promise.all(args);
        }

        /**
         * 装饰器方法
         * @type {function}
         */

    }], [{
        key: '_setOptions',
        value: function _setOptions(axiosInstance) {
            axiosInstance.defaults.timeout = 10000;
            axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            axiosInstance.defaults.baseURL = '/';
            // Add a request interceptor
            axiosInstance.interceptors.request.use(function (cfg) {
                // Do something before request is sent
                return cfg;
            }, function (error) {
                // Do something with request error
                return Promise.reject(error);
            });

            // Add a response interceptor
            axiosInstance.interceptors.response.use(function (response) {
                // Do something with response data
                return response;
            }, function (error) {
                // Do something with response error
                return Promise.reject(error);
            });
        }
    }]);

    return SxFetch;
}();

exports.default = SxFetch;