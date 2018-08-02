var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var net = require('net');
var shasum = crypto.createHash('sha1');
//shasum.update("c518f228e213c172");
shasum.update("4cf4f658e8eed030");
var result = shasum.digest('hex');
var code = 0;
//var server = net.createServer();
var mysock  = 0;
var ThingCode_bak = 10;
var cmd_bak = 3;
var RoomCode = 204; //房间号
var netPort = 27745  //网关端口
function sendSmartHomeMsg(thing,cmd)
{
    var head = "##";
 
    var module_type = 0;  //默认
    var command = "{\"RoomCode\":"+RoomCode+"," + "\"MessageType\":2"+","+ "\"CommandCode\":"+ cmd+"," +"\"ThingCode\":" +thing +"}";  
    var cmd_length = command.length;    
    const buff = Buffer.allocUnsafe(4);
    buff.writeInt16BE(module_type,0);
    buff.writeInt16BE(cmd_length,2);        
    var typeAndLength = buff.toString();
    var msg = head+typeAndLength+command;
    console.log(msg);
    mysock.write(msg);
}
function sendHeartMsg()
{
    var head = "##";  
    var module_type = 0;  //默认    
    var command = "{\"CommandCode\":99}";  
    var cmd_length = command.length;    
    const buff = Buffer.allocUnsafe(4);
    buff.writeInt16BE(module_type,0);
    buff.writeInt16BE(cmd_length,2);        
    var typeAndLength = buff.toString();
    var msg = head+typeAndLength+command;
    //console.log("网关还活着...");
    mysock.write(msg);
}
net.createServer(function(sock) {
    mysock = sock;
    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('CONNECTED: ' +
        sock.remoteAddress + ':' + mysock.remotePort);

    // 为这个socket实例添加一个"data"事件处理函数
    mysock.on('data', function(data) {
       
      // var decoded = new Buffer(data,6 ).toString();
        // 回发该数据，客户端将收到来自服务端的数据
      // var sockData = JSON.parse(decoded); 
      var decoded = new Buffer(data, 'base64').toString();
      if(decoded.length <10)
      {
      //  console.log(decoded);
         sendHeartMsg();
      }
   

        
    });

    // 为这个socket实例添加一个"close"事件处理函数
    mysock.on('close', function(data) {
        console.log('CLOSED: ' +
            mysock.remoteAddress + ' ' + mysock.remotePort);
    });

 }).listen(netPort);
/* GET users listing. */
router.get('/', function(req, res) {
  res.send(result);
});

router.post('/', function(req, res) {
  var content = req.body.Msg.Content;

  //console.log(req);

  // 
  //
  // base64解码
  var decoded = new Buffer(content, 'base64').toString();

   if(decoded  !== undefined)
  {
  // req.body.Msg.Content.intent.answer = "你是";
   res.json(req.body.Msg.Content);
  var decodedSessionParams = new Buffer(req.body.SessionParams, 'base64').toString();
  req.body.SessionParams = JSON.parse(decodedSessionParams);
  req.body.Msg.Content = JSON.parse(decoded);
  
  var preWriteString = JSON.stringify(req.body) + '\n';
  var intent = JSON.parse(decoded).intent;
  if(intent.text !== undefined) {
		if(intent.search_semantic !== undefined)
		{
			//aiui返回的控制信息
			var semantic = intent.semantic.slots;
			//var semantic = JSON.parse(intent).search_semantic;
			//console.log(semantic);
			var attr = semantic.attr;
			var attrValue = semantic.attrValue;
			//var deviceName = semantic.deviceName;
			var service = intent.service;
			var cmd  = 10;
			var ThingCode = 3;

			if(attrValue == "开")
        {
          cmd = 1;
        }
      else 
      {
          cmd = 2;
      }
          switch(service)
          {
            case "airControl_smartHome":
            ThingCode  = 17;       
            break;
            case "airCleaner_smartHome":
            ThingCode  = 17;                     
            break;
            case "airVent_smartHome":
            ThingCode  = 19;           
            break;
            case "curtain_smartHome":
            ThingCode  = 20;          
             if(attrValue == "开")
            {
              cmd = 6;
            }else
            {
              cmd = 7;
            }
            break;
            case "light_smartHome":
            ThingCode  = 15;          
            break;
            case "tv_smartHome":
            ThingCode  = 27;
            break;
            case "musicPlayer_smartHome":
            ThingCode  = 22;
             if(attrValue == "播放")
            {
              cmd = 10;
            }else if(attrValue == "下一首")
            {
              cmd = 12;
            }else if(attrValue == "上一首")
            {
                 cmd = 11;
            }else{
              cmd = 9;
            }
            break;
            default:
            ThingCode = 10
            cmd  = 3;
          }
           console.log(" " +" "+attrValue+" "+service+" "+attr); 
          if(ThingCode != 10 && cmd != 3)
          {
             sendSmartHomeMsg(ThingCode,cmd);
          }
         
         
          // sendSmartHomeMsg(16,1);
         //  sendSmartHomeMsg(22,9);

         // mysock.write('You said "' + deviceName + '"');
         
        }
  }
  }
 
});

module.exports = router;
