
let randomMin = 2
let randomMax = 10

let node = document.querySelector("[name=templete]");
function multipleNode(count = 1) {
    let deep = true;
    for (let i = 0, copy; i < count; i++) {
        copy = node.cloneNode(deep);
        node.parentNode.insertBefore(copy, node);
    }
    //templete count
    chrome.storage.local.set({ "tCount": document.querySelectorAll("[name=templete]").length });
}


//get all data from local storage and restore looks
chrome.storage.local.get(null, function (data) {
    console.log("all data = ", data);

    multipleNode(data.tCount - 1);

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

    storeLooks();

})