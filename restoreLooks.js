
let randomMin = 2
let randomMax = 10

let node = document.querySelector("[name=templete]");
function multipleNode(count = 1) {
    for (let i = 0, copy; i < count; i++) {
        copy = node.cloneNode(true);
        node.parentNode.insertBefore(copy, node);
    }
    //templete count
    chrome.storage.local.set({ "tCount": document.querySelectorAll("[name=templete]").length });

    setTimeout(() => {
        let labels = document.querySelectorAll("#file-input2")
        for (let i = 0; i < labels.length; i++) {
            let rnd = Math.random(36592836);
            document.querySelector("#file-input").setAttribute("id", rnd)
            labels[i].setAttribute("for", rnd)
            labels[i].setAttribute("id", "for" + rnd)
        }
    }, 100);

}


//get all data from local storage and restore looks
chrome.storage.local.get(null, function (data) {
    console.log("all data = ", data);

    multipleNode(data.tCount - 1);

    if (data.firstInput) document.getElementById("firstInput").value = data.firstInput;
    else
        chrome.storage.local.set({ "firstInput": document.getElementById("firstInput").value });

    textarea = [...document.getElementsByTagName('textarea')];
    textarea.forEach((element, index) => {
        if (index == 0) return;
        if (data["textarea" + index]) element.value = data["textarea" + index];
        else chrome.storage.local.set({ ["textarea" + index]: element.value });
    })
    image = [...document.querySelectorAll('label[name="file"]')];
    image.forEach((element, index) => {
        if (data["image" + index]) {
            console.log("showing image count " + index, data["image" + index], data["image" + index].length);
            element.innerText = data["image" + index] ? data["image" + index].length : "0";
        }
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