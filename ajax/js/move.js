//获取某元素节点的某属性值
/*
 * obj: 需要获取属性值的元素节点, 如:oBox
 * attr: 需要获取的属性, 如:"left"
 */
function getStyleAttr(obj, attr) {
	if(window.getComputedStyle) { //支持IE9+, 谷歌, 火狐..
		return getComputedStyle(obj, null)[attr];
	}
	return obj.currentStyle[attr]; //支持IE8-
}

//封装startMove
//obj 需要运动的元素
//json 一个或多个属性的对象{attr:iTarget,attr:iTarget} {left:30,top:50}
//fn 回调函数，当运动停止时执行

function startMove(obj,json,fn){
	
	//关闭之前的定时器
	clearInterval(obj.timer);
	//再开启新的定时器
	obj.timer = setInterval(function(){
		//当所有属性都到指定值时的一个判断(效果完成的判断)
		var bStop = true;
		for(var attr in json){
			
			//attr 属性名
			//json[attr]  //attr属性的值
			var iTarget = json[attr];
			
			
			//1, 获取当前值
			var current = 0;
			//如果是透明度设置就进入以下判断，getStyleAttr(obj, attr),这个获取属性的函数在顶部已经声明，obj是startMove传进来的参数，attr是传进来的对象的属性，即要设置的属性。
			//所以获取了对象的属性，parseFloat();用来获取数字的方法，第一个0无效，遇到浮点数其后的无效
			/*parseFloat();提取数字
			 * var num1 = parseFloat("123AF");　　　　　　 　　　　//123
			　var num2 = parseFloat("0xA");　　　　　　　　　　　　//0
			　var num3 = parseFloat("22.5");　　　　　　　 　　　 //22.5
			　var num4 = parseFloat("22.3.56");　　　　　　　　　//22.3
			　var num5 = parseFloat("0908.5");　　　　　　　　　 //908.5
			parseInt()
			var num1 = parseInt("AF",16);　　　　　　 　　　　//175 (按进制转换的写法)进制转化后都为10进制的数。
		　　　var num2 = parseInt("AF");　　　　　　　　　　　　//NaN
		　　　var num3 = parseInt("10",2);　　　　　　　 　　　//2　　(按照二进制解析)
		　　　var num4 = parseInt("sdasdad");　　　　　　　　　//NaN

			 */
			if (attr == "opacity") { //透明度
				current = parseFloat(getStyleAttr(obj, attr) * 100);
				current = Math.round(current); //四舍五入
			}
			else { // left/top/width/height...
				current = parseFloat(getStyleAttr(obj, attr));
				current = Math.round(current); //四舍五入
			}			
			
			//2, 给一个速度
			var iSpeed = (iTarget - current) / 10;
			//向上取整(舍去小数点)+1，向下取整(舍去小数点)，总的来说这两种方法数值相差1
			iSpeed = iSpeed>0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);		
			
			//3, 判断是否到达目标值
			if (current != iTarget) {
				 bStop = false;
			}			
			
			//4, 运动
			if (attr == "opacity") { //透明度
				obj.style.opacity = (current + iSpeed) / 100;
				obj.style.filter = "alpha(opacity=" + (current + iSpeed) + ")";
			}
			else { // left/top/width/height
				obj.style[attr] = current + iSpeed + "px";
			}			
 
		}
		//当所有属性值都到达目标值时
		if(bStop){
			
			clearInterval(obj.timer);
			
			//回调
			if(fn){
				fn();
			}
						
		}
 
	},30);
	
}





//封装startMove
/*
 * obj: 需要运动的元素
 * attr: 需要改变的属性
 * iTarget: 需要到达的目标值(终点值)
 * fn: 回调函数
 *
 * /
/*
function startMove(obj, attr, iTarget, fn) {
	
	//关闭之前的定时器
	clearInterval(obj.timer);
	
	//再开启新的定时器
	obj.timer = setInterval(function(){
		
		//1, 获取当前值
		var current = 0;
		if (attr == "opacity") { //透明度
			current = parseFloat(getStyleAttr(obj, attr) * 100);
			current = Math.round(current); //四舍五入
		}
		else { // left/top/width/height...
			current = parseFloat(getStyleAttr(obj, attr));
			current = Math.round(current); //四舍五入
		}
		
		//2, 给一个速度
		var iSpeed = (iTarget - current) / 8;
		iSpeed = iSpeed>0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
		
		//3, 判断是否到达目标值
		if (current == iTarget) {
			clearInterval(obj.timer); //关闭定时器, 停止运动
			//console.log("a");
			
			//回调
			if (fn) {
				fn(); 
			}
			
			return; //退出函数, 不再执行下面的语句
		}
		
		//4, 运动
		if (attr == "opacity") { //透明度
			obj.style.opacity = (current + iSpeed) / 100;
			obj.style.filter = "alpha(opacity=" + (current + iSpeed) + ")";
		}
		else { // left/top/width/height
			obj.style[attr] = current + iSpeed + "px";
		}
		
	}, 30);
}

*/