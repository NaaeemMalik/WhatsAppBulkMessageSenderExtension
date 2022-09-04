chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['wa.js'] })
});

//send message to content script
document.getElementById("btn").addEventListener("click", function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.storage.local.get(null, function (data) {
            chrome.tabs.sendMessage(tabs[0].id, {
                "do": "send",
                "data": data
            });
        });
    });
})

//ttps://web.whatsapp.com/send?phone=923336508521&text&type=phone_number&app_absent=0

//saving text field value to local storage
document.getElementById("firstInput").addEventListener("keyup", function (e) {
    chrome.storage.local.set({ "firstInput": e.target.value });
})
let textarea = [...document.getElementsByTagName('textarea')];
textarea.forEach((element, index) => {
    if (index == 0) return;
    element.addEventListener("keyup", function (e) {
        let tmp = "textarea" + index
        tmp = { [tmp]: e.target.value }
        chrome.storage.local.set(tmp);
    })
});
//saving image textfileds to local storage
let image = [...document.querySelectorAll('input[type="file"]')];
image.forEach((element, index) => {
    element.setAttribute("idc","image"+index)
    element.addEventListener("change", function (e) {
        let tmp = e.currentTarget.idc
        let blobURL = []
        console.log("selected ",tmp, e.target.files.length);
        for (let i = 0; i < e.target.files.length; i++) {
            blobURL.push(window.URL.createObjectURL(e.target.files[i]))
        }
        tmp = { [tmp]: blobURL }
        console.log("saving ", tmp);
        chrome.storage.local.set(tmp);
    })
});

let checkbox = [...document.querySelectorAll('input[type="checkbox"]')];
checkbox.forEach((element, index) => {
    element.addEventListener("click", function (e) {
        let tmp = "checkbox" + index
        tmp = { [tmp]: e.target.checked }
        console.log(tmp);
        chrome.storage.local.set(tmp);
    })
});
let randomMin = 2
let randomMax = 10
chrome.storage.local.get(null, function (data) {
    console.log("all data = ", data);
    document.getElementById("firstInput").value = data.firstInput ? data.firstInput : "";
    textarea = [...document.getElementsByTagName('textarea')];
    textarea.forEach((element, index) => {
        if (index == 0) return;
        element.value = data["textarea" + index] ? (data["textarea" + index]) : "";
    })
    image = [...document.querySelectorAll('label[name="file"]')];
    image.forEach((element, index) => {
        console.log("image" + index, data["image" + index]);
         element.innerText = data["image" + index] ? data["image" + index].length : "0";
    })
    checkbox = [...document.querySelectorAll('input[type="checkbox"]')];
    checkbox.forEach((element, index) => {
        console.log("checkbox" + index, data["checkbox" + index]);
        element.checked = data["checkbox" + index] ? (data["checkbox" + index]) : false;
    })
    data.randomMin ? randomMin = data.randomMin : chrome.storage.local.set({ randomMin: randomMin })
    data.randomMax ? randomMax = data.randomMax : chrome.storage.local.set({ randomMax: randomMax })
    document.getElementById("randomMin").value = randomMin
    document.getElementById("randomMax").value = randomMax


})
document.getElementById("randomMin").addEventListener("keyup", function (e) {
    chrome.storage.local.set({ "randomMin": e.target.value });
})
document.getElementById("randomMax").addEventListener("keyup", function (e) {
    chrome.storage.local.set({ "randomMax": e.target.value });
})


