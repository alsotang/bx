/**
 * User: butai
 * Date: 13-2-22
 * Time: AM11:18
 */
define(function (require, exports, module) {
    var Backbone = require('backbone'),
        $ = require('zepto'),
        _ = require('underscore'),
        _model=require('./detailModel');

    var accinfoTemplate = _.template($('#detail_accinfo_tpl').html());
    var contentTemplate = _.template($('#detail_content_tpl').html());

   var detailView = Backbone.View.extend({
        className: 'detail',
        model : new _model(),
        events:{

        },
        initialize:function (snsId,feedId) {
          $('.tb-h5').html(this.el);

          this.model.on('change:feed', this.renderDetail, this)
          this.model.on('change:accInfo', this.renderAccInfo, this)

          this.model.getPageData({'snsId':snsId,'feedId':feedId});
        },

        renderAccInfo: function() {
          var accInfo = accinfoTemplate({});
          this.$el.prepend(accInfo)
        },

        //渲染详情页
        renderDetail: function() {
          var content = contentTemplate({});
          this.$el.append(content);

          var feed = this.model.get('feed');
          console.log('render detail! feed='+JSON.stringify(feed));
        }
    });
    return detailView;
}
);