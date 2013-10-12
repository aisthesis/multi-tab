var prefix = 'http://finance.yahoo.com/echarts?s=',
    middle = '+Interactive#symbol=',
    suffix = ';range=1y;compare=;indicator=sma+volume+rsi;charttype=ohlc;crosshair=cross;' + 
           'ohlcvalues=1;logscale=on;source=undefined;',
    stocks = ['spwr', 'cree', 'eog', 'ddd'];

chrome.browserAction.onClicked.addListener(function() {
    var _url;

    for (var i = 0; i < stocks.length; i++) {
        _url = prefix + stocks[i] + middle + stocks[i] + suffix;
        chrome.tabs.create({url: _url});
    }
});
