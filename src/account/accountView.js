/**
 * User: 晓田(tancy)
 * Date: 13-2-21
 * Time: PM4:44
 */
define(function (require, exports, module) {
    var Backbone = require('backbone'),
        $ = require('zepto'),
        _ = require('underscore'),
        _model=require('./accountModel'),
        pageNav=require('../../../../base/styles/component/pagenav/js/pagenav.js'),
        h5_comm = require('h5_comm'),
        notification = require('../ui/notification.js'),
        mtop = require('../common/mtopForAllspark.js');


    var accountView = Backbone.View.extend({
        el:'#content',
        events:{
            'click .tb-feed-items li':'goToDetail',
            //'click .navbar .back':'goBackHome',
            'click #accountPage .J_info .stats-follow-btn':'follow',
            'click .navbar .refresh':'refresh',
            'click #accountPage .wwwIco':'goWWW'


        },
        backURL:'',
        afterTimestamp:'',
        before:false,
        initialize:function () {
            var that=this;
            that._pageSize=4;
            that.afterTimestamp=new Date().getTime();
            that.accountModel = new _model();
            that.accountModel.on("change:accInfo",function(model,result){
                console.log('accInfo');
                console.log(result);
                if(result){
                    $('#accountPage .J_info').html(_.template($('#accountinfo_tpl').html(),that.reconAccInfoData(result)));
                }
            });
            that.accountModel.on("change:accFeeds",function(model,result){
                if(that.oldTotalCount){
                    if(that.oldTotalCount.snsid==that.snsid){
                        var addCount=parseInt(result.totalCount)-parseInt(that.oldTotalCount.count);
                        if(addCount>0){
                            that.oldTotalCount.count=result.totalCount;
                            notification.message('更新了 '+addCount+' 条广播');
                        }
                    }
                }else{
                    that.oldTotalCount={'snsid':that.snsid,'count':result.totalCount};
                }
                //取消刷新按钮动画
                setTimeout(function(){
                    $('.navbar .refresh div').removeClass('spinner');
                },2000);

                if(result.list&&result.list.length>0){
                    console.log('change:accFeeds');
                    console.log(result);

                    $('#accountPage .J_feed .tb-feed-items').html(_.template($('#tbfeed_tpl').html(),that.reconFeedListData(result)));

                    //if(!that.pageNav){
                        var pageCount=Math.ceil(result.totalCount/that._pageSize);
                        if(pageCount>1){
                            that.pageNav=new pageNav({'id':'#feedPageNav','index':that.curPage, 'pageCount':pageCount,'pageSize':that._pageSize,'disableHash': 'true'});
                            that.pageNav.pContainer().on('P:switchPage', function(e,page){
                                that.changePage(page.index);
                            });
                        }
                    //}
                }
            });
            that.accountModel.on("change:prices",function(model,result){
                console.log('prices');
                console.log(result);
                if(result&&result.prices.length>0){

                    for(var i=0;i<result.prices.length;i++){
                        $('.it'+result.prices[i].id).append('<div class="price">￥'+result.prices[i].price+'</div>');
                    }

                    //<div class="price">￥102.00</div>
                }
                //测试插入效果
//                setTimeout(function(){
//                    var _item=$('.media .item');
//                    for(var i=0;i<_item.length;i++){
//                        _item.eq(i).append('<div class="price">￥102.00</div>');
//                    }
//                },5000);
            });
        },
        render:function(snsid,page){
            var that=this;
            that.snsid=snsid;
            that.curPage= page;
            if(snsid!=$('#accountPage').attr('snsid')){
                $('#accountPage').attr('snsid',snsid);
                $('#accountPage .J_info').html('');
                $('#accountPage .J_feed .tb-feed-items').html('');

            }
            $('header.navbar').html('');
            $('#feedPageNav').html('');

            var _navbar=$('header.navbar');
            var _accountPage=$('#accountPage');
            window.scrollTo(0,1);
            var _back={'backUrl':'','backTitle':'返回'};
            if(typeof window.AccountList!='undefined'){
                //window.location.hash=window.AccountList.hash;
                _back={'backUrl':'#'+window.AccountList.hash,'backTitle':'返回'};
                window.AccountList.flag=false;
                delete window.AccountList;
            }else{
                if(that.backURL!=''){
                    _back={'backUrl':that.backURL,'backTitle':'返回'}
                }else{
                    _back={'backUrl':'#index','backTitle':'返回'}
                }

            }




            _navbar.html(_.template($('#navBack_tpl').html(),_back)+$('#accountTitle_tpl').html());

            //判断导航是否已经载入
            if(_navbar.hasClass('iT')){
                _navbar.removeClass('iT').addClass('iC');
            }
            var _show=$('.view-page.show');
            if($('#detailPage').hasClass('show')){
                _accountPage.removeClass(' iR iL').addClass('iL');
                _show.removeClass('show iC').addClass('iR').wAE(function(){
                    _show.addClass('hide');
                });
            }else{
                if(!_accountPage.hasClass('show')){
                    _show.removeClass('show iC').addClass('iL').wAE(function(){
                        _show.addClass('hide');
                    });
                }
            }

            _accountPage.removeClass('hide');
            setTimeout(function(){
                _accountPage.removeClass(' iR iL').addClass('show iC');
            },0);





//            * @param param.curPage  页码
//            * @param param.pageSize
//            * @param param.snsId
//            * @param param.afterTimestamp
            that.accountModel.getPageData({'snsId':that.snsid,'curPage':that.curPage,'pageSize':that._pageSize,'timestamp':'','afterTimestamp':that.afterTimestamp,'before':that.before});

        },
        refresh:function(){
            var that=this;
            var _spinner=$('.navbar .refresh div');
            if(!_spinner.hasClass('spinner')){
                _spinner.addClass('spinner');
            }
            that.afterTimestamp=new Date().getTime();
            if(that.curPage=='1'){
                that.accountModel.getPageData({'exCludInfo':true,'snsId':that.snsid,'curPage':that.curPage,"before":false,'pageSize':that._pageSize,'afterTimestamp':new Date().getTime()});
            }else{
                window.location.hash='#account/'+that.snsid+'/1';
            }
        },
        goWWW:function(e){
            var that=this;
            var cur=$(e.currentTarget);
            if (cur.attr('linkUrlIsExt') == 'true') {
                notification.external(cur.attr('url'),function(){
                    window.location.href=cur.attr('url');
                },null);
            } else {
                if(cur.attr('url')!=''){
                    window.location.href = cur.attr('url');
                }
            }


        },
        goBackHome:function(){
            if(typeof window.AccountList!='undefined'){
                window.AccountList.flag=false;
                window.location.hash=window.AccountList.hash;
            }else{
                window.history.back();
            }
        },
        follow:function(e){
            var that=this;
            var cur=$(e.currentTarget);
            if(h5_comm.isLogin()){
                if(cur.hasClass('followed')){
                    cur.html('取消关注');
                    mtop.removeAccount(cur.attr('pid'),function(d){
                        if(d.data.result){
                            for(var len=d.data.result.length,i=0;i<len;i++){
                                if(cur.attr('pid')==d.data.result[i].id){
                                    if(d.data.result[i].isSuccess=='true'){
                                        cur.html('关注');
                                        cur.removeClass('followed');
                                        $('.stats-count').text(parseInt($('.stats-count').text())-1);
                                    }else{
                                        notification.message('取消关注失败！');
                                        cur.html('取消关注');
                                    }
                                }

                            }
                        }
                    },function(){
                        notification.message('取消关注失败！');
                        cur.html('取消关注');
                    });
                }else{
                    cur.html('关注中...');

                    mtop.addAccount(cur.attr('pid'),function(d){
                        if(d.data.result){
                            for(var len=d.data.result.length,i=0;i<len;i++){
                                if(cur.attr('pid')==d.data.result[i].id){
                                    if(d.data.result[i].isSuccess=='true'){
                                        console.log(d);
                                        cur.addClass('followed');
                                        cur.html('取消关注');
                                        $('.stats-count').text(parseInt($('.stats-count').text())+1);
                                    }else{
                                        notification.message('关注失败！');
                                        cur.html('关注');
                                    }
                                }
                            }
                        }
                    },function(){
                        notification.message('关注失败！');
                        cur.html('关注');
                    });
                }
            }else{
                h5_comm.goLogin('h5_allspark');
            }
        },
        changePage:function(page){
            var that=this;
            console.log('page:'+page);

            if(parseInt(that.curPage)<parseInt(page)){
                that.before=true;
            }else{
                that.before=false;
            }
            window.location.hash='#account/'+that.snsid+'/'+page;
            //判断是否为分页，如果是分页返回还是账号列表
            that.backURL=$('.navbar .back a').attr('href');

            //that.accountModel.getPageData({'snsId':that.snsid,'curPage':page,'pageSize':that._pageSize,'disableHash': 'true'});
        },
        goToDetail:function(e){
            var cur=$(e.currentTarget);
            var that=this;
            window.location.hash='#detail/'+$('.tb-profile').attr('snsid')+'/'+cur.attr('feedid')+'/'+that.curPage;
        },
        /**
         * 重构数据集
         * @param data
         * @returns {*}
         */
        reconAccInfoData:function(data){
            var d=data;
            console.log(!!d.logoUrl);
            //if(!d.logoUrl){d.logoUrl='imgs/avatar.png'}
            //if(!d.description){d.description='亲，欢迎光临！'}
            //if(!d.backgroundImg){d.backgroundImg='imgs/cover.png'}
            return d;
        },
        /**
         * 重构feed数据集
         * @param data
         * @returns {*}
         */
        reconFeedListData:function(data){
            var that=this;
            var d=data;
            for(var i=0;i< d.list.length;i++){
                if(!d.list[i].commentCount){d.list[i].commentCount=0}
            }
            return d;
        }

    });
    return accountView;
});