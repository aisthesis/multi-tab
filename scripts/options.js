var indexedDbVersion = 2,
    updateUrlView = new multiTab.UpdateUrlView({
        el: $('#update-and-delete-urls'),
        dbVersion: indexedDbVersion
    }),
    insertUrlView = new multiTab.InsertUrlView({
        el: $('#insert-url'),
        updateView: updateUrlView,
        dbVersion: indexedDbVersion
    }),
    updateIndices = function(e0, ui) {
        // disable further sorting until event has been processed
        $('#url-tbody').sortable("option", "disabled", true);

        var movedOrderVal = parseInt($(ui.item.context).attr('data-order'), 10),
            $tblRows = $('#url-tbody').children('tr'),
            maxOrderVal = parseInt($tblRows.last().attr('data-order'), 10),
            openDbRequest = indexedDB.open("multi_tab", indexedDbVersion);

        openDbRequest.onsuccess = function(e1) {
            /**
             * Algorithm:
             * =================================================================
             * This works for both forward and backward moves:
             * 1) If the moved element is at the end of the table,
             * set its value to max + 1 in both DOM and db, and exit.
             * Otherwise:
             * 2) Set the orderVal of the moved element to max + 2 in
             * both db and DOM (keep these in sync)
             * 3) Get a descending cursor with range (upper bound) restricted to max
             * (before setting moved element to max + 2)
             * 4) As long as the DOM element data-order attribute === db orderVal,
             * add 1 to each.
             * 5) Once data-order attribute in DOM !== db orderVal, we have reached
             * the moved element. Set that value to predecessor + 1 or to 0
             * if it has no predecessor (both in DOM and in db).
             * Using updates rather than puts, the worst that can happen on
             * failed db request is that the order is strange.
             *
             * Bad but tempting algorithm:
             * Starting with last element in table and working backwards,
             * add 1 to each order value until you reach the item that has
             * been moved.
             * For the moved item, find the value of its predecessor and add 1.
             * If the moved item has no predecessor (moved to the beginning),
             * set its index to 0.
             * This doesn't work: Consider 0, 1, 2, 3 where we move 3 to top.
             * Then 2 becomes 3, temporarily violating uniqueness.
             */
            var db = e1.target.result,
                tx = db.transaction(["tbl_url"], "readwrite"),
                os = tx.objectStore("tbl_url"),
                movedElementCursor,
                descendingCursor;

            if (movedOrderVal > maxOrderVal) { maxOrderVal = movedOrderVal; }
            movedElementCursor = os.openCursor(IDBKeyRange.only(movedOrderVal));
            movedElementCursor.onsuccess = function(e2) {
                var cursorResult = e2.target.result;

                if ($(ui.item.context).next().length === 0) {
                    $(ui.item.context).attr('data-order', maxOrderVal + 1);
                    cursorResult.value.order = maxOrderVal + 1;
                    cursorResult.update(cursorResult.value);
                    console.log("element was moved to end and updated!");
                    return;
                }
            };
            /*
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
            */
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
