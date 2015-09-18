var url = 'http://122.10.121.48:5916';
var io_config = {'transports':['xhr-polling', 'jsonp-polling'], 'reconnect':true, 'reconnection delay': 100, 'max reconnection attempts': Infinity, 'reconnection limit': 100};
var jm = io.connect(url, io_config);
var room = get('r') ? get('r') : 103;
var s = get('s') ? get('s') : 0;
var siteUrl = ['www.qqzhibo.net', 'www.qqzuqiu.com'];
var siteName = ['QQ直播网', 'QQ足球网'];
var ad_show_num = 0;
//用户名
var user_name = $.cookie('jm_chat_user_name') ? $.cookie('jm_chat_user_name') : '游客'+rand(5);
$("#jm_name").val(user_name);
$.cookie('jm_chat_user_name', user_name, {expires:7, path:'/'});
//进入房间
jm.emit('online',{room:room,user:user_name});
//监控聊天信息
jm.on('chats',function(data){msg_show(data);});
//监控改名信息
jm.on('upname', function(data){
	if(data.status == 0) $("#jm_name").val(data.user);
	else $.cookie('jm_chat_user_name', data.user, {expires:7, path:'/'});
	msg_show({type:-1, user:'系统提示', time:now_time(), msg:data.msg});
});
//服务器关闭
jm.on('disconnect', function(){
	msg_show({type:-1, user:'系统提示', time:now_time(), msg:'抱歉，您与聊天服务器断开！'});
});
//重新启动服务器
jm.on('reconnect', function(){
	msg_show({type:-1, user:'系统提示', time:now_time(), msg:'正在为您重新连接聊天服务器，请稍候！'});
	jm.emit('online',{room:room,user:user_name});
});
//初始化
function init(){
	//设置窗口
	var win_w = get('w') ? get('w') : $(window).width();
	var win_h = get('h') ? get('h') : $(window).height();
	$("#chat_content").css("height", win_h-86+'px');
	$("#chat_title .right").css("width", win_w-170+'px');
	$("#jm_msg").css("width",win_w-93+'px');
	$("#tips").css("width",win_w-110+'px');
}
//获取参数
function get(name){
	url  = self.window.document.location.href;
	var start	= url.indexOf(name + '=');
	if (start == -1) return '';
	var len = start + name.length + 1;
	var end = url.indexOf('&',len);
  	if (end == -1) end = url.length;
  	return unescape(url.substring(len,end));	
}
//生成随机数
function rand(n){
	var rnd="";
	for(var i=0;i<n;i++)rnd += Math.floor(Math.random()*10);
	return rnd;
}
//当前时间
function now_time(){
	var d  = new Date();
	return d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}
