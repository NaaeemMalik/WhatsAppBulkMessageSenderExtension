function replaceAll(str, find, replace) {
    return str.replace(find, replace);
}
let outerLoop = 0;
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Storage key "${key}" in namespace "${namespace}" changed. Old value was "${oldValue}", new value is "${newValue}".`);

        if (key == "send") {
            manageAllNumbers()
        } else if (key == "stage" && newValue == "sent") {
            console.log("stage changed to sent");
            outerLoop++;
            console.log("outerLoop", outerLoop);
            manageAllNumbers()
        }

    }
});


let captionNum = 0
manageAllNumbers = () => {
    console.log("manageAllNumbers", outerLoop);
    chrome.storage.local.get(null, function (data) {
        console.log(data);
        let text = data.firstInput;
        //split text new lines in array
        let textArray = text.split("\n");
        if (outerLoop < textArray.length) {

            console.log(textArray[outerLoop], outerLoop, textArray.length);
            let username = textArray[outerLoop].split(",")[0];
            let password = textArray[outerLoop].split(",")[1];
            let date = textArray[outerLoop].split(",")[2];
            let number = textArray[outerLoop].split(",")[3];


            let tmp = {
                "sendOne": Math.random(239895),
                "url": "https://web.whatsapp.com/send?phone=" + number + "&text&type=phone_number&app_absent=0",
                "stage": "redirecting",
                "outerLoop": outerLoop
            }
            //if()
            for (innerLoop = 0; innerLoop < data.tCount; innerLoop++) {
                let caption = data["checkbox" + (captionNum)]
                console.log("caption", captionNum, caption);
                captionNum++;
                let sendIt = data["checkbox" + (captionNum)]
                console.log("sendIt", captionNum, sendIt);
                captionNum++;
                console.log("accessing textarea ", innerLoop);
                let textareai
                if (data["textarea" + (innerLoop + 1)]) {
                    textareai = replaceAll(data["textarea" + (innerLoop + 1)], "[username]", username);
                    textareai = replaceAll(textareai, "[password]", password);
                    textareai = replaceAll(textareai, "[date]", date);
                }
                tmp["dotext" + innerLoop] = textareai ? textareai : "";
                tmp["docaption" + innerLoop] = caption ? caption : false;
                tmp["doimage" + innerLoop] = data["image" + innerLoop] ? data["image" + innerLoop] : null;
                tmp["dosend" + innerLoop] = sendIt;
            }
            console.log("tmp sent msg ", tmp);
            chrome.storage.local.set(tmp);

        }
    })
}