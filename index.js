function getBase64(file, callback, tmp, baseImages) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        console.log(reader.result);
        callback(reader.result, tmp, baseImages);
    };
    reader.onerror = function (error) {
        console.log('image base64 Error: ', error);
    };
}

let baseImages = []
function storeLooks() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['wa.js'] })
    });
    //send message to content script
    document.getElementById("btn").addEventListener("click", function () {
        console.log("btn clicked");
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            let tmp = { send: Math.random(239895) }
            console.log(tmp);
            chrome.storage.local.set(tmp)
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
        element.setAttribute("index", index);
        element.addEventListener("keyup", function (e) {
            let tmp = "textarea" + e.target.getAttribute("index");
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
            baseImages = []
            console.log("selected image ", tmp, e.target.files.length);
            for (let i = 0; i < e.target.files.length; i++) {
                getBase64(e.target.files[i], function (result, tmp, baseImages) {
                    baseImages.push(result)
                    console.log("saving ", tmp);
                    tmp = { [tmp]: baseImages }
                    console.log("saving ", tmp);
                    chrome.storage.local.set(tmp);
                }, tmp, baseImages)
            }
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

    document.getElementById("randomMin").addEventListener("keyup", function (e) {
        chrome.storage.local.set({ "randomMin": e.target.value });
    })
    document.getElementById("randomMax").addEventListener("keyup", function (e) {
        chrome.storage.local.set({ "randomMax": e.target.value });
    })


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
    document.querySelector("#deleteButton").onclick = function () {
        document.querySelector("[name=templete]").style.display = 'none';
    }




}