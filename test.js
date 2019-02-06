let promise = new Promise(function (resolve, reject) {

    console.log("runing")

    if (1 != 1) {
        resolve("success")
    } else {
        reject("fail")
    }
})


promise.then(function (res) {
    console.log("then:", res)
}).catch(function (err) {
    console.log("err:", err)
})