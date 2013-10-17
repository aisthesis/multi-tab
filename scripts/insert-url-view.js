var multiTab = multiTab || {};

multiTab.InsertUrlView = Backbone.View.extend({
    events: {
        "click #save-url-button": "handleSave"
    },

    initialize: function(options) {
        var _this = this;

        _.bindAll(_this,
            'render',
            'initializeConstants',
            'handleSave',
            'saveToDb'
        );

        _this.initializeConstants();
        _this.render();
    },

    render: function() {
        var _this = this;

        _this.$el.find(_this.DESCRIPTION_INPUT_SELECTOR).attr('placeholder', 'Description');
        _this.$el.find(_this.URL_INPUT_SELECTOR).attr('placeholder', 'https://www.google.com/');
    },

    initializeConstants: function() {
        var _this = this;

        _this.DESCRIPTION_INPUT_SELECTOR = '#description-input';
        _this.URL_INPUT_SELECTOR = '#url-input';
        _this.LOCAL_DB = "multi_tab";
        _this.DB_VERSION = 1;
        _this.URL_TABLE = "tbl_url";
    },

    handleSave: function(event) {
        var _this = this,
            description = _this.$el.find(_this.DESCRIPTION_INPUT_SELECTOR).val().trim(),
            url = _this.$el.find(_this.URL_INPUT_SELECTOR).val().trim();

        if (description.length === 0 || url.length === 0) {
            alert("Both description and URL are required inputs!");
            return;
        }
        _this.saveToDb(description, url);
        _this.$el.find(_this.DESCRIPTION_INPUT_SELECTOR).val('');
        _this.$el.find(_this.URL_INPUT_SELECTOR).val('');
        event.target.blur();
    },

    saveToDb: function(_description, _url) {
        var _this = this,
            request = indexedDB.open(_this.LOCAL_DB, _this.DB_VERSION);

        request.onerror = function(event) {
            console.log("Error");
        };

        request.onupgradeneeded = function(event) {
            var db = event.target.result,
                store = db.createObjectStore(_this.URL_TABLE, {keyPath: "order"});

            store.put({order: 0, description: _description, url: _url});
            db.close();
            console.log('url saved');
        };

        request.onsuccess = function(event) {
            console.log('on the path to success! but nothing stored');
        };
    }
});
