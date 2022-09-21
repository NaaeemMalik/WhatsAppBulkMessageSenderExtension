console.log("wa.js loaded");
function alert(text) {
    console.warn(text)
}
function send_text(text, wait = false, templeteLastItem = false) {
    if (isLastItemOfLastTempleteSent) return
    console.log("sending text", templeteLastItem, wait);
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text', text);
    const event = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true
    });
    let selector = '.selectable-text.copyable-text'
    let textEXPECTEDLENGTH = 2
    if (wait) { textEXPECTEDLENGTH = 0; selector = '[data-testid="media-caption-input-container"]' }
    //console.log("waiting for textbox to appear");
    waitForElm(selector).then((el) => {
        console.log("text element found ", el.length, textEXPECTEDLENGTH, el.length < textEXPECTEDLENGTH, sending, waitforimageforcaptiontext);
        if (el.length < textEXPECTEDLENGTH || sending || waitforimageforcaptiontext) {
            setTimeout(() => {
                send_text(text, wait, templeteLastItem)
            }, 10);
            return;
        }
        alert("picked textbox element " + selector + wait)
        console.log("textfields length ", el.length)
        el = el[el.length - 1]
        //writing text in text field
        if (lastSentTextMessage !== text) {
            el.dispatchEvent(event)
            lastSentTextMessage = text
            sending = true
            console.log("wait for send image button");
            setTimeout(() => {
                alert("click_send send with " + templeteLastItem)
                click_send(templeteLastItem)
            }, 1000);
        }

    })
}

let waitforimageforcaptiontext = false
function upload_image(image, wait = false, templeteLastItem = false) {
    if (isLastItemOfLastTempleteSent) return
    if (image == lastSentImageMessage) return
    waitforimageforcaptiontext = wait
    alert("waitforimageforcaptiontext" + waitforimageforcaptiontext)
    waitForElm('[data-icon=clip]').then((elm) => {
        if (elm[0] === undefined || sending) {
            console.log("waiting for clip icon undefined");
            setTimeout(() => {
                upload_image(image, wait, templeteLastItem)
            }, 100);
            return;
        }
        if (image == lastSentImageMessage) return
        console.log("clip icon found and clicked");
        elm[0].click()
        let imgTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/jpg', 'image/bmp']
        let imageURL = ""
        for (let j = 0; j < imgTypes.length; j++) {
            let tmpstr = 'data:' + imgTypes[j] + ';base64,'
            if (image.startsWith(tmpstr))
                imageURL = b64toBlob(
                    image.replace(tmpstr, ''),
                    imgTypes[j],
                    512
                );
        }
        console.log("sending image request", image);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", imageURL);
        xhr.responseType = "blob";
        xhr.onload = function (e) {
            console.log("image loaded", e);
            if (xhr.status === 200) {
                console.log("wait for image upload button");
                if (image == lastSentImageMessage) return
                waitForElm('[type=file]').then((input) => {
                    const dT = new ClipboardEvent('').clipboardData || new DataTransfer(); // specs 
                    dT.items.add(new File([xhr.response], "attachment.jpg", { type: "image/jpeg" }));
                    if (image != lastSentImageMessage) {
                        input[0].files = dT.files;
                        var evt = new Event('change', {
                            'bubbles': true,
                            'cancelable': false,
                        });
                        lastSentImageMessage = image
                        console.log("last sent image is now ", lastSentImageMessage);

                        input[0].dispatchEvent(evt);
                        console.log("image uploaded");
                        console.log("wait is ", wait, waitforimageforcaptiontext);

                        setTimeout(() => {
                            alert("waitforimageforcaptiontext became false");
                            waitforimageforcaptiontext = false
                            if (!wait) {
                                sending = true
                                console.log("wait for send image button");
                                alert("about to send only image message not caption");
                                click_send(templeteLastItem)
                            }
                        }, 1000);
                    }
                })
            }
            xhr.onloadend = (event) => {
                console.log("xhr.onloadend, wait=", wait);
                if (event.loaded && xhr.response) {
                    //   resolve(xhr.response);
                } else {
                    console.log("image error", event)
                    try { document.querySelector('[data-icon="send"]').click() } catch (e) { console.log("image error2 ", e) }
                    click_send(templeteLastItem)
                }
            }
        }
        xhr.send();
    })
}

