let AppKey = {
  联球制衣厂: "3527689",
  朝雄制衣厂: "4834884",
  朝瑞制衣厂: "4834884",
  万盈饰品厂: "3527689",
  义乌睿得: "3527689",
};
let AppSecret = {
  联球制衣厂: "Zw5KiCjSnL",
  朝雄制衣厂: "JeV4khKJshr",
  朝瑞制衣厂: "JeV4khKJshr",
  万盈饰品厂: "Zw5KiCjSnL",
  义乌睿得: "Zw5KiCjSnL",
};
let access_token = {
  联球制衣厂: "999d182a-3576-4aee-97c5-8eeebce5e085",
  朝雄制衣厂: "ef65f345-7060-4031-98ad-57d7d857f4d9",
  朝瑞制衣厂: "438de82f-d44f-44f1-b343-4e0721b9e767",
  万盈饰品厂: "cd62b5c5-00d1-41c9-becf-4f9dfcbf4b75",
  义乌睿得: "7f813331-15d6-40a8-97ac-00589efc8e81",
};

let request_type = {
  trade: "param2/1/com.alibaba.trade/",
  delivery: "param2/1/com.alibaba.logistics/",
};

let base_url = "https://gw.open.1688.com/openapi/";

let orderMap = {
  联球制衣厂: {},
  朝雄制衣厂: {},
  万盈饰品厂: {},
  义乌睿得: {},
};

let locationMap = {
  万盈饰品厂: {},
};

let location_table = {};

const SHOP_TYPE = {
  CLOTH: 0,
  JEWELRY: 1,
};

// 找到文本输入框
var input = document.getElementById("logisticsBillNo");

// 添加事件监听器，以确保失去焦点时再次聚焦
input.addEventListener("blur", function () {
  input.focus();
});

// 自动初始化
window.onload = function () {
  document.getElementById("status").innerHTML = "获取后台订单信息";
  getSeaTableToken();

  DoProcess();

  document.getElementById("status").innerHTML = "等待查询";

  input.disabled = false;
  input.focus();
};

let gLogisticsBillNo = "";

input.focus();
// 添加事件监听器
input.addEventListener("keyup", function (event) {
  // 检查按下的是否是回车键
  if (event.keyCode === 13) {
    // 执行您的代码
    // alert("回车键被按下！");
    FindInMap();
    input.value = "";
  }
});

function FindInMap() {
  Clean2();

  input.disabled = true;

  document.getElementById("status").innerHTML = "订单信息查询中。。。";

  gLogisticsBillNo = document.getElementById("logisticsBillNo").value;
  let isFind = false;

  document.getElementById("deliverId").innerHTML = input.value;
  input.value = "";

  for (let shopName in orderMap) {
    let orderList = orderMap[shopName];
    for (let order in orderList) {
      let logisticsBillNoList = orderList[order]["logistics"];
      for (let logisticsBillNo of logisticsBillNoList) {
        if (String(logisticsBillNo) == String(gLogisticsBillNo)) {
          isFind = true;
          shopType = SHOP_TYPE.CLOTH;
          if (shopName == "万盈饰品厂") {
            shopType = SHOP_TYPE.JEWELRY;
          }
          document.getElementById("orderId").innerHTML = order;

          Show(orderList[order]["data"], shopType);
        }

        if (isFind) {
          break;
        }
      }
      if (isFind) {
        break;
      }
    }
    if (isFind) {
      break;
    }
  }

  if (!isFind) {
    document.getElementById("status").innerHTML = "未查询到，获取后台订单信息";
    DoProcess();
  }
}

function DoProcess() {
  console.log("DoProcess");
  Clean2();
  input.disabled = true;
  // 1. 获取订单id & 获取对应的物流单号 & 存储
  GetOrderList();

  document.getElementById("status").innerHTML = "未查询到，此单无法查询";

  input.disabled = false;
  input.focus();
}

