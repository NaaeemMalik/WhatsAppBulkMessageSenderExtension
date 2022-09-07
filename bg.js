function replaceAll(str, find, replace) {
    return str.replace(find, replace);
}
let outerLoop = 0;
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Storage key "${key}" in namespace "${namespace}" changed. Old value was "${oldValue}", new value is "${newValue}".`);

        if (key == "send") {
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
                    let innerLoop = 0

                    let textareai = replaceAll(data["textarea" + (innerLoop + 1)], "[username]", username);
                    textareai = replaceAll(textareai, "[password]", password);
                    textareai = replaceAll(textareai, "[date]", date);
                    console.log(textareai);

                    chrome.storage.local.set({
                        "sendOne": Math.random(239895),
                        "url": "https://web.whatsapp.com/send?phone=" + number + "&text&type=phone_number&app_absent=0",
                        "text": textareai,
                        "caption": data["checkbox" + innerLoop],
                        "image": data["image" + innerLoop],
                        "outerLoop": outerLoop,
                        "innerLoop": innerLoop,
                        "stage": "redirecting"
                    });

                }

            })
        }

    }
});
