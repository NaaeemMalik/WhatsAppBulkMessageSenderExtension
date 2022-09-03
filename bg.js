chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);
        if (request.do === "send") {
            chrome.storage.local.get(null, function (data) {
                console.log(data);
                let text = data.firstInput;
                //split text new lines in array
                let textArray = text.split("\n");
                for (let i = 0; i < textArray.length; ++i) {
                    console.log(textArray[i]);
                    chrome.runtime.sendMessage({
                        "do": "sendOne",
                        "cred": textArray[i]
                    });
                }
            })

        }
    }
);
