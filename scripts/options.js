var updateUrlView = new multiTab.UpdateUrlView( {el: $('#update-and-delete-urls')} ),
    insertUrlView = new multiTab.InsertUrlView({
        el: $('#insert-url'),
        updateView: updateUrlView
    }),
    updateIndices = function(event, ui) {
        //disable sorting with:
        //$('#url-tbody').sortable("option", "disabled", true);
        // Then enable again when database has been updated.
        console.log('sorting!');
    };

$(function() {
    // Cf. http://api.jqueryui.com/sortable/#event-stop
    // http://jsfiddle.net/pmw57/tzYbU/205/
    $('#url-tbody').sortable({
        stop: updateIndices
    });
});
