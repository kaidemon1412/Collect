//web服务器的创建，首先作为一个web服务器需要有以下几个功能
//1、显示以.html/.html结尾的web页面
//2、能够直接打开.js/.css/.json/.text结尾的文件内容
//3、显示图片资源
//4、自动下载.apk/.docx/.zip结尾的文件
//5、形如http：//xxx.com/a/b,则查找b目录下是否有index文件，如果有则打开，如果没有就一一列出该目录下的文件并可以一一打开
//6、形如http://xxx.com/a/b,则作301重定向到http://xxx.com/a/b,这样可以解决内部资源引用错位的问题


//映入要用到的模块：

//http协议模块--功能
var http = require("http");
//url解析模块--功能
var url = require("url");
//文件系统模块
var fs = require("fs");
//路径解析模块
var path = require("path");


//创建服务并指定端口监听

//创建一个服务
var httpServer = http.createServer(this.processRequest.bind(this));

//在指定的端口监听服务
httpServer.listen(port,function(){
	console.log("[HttpServer][Start]","runing at http://"+ip+":"+port+"/");
	console.log(ip);
	console.timeEnd("[HttpServer][start]");
})


//在创建服务的时候需要传递一个匿名函数processRequest对请求进行处理，processRequest接收两个参数，分别是request和response，
//request对象包含请求的所有内容，response是用来设置响应头以及对客户端做出响应操作。



processRequest:function(request,response){
    var hasExt = true;
    var requestUrl = request.url;
    var pathName = url.parse(requestUrl).pathname;
 
    //对请求的路径进行解码，防止中文乱码
    pathName = decodeURI(pathName);
 
    //如果路径中没有扩展名
    if(path.extname(pathName) === ''){
        //如果不是以/结尾的，加/并作301重定向
        if (pathName.charAt(pathName.length-1) != "/"){
            pathName += "/";
            var redirect = "http://"+request.headers.host + pathName;
            response.writeHead(301, {
                location:redirect
            });
            response.end();
            return ;
        }
        //添加默认的访问页面,但这个页面不一定存在,后面会处理
        pathName += "index.html";
        hasExt = false; //标记默认页面是程序自动添加的
    }
 
    //获取资源文件的相对路径
    var filePath = path.join("http/webroot",pathName);
 
    //获取对应文件的文档类型
    var contentType = this.getContentType(filePath);
 
    //如果文件名存在
    fs.exists(filePath,function(exists){
        if(exists){
            response.writeHead(200, {"content-type":contentType});
            var stream = fs.createReadStream(filePath,{flags:"r",encoding:null});
            stream.on("error", function() {
                response.writeHead(500,{"content-type": "text/html"});
                response.end("<h1>500 Server Error</h1>");
            });
            //返回文件内容
            stream.pipe(response);
        }else { //文件名不存在的情况
            if(hasExt){
                //如果这个文件不是程序自动添加的，直接返回404
                response.writeHead(404, {"content-type": "text/html"});
                response.end("<h1>404 Not Found</h1>");
            }else {
                //如果文件是程序自动添加的且不存在，则表示用户希望访问的是该目录下的文件列表
                var html = "<head><meta charset='utf-8'></head>";
 
                try{
                    //用户访问目录
                    var filedir = filePath.substring(0,filePath.lastIndexOf('\\'));
                    //获取用户访问路径下的文件列表
                    var files = fs.readdirSync(filedir);
                    //将访问路径下的所以文件一一列举出来，并添加超链接，以便用户进一步访问
                    for(var i in files){
                        var filename = files[i];
                        html += "<div><a  href='"+filename+"'>"+filename+"</a></div>";
                    }
                }catch (e){
                    html += "<h1>您访问的目录不存在</h1>"
                }
                response.writeHead(200, {"content-type": "text/html"});
                response.end(html);
            }
        }
    });
}
