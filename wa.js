console.log("wa.js loaded");

function send_text(text, wait = false) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text', text);
    const event = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true
    });
    let selector = '.selectable-text.copyable-text'
    let textEXPECTEDLENGTH = 2
    if (!wait) { textEXPECTEDLENGTH = 0; selector = '[data-testid="media-caption-input-container"]' }
    //console.log("waiting for textbox to appear");
    waitForElm(selector).then((el) => {
        console.log("text element found ", el.length, textEXPECTEDLENGTH, el.length < textEXPECTEDLENGTH, sending, waitforimageforcaptiontext);
        if (el.length < textEXPECTEDLENGTH || sending || waitforimageforcaptiontext) {
            setTimeout(() => {
                send_text(text, wait)
            }, 10);
            return;
        }
        alert("picked textbox element " + selector)
        console.log("textfields length ", el.length)
        el = el[el.length - 1]
        //writing text in text field
        el.dispatchEvent(event)

        sending = true
        console.log("wait for send image button");
        setTimeout(() => {
            click_send()
        }, 1000);

    })
}
let waitforimageforcaptiontext = false
function upload_image(image, wait = false) {
    waitforimageforcaptiontext = !wait
    alert("waitforimageforcaptiontext" + waitforimageforcaptiontext)
    waitForElm('[data-icon=clip]').then((elm) => {
        if (elm[0] === undefined || sending) {
            console.log("waiting for clip icon undefined");
            setTimeout(() => {
                upload_image(image)
            }, 100);
            return;
        }
        console.log("clip icon found and clicked");
        elm[0].click()

        image = b64toBlob(
            image.replace('data:image/jpeg;base64,', ''),
            'image/jpeg',
            512
        );

        console.log("sending image request", image);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", image);
        xhr.responseType = "blob";
        xhr.onload = function (e) {
            console.log("image loaded", e);
            if (xhr.status === 200) {
                console.log("wait for image upload button");
                waitForElm('[type=file]').then((input) => {
                    const dT = new ClipboardEvent('').clipboardData || new DataTransfer(); // specs 
                    dT.items.add(new File([xhr.response], "attachment.jpg", { type: "image/jpeg" }));
                    input[0].files = dT.files;
                    var evt = new Event('change', {
                        'bubbles': true,
                        'cancelable': false,
                    });

                    input[0].dispatchEvent(evt);
                    console.log("image uploaded");
                    console.log("wait is ", wait, waitforimageforcaptiontext);
                    alert("about to send only image message not caption");
                    sending = true
                    alert("waitforimageforcaptiontext became false");
                    setTimeout(() => {
                        alert("waitforimageforcaptiontext became false");
                        waitforimageforcaptiontext = false
                        if (wait) {
                            console.log("wait for send image button");
                            click_send()
                        }
                    }, 1000);

                })
            }
            xhr.onloadend = (event) => {
                console.log("xhr.onloadend, wait=", wait);
                if (event.loaded && xhr.response) {
                    //   resolve(xhr.response);
                } else {
                    console.log("image error", event)
                    try { document.querySelector('[data-icon="send"]').click() } catch (e) { console.log("image error2 ", e) }
                    click_send()
                }
            }
        }
        xhr.send();
    })
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
                console.log(data, "data", data.url);
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
        recursiveSendAllTemplates(data, 0)
    }
})
recursiveSendAllTemplates = (data, i) => {
    console.log("sending it ", data["dosend" + i], i, data.tCount, i >= data.tCount)
    if (data["dosend" + i] === undefined) {
        alert("looks like all templates are sent", i, data.tCount)
        return
    }
    if (data["dosend" + i] !== true) {
        alert("not sending templete " + data["dosend" + i] + i + data.tCount);
        setTimeout(() => {
            recursiveSendAllTemplates(data, i + 1)
        }, 100);
        return
    }
    console.log("passed dosend if ", i);

    setTimeout(() => {
        let waitForTempleteToBeSent = true
        let text = data["dotext" + i];
        let image = data["doimage" + i];
        let wait = data["docaption" + i];
        console.log("text", text, "img ", image, " wait ", wait);
        if (!wait) {
            alert('%c sending with caption! ' + i);
            upload_image(image[0], wait)
            send_text(text, wait)

            for (let ii = 1; ii < image.length; ii++)
                upload_image(image[ii])

        } else {
            alert('%c sending WITHOUT caption! ' + i);
            if (text != "") {
                send_text(text)
            }
            if (image) {
                console.log("uploading image", image);
                for (let ii = 0; ii < image.length; ii++)
                    upload_image(image[ii])
            }
        }
        setInterval(() => {
            if (waitForTempleteToBeSent === false) {
                alert("sending next template " + i + data.tCount);
                if (i < data.tCount) {
                    alert("tCount is lesser the i yet i=" + i + " tcount=" + data.tCount)
                    setTimeout(() => {
                        recursiveSendAllTemplates(data, i + 1)
                    }, 1000);
                } else {
                    alert("tCount is equal to i", i, data.tCount)
                    console.warn("stopped stage from being sent for 5 seconds");
                    setTimeout(() => {
                        console.log("last sent click");
                        click_send()
                        setTimeout(() => {
                            console.log("moving to next number");
                            alert("done sending all templates")
                            chrome.storage.local.set({ stage: "sent", activete: false })
                        }, 3000);
                    }, 3000);
                }
            }
        }, 1000);



    }, 500);

}
function click_send() {
    sending = true
    console.log("click_send() waiting to clicking send");
    setTimeout(() => {
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
                    sending = false
                    waitForTempleteToBeSent = false
                }, 100);
            } else
                setTimeout(() => {
                    click_send()
                }, 10);
        })
    }, 500);

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
const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return window.URL.createObjectURL(blob)
};