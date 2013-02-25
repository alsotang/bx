define(function (require, exports, module) {
    var Backbone = require('backbone'),
        $ = require('zepto'),
        _ = require('underscore'),
        mtop = require('../common/mtopForAllspark.js'),
        //base64 = require('base64'),
        h5_comm = require('h5_comm'),
        h5_cache = require('h5_cache'),
        cookie = require('cookie');

    /**
     * 个人信息页面
     */
    return Backbone.Model.extend({

        /**
         * 获取首页数据：
         *
         * @param param.curPage  页码
         * @param param.type 列表类型
         *             2. 关注列表 acc
         *             1. 推荐 rec
         */
        getPageData:function (param) {

            var self = this;

            param || (param = {});
            var type = param.type || 1;

            var pageParam = _.clone(mtop.pageParam);
            _.extend(pageParam, param);

            delete pageParam.type;

            console.log(pageParam);

            if (2 == type) {
                mtop.my(
                    pageParam, function (accResult) {
                        self.set("myAttention", accResult);
                    });

            } else {
                mtop.recommends(pageParam, function (recResult) {
                    self.set("recommends", recResult);
                })

            }

        }

    });
});