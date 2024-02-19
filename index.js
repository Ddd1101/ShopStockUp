let AppKey = {'联球制衣厂': '3527689', '朝雄制衣厂': '4834884', '万盈饰品厂': '2888236'}
let AppSecret = {"联球制衣厂": 'Zw5KiCjSnL', "朝雄制衣厂": 'JeV4khKJshr', "万盈饰品厂": 'Zy7QvG0bQJI'}
let access_token = {'联球制衣厂': '999d182a-3576-4aee-97c5-8eeebce5e085',
                '朝雄制衣厂': 'ef65f345-7060-4031-98ad-57d7d857f4d9',
                '万盈饰品厂': 'f2f18480-0067-462f-9fac-952311ad4349'}

let request_type = {
    'trade': "param2/1/com.alibaba.trade/",
    'delivery': 'param2/1/com.alibaba.logistics/'
};

let base_url = 'https://gw.open.1688.com/openapi/';

let orderMap = {
    '联球制衣厂':{},
    '朝雄制衣厂':{}
}

let gLogisticsBillNo = "";

function FindInMap() {
    Clean2();
    gLogisticsBillNo = document.getElementById('logisticsBillNo').value;
    let isFind = false;

    for (let shopName in orderMap) {
        let orderList = orderMap[shopName];
        for (let order in orderList) {
            let logisticsBillNoList = orderList[order]['logistics'];
            for (let logisticsBillNo of logisticsBillNoList) {
                if (String(logisticsBillNo) == String(gLogisticsBillNo)) {
                    isFind = true;
                    Show(orderList[order]['data']);

                    document.getElementById('orderId').innerHTML = order;
                }

                if(isFind){
                    break;
                }
            }
            if(isFind){
                break;
            }
        }
        if(isFind){
            break;
        }
    }

    if(!isFind){
        DoProcess();
    }
}


function DoProcess() {
    Clean2();
    // 1. 获取订单id & 获取对应的物流单号 & 存储
    GetOrderList();
}

function GetOrderList() {
    var today = new Date();
    today.setDate(today.getDate() - 30);
    var startYear = today.getFullYear();
    var startMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    var startDay = today.getDate().toString().padStart(2, '0');
    var startTime = startYear + startMonth + startDay + '000000000+0800'

    today = new Date();
    today.setDate(today.getDate() + 1);
    var endYear = today.getFullYear();
    var endMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    var endDay = today.getDate().toString().padStart(2, '0');
    var endTime = endYear + endMonth + endDay + '000000000+0800'

    let orderstatus = 'waitbuyerreceive';

    let shopNameList = ['联球制衣厂', '朝雄制衣厂'];

    let  orderListRaw = [];


    shopNameList.forEach((shopName) => {
        const data = {
            'createStartTime': startTime.trim(),
            'createEndTime': endTime.trim(),
            'orderStatus': orderstatus.trim(),
            'needMemoInfo': 'true'
        };

        response = GetTradeList(data, shopName);
    });
}


function GetTradeList(data, shopName) {
    data['access_token'] = access_token[shopName];
    const _aop_signature = CalculateSignature(request_type['trade'] + "alibaba.trade.getSellerOrderList/" + AppKey[shopName], data, shopName);
    data['_aop_signature'] = _aop_signature;

    let params = new URLSearchParams(data).toString();

    const url = base_url + request_type['trade'] + "alibaba.trade.getSellerOrderList/" + AppKey[shopName];
    try {
        setTimeout(() => {
            fetch(url, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => MapOrderId(data, shopName))
            .catch(error => console.error('post error', error));
        }, 200);
    } catch (error) {
        console.error('post error', error);
    }
}

function MapOrderId(data, shopName){
    orderList = data.result;

    orderList.forEach((order) => {
        if(!orderMap[shopName].hasOwnProperty(order['baseInfo']['idOfStr'])){
            let _orderId = order['baseInfo']['idOfStr'];
            orderMap[shopName][_orderId] = {'logistics':[]};
            GetTradeData(_orderId, shopName);
        }
    })

    console.log(orderMap);
}

