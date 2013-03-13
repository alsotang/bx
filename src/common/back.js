define(function (require, exports, module) {

    var log = require("./log.js"),
        hashStack = [];

//    var fromBack = false;

    exports.add = function (hash) {

        //DO IT
        if (hashStack.length) {
            var lastHash = hashStack[hashStack.length - 1], logAction;
            switch (hash) {
                case 'accountList':
                    if (('index' == lastHash.hash) && (1 >= history.length - lastHash.hisLen)) {
                        logAction = 'AddAccount';
                    }
                    break;
                case 'account':
                    if (('index' == lastHash.hash) && (1 >= history.length - lastHash.hisLen)) {
                        logAction = 'AccountList';
                    }
                    break;
                case 'detail':
                    if (('account' == lastHash.hash) && (1 >= history.length - lastHash.hisLen)) {
                        logAction = 'DetailList';
                    }
                    break;
                case 'comment':
                    if (('detail' == lastHash.hash) && (1 >= history.length - lastHash.hisLen)) {
                        logAction = 'Comment';
                    }
                    break;
            }
            logAction && log.log(logAction);
        }


//        if("newComment" == hash){return};
        var tmpStack = [];
        var i = 0;
        while (i < hashStack.length) {
            if (hashStack[i].hash == hash) {
                break;
            } else {
                tmpStack.push(hashStack[i])
            }
            i++;
        }
        hashStack = tmpStack;
        hashStack.push({hash: hash, hisLen: history.length, orignHash: location.hash});
        console.log(hashStack);
    }

    // = window.smartBack
    exports.exec = function () {
        var curHash = location.hash;
        if (!curHash) {
            window.location.href = "#index";
            return;
        }
        if (curHash.indexOf("index") >= 0) {
            return true;
        }
        var part = curHash.split("/")[0];
        if (0 == part.indexOf("#")) {
            part = part.substring(1);
        }
        var hashObj;
        while (hashStack.length) {
            hashObj = hashStack.pop();
            if (part != hashObj.hash) {
                break;
            }
        }
        if (hashObj) {
            console.log(hashObj);
            console.log(JSON.stringify(hashStack));
            if (-1 == (hashObj.hisLen - history.length)) {
                history.go(-1);
            } else {
                window.location.href = hashObj.orignHash;
            }
        } else {
            window.location.href = "#index";
        }
        return false;
    }

});