//
function get_time(){
	var d  = new Date();
	return d.getTime();
}
// 格式化消息 
function html2str(html){
	html = html.replace(/</g, '&lt;');
	html = html.replace(/>/g, '&gt;');
	return trim(html);
}
//字符串长度
function len(str) {  
    var cArr = str.match(/[^\x00-\xff]/ig);  
    return str.length + (cArr == null ? 0 : cArr.length);  
}
//去首尾空格
function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, '');
}
//清屏
function chat_del(){
	$("#jm_msg").html('');
}
//发送消息
function msg_send(){
	var msg = html2str($("#jm_msg").val());
	if(len(msg) == 0){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，发送的内容不能为空哦！'});
	}else if(len(msg) > 160){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，发送的内容不能超过160个字符哦！'});
	}else if($.cookie('jm_chat_msg_time') && get_time() - $.cookie('jm_chat_msg_time') < 10000){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，每次发言间隔10秒钟，休息一下吧！'});
	}else if($.cookie('jm_chat_user_msg') && $.cookie('jm_chat_user_msg') == msg){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'哥们，您是专门来刷屏的吗？'});
	}else if(((msg.split('em_')).length-1) > 3){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，每次最多只能发3个表情哦！'});
	}else{
		jm.emit('chats',msg);
		$.cookie('jm_chat_msg_time', get_time(), {path:'/'});
		$.cookie('jm_chat_user_msg', msg, {path:'/'});
		$('#jm_msg').val('');
		$('#jm_msg').focus();
	}
}
//返回消息
function msg_show(data){
	data.msg = show_face(data.msg);
	switch(data.type){
		case -1:
			var str = '<p class="c"><strong>'+ data.user +'：</strong>'+ data.msg +'<em>' + data.time + '</em></p>';
			$('#chat_content').append(str);
			break;
		case 0:
			var str = '<p><strong>'+ data.user +'：</strong>'+ data.msg +'<em>' + data.time + '</em></p>';
			$('#chat_content').append(str);
			break;
		case 1:
			var str = '<p class="m"><strong>'+ data.user +'[我]：</strong>'+ data.msg +'<em>' + data.time + '</em></p>';
			$('#chat_content').append(str);
			break;
		case 9:
			var str = '<p class="a9"><strong>'+ data.user +'：</strong>'+ data.msg +'<em>' + data.time + '</em></p>';
			$('#chat_content').append(str);
			break;
		case 10:
			var str = '';
			if(data.msg == 'welcome'){
				str = '<p class="a"><font color="blue">'+ data.user +'</font>您好！欢迎进入<a href="http://'+siteUrl[s]+'" target="_blank">'+siteName[s]+'</a>聊天室，请文明聊天，勿报比分，谢谢合作！<em>' + data.time + '</em></p>';
				$('#chat_content').append(str);
				//show_google();
				show_mm();
			}else{
				str = '<p class="a">'+ data.msg +'<em>' + data.time + '</em></p>';
				$('#chat_content').append(str);
			}
			break;
	}
	var _H = $("#chat_content")[0].scrollHeight;
	$("#chat_content").scrollTop(_H);
}
//改名
function chat_name(){
	var name = html2str($("#jm_name").val());
	var upname_num = $.cookie('jm_chat_upname_num') ? $.cookie('jm_chat_upname_num') : 0;
	upname_num = parseInt(upname_num);
	if(len(name) == 0){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，用户名不能为空哦！'});
	}else if(len(name) > 20){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，用户名不能超过20个字符哦！'});
	}else if($.cookie('jm_chat_upname_time') && get_time() - $.cookie('jm_chat_upname_time') < 10000){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，改名不要太积极哦，休息一下吧！'});
	}else if(upname_num >= 3){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'哥们，你是来表演变脸的吧[您今天的3次改名机会已用完]！'});
		$("#jm_name").val(user_name);
	}else if(name == user_name){
		msg_show({type:-1, user:'系统提示', time:now_time(), msg:'亲，您的名字没有发生任何变化哦！'});
	}else{
		jm.emit('upname',{user:name, upnum:upname_num});
		user_name = name;
		$.cookie('jm_chat_upname_time', get_time(), {path:'/'});
		$.cookie('jm_chat_upname_num', upname_num+1, {expires:1, path:'/'});
	}
}
function show_google(){
	if(ad_show_num < 4){
		$('#chat_content').append('<p id="googleAd" style="padding:0px; margin:0 2px;"><ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-3667866382943365" data-ad-slot="6403887253"></ins></p>');
		(adsbygoogle = window.adsbygoogle || []).push({});
		var _H = $("#chat_content")[0].scrollHeight;
		$("#chat_content").scrollTop(_H);
		ad_show_num = ad_show_num + 1;
	}
}
function show_mm(){
	if(ad_show_num < 4){
		var p_min = ad_show_num * 20;
		var p_num = $('#chat_content').find("p").length;
		if(p_num >= p_min){
			var mm_width = (ad_show_num == 0) ? 300 : 280;
			$('#chat_content').append('<p style="padding:0px;text-align:center;"><a href="http://s.click.taobao.com/5Z0TGsx" onclick="tongji();" target="_blank"><img src="http://ww2.sinaimg.cn/large/a39ca5d8gw1etnczqhtijj20i40283zs.jpg" width="'+mm_width+'" /></a></p>');
			var _H = $("#chat_content")[0].scrollHeight;
			$("#chat_content").scrollTop(_H);
			ad_show_num = ad_show_num + 1;
		}
	}
}
function tongji(){
	var _hmt = _hmt || [];
	(function() {
		var hm = document.createElement("script");
		hm.src = "//hm.baidu.com/hm.js?728fe640c02b319877ee9cd07a665748";
		var s = document.getElementsByTagName("script")[0]; 
		s.parentNode.insertBefore(hm, s);
	})();
}
function show_face(msg){
	msg = msg.replace(/\[em_([0-9]*)\]/g,'<img src="http://mat1.gtimg.com/www/mb/images/face/$1.gif" class="f" border="0" />');
	return msg;
}
$(document).ready(function(){
	init();
	$(document).attr("title", siteName[s]+"聊天室[No."+ room +"] By Jewel_M");
	$("#chat_title .left").html(siteName[s]+"聊天室[No."+ room +"]");
	//输入框背景
	$("#jm_msg").focus(function(){$("#jm_msg").removeClass("f");});
	$("#jm_msg").blur(function(){
		if($("#jm_msg").val()) $("#jm_msg").removeClass("f");
		else $("#jm_msg").addClass("f");
	});
	//表情功能
	$('.emotion').qqFace({
		id : 'facebox', 
		assign:'jm_msg', 
		path:'/res/qqface/imgs/'	//表情存放的路径
	});
	//setInterval(show_google,5*60*1000);
	setInterval(show_mm, 3*60*1000); //3分钟
});
window.onresize = function(){init();}
