var multiTab = multiTab || {};

multiTab.UpdateUrlView = Backbone.View.extend({
    initialize: function(options) {
        var _this = this;

        _.bindAll(_this,
            'render',
            'initializeConstants',
            'appendDbData',
            'showEmptyDbWarning'
        );

        _this.initializeConstants();
        _this.render();
    },

    render: function() {
        var _this = this;

        _this.appendDbData();
    },

    initializeConstants: function() {
        var _this = this;

        _this.TEMPLATE_SELECTOR = '#url-record-template';
        _this._COMPILED_TEMPLATE = _.template($(_this.TEMPLATE_SELECTOR).html());
        _this.TABLE_BODY_SELECTOR = '#url-tbody';
        _this.LOCAL_DB = "multi_tab";
        _this.DB_VERSION = 1;
        _this.URL_TABLE = "tbl_url";
        _this.SHOW_IF_EMPTY_SELECTOR = '.show-if-empty';
        _this.HIDE_IF_EMPTY_SELECTOR = '.hide-if-empty';
    },

    appendDbData: function() {
        var _this = this,
            request = indexedDB.open(_this.LOCAL_DB, _this.DB_VERSION);

        request.onerror = function(event) {
            console.log("Error getting data to append");
        };

        request.onupgradeneeded = function(event) {
            console.log('upgrade needed for append action');
        };

        request.onsuccess = function(event) {
            var rows = [],
                db = event.target.result,
                tx = db.transaction([_this.URL_TABLE], "readonly"),
                os = tx.objectStore(_this.URL_TABLE),
                cursor = os.openCursor(),
                $tbodyEl;

            cursor.onsuccess = function(event) {
                var res = event.target.result;

                if (res) {
                    rows.push(res.value);
                    res.continue();
                }
                else {
                    if (rows.length === 0) {
                        $(_this.SHOW_IF_EMPTY_SELECTOR).slideDown('fast');
                    }
                    else {
                        $tbodyEl = _this.$el.find(_this.TABLE_BODY_SELECTOR);
                        _.sortBy(rows, function(row) { return row.order; });
                        for (var i = 0; i < rows.length; i++) {
                            $tbodyEl.append($(_this._COMPILED_TEMPLATE(rows[i])));
                        }
                        $(_this.HIDE_IF_EMPTY_SELECTOR).slideDown('fast');
                    }
                }
            };
            db.close();
        };
    },

    showEmptyDbWarning: function() {
        var _this = this;

        $(_this.SHOW_IF_EMPTY_SELECTOR).slideDown('fast');
    },

    appendRow: function(row) {
        var _this = this,
            $tbodyEl = _this.$el.find(_this.TABLE_BODY_SELECTOR),
            $rowEl = $(_this._COMPILED_TEMPLATE(row)).hide();
        
        $rowEl.appendTo($tbodyEl).slideDown('fast');
    }
});
