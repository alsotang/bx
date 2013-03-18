define(function (require, exports, module) {
    var Backbone = require('backbone'),
        $ = require('zepto'),
        _ = require('underscore'),
        mtop = require('../common/mtopForAllspark.js'),
        h5_comm = require('h5_comm'),
        cache = require('../common/cache'),
        refine = require('../common/refine.js');

    /**
     * 动态首页
     */
    var DynIndexModel = Backbone.Model.extend({

        /**
         * 私有对象，封装了简单的业务逻辑
         */
        _biz:{
            bannerUrl:"http://wapa.taobao.com/channel/rgn/mobile/h5-home.html?callback=?",
            banner:function (fun) {
                var banner = cache.getIndexTms();
                //banner有效
                if (banner) {
                    fun && fun.call(arguments.callee, JSON.parse(banner));
                } else {
                    $.ajax({
                        type:'GET',
                        dataType:'json',
                        url:this.bannerUrl,
                        success:function (result) {
                            var _banner = {
                                list:result,
                                lastUpdate:Date.now()
                            }
                            cache.saveIndexTms(JSON.stringify(_banner));
                            fun && fun.call(arguments.callee, _banner);
                        },
                        error:function (error) {
                            console.log(error);
                            fun && fun.call(arguments.callee, null);
                        }
                    });
                }
            }
        },

        /**
         * 获取首页数据：
         *
         * @param param.order
         * @param param.curPage  页码
         * @param param.type 列表类型
         *             1. 关注列表 acc
         *             2. 推荐 rec
         */
        getPageData:function (param) {

            var biz = this._biz;
            var self = this;

            /**
             * 更新推荐排序规则
             * @param param.order
             * @param param.curPage  页码
             */
            function getrecommends(param) {
                mtop.recommends(param, function (recResult) {
                    refine.refineRecommend(recResult);

                    recResult.t=new Date().getTime();
                    self.set("recommends", recResult);
                })
            }
            /**
             * 获取公共账号列表
             * @param param
             */
            function getPubAccounts(param, fun) {
                mtop.listWithFirstFeed(
                    param, function (accResult) {
                        accResult.t=new Date().getTime();
                        self.set("accWithFeed", accResult);
                        fun && fun.call(arguments.callee, accResult);
                    })
            }

            param || (param = {});
            var type = param.type || 1;

            if (param.order) {
                self.order = param.order;
            } else {
                param.order = self.order || "fans";
            }

            var pageParam = _.clone(mtop.pageParam);
            _.extend(pageParam, param);

            delete pageParam.type;

            //首页
            biz.banner(function (result) {
                (!self.get("banner") || result.lastUpdate != self.get("banner").lastUpdate ) && self.set("banner", result);
            });


            //自动创建账号
            var loginStatus = h5_comm.isLogin();
            self.set("loginStatus",loginStatus);
            if( (1 == type || pageParam.isIndex()) && loginStatus){

                //TODO
                pageParam.isIndex() && mtop.allFeedCount(function(result){
                    //比较
                    if(!result.data){return};
                    var lastCounts = parseInt(cache.getPersistent("feedCountsKey","counts"));
                    var nowCounts = parseInt(result.data.count);
                    var updateCounts = nowCounts - lastCounts;
                    if(!!lastCounts && !!nowCounts && updateCounts ){
                        self.set("newFeedCounts",{count: updateCounts,t:new Date().getTime()})
                    }
                    nowCounts && updateCounts && (cache.savePersistent("feedCountsKey","counts",nowCounts));
                });

                getPubAccounts(pageParam, pageParam.isIndex() ? function (accResult) {
                    if (  !accResult.list || accResult.list.length <= 1) {
                        getrecommends(pageParam);
                    }
                } : null);
            }else{
                //未登录只有推荐列表了
                getrecommends(pageParam);
            }

        }

    });

    return DynIndexModel;
});