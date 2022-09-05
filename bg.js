function replaceAll(str, find, replace) {
    return str.replace(find, replace);
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Storage key "${key}" in namespace "${namespace}" changed. Old value was "${oldValue}", new value is "${newValue}".`);

        if (key == "send") {
            chrome.storage.local.get(null, function (data) {
                console.log(data);
                let text = data.firstInput;
                //split text new lines in array
                let textArray = text.split("\n");
                for (let i = 0; i < textArray.length; ++i) {
                    console.log(textArray[i], i, textArray.length);
                    let username = textArray[i].split(",")[0];
                    let password = textArray[i].split(",")[1];
                    let date = textArray[i].split(",")[2];
                    let textarea1 = replaceAll(data.textarea1, "[username]", username);
                    textarea1 = replaceAll(textarea1, "[password]", password);
                    textarea1 = replaceAll(textarea1, "[date]", date);
                    let textarea2 = replaceAll(data.textarea2, "[username]", username);
                    textarea2 = replaceAll(textarea2, "[password]", password);
                    textarea2 = replaceAll(textarea2, "[date]", date);
                    console.log(textarea1);
                    console.log(textarea2);
                    chrome.runtime.sendMessage({
                        "do": "sendOne",
                        "cred": textarea1
                    });
                }
            })
        }

    }
});