function GetOrderList() {
  console.log("GetOrderList");
  var today = new Date();
  today.setDate(today.getDate() - 5);
  var startYear = today.getFullYear();
  var startMonth = (today.getMonth() + 1).toString().padStart(2, "0");
  var startDay = today.getDate().toString().padStart(2, "0");
  var startTime = startYear + startMonth + startDay + "000000000+0800";

  today = new Date();
  today.setDate(today.getDate() + 1);
  var endYear = today.getFullYear();
  var endMonth = (today.getMonth() + 1).toString().padStart(2, "0");
  var endDay = today.getDate().toString().padStart(2, "0");
  var endTime = endYear + endMonth + endDay + "000000000+0800";

  let orderstatus = "waitbuyerreceive";

  let shopNameList = ["联球制衣厂", "朝雄制衣厂", "万盈饰品厂", "朝瑞制衣厂"];
  // let shopNameList = ["联球制衣厂"];
  // let shopNameList = ["万盈饰品厂"];
  // let shopNameList = ["义乌睿得"];

  let orderListRaw = [];

  shopNameList.forEach((shopName) => {
    const data = {
      createStartTime: startTime.trim(),
      createEndTime: endTime.trim(),
      orderStatus: orderstatus.trim(),
      needMemoInfo: "true",
    };

    GetTradeList(data, shopName);
  });
}

function GetTradeList(data, shopName) {
  console.log("GetTradeList");
  data["access_token"] = access_token[shopName];
  const _aop_signature = CalculateSignature(
    request_type["trade"] +
      "alibaba.trade.getSellerOrderList/" +
      AppKey[shopName],
    data,
    shopName
  );
  data["_aop_signature"] = _aop_signature;

  let params = new URLSearchParams(data).toString();

  const url =
    base_url +
    request_type["trade"] +
    "alibaba.trade.getSellerOrderList/" +
    AppKey[shopName];

  try {
    setTimeout(() => {
      fetch(url, {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => response.json())
        .then((responseData) => OnResponse(responseData, shopName, data))
        .catch((error) => console.error("post error", error));
    }, 200);
    console.error("post error", error);
  } catch (error) {}
}

function OnResponse(responseData, shopName, requestData) {
  console.log("OnResponse");
  let itemNum = responseData["totalRecord"];
  let pageNum = Math.ceil(itemNum / 20); // 页数

  delete requestData._aop_signature;

  const requests = [];

  for (let i = 1; i <= pageNum; i++) {
    delete requestData._aop_signature;
    requestData["page"] = String(i);
    const _aop_signature = CalculateSignature(
      request_type["trade"] +
        "alibaba.trade.getSellerOrderList/" +
        AppKey[shopName],
      requestData,
      shopName
    );
    requestData["_aop_signature"] = _aop_signature;

    let params = new URLSearchParams(requestData).toString();

    const url =
      base_url +
      request_type["trade"] +
      "alibaba.trade.getSellerOrderList/" +
      AppKey[shopName];

    const request = fetch(url, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => response.json())
      .catch((error) => console.error("post error", error));

    requests.push(request);
  }

  Promise.all(requests).then((responses) => {
    // 处理所有响应数据
    const combinedResult = responses.reduce((acc, response) => {
      acc = acc.concat(response.result);
      return acc;
    }, []);

    // 处理合并后的结果
    MapOrderId(combinedResult, shopName);
  });
}

function MapOrderId(data, shopName) {
  console.log("MapOrderId");
  orderList = data;

  orderList.forEach((order) => {
    if (!orderMap[shopName].hasOwnProperty(order["baseInfo"]["idOfStr"])) {
      let _orderId = order["baseInfo"]["idOfStr"];
      orderMap[shopName][_orderId] = { logistics: [] };
      GetTradeData(_orderId, shopName);
    }
  });
}

function GetTradeData(orderId, shopName) {
  const data = {
    orderId: String(orderId),
  };

  data["access_token"] = access_token[shopName];
  const _aop_signature = CalculateSignature(
    request_type["trade"] + "alibaba.trade.get.sellerView/" + AppKey[shopName],
    data,
    shopName
  );
  data["_aop_signature"] = _aop_signature;

  let params = new URLSearchParams(data).toString();

  const url =
    base_url +
    request_type["trade"] +
    "alibaba.trade.get.sellerView/" +
    AppKey[shopName];

  try {
    setTimeout(() => {
      fetch(url, {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => response.json())
        .then((data) => MapLogisticsBillNoAndData(shopName, orderId, data))
        .catch((error) => console.error("post error", error));
    }, 200);
  } catch (error) {
    console.error("post error", error);
  }
}

function MapLogisticsBillNoAndData(shopName, orderId, data) {
  let logisticsItems = data["result"]["nativeLogistics"]["logisticsItems"];
  let isFind = false;

  for (let logisticsItem of logisticsItems) {
    let logisticsBillNo = logisticsItem["logisticsBillNo"];
    if (!orderMap[shopName][orderId]["logistics"].includes(logisticsBillNo)) {
      orderMap[shopName][orderId]["logistics"].push(logisticsBillNo);
      orderMap[shopName][orderId]["data"] = data;
    }

    if (logisticsBillNo == gLogisticsBillNo) {
      isFind = true;
      break;
    }
  }

  if (isFind) {
    document.getElementById("orderId").innerHTML = orderId;
    // document.getElementById('shopName').innerHTML = data['result']['baseInfo']['sellerContact']['companyName'];
    shopType = SHOP_TYPE.CLOTH;
    if (shopName == "万盈饰品厂") {
      shopType = SHOP_TYPE.JEWELRY;
    }
    Show(data, shopType);
  }
}

function Show(data, shopType) {
  document.getElementById("status").innerHTML = "查询完成";
  document.getElementById("shopName").innerHTML =
    data["result"]["baseInfo"]["sellerContact"]["companyName"];

  formateJson = {};
  var table = document.getElementById("productTable");

  let itemsJson = {};

  for (let item of data["result"]["productItems"]) {
    let cargoNumber = "";
    if (item.hasOwnProperty("productCargoNumber")) {
      cargoNumber = item["productCargoNumber"];
    } else if (item.hasOwnProperty("cargoNumber")) {
      cargoNumber = item["cargoNumber"];
    }
    // 新货号 item 基础信息
    productCargoNumber = "";
    if (!itemsJson.hasOwnProperty(cargoNumber)) {
      itemsJson[cargoNumber] = {
        name: item["name"],
        sku: {},
      };
    }
    //sku
    let color = item["skuInfos"][0]["value"];
    let size = "无";
    if (item["skuInfos"].length > 1) {
      size = item["skuInfos"][1]["value"];
    }
    let quantity = item["quantity"];

    if (!itemsJson[cargoNumber]["sku"].hasOwnProperty(color)) {
      itemsJson[cargoNumber]["sku"][color] = {
        size: {},
        productImgUrl: item["productImgUrl"][1],
      };
    }
    itemsJson[cargoNumber]["sku"][color]["size"][size] = quantity;
  }

  for (let itemCargoNumber in itemsJson) {
    let name = itemsJson[itemCargoNumber].name;
    for (let color in itemsJson[itemCargoNumber]["sku"]) {
      let imgUrl = itemsJson[itemCargoNumber]["sku"][color].productImgUrl;
      // size
      let sizeStr = "";
      let isFirst = true;
      let sizeList = itemsJson[itemCargoNumber]["sku"][color]["size"];
      // 提取JSON对象的键并进行排序
      let sortedSize = Object.keys(sizeList).sort();
      // 根据排序后的键重新构建JSON对象
      let sortedSizeJson = {};
      sortedSize.forEach((key) => {
        sortedSizeJson[key] = sizeList[key];
      });
      // 打印排序后的JSON对象
      for (let size in sortedSizeJson) {
        if (isFirst != true) {
          sizeStr += "<br>";
        }
        isFirst = false;
        sizeStr +=
          size +
          "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
          itemsJson[itemCargoNumber]["sku"][color]["size"][size] +
          "&nbsp;件";
      }
      let row = table.insertRow();
      let nameCell = row.insertCell(0);
      let locationCell = row.insertCell(1);
      let colorCell = row.insertCell(2);
      colorCell.style.whiteSpace = "nowrap";
      let sizeCell = row.insertCell(3);
      sizeCell.style.whiteSpace = "nowrap";

      let imgcell = row.insertCell(4);
      nameCell.innerHTML = itemCargoNumber;
      locationCell.innerHTML = getLocation(itemCargoNumber, shopType);
      colorCell.innerHTML = color;
      sizeCell.innerHTML = sizeStr;
      var imgUrlFixed = imgUrl.replace(/^http:\/\//i, "https://");
      imgcell.innerHTML =
        '<img src="' +
        imgUrlFixed +
        '" alt="' +
        name +
        '" onclick="showImage(this.src)">';
    }
  }

  input.disabled = false;
  input.focus();
}

function CalculateSignature(urlPath, data, shopName) {
  // 构造签名因子：urlPath

  // 构造签名因子：拼装参数
  const params = Object.keys(data).map((key) => key + data[key]);
  params.sort();
  const assembedParams = params.join("");

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
  document.getElementById("logisticsBillNo").value = "";
  document.getElementById("orderId").innerHTML = "";

  var table = document.getElementById("productTable");
  table.innerHTML = "";
}

function Clean2() {
  console.log("Clean2");
  document.getElementById("orderId").innerHTML = "";

  var table = document.getElementById("productTable");
  table.innerHTML = "";
}

function Fresh() {
  location.reload();
}

var modal = document.getElementById("myModal");

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
span.onclick = function () {
  modal.style.display = "none";
};

function getSeaTableToken() {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json; charset=utf-8; indent=4",
      authorization: "Bearer 0ac8d62a73f1283739f8704ad32ce92c06c480ab",
    },
  };

  // 将参数附加到 URL
  const url = "https://cloud.seatable.cn/api/v2.1/dtable/app-access-token/";

  fetch(url, options)
    .then((response) => response.json())
    .then((response) => getLocationTable(response))
    .catch((err) => console.error(err));
}

function getLocationTable(app_access_token_data) {
  console.log(app_access_token_data);

  const options2 = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: "Bearer " + app_access_token_data["access_token"],
    },
  };

  const params = new URLSearchParams({
    table_name: "货架-A",
  });

  // 将参数附加到 URL
  const url = `https://dtable-server.seatable.cn/api/v1/dtables/72e5d5ce-2361-4805-b164-ecbee3d331d3/rows/?${params.toString()}`;

  fetch(url, options2)
    .then((response) => response.json())
    .then((response) => getLocationTableCallBack(response))
    .catch((err) => console.error(err));
}

function getLocationTableCallBack(response) {
  location_table = response;
  // console.log(location_table);
  // console.log(location_table["rows"]);
  for (let i = 0; i < location_table["rows"].length; i++) {
    for (let j = 1; j <= 10; j++) {
      if (location_table["rows"][i][j + "号仓"] != null) {
        let cargoNumberRaw = location_table["rows"][i][j + "号仓"];
        // 库存为空
        let cargoNumberStrList = cargoNumberRaw.split("-");
        let cargoNumber = cargoNumberStrList[0];
        locationMap["万盈饰品厂"][cargoNumber] =
          location_table["rows"][i]["表头"] + "-" + j + "号仓";

        if (cargoNumberStrList.length > 1 && cargoNumberStrList[1] == "0") {
          locationMap["万盈饰品厂"][cargoNumber] += " 无库存";
        }
      }
    }
  }
}

function getLocation(cargoNumber, shopType) {
  if (shopType == SHOP_TYPE.CLOTH) {
    return "未找到对应商户";
  }
  return locationMap["万盈饰品厂"][cargoNumber];
}