let activete = false
let sending = false
let isStageSent = false
let isLastItemOfLastTempleteSent = false
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Storage key "${key}" in namespace "${namespace}" changed. Old value was "${oldValue}", new value is "${newValue}".`);
        if (key === "url") {
            console.log("url changed, reloading");
            location.href = newValue
        }
        if (key == "stage" && newValue == "sent") isStageSent = true
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
let waitForTempleteToBeSent = true
let lastSentTextMessage = ""
let lastSentImageMessage = ""
recursiveSendAllTemplates = (data, i) => {
    let thisIsSent = false
    console.log("recursiveSendAllTemplates sending it ", data["dosend" + i], i, data.tCount, i >= data.tCount)
    if (data["dosend" + i] === undefined) {
        thisIsSent = true
        alert("looks like all templates are sent", i, data.tCount)
        if (!isStageSent)
            chrome.storage.local.set({ stage: "sent", activete: false })
        isLastItemOfLastTempleteSent = true
        return
    }
    if (data["dosend" + i] !== true) {
        thisIsSent = true
        alert("not sending templete " + data["dosend" + i] + i + data.tCount);
        setTimeout(() => {
            recursiveSendAllTemplates(data, i + 1)
        }, 100);
        return
    }
    console.log("passed dosend if ", i);

    setTimeout(() => {
        waitForTempleteToBeSent = true
        let text = data["dotext" + i];
        let image = data["doimage" + i];
        let wait = data["docaption" + i];
        console.log("text", text, "img ", image, " wait ", wait, thisIsSent);
        if (!thisIsSent)
            if (wait && image) {
                alert('%c sending with caption! ' + i + image.length + (image.length == 1));
                upload_image(image[0], wait)
                console.log("send_text111", text, wait, image.length == 1);
                send_text(text, wait, image.length == 1)
                // if (image.length == 1) thisIsSent = true
                for (let ii = 1; ii < image.length; ii++) {
                    alert("sent caption one, now sending remaing without caption " + ii + image.length + (ii == image.length - 1));
                    upload_image(image[ii], false, ii == image.length - 1)
                    // if (ii == image.length - 1) thisIsSent = true
                }
            } else {
                alert('%c sending WITHOUT caption! ' + i);
                if (text != "") {
                    send_text(text, wait, !image)
                    //if (!image) thisIsSent = true
                }
                if (image) {
                    console.log("uploading image", image);
                    for (let ii = 0; ii < image.length; ii++) {
                        upload_image(image[ii], false, ii == image.length - 1)
                        // if (ii == image.length - 1) thisIsSent = true
                    }
                }
            }
        let myinterval = setInterval(() => {
            console.log("checking if next template can be sent ", i, data.tCount, waitForTempleteToBeSent);
            if (waitForTempleteToBeSent === false) {
                alert("sending next template " + i + data.tCount);
                if (i < data.tCount) {
                    alert("tCount is lesser the i yet i=" + i + " tcount=" + data.tCount)
                    setTimeout(() => {
                        recursiveSendAllTemplates(data, i + 1)
                        clearInterval(myinterval)
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
                            isLastItemOfLastTempleteSent = true
                            if (!isStageSent)
                                chrome.storage.local.set({ stage: "sent", activete: false })
                            clearInterval(myinterval)
                        }, 3000);
                    }, 3000);
                }
            }
        }, 1000);


    }, 500);

}
function click_send(templeteLastItem = false) {
    if (isLastItemOfLastTempleteSent) return
    sending = true
    console.log("click_send() waiting to clicking send", templeteLastItem);
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
                    if (isLastItemOfLastTempleteSent) return
                    elSend[0].click()
                    sending = false
                    if (templeteLastItem) {
                        alert("templeteLastItem, waitForTempleteToBeSent = false now");
                        waitForTempleteToBeSent = false
                    }
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
}
window.onbeforeunload = function () {
    // blank function do nothing
}