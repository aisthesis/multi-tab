var multiTab = multiTab || {};

multiTab.UpdateUrlView = Backbone.View.extend({
    initialize: function(options) {
        var _this = this;

        _.bindAll(_this,
            'render',
            'initializeConstants'
        );

        _this.initializeConstants();
        _this.render();
    },

    render: function() {
        var _this = this;

        alert(_this.$el.find('h3').text());
    },

    initializeConstants: function() {
        var _this = this;

        _this.TEMPLATE_SELECTOR = '#url-record-template';
        _this._COMPILED_TEMPLATE = _.template($(_this.TEMPLATE_SELECTOR).html());
    }
});
