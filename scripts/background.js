chrome.browserAction.onClicked.addListener(function() {
    var _urls = [],
        request = indexedDB.open("multi_tab", 2);

    request.onerror = function(event) {
        console.log("Error opening database");
    };

    request.onupgradeneeded = function(event) {
        console.log('Database version is not current');
    };

    request.onsuccess = function(event) {
        var _urls = [],
            db = event.target.result,
            tx = db.transaction(["tbl_url"], "readonly"),
            os = tx.objectStore("tbl_url"),
            index = os.index("order"),
            cursor = index.openCursor();

        cursor.onsuccess = function(event) {
            var res = event.target.result;

            if (res) {
                _urls.push(res.value.url);
                res.continue();
            }
            else {
                if (_urls.length === 0) {
                    chrome.tabs.create({url: 'chrome-extension://obcbjcogdoelmafggekmkghajjgmcfnc/options.html'});
                    return; 
                }
                for (var i = 0; i < _urls.length; i++) {
                    chrome.tabs.create({url: _urls[i]});
                }
            }
        }
    }
});
