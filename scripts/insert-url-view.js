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
        
        _this.initializeConstants(options);
        _this.render();
    },

    render: function() {
        var _this = this;

        _this.$el.find(_this.DESCRIPTION_INPUT_SELECTOR).attr('placeholder', 'Description');
        _this.$el.find(_this.URL_INPUT_SELECTOR).attr('placeholder', 'https://www.google.com/');
    },

    initializeConstants: function(options) {
        var _this = this;

        _this.UPDATE_VIEW = options.updateView;
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
            event.target.blur();
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
            console.log("Error opening database");
        };

        request.onupgradeneeded = function(event) {
            var db = event.target.result,
                store = db.createObjectStore(_this.URL_TABLE, {keyPath: "order"});

            db.close();
        };

        request.onsuccess = function(event) {
            var db = event.target.result,
                tx = db.transaction([_this.URL_TABLE], "readwrite"),
                store = tx.objectStore(_this.URL_TABLE),
                // iterate in descending order
                cursor = store.openCursor(null, "prev"),
                _order = 0,
                row;

            cursor.onsuccess = function(event) {
                var res = event.target.result;

                if (res) {
                    _order = res.key + 1;
                }
                row = {order: _order, description: _description, url: _url};
                store.put(row);
                console.log('record save with order ' + _order);
                _this.UPDATE_VIEW.appendRow(row);
            }
            db.close();
        };
    }
});
