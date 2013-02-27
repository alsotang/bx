define(function(require, exports, module) {
  var Backbone = require('backbone'),
      $ = require('zepto'),
      _ = require('underscore'),
      router = require('../router');

  var commentListHeaderTemplate = _.template($('#comment_list_header_tpl').html())

  var CommentModel = require('./commentModel')

  var CommentListView = Backbone.View.extend({

    el: '#content',

    model: new CommentModel(),

    events: {
      'click .btn.comment': 'newComment'
    },

    initialize: function(snsId, feedId, page) {

      $('header.navbar').html(commentListHeaderTemplate({}))

      $('.view-page.show').removeClass('show iC').addClass('iL');
      $('#commentListPage').removeClass('iL').addClass('show iC');

      this.$container = $('#commentListPage')

      this.model.on('change:commentList', this.renderCommentList, this)

      this.model.getPageData({'snsId':snsId,'feedId':feedId});
    },

    renderCommentList: function() {
      var list = this.model.get('commentList')
      if (list.totalCount == 0) {
        this.$container.html('<p class="no-comment">暂时没有评论</p>')
      } else {

      }

      console.log('comment list', this.model.get('commentList'))
    },

    newComment: function() {
      router.navigate('newComment', { trigger: true })
    }

  })

  return CommentListView
});