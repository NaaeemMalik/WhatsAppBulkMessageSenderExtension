console.log("wa.js loaded");

function send_text(text, wait) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text', text);
    const event = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true
    });
    //console.log("waiting for textbox to appear");
    waitForElm('.selectable-text.copyable-text').then((el) => {
        //console.log("el length = ", el);
        if (el.length < 2 || sending) {
            setTimeout(() => {
                send_text(text, wait)
            }, 10);
            return;
        }
        console.log("textfields length ", el.length)
        el = el[el.length - 1]
        el.dispatchEvent(event)

        console.log("wait ", !wait, "clcking send");
        if (!wait) click_send()
    })
}

function upload_image(image) {
    waitForElm('[data-icon=clip]').then((elm) => {
        if (elm[0] === undefined || sending) {
            console.log("waiting for clip icon undefined");
            setTimeout(() => {
                upload_image(image)
            }, 10);
            return;
        }
        elm[0].click()
        console.log("sending image request");
        var xhr = new XMLHttpRequest();
        xhr.open("GET", image);
        xhr.responseType = "blob";
        xhr.onload = function (e) {
            console.log("image loaded", e);
            if (xhr.status === 200) {
                console.log("wait for image upload button");
                waitForElm('[type=file]').then((input) => {
                    const dT = new ClipboardEvent('').clipboardData || new DataTransfer(); // specs 
                    dT.items.add(new File([xhr.response], "test.jpg", { type: "image/jpeg" }));
                    input[0].files = dT.files;
                    var evt = new Event('change', {
                        'bubbles': true,
                        'cancelable': false,
                    });

                    input[0].dispatchEvent(evt);
                    setTimeout(() => {
                        console.log("wait for send image button");
                        click_send()
                    }, 1000);

                })
            }

        }
        xhr.onloadend = (event) => {
            console.log("xhr.onloadend", event, xhr.status, xhr.statusText, xhr.readyState, xhr);
            if (event.loaded && xhr.response) {
                //   resolve(xhr.response);
            } else {
                console.log("error", event)
                click_send()

            }
        }
        xhr.send();


    });
}

let activete = false
let sending = false
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
        console.log(data);
        let text = data.text;
        let image = data.image;
        let wait = data.caption;
        console.log("img ", image, " wait ", wait);
        if (text != "") {
            send_text(text, wait)
        }
        if (image) {
            upload_image(image)
        }

    }
})

function click_send() {
    sending = true
    console.log("click_send() waiting to clicking send");
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
                console.log("sent clicked", elSend[0]);
                elSend[0].click()
                chrome.storage.local.set({ stage: "sent", activete: false })
                sending = false
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