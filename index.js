let AppKey = {'联球制衣厂': '3527689', '朝雄制衣厂': '4834884', '万盈饰品厂': '2888236'}
let AppSecret = {"联球制衣厂": 'Zw5KiCjSnL', "朝雄制衣厂": 'JeV4khKJshr', "万盈饰品厂": 'Zy7QvG0bQJI'}
let access_token = {'联球制衣厂': '999d182a-3576-4aee-97c5-8eeebce5e085',
                '朝雄制衣厂': 'ef65f345-7060-4031-98ad-57d7d857f4d9',
                '万盈饰品厂': 'f2f18480-0067-462f-9fac-952311ad4349'}

let request_type = {
    'trade': "param2/1/com.alibaba.trade/",
    'delivery': 'param2/1/com.alibaba.logistics/'
};

base_url = 'https://gw.open.1688.com/openapi/';




function DoProcess() {
    // 1. 获取订单id并存储
    GetOrderList();
}

function GetOrderList() {
    var today = new Date();
    today.setDate(today.getDate() - 2);
    var startYear = today.getFullYear();
    var startMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    var startDay = today.getDate().toString().padStart(2, '0');
    var startTime = startYear + startMonth + startDay + '000000000+0800'

    today = new Date();
    today.setDate(today.getDate() + 0);
    var endYear = today.getFullYear();
    var endMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    var endDay = today.getDate().toString().padStart(2, '0');
    var endTime = endYear + endMonth + endDay + '000000000+0800'

    let orderstatus = 'waitbuyerreceive';

    let shopNameList = ['联球制衣厂'];

    let  orderListRaw = [];


    shopNameList.forEach((shopName) => {
        const data = {
            'createStartTime': startTime.trim(),
            'createEndTime': endTime.trim(),
            'orderStatus': orderstatus.trim(),
            'needMemoInfo': 'true'
        };

        response = GetTradeData(data, shopName);
    });
}


function GetTradeData(data, shopName) {
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
            .then(data => console.log(data))
            .catch(error => console.error('post error', error));
        }, 200);
    } catch (error) {
        console.error('post error', error);
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
