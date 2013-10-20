var updateUrlView = new multiTab.UpdateUrlView( {el: $('#update-and-delete-urls')} ),
    insertUrlView = new multiTab.InsertUrlView({
        el: $('#insert-url'),
        updateView: updateUrlView
    });

$(function() {
    $('#url-tbody').sortable();
});
