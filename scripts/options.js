var updateUrlView = new multiTab.UpdateUrlView( {el: $('#update-and-delete-urls')} ),
    insertUrlView = new multiTab.InsertUrlView({
        el: $('#insert-url'),
        updateView: updateUrlView
    }),
    updateIndices = function(event, ui) {
        // disable further sorting until event has been processed
        $('#url-tbody').sortable("option", "disabled", true);

        var movedOrderVal = parseInt($(ui.item.context).attr('data-order'), 10),
            $tblRows = $('#url-tbody').children('tr'),
            maxOrderVal = parseInt($tblRows.last().attr('data-order'), 10),
            openDbRequest = indexedDB.open("multi_tab", 1);

        openDbRequest.onsuccess = function(evt) {
            var db = evt.target.result,
                tx = db.transaction(["tbl_url"], "readonly"),
                os = tx.objectStore("tbl_url"),
                recursiveUpdate;

            if (movedOrderVal > maxOrderVal) { maxOrderVal = movedOrderVal; }
            /**
             * Algorithm:
             * Starting with last element in table and working backwards,
             * add 1 to each order value until you reach the item that has
             * been moved.
             * For the moved item, find the value of its predecessor and add 1.
             * If the moved item has no predecessor (moved to the beginning),
             * set its index to 0.
             */
            console.log('maxOrderVal is ' + maxOrderVal);
            recursiveUpdate = function(index) {
                var currentOrderVal = parseInt($($tblRows[index]).attr('data-order'), 10),
                    updateRequest,
                    $prevSibling;

                // base case
                if (currentOrderVal === movedOrderVal) {
                    $prevSibling = $($tblRows[index]).prev();
                    if ($prevSibling.length === 0) {
                        // no previous sibling means element was moved to beginning of list, so set to 0
                        $($tblRows[index]).attr('data-order', 0);
                    }
                    else {
                        $($tblRows[index]).attr('data-order', parseInt($prevSibling.attr('data-order'), 10) + 1);
                    }
                    console.log('Done with recursiveUpdate');
                    return;
                }
                $($tblRows[index]).attr('data-order', currentOrderVal + 1);
                recursiveUpdate(index - 1);
            }
            recursiveUpdate($tblRows.length - 1);
            console.log('Going forward after recursive update');
            db.close();
            // enable sorting after updating db
            $('#url-tbody').sortable("option", "disabled", false);
        };
    };

$(function() {
    // Cf. http://api.jqueryui.com/sortable/#event-stop
    // http://jsfiddle.net/pmw57/tzYbU/205/
    $('#url-tbody').sortable({
        stop: updateIndices
    });
});
