console.log("wa.js loaded");

function send_text(text) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text', text);
    const event = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true
    });
    //console.log("waiting for textbox to appear");
    waitForElm('.selectable-text.copyable-text').then((el) => {
        //console.log("el length = ", el);
        if (el.length < 2) {
            setTimeout(() => {
                send_text(text)
            }, 10);
            return;
        }
        console.log("textfields length ", el.length)
        el = el[el.length - 1]
        el.dispatchEvent(event)
        click_send()
    })
}

function upload_image(image) {
    waitForElm('[data-icon=clip]').then((elm) => {
        elm.click()
        var xhr = new XMLHttpRequest();
        xhr.open("GET", image);

        xhr.responseType = "blob";
        xhr.onload = function () {
            if (xhr.status === 200) {
                waitForElm('[type=file]').then((input) => {
                    const dT = new ClipboardEvent('').clipboardData || new DataTransfer(); // specs 
                    dT.items.add(new File([xhr.response], "test.jpg", { type: "image/jpeg" }));
                    input.files = dT.files;
                    var evt = new Event('change', {
                        'bubbles': true,
                        'cancelable': false,
                    });
                    input.dispatchEvent(evt);
                    waitForElm('[data-icon="send"]').then((btn2) => {
                        btn2.click()
                    })
                })
            }
        };
        xhr.send();

    });
}

let activete = false
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Storage key "${key}" in namespace "${namespace}" changed. Old value was "${oldValue}", new value is "${newValue}".`);
        if (key == "sendOne" && location.href.includes("https://web.whatsapp.com")) {
            activete = true;
            chrome.storage.local.set({ activete: true })

            chrome.storage.local.get(null, function (data) {
                console.log(data, "data");
                if (data.stage == "redirecting") {
                    chrome.storage.local.set({ stage: "redirected" })
                    location.href = data.url
                }
            })
        }

    }
})
chrome.storage.local.get(null, function (data) {
    console.log(data, "data2");
    if (data.stage == "redirected") {
        setTimeout(() => {
            console.log(data);
            let text = data.text;
            let image = data.image;
            let caption = data.caption;
            if (text != "") {
                send_text(text)
            }
            if (image != "") {
                // upload_image(image)
            }

        }, 1000);

    }
})

function click_send() {
    console.log("waiting to clicking send");
    waitForElm('[data-icon="send"]').then((elSend) => {
        console.log("elSend length = ", elSend, elSend[0]);
        if (elSend[0] === undefined) {
            setTimeout(() => {
                click_send()
            }, 10);
            return;
        }
        if (elSend[0] !== undefined) {
            setTimeout(() => {
                elSend[0].click()
                chrome.storage.local.set({ stage: "sent", activete: false })
            }, 100);
        } else
            setTimeout(() => {
                click_send()
            }, 10);
    })
}
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelectorAll(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelectorAll(selector)) {
                resolve(document.querySelectorAll(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}