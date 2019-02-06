// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const BrowserWindow = require('electron').remote.BrowserWindow;
const BrowserView = require('electron').remote.BrowserView;

const $ = require('jquery')

let sesID = 0

$(document).ready(function () {

    $("#nwin").on("click", () => {
        createNewWin($("#nurl").val())
    })

})




function createNewWin(URL, UA, refURL) {


    if (!URL.startsWith("http://") && !URL.startsWith("https://")) {
        URL = "http://" + URL
    }

    //创建窗口，隔离会话
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
            nodeIntegration: false,
            partition: "sesid-" + sesID
        }
    })


    win.loadURL(URL, {
        userAgent: UA,
        httpReferrer: refURL
    })


}


function getABCOrderData(win) {

    let wc = win.webContents

    //如果不是主界面，说明未登录
    if (wc.getURL() != "https://perbank.abchina.com/EbankSite/qrlogin.do" &&
        wc.getURL() != "https://perbank.abchina.com/EbankSite/upLogin.do") {

        console.log("wait login...")

    } else { //登录后的界面，直接调用fetch抓取

        let code = 'fetch("https://perbank.abchina.com/EbankSite/AccountTradeDetailQuery1Act.do", { "credentials": "include","headers": {"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},"referrer": "https://perbank.abchina.com/EbankSite/AccountTradeDetailQueryInitAct.do","referrerPolicy": "no-referrer-when-downgrade","body": "trnStartDt=20190131&trnEndDt=20190201&acctId=6228411414506392171&acctType=401","method": "POST","mode": "cors"}).then(    res => res.json()).catch(error => console.error("Error:", error))'


        wc.executeJavaScript(code, true)
            .then((result) => {

                //判断一下是否有新数据
                for (let index = 0; index < result["table"].length; index++) {
                    const row = result["table"][index];

                    if (JSON.stringify(row) == JSON.stringify(lastUpdateTimes[win.id])) {
                        break;
                    }

                    //处理数据(回调给服务器) **************
                    //Todo Call back
                    console.log("new row:", row)
                }

                //设置本窗口的最新的数据行，用于识别新数据
                lastUpdateTimes[win.id] = result["table"][0]


                console.log("lastest:", lastUpdateTimes[win.id])

            })

    }

    //N秒后，抓取数据
    setTimeout(() => {
        getABCOrderData(win)
    }, 5000);

}