define(function (require, exports, module) {
        var Backbone = require('backbone'),
        _ = require('underscore'),
        mtop = require('../common/mtopForAllspark.js'),
        cache = require('../common/cache.js'),
        h5_comm = require('h5_comm'),
        refine = require('../common/refine.js');

    /**
     * 详情页面
     */
        return Backbone.Model.extend({

            linkUrlFormat:function(linkUrl){
                if(linkUrl)
                {
                    if(linkUrl.indexOf('detail.tmall.com')!=-1)
                    {
                        var id=linkUrl.match(/id=[\d]+/);
                        id = id && id[0].split('=');
                        if(id && id.length > 1)
                        {
                            return "http://a.m.tmall.com/i"+id[1]+".htm";
                        }
                    }
                }
                return linkUrl;
            },
            /**
             * mtop.sns.feed.detail Feed详情
             用户登录可选
             入参：
             snsId: string
             feedId:string
             出参：
             BatOperationResult feed详情
             业务异常：sid不存在对应的snsAccount，feed不存在，sid没有权限，
             返回特定错误码(FAIL_DOWNGRADED)表示被降级
               */
            getPageData:function (param) {
                var self = this;
                function getPrices(result) {
                      //获取价格参数
                    var ids = [];

                    result.tiles &&  result.tiles.forEach(function(tile){
                            tile.item &&  ids.push(tile.item.id); }
                            );
                      mtop.getPrices(_.uniq(ids),function(prices){
                          prices.length && self.set({"prices":prices},{silent:true});
                          self.trigger('change:prices');
                      })
                 }

                //step1: 获取帐号信息
                var accountInfo = cache.getAccountById(param.snsId);
                if(accountInfo)
                {
                 self.set("accInfo",accountInfo);
                }
                else
                {
                mtop.info({snsId:param.snsId},function(result){
                    refine.refinePubAccount(result);
                    self.set("accInfo",result);
                    cache.saveAccount(param.snsId,result);

                });
                }


                //step2: 获取详情
                var cacheFeed = cache.getItemById(param.snsId+"_"+param.feedId);
                if (cacheFeed  && cacheFeed.title && cacheFeed.tiles && cacheFeed.tiles.length>0) {
                    //保存详情信息
                    self.set( "feed", cacheFeed);
                    self.trigger('change:feed');

                   // self.set("accInfo",cache.getAccountById(param.snsId));

                    getPrices(cacheFeed,param);
                    return;
                }else {
                    mtop.detail(param || {},function(result){
                         if(_.isEmpty(result) )
                         {
                         self.set("feed",{fail:'null',errMsg:'抱歉,该广播已删除或不存在！', t: (new Date()).getTime() });
                         }
                         else if(result.fail)
                         {
                             self.set("feed",result);
                         }
                         else{
                         refine.refineDetail(result);
                         self.set("feed",result);
                         //linkUrlFormat
                         result.linkUrl = self.linkUrlFormat(result.linkUrl);
                        if (result  && result.tiles && result.tiles.length>0) {
                            cache.saveItem(param.snsId+"_"+param.feedId,result);
                            getPrices(result,param);
                        }
                         }
                    });
                }
        }
});
});