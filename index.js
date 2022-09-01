chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['wa.js'] })
});

document.getElementById("btn").addEventListener("click", function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        let textt = document.getElementsByName("text")[0].value
        chrome.tabs.sendMessage(activeTab.id, {
            "type": "text",
            "text": textt
        });
    });
})
document.getElementById("btni").addEventListener("click", function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        let blobURL = window.URL.createObjectURL(document.querySelector("input[name='image']").files[0])
        chrome.tabs.sendMessage(activeTab.id, { "type": "image", "image": blobURL });

    });
})