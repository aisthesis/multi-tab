var multiTab = multiTab || {};

multiTab.UpdateUrlView = Backbone.View.extend({
    events: {
        "change input[name=to-delete]": "handleDeleteCheckChange",
        "click #delete-selected-button": "handleDeleteSelected"
    },

    initialize: function(options) {
        var _this = this;

        _.bindAll(_this,
            'render',
            'initializeConstants',
            'appendDbData',
            'showEmptyDbWarning',
            'handleDeleteCheckChange',
            'handleDeleteSelected',
            'deleteFromDb'
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
        _this.DB_VERSION = 2;
        _this.URL_TABLE = "tbl_url";
        _this.ORDER_INDEX = "order";
        _this.SHOW_IF_EMPTY_SELECTOR = '.show-if-empty';
        _this.HIDE_IF_EMPTY_SELECTOR = '.hide-if-empty';
        _this.CHECKED_DELETE_CHECKBOXES_SELECTOR = 'input[name=to-delete]:checked';
        _this.DELETE_SELECTED_BUTTON_SELECTOR = '#delete-selected-button';
    },

    appendDbData: function() {
        var _this = this,
            request = indexedDB.open(_this.LOCAL_DB, _this.DB_VERSION);

        request.onerror = function(event) {
            console.log("Error getting data to append");
        };

        request.onupgradeneeded = function(event) {
            var db = event.target.result,
                store;
            
            db.deleteObjectStore(_this.URL_TABLE);
            store = db.createObjectStore(_this.URL_TABLE, { autoIncrement: true });
            store.createIndex(_this.ORDER_INDEX, "order", { unique: true });
            db.close();
        };

        request.onsuccess = function(event) {
            var rows = [],
                db = event.target.result,
                tx = db.transaction([_this.URL_TABLE], "readonly"),
                os = tx.objectStore(_this.URL_TABLE),
                index = os.index(_this.ORDER_INDEX),
                cursor = index.openCursor(),
                $tbodyEl;

            cursor.onsuccess = function(event) {
                var res = event.target.result;

                if (res) {
                    rows.push({
                        id: res.primaryKey,
                        order: res.value.order,
                        description: res.value.description,
                        url: res.value.url
                    });
                    res.continue();
                }
                else {
                    if (rows.length === 0) {
                        $(_this.SHOW_IF_EMPTY_SELECTOR).slideDown('fast');
                    }
                    else {
                        $tbodyEl = _this.$el.find(_this.TABLE_BODY_SELECTOR);
                        //_.sortBy(rows, function(row) { return row.order; });
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
            $rowEl = $(_this._COMPILED_TEMPLATE(row)).hide(),
            $hideIfEmptyElements = _this.$el.find(_this.HIDE_IF_EMPTY_SELECTOR);
        
        if (!$hideIfEmptyElements.is(':visible')) {
            _this.$el.find(_this.SHOW_IF_EMPTY_SELECTOR).hide('fast');
            $hideIfEmptyElements.show('fast');
            $tbodyEl.append($rowEl.show());
            $tbodyEl.slideDown('fast');
        }
        else {
            $rowEl.appendTo($tbodyEl).slideDown('fast');
        }
    },

    handleDeleteCheckChange: function(event) {
        var _this = this;
        
        if (_this.$el.find(_this.CHECKED_DELETE_CHECKBOXES_SELECTOR).length > 0) {
            _this.$el.find(_this.DELETE_SELECTED_BUTTON_SELECTOR).removeAttr('disabled');
        }
        else {
            _this.$el.find(_this.DELETE_SELECTED_BUTTON_SELECTOR).attr('disabled', 'true');
        }
    },

    handleDeleteSelected: function(event) {
        var _this = this,
            $rows = _this.$el.find(_this.CHECKED_DELETE_CHECKBOXES_SELECTOR).closest('tr'),
            keysToDelete = [];

        $rows.each(function() {
            keysToDelete.push(parseInt($(this).attr('data-order'), 10));
        });
        _this.deleteFromDb(keysToDelete, function() {
            $rows.remove();
            event.target.blur();
            _this.$el.find(_this.DELETE_SELECTED_BUTTON_SELECTOR).attr('disabled', 'true');
            if (_this.$el.find(_this.TABLE_BODY_SELECTOR).find('tr').length === 0) {
                _this.$el.find(_this.HIDE_IF_EMPTY_SELECTOR).slideUp('fast', function() {
                    _this.$el.find(_this.SHOW_IF_EMPTY_SELECTOR).slideDown('fast');
                });
            }
        });
    },

    deleteFromDb: function(keys, callback) {
        var _this = this,
            request = indexedDB.open(_this.LOCAL_DB, _this.DB_VERSION);

        request.onsuccess = function(event) {
            var db = event.target.result,
                tx = db.transaction([_this.URL_TABLE], "readwrite"),
                store = tx.objectStore(_this.URL_TABLE),
                recursiveDelete;

            recursiveDelete = function(_index) {
                var deleteRequest;

                // base case
                if (_index >= keys.length) {
                    callback();
                    return;
                }
                deleteRequest = store.delete(keys[_index]);
                deleteRequest.onsuccess = function(event) {
                    recursiveDelete(_index + 1);
                }
            }
            recursiveDelete(0);
        }
    }
});
