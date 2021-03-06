/**
 * User: 晓田(tancy)
 * Date: 13-2-21
 * Time: PM4:44
 */
define(function (require, exports, module) {
    var Backbone = require('backbone'),
        $ = require('zepto'),
        _ = require('underscore'),
        _model=require('./accountListModel'),
        h5_comm = require('h5_comm'),
        pageNav=require('../../../../base/styles/component/pagenav/js/pagenav.js'),
        notification = require('../ui/notification.js'),
        loading = require('../ui/loading'),
        mtop = require('../common/mtopForAllspark.js');


    var accountListView = Backbone.View.extend({
        el:'#content',
        events:{
            'click .tab-bar li':'changeTab',
            //'click .navbar .back':'goBack',
            'click #accountListPage .person-list li .content':'goToAccount',
            'click #accountListPage .followbtn':'follow'

        },


        initialize:function () {
            var that=this;
            that.pageSize = 15;
            that.accountListModel = new _model();
            that.accountListModel.on("change:myAttention",function(model,result){

                if(result&&result.fail){
                    $('#accountListPage .person-list').html('');
                    notification.message('服务异常，请稍后再试！');
                    return;
                }

                var pageCount=Math.ceil(result.totalCount/that.pageSize);
                if(pageCount<that.curPage){
                    that.changePage(pageCount);
                }
                if(result.list&&result.list.length>0){
                    $('#accountListPage .person-list').html(_.template($('#myList_tpl').html(),result));
                    window.lazyload.reload()
                    //$('.tb-h5').append(_.template($('#personList_tpl').html(),result));

                    if(pageCount>1){
                        that.myPageNav=new pageNav({'id':'#accountListPageNav','index':that.curPage,'pageCount':pageCount,'pageSize':that.pageSize,'disableHash': 'true'});
                        that.myPageNav.pContainer().on('P:switchPage', function(e,page){
                            that.changePage(page.index);
                        });
                    }
                }else{
                    $('#accountListPage .person-list').html('<div class="empty">还没有关注任何帐号哦</div>');
                }
            });
            that.accountListModel.on("change:recommends",function(model,result){

//                console.log('recommends');
//                console.log(result);
                if(result&&result.fail){
                    $('#accountListPage .person-list').html('');
                    notification.message('服务异常，请稍后再试！');
                    return;
                }

                var pageCount=Math.ceil(result.totalCount/that.pageSize);
                if(pageCount<that.curPage){
                    that.changePage(pageCount);
                }
                if(result.list&&result.list.length>0){
                    $('#accountListPage .person-list').html((_.template($('#personList_tpl').html(),result)));
                    window.lazyload.reload()
                    $('#accountListPageNav').html('');

                    if(pageCount>1){
                        that.recPageNav=new pageNav({'id':'#accountListPageNav','index':that.curPage,'pageCount':pageCount,'pagesize':that.pageSize,'disableHash': 'true'});
                        that.recPageNav.pContainer().on('P:switchPage', function(e,page){
                            that.changePage(page.index);
                        });
                    }
                }else{
                    $('#accountListPage .person-list').html('<div class="empty">您已经关注所有帐号了</div>');
                }
            });

            //监听数据加载是否完毕
            that.accountListModel.on("change:loaded",function(model,result){
                loading.hide();
                model.set("loaded","0");
            })
        },
        render: function(status,page) {
            var that=this;

            loading.show();

            that.status=status;
            that.curPage=parseInt(page);
            //$('.tb-h5').html('');
            $('.navbar .back').unbind('click');
            var _navbar=$('header.navbar');
//            $('.view-page.show').removeClass('show iC').addClass('iL');
//            $('#accountListPage').removeClass('iL').addClass('show iC');
            _navbar.html(_.template($('#navBack_tpl').html(),{'backUrl':'#index','backTitle':'微淘'})+$('#accountListTabBar_tpl').html());


            window.scrollTo(0,1);
            $('.tab-bar li.cur').removeClass('cur');
            $('.tab-bar li').eq(that.status-1).addClass('cur');
            $('#accountListPage .person-list').html('<div class="loading"><span class="spinner"></span></div>');
            $('#accountListPageNav').html('');
            that.accountListModel.getPageData({'type':that.status,'curPage':that.curPage,'pageSize': that.pageSize,"order":"lastFeedTime"});

            //判断导航是否已经载入
            if(_navbar.hasClass('iT')){
                _navbar.removeClass('iT').addClass('iC');
            }

            var _show=$('.view-page.show');
            var _accountListPage=$('#accountListPage');
            //判断动画先后顺序
            var _indexPage=$('#indexPage');

            if(!_accountListPage.hasClass('show')){
                _show.removeClass('show iC').addClass('iL').wAE(function(){
                    _show.addClass('hide');
                });
            }

            _accountListPage.removeClass('hide');
            setTimeout(function(){
                _accountListPage.removeClass('iR iL').addClass('show iC');
            },0);



        },
        changePage:function(page){
            var that=this;
            $('#accountListPage .person-list').html('<div class="loading"><span class="spinner"></span></div>');
            window.location.hash='#accountList/'+that.status+'/'+page;
        },
        goToAccount:function(e){
            var that=this;
            e.stopPropagation();
            var cur=$(e.currentTarget);
            window.AccountList={'hash':'#accountList/'+that.status+'/'+that.curPage,'flag':true}
            changeHash('#account/'+cur.attr('snsid')+'/1','account');
            //window.location.hash='#account/'+cur.attr('snsid')+'/1';
        },
        follow:function(e){
            e.stopPropagation();
            var that=this;
            var cur=$(e.currentTarget);
            var _numObj=cur.parent().find('.follows span');
            if(h5_comm.isLogin()){
                //已登录
                if(!cur.hasClass('followed')){
                    cur.html('关注中...');
                    cur.addClass('min');
                    mtop.addAccount(cur.attr('pid'),function(d){
                        if(d.data.result){
                            for(var len=d.data.result.length,i=0;i<len;i++){
                                if(cur.attr('pid')==d.data.result[i].id){
                                    if(d.data.result[i].isSuccess=='true'){
                                        cur.addClass('followed');
                                        cur.html('已关注');
                                        cur.removeClass('min');
                                        var fans = _numObj.text();
                                        if(fans.indexOf('万')==-1 &&  fans.indexOf('亿') == -1 )
                                        {
                                            _numObj.text(parseInt(fans)+1);
                                        }

                                    }else{
                                        notification.message('关注失败！');
                                        cur.removeClass('min');
                                        cur.html('关注');
                                    }
                                }
                            }
                        }
                    },function(){
                        notification.message('关注失败！');
                        cur.html('关注');
                        cur.removeClass('min');
                    });
                }
            }else{
               // h5_comm.goLogin('h5_allspark');
                h5_comm.goLogin({rediUrl:'h5_allSpark',hideType:'close'});
            }
        },
        goBack:function(){
            //history.back();
            window.location.hash='index/';
        },
        changeTab:function(e){
            var that=this;
            var cur=$(e.currentTarget);
            $('.tab-bar li.cur').removeClass('cur');
            cur.addClass('cur');
            if(that.status==1){
                window.location.hash='accountList/2/1';
            }else{
                window.location.hash='accountList/1/1';
            }
        }

    });
    return accountListView;
});