function GetTradeData(orderId, shopName){
    const data = {
        'orderId': String(orderId)
    };

    data['access_token'] = access_token[shopName];
    const _aop_signature = CalculateSignature(request_type['trade'] + "alibaba.trade.get.sellerView/" + AppKey[shopName], data, shopName);
    data['_aop_signature'] = _aop_signature;

    let params = new URLSearchParams(data).toString();

    const url = base_url + request_type['trade'] + "alibaba.trade.get.sellerView/" + AppKey[shopName];

    try {
        setTimeout(() => {
            fetch(url, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => MapLogisticsBillNoAndData(shopName, orderId, data))
            .catch(error => console.error('post error', error));
        }, 200);
    } catch (error) {
        console.error('post error', error);
    }
}

function MapLogisticsBillNoAndData(shopName, orderId, data){
    console.log(data);
    let logisticsItems = data['result']['nativeLogistics']['logisticsItems'];
    let isFind = false;

    for(let logisticsItem of logisticsItems) {
        let logisticsBillNo = logisticsItem['logisticsBillNo']
        if (!orderMap[shopName][orderId]['logistics'].includes(logisticsBillNo)) {
            orderMap[shopName][orderId]['logistics'].push(logisticsBillNo);
            orderMap[shopName][orderId]['data'] = data;
        }

        console.log(logisticsBillNo);
        console.log(gLogisticsBillNo);

        if (logisticsBillNo == gLogisticsBillNo) {
            isFind = true;
            break;
        }
    }

    if (isFind) {
        document.getElementById('orderId').innerHTML = orderId;
        // document.getElementById('shopName').innerHTML = data['result']['baseInfo']['sellerContact']['companyName'];
        Show(data);
    }
}

function Show(data) {
    console.log("Show");

    console.log(data['result']['productItems']);

    formateJson = {};
    var table = document.getElementById("productTable");
    for(let item of data['result']['productItems']){
        var row = table.insertRow();
        var name = row.insertCell(0);
        var color = row.insertCell(1);
        var size = row.insertCell(2);
        var num = row.insertCell(3);
        var img = row.insertCell(4);
        name.innerHTML = item['name'];
        color.innerHTML = item['skuInfos'][0]['value'];
        size.innerHTML = item['skuInfos'][1]['value'];
        num.innerHTML = item['quantity'];
        img.innerHTML = '<img src="' + item['productImgUrl'][1] + '" alt="' + name + '" onclick="showImage(this.src)">'; 
    }
}

function CalculateSignature(urlPath, data, shopName) {
    // 构造签名因子：urlPath

    // 构造签名因子：拼装参数
    const params = Object.keys(data).map(key => key + data[key]);
    params.sort();
    const assembedParams = params.join('');

    // 合并签名因子
    let mergedParams = urlPath + assembedParams;

    // 执行hmac_sha1算法 && 转为16进制
    let hex_res1 = CryptoJS.HmacSHA1(mergedParams, AppSecret[shopName]);


    hex_res1_str = hex_res1.toString();

    // 转为全大写字符
    hex_res1_str = hex_res1_str.toUpperCase();

    return hex_res1_str;
}

// 清除
function Clean() {
    document.getElementById('logisticsBillNo').value = '';
    document.getElementById('orderId').innerHTML = '';

    var table = document.getElementById("productTable");
    table.innerHTML = "";
}

function Clean2() {
    document.getElementById('orderId').innerHTML = '';

    var table = document.getElementById("productTable");
    table.innerHTML = "";
}


var modal = document.getElementById('myModal');

// 获取用于展示放大图片的<img>标签
var modalImg = document.getElementById("img01");

// 获取关闭按钮
var span = document.getElementsByClassName("close")[0];


// 点击图片打开模态框
function showImage(src) {
    modal.style.display = "block";
    modalImg.src = src;
}

// 点击 <span> (x), 关闭模态框
span.onclick = function() {
    modal.style.display = "none";
}