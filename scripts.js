var cryptoArray =  []; //array of crypto data from CMC
var portfolioDict = new Object(); 
var portfolioDict = {}; //portfolio to store user balances
var imgVar = "goodbye";
var curr_btcusd = 0;
var recommend3 = []; //array
var global_prediction = {};
var image_value = 100;
var cryptoImageUrl = 'https://images.coinviewer.io/currencies/128x128/';
var topThreeCrypto = [];
var topThreePercent = 0;
/*
function loadCryptos(){
    var requestCryptos = new XMLHttpRequest();
    requestCryptos.open("GET", "https://api.coinmarketcap.com/v2/ticker/", true);
    console.log("first");
    requestCryptos.onload = function () {
        //Begin accessing Json data
        console.log("before json parse");
        var cryptoData = JSON.parse(this.response);
        cryptoData.forEach(crypto => {
            console.log("hi");
            console.log(crypto.id);
            console.log(crypto.name);
        });




    }
}

loadCryptos();
console.log("hi2");

*/

$(document).ready(function(){
    $('#crypto_table').DataTable({
        "ajax":{
            "url": 'https://api.coinmarketcap.com/v1/ticker/?limit=100',
            dataSrc: ''
        } ,
        "columns": [
            //{ data: 'id'},
            { data: 'rank'},
            { data: 'symbol'},
            { data: 'name'},
            { data: 'price_usd'},
            //{ data: 'price_btc'},
            { data: '24h_volume_usd'},
            { data: 'market_cap_usd'},
            // { data: 'available_supply'},
            // { data: 'total_supply'},
            // { data: 'max_supply'},
            { data: "percent_change_1h"},
            { data: "percent_change_24h"},
            { data: "percent_change_7d"},
         ]
    });
});

function predict3Crypto(cryptolist){
    for(i=0; i<cryptolist.length; i++){
        const symbol = cryptolist[i].symbol;
        var currTime = new Date();
        var yesterdayTime = currTime.getTime();
        yesterdayTime = currTime.getTime() - 86400; // gets timestamp for 24hrs before currentime
        //yesterdayTime = yesterdayTime.toString();
        //console.log("currtime:" ,currTime);
        //console.log("yestime::" ,yesterdayTime);
        $.ajax({
            url: 'https://min-api.cryptocompare.com/data/histominute?fsym=' + symbol + '&tsym=USD&limit=60&aggregate=1&toTs=' + yesterdayTime+ '&extraParams=your_app_name',
            type: "GET",
            dataType: 'json',
            success:function(result){
                //console.log("this result is:", result.Data);
                var calcsum = 0;
                if(result.Data.length == 0){
                    return;
                }
                for( i= 0; i < 50; i+=9){
                   // console.log("firstentry:", result.Data[i].close);
                   // console.log("secondtentry:", result.Data[i+1].close);
                    firstpt = (1.0 - (result.Data[i].close / result.Data[i+9].close))* 100 ;
                    calcsum += firstpt;
                }
                var calcavg = calcsum / 6.0;
                //console.log("calcavg is:",symbol, calcavg);
                switch(calcavg){
                    case calcavg  > -3 && calcavg <= 12:
                    calcavg *= 1;
                    break;
                    case calcavg  > 12 && calcavg <= 17:
                    calcavg *= 0.9;
                    break;
                    case calcavg  > 17 && calcavg <= 22:
                    calcavg *= 0.73;
                    break;
                    case calcavg  > 22 && calcavg <= 27:
                    calcavg *= 0.56;
                    break;
                    case calcavg  > 27 && calcavg <= 32:
                    calcavg *= 0.5;
                    break;
                    case calcavg  <= -3 && calcavg < -10:
                    calcavg *= 0.85;
                    break;
                    case calcavg  >= -10 && calcavg < -20:
                    calcavg *= 0.2;
                    break;
                    case calcavg  <= -20:
                    calcavg *= 0.1;
                    break;
                }
                global_prediction[symbol] = calcavg

            }
        })
    }
}

function loadcryptoStuff(resolve, error){
    $.ajax({
        url:'https://api.coinmarketcap.com/v1/ticker/?limit=100',
        type: "GET",
        dataType: 'json',
        success:function(result){
            console.log("successful");

            
            for(var i = 0 ; i < result.length; i++){
                var crypto = result[i];
                cryptoArray.push(crypto);

            }

            resolve()

        }
    })

}

new Promise(function(resolve, reject){
    loadcryptoStuff(resolve, reject)
}).then(() => {
    loadPicture()
}).then(() => {
    predict3Crypto()
})




function getCurrentBtcPrice(){
    $.ajax({
        url:'https://api.coinmarketcap.com/v1/ticker/?limit=1',
        type: 'GET',
        dataType: 'json',
        success:function(result){
            console.log("getCurrentBtcPrice Success");
            console.log(result[0].price_usd);
            curr_btcusd = result[0].price_usd;
            
        }
    })
    
}

function initPortfolio(cryptlist, portfolioDict){
    /*
    console.log("cryptob4loop",cryptlist);
    console.log("cryptofolio: Shud be empty", portfolioDict);
    console.log("cryplist.length is" , cryptlist.length);*/
    for(var i = 0 ; i <cryptlist.length; i++){
        //console.log(cryptlist[i].symbol);
        if(cryptlist[i].symbol in portfolioDict){
            break;
        }
        else{
            portfolioDict[cryptlist[i].symbol] = 0;
        }
    }
    console.log(Object.keys(portfolioDict).length);
    for(var key in portfolioDict){
        if(key in portfolioDict){
            //console.log("Each item in dict:",key,portfolioDict[key]);
        }
        else{
            //console.log("Some item missing");
        }
    }
}



function loadPicture(){
    var picloc = '';
    switch(imgVar){
        case "hello":
            picloc = "Images/HelloWorld.jpg";
            break;
        case "goodbye":
            picloc = "Images/GoodbyeWorld.png";
            break;
        default:
            picloc = "Images/NeutralWorld.jpg";
    }
    $('#SImage').attr("src",picloc);
}

function getTop3(){
    var cryptoArrayRating = Object.keys(global_prediction).map(function(key){
        return  {key: key, value: this[key]};
    }, global_prediction);
    cryptoArrayRating.sort(function(c1, c2){return c2.value- c1.value;});
    topThreeCrypto = cryptoArrayRating.slice(0,3);
    console.log("cryptoArrayRating: top3", topThreeCrypto);
}

function loadTop3Image(){
    for(i = 0; i<3; i++){
        console.log('PredictedCrypto' + (i+1));
        $('#PredictedCrypto' + (i+1)).append("<img src=" + cryptoImageUrl + topThreeCrypto[i].key + '.png>'+"</img>");
        $('#PredictedCrypto' + (i+1)).append("<h5 style = 'text-align: center'>" +  topThreeCrypto[i].key + "</h5>");
        //console.log("top threecrypto key:", topThreeCrypto[i].key);
    }
}
function getTop3Data(){
    for(i = 0; i<3; i++){
        const symbol = topThreeCrypto[i].key;
        var currTime = new Date();
        var yesterdayTime = currTime.getTime();
        yesterdayTime = currTime.getTime() - 86400;
        $.ajax({
            url: 'https://min-api.cryptocompare.com/data/histominute?fsym=' + symbol + '&tsym=USD&limit=60&aggregate=1&toTs=' + yesterdayTime+ '&extraParams=your_app_name',
            type: "GET",
            dataType: 'json',
            success:function(result){
                if(result.Data.length == 0){
                    return;
                }
                firstpt = (1.0 - (result.Data[0].close / result.Data[10].close))* 100 ;
                console.log("opening:",result.Data[0].close);
                console.log("result:" ,result.Data[10].close);
                console.log("firstpt is", firstpt);

                topThreePercent += firstpt;
                
            }
        })
    }
}

function resizeImage(){
    var temp = topThreePercent / 3.0;
    console.log("temp is:", temp);
    console.log( temp < 2 && temp > 0);
    console.log(Boolean(temp));
    debugger;
    switch(temp){
        case temp < 2 && temp > 0:
            $('#helloimage').width('60%');
            $('#helloimage').height('auto');
            console.log("1");
            break;
        case temp < -2 && temp > -50:
            $('#helloimage').width('20%');
            $('#helloimage').height('auto');
            console.log("2");
            break;
        case temp >= 2 && temp < 50:
            $('#helloimage').width('80%');
            $('#helloimage').height('auto');
            console.log("3");
            break;
        case temp < 0 && temp > -2:
            $('#helloimage').width('40%');
            $('#helloimage').height('auto');
            console.log("4");
            break;
    }
}

loadcryptoStuff();
//value =getCurrentBtcPrice();
getCurrentBtcPrice();
loadPicture();
setTimeout(function(){console.log("value is",curr_btcusd);}, 1000)
//initPortfolio(cryptoArray, portfolioDict);
setTimeout(function(){initPortfolio(cryptoArray, portfolioDict);},3000)
//console.log("Successful at the end",cryptoArray);
setTimeout(function(){console.log(cryptoArray[0].id, cryptoArray[0].price_usd);
},1000)
setTimeout(function(){predict3Crypto(cryptoArray);},1000)
//setTimeout(function(){console.log("global_prediction:",global_prediction)},5000)
setTimeout(function(){console.log(Object.keys(global_prediction).length)},10000)
//console.log(cryptolist);
setTimeout(function(){getTop3();},5000)
setTimeout(function(){loadTop3Image();},5000)
setTimeout(function(){getTop3Data();},5000)
setTimeout(function(){resizeImage();},10000)

