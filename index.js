chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['wa.js'] })
});

//send message to content script
document.getElementById("btn").addEventListener("click", function () {
    console.log("btn clicked");
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.storage.local.set({ send: [Math.random(239895)] })
    });
})

//https://web.whatsapp.com/send?phone=923336508521&text&type=phone_number&app_absent=0

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
    element.setAttribute("idc", "image" + index)
    element.addEventListener("change", function (e) {
        let tmp = e.currentTarget.getAttribute("idc")
        console.log(e.currentTarget);
        let blobURL = []
        console.log("selected ", tmp, e.target.files.length);
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

document.getElementById("randomMin").addEventListener("keyup", function (e) {
    chrome.storage.local.set({ "randomMin": e.target.value });
})
document.getElementById("randomMax").addEventListener("keyup", function (e) {
    chrome.storage.local.set({ "randomMax": e.target.value });
})


let node = document.querySelector("[name=templete]");
document.querySelector("#createOne").onclick = function () {
    multipleNode();
}

document.querySelector("#createMore").onclick = function () {
    document.querySelector("#quantity").style.display = 'block';
    document.querySelector("#createMul").style.display = 'block';
}
document.querySelector("#createMul").onclick = function () {
    document.querySelector("#quantity").style.display = 'none';
    document.querySelector("#createMul").style.display = 'none';

    count = document.querySelector("#quantity").value;
    multipleNode(count);
}

function multipleNode(count = 1) {
    let deep = true;
    for (let i = 0, copy; i < count; i++) {
        copy = node.cloneNode(deep);
        node.parentNode.insertBefore(copy, node);
    }
    //templete count
    chrome.storage.local.set({ "tCount": document.querySelectorAll("[name=templete]").length });
}

