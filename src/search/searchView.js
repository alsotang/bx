/**
 * User: 金建峰
 * Date: 13-5-30
 * Time:
 */
define(function (require, exports, module) {
    var Backbone = require('backbone'),
        $ = require('zepto'),
        _ = require('underscore'),
        Person = require('./person'),
        pageNav = require('../../../../base/styles/component/pagenav/js/pagenav.js'),
        h5_comm = require('h5_comm'),
        loading = require('../ui/loading'),
        notification = require('../ui/notification.js'),
        mtop = require('../common/mtopForAllspark.js'),
        personCollection = require('./personCollection.js'),
        personItemView1 = require('./personItemView.js'),
        favUtils = require('../common/favUtils.js');


    var searchView = Backbone.View.extend({
        el: '#content',
        events: {
            "click .content": "goToAccount",
            "click #J-searchBtn": "searchPerson",
            "click .add-public-account": "goToRecommend"
        },


        attrs: {
            PAGESIZE: 15,
            curPage: 1,
            backURL: '',
            afterTimestamp: '',
            before: false
        },


        template: $("#J-personTpl").html(),

        initialize: function () {

            var self = this;

            this.Collection = new personCollection;
            this.Model = new Person();

            this.getAttr = function (key) {
                return self.attrs[key];
            };
            this.setAttr = function (key, val) {
                self.attrs[key] = val;
            };

            this.Collection.on("reset", this.render, this);
        },

        searchPerson: function (e) {
            e.stopPropagation();

            var nick = $.trim($("#J-keyword").val());

            this.queryPersonList(nick, 1);
        },


        _renderPager: function (totalCount) {

            var self = this;

            var pageTotal = Math.ceil(totalCount / this.getAttr('PAGESIZE'));


            if (pageTotal > 1) {

                self.pageNav = new pageNav({'id': '#J-searchListPageNav', 'index': self.curPage, 'pageCount': pageTotal, 'pageSize': this.getAttr('PAGESIZE'),'objId':'p', 'disableHash': 'true'});

                self.pageNav.pContainer().on('P:switchPage', function (e, goPage) {

                    window.location.hash = '#searchAccount/p' + goPage.index;
                    //判断是否为分页，如果是分页返回还是账号列表
                    self.backURL = $('.navbar .back a').attr('href');
                });
            }

        },

        //motp queryPersonList
        queryPersonList: function (nick, page) {
            var self = this;
            var params = {keywords: nick, curPage: page, pageSize: this.getAttr('PAGESIZE')};
            this.setAttr('curPage', page);

            mtop.searchAccount(params, function (result) {
                self.Collection.reset(result.list);
                self._renderPager(result.totalCount);

            });
        },


        //查询我的列表
        queryMyList: function (page) {

            var self = this;
            var page = page || 1;
            var params = {curPage: page, pageSize: this.getAttr('PAGESIZE')};
            this.setAttr('curPage', page);

            mtop.my(params, function (result) {
                self.Collection.reset(result.list);
                $("#J-num").text(result.totalCount);
                self._renderPager(result.totalCount);
            });
        },


        addItem: function (person) {
            var personModel = person.set('isMyList', this.getAttr('isMypage'));
            var personItemView = new personItemView1({model: personModel});
            $("#J-personList").append(personItemView.render());
        },



        //render person list
        render: function () {

            var self = this;
            var _navbar = $('header.navbar');
            var _accountListPage = $('#searchPersonPage');


            var _back = {'backUrl': '', 'backTitle': '返回'};
            if (typeof window.AccountList != 'undefined') {
                //window.location.hash=window.AccountList.hash;
                _back = {'backUrl': '#' + window.AccountList.hash, 'backTitle': '返回'};
                window.AccountList.flag = false;
                delete window.AccountList;
            } else {
                if (self.backURL != '') {
                    _back = {'backUrl': self.backURL, 'backTitle': '返回'}
                } else {
                    _back = {'backUrl': '#index', 'backTitle': '返回'}
                }
            }


            // render
            _accountListPage.find("#J-searchListPage").html($("#J-searchItemTpl").html());
            this.Collection.each(function (person) {
                self.addItem(person);
            });





            _accountListPage.removeClass('hide');

            if (_navbar.hasClass('iT')) {
                _navbar.removeClass('iT').addClass('iC');
            }

            var _show = $('.view-page.show');
            if ($('#detailPage').hasClass('show')) {
                _accountListPage.removeClass(' iR iL').addClass('iL');
                _show.removeClass('show iC').addClass('iR').wAE(function () {
                    _show.addClass('hide');
                });
            } else {
                if (!_accountListPage.hasClass('show')) {
                    _show.removeClass('show iC').addClass('iL').wAE(function () {
                        _show.addClass('hide');
                    });
                }
            }

            _accountListPage.removeClass('hide');

            setTimeout(function () {
                _accountListPage.removeClass(' iR iL').addClass('show iC');
            }, 0);


            window.scrollTo(0, 1);

            window.lazyload.reload();

            // this is for Android
            $('#content')[0].style.minHeight = '360px';
        },


        //====以下是以前的逻辑
        goToRecommend: function (e) {
            e.stopPropagation();
            changeHash('#recommendAccount/0/p1', 'account');
        },

        goToAccount: function (e) {
            var that = this;
            e.stopPropagation();
            var cur = $(e.currentTarget);
            window.AccountList = {'hash': '#accountList/' + that.status + '/' + that.curPage, 'flag': true};

            changeHash('#account/' + cur.attr('snsid') + '/1', 'account');
        },

        goBackHome: function () {
            if (typeof window.AccountList != 'undefined') {
                window.AccountList.flag = false;
                window.location.hash = window.AccountList.hash;
            } else {
                window.history.back();
            }
        }




    });
    return searchView;
});