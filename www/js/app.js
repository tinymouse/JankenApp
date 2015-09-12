/*
 * Please see the included README.md file for license terms and conditions.
 */


// This file is a suggested starting place for your code.
// It is completely optional and not required.
// Note the reference that includes it in the index.html file.


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */



// This file contains your event handlers, the center of your application.
// NOTE: see app.initEvents() in init-app.js for event handler initialization code.

/*
function myEventHandler() {
    "use strict" ;

    var ua = navigator.userAgent ;
    var str ;

    if( window.Cordova && dev.isDeviceReady.c_cordova_ready__ ) {
            str = "It worked! Cordova device ready detected at " + dev.isDeviceReady.c_cordova_ready__ + " milliseconds!" ;
    }
    else if( window.intel && intel.xdk && dev.isDeviceReady.d_xdk_ready______ ) {
            str = "It worked! Intel XDK device ready detected at " + dev.isDeviceReady.d_xdk_ready______ + " milliseconds!" ;
    }
    else {
        str = "Bad device ready, or none available because we're running in a browser." ;
    }

    alert(str) ;
}
*/


// ...additional event handlers here...

var stage = {
	join: -1,
	start: 0,
	hajime: 1,
	saisho: 2,
	gu: 3,
	janken: 4,
	pon: 5,
	aiko: 6,
	sho: 7,
	hantei: 8,
	kekka: 9
};

var hand = {
	gu: 1,
	choki: 2,
	pa: 3
};

var role = {
	master: 1,
	player: 2
};

var mode = {
	single: 0,
	group: 1,
};

var hantei = {
	kachi: 1,
	make: 2,
	aiko: 3,
};

var self = {
	stage: stage.start,
	hand: undefined,
	role: role.player,
};

var master = {
	exist: false,
	stage: stage.start,
	hand: undefined,
};

var players = {
	num: 0,
	hands: [],
	kachi: 0, make: 0, aiko: 0
}

var game = {
	mode: mode.single,
	id: "99999999",
	hantei: undefined,
};

function makeGame(){
	game.id = Math.floor(Math.random() * 99999999).toString();
	datastore = milkcocoa.dataStore(game.id);
	datastore.on("send", receiveStatus);
}

function showStart(){
	$(".page").hide();
	$("#page_start").show();
	$("#label_gameid").text(game.id);
	self.stage = stage.start;
}

function showJoin(){
	$(".page").hide();
	$("#page_join").show();
	self.stage = stage.join;
}

function joinGame(){
	datastore = milkcocoa.dataStore(game.id);
	datastore.on("send", receiveStatus);
	sendStatus();
	setTimeout("checkJoin()", 1000);
}

function checkJoin(){
	if (self.stage == stage.join) {
		alert("ゲームに参加が失敗");
	}
	else {
		startGame();
	}
}

function startGame(){
	$(".page").hide();
	$("#page_game").show();
	initStatus();
	showHajime();
}

function initStatus(){
	master.exist = false;
	players.num = 0;
	players.kachi = 0; players.make = 0; players.aiko = 0;
	self.stage = stage.hajime;
	self.hand = undefined;
}	

function onDeviceReady() {
	$(".page").hide();
	$("#page_menu").show();

	$(".button_standalone").click(function(){
		game.mode = mode.single;
		self.role = role.player;
		startGame();
	});
	
	$(".button_no_master").click(function(){
		game.mode = mode.group;
		self.role = role.player;
		makeGame();
		showStart();
	});
	
	$(".button_as_master").click(function(){
		game.mode = mode.group;
		self.role = role.master;
		makeGame();
		showStart();
	});
	
	$(".button_start").click(function(){
		startGame();
	});

	$(".button_join_game").click(function(){
		game.mode = mode.group;
		self.role = role.player;
		showJoin();
	});	
	
	$(".button_join").click(function(){
		game.id = $("#input_gameid").text();
		joinGame();
		console.log("joinGame");
	});
	
	var oldx = 0;
	var oldy = 0;
	var oldz = 0;
	var oldt = 0;
	var olds = 0;
	
    var accel = navigator.accelerometer.watchAcceleration(function(acceleration) {
		
		var force = Math.abs(acceleration.x - oldx + acceleration.y - oldy);
		if (force > 15.0) {
			if (oldt > 0 && acceleration.timestamp - olds > 200) {    // 端末をシェイク
				showHajime();
				initStatus();
				return;
			}
			olds = acceleration.timestamp;
		}		
		else if ((acceleration.z > 0) != (oldz > 0)) {    // 端末を表から裏、裏から表に
			
			if (self.stage == stage.hajime && acceleration.z < 0) {
				showSaisho();
				saySaisho();
				self.stage = stage.saisho;
			}
			else if (self.stage == stage.saisho && acceleration.z > 0) {
				showGu();
				sayGu();
				self.stage = stage.gu;
			}
			else if (self.stage == stage.gu && acceleration.z < 0) {
				showJanken();
				sayJanken();
				self.stage = stage.janken;
				players.hands = [];
			}
			else if (self.stage == stage.janken && acceleration.z > 0) {
				selectHand();
				showHand();
				sayPon();
				self.stage = stage.pon;
			}
			else if (self.stage == stage.pon && acceleration.z < 0) {
				showAiko();
				sayAiko();
				self.stage = stage.aiko;
				players.hands = [];
			}
			else if (self.stage == stage.aiko && acceleration.z > 0) {
				selectHand();
				showHand();
				saySho();
				self.stage = stage.pon;
			}
			
			if (game.mode != mode.single) {
				sendStatus();
			}
		}
		
		oldx = acceleration.x;
		oldy = acceleration.y;
        oldz = acceleration.z;
		oldt = acceleration.timestamp;
		
    },function(){
		
    },{
        frequency: 30, adjustForRotation: true
    });
}
document.addEventListener("deviceready", onDeviceReady, false);

function showHajime(){
	$(".page").hide();
	$("#page_hajime").show();
	$("#label_mess").text("はじめるよ！");
	$("#image_back").css('background-image', 'url("images/Janken.png")');
}

function showSaisho(){
	$(".page").hide();
	$("#page_game").show();
	$("#image_hantei").hide();
	$("#label_mess").text("最初は・・");
}

function showJanken(){
	$("#label_mess").text("じゃんけん・・");
}

function selectHand(){
	var arr = [hand.gu, hand.choki, hand.pa];
    self.hand = arr[Math.floor(Math.random() * arr.length + 1) - 1];
}

function showGu(){
	$("#image_hand").css('background-image', 'url("images/gu.png")');
}

function showHand(){
	if (self.hand == hand.gu) {
		$("#image_hand").css('background-image', 'url("images/gu.png")');
	}
	else if (self.hand == hand.choki) {
		$("#image_hand").css('background-image', 'url("images/choki.png")');
	}
	else if (self.hand == hand.pa) {
		$("#image_hand").css('background-image', 'url("images/pa.png")');
	}
}

function showAiko(){
	$("#label_mess").text("あいこで・・");
}

function getCurrentPath(){
	var str = location.pathname;
    return str.substring(0, str.lastIndexOf('/') + 1);
}

function play(path){
	var media = new Media(getCurrentPath() + path , function(){
	}, function(){
	});
	media.play();
}

function saySaisho(){
	play('sounds/saisho.mp3');
}

function sayGu(){
	play('sounds/gu.mp3');
}

function sayJanken(){
	play('sounds/janken.mp3');
}

function sayPon(){
	play('sounds/pon.mp3');
}

function sayAiko(){
	play('sounds/aiko.mp3');
}

function saySho(){
	play('sounds/sho.mp3');
}

var milkcocoa = new MilkCocoa("flagie73jdt7.mlkcca.com");
var datastore = milkcocoa.dataStore(game.id);

function sendStatus(){
	var text = "role:" + self.role + "/stage:" + self.stage + "/hand:" + self.hand + "/hantei:" + game.hantei;
	var data = {
		role: self.role,
		stage: self.stage,
		hand: self.hand,
		hantei: game.hantei,
		text: text
	};
	datastore.send(data, function(){
	},function(){
	});
}

function receiveStatus(data){
	console.log("data.value.text" + data.value.text);
	
	if (data.value.role == role.master) {
		if (data.value.stage == stage.gu) {
			master.exist = true;
		}
		master.stage = data.value.stage;
		master.hand = data.value.hand;
	}
	else if (data.value.role == role.player) {
		if (data.value.stage == stage.gu) {
			players.num++;
		}
		else if (data.value.stage == stage.pon) {
			players.hands.push(data.value.hand);
		}
		else if (data.value.stage == stage.hantei) {
			if (data.value.hantei == hantei.kachi) {
				players.kachi++;
			}
			else if (data.value.hantei == hantei.make) {
				players.make++;
			}
			else {
				players.aiko++;
			}
		}
		else if (data.value.stage == stage.join) {
			sendStatus();
		}
	}
	if (self.stage == stage.join &&
	    data.value.stage != stage.join) {
		self.stage = stage.start;
	}

	if (master.exist) {    // 親あり
		if (self.role == role.player &&
			self.stage == stage.pon &&
			master.stage == stage.pon) {

			judgeByMaster();
			showHantei();
			sayHantei();
			self.stage = stage.hantei;
		}
		if (self.role == role.master &&
			self.stage == stage.pon) {

			self.stage = stage.kekka;
		}
	}
	else if (players.num > 2) {    // グループ
		if (self.stage == stage.pon &&
			data.value.stage == stage.pon &&
			players.hands.length >= players.num) {

			judgeByPlayers();
			showHantei();
			sayHantei();
			self.stage = stage.hantei;
		}
	}
	else {    // 一対一
		if (self.stage == stage.pon &&
			data.value.stage == stage.pon &&
			players.hands.length >= players.num) {

			judgeByOpponent();
			showHantei();
			sayHantei();
			if (game.hantei != hantei.aiko) {
				self.stage = stage.hantei;
			}
		}
	}
	if (self.stage == stage.hantei) {
		sendStatus();
		self.stage = stage.kekka;
	}
	if (self.role == role.master &&
		self.stage == stage.kekka) {
		showKekka();
	}
}

function judgeByMaster(){		
	if (self.hand == master.hand) {
		game.hantei = hantei.aiko;
	}
	else if (self.hand == hand.gu && master.hand == hand.choki) {
		game.hantei = hantei.kachi;
	}
	else if (self.hand == hand.choki && master.hand == hand.pa) {
		game.hantei = hantei.kachi;
	}
	else if (self.hand == hand.pa && master.hand == hand.gu) {
		game.hantei = hantei.kachi;
	}
	else {
		game.hantei = hantei.make;
	}
}

function judgeByPlayers(){
	var arr = players.hands.concat();
	arr.splice(arr.indexOf(self.hand), 1);

	if (self.hand == hand.gu && arr.indexOf(hand.choki) < 0 && arr.indexOf(hand.pa) < 0) {
		game.hantei = hantei.aiko;
	}
	else if (self.hand == hand.choki && arr.indexOf(hand.gu) < 0 && arr.indexOf(hand.pa) < 0) {
		game.hantei = hantei.aiko;
	}
	else if (self.hand == hand.pa && arr.indexOf(hand.gu) < 0 && arr.indexOf(hand.choki) < 0) {
		game.hantei = hantei.aiko;
	}
	else if (self.hand == hand.gu && arr.indexOf(hand.choki) >= 0 & arr.indexOf(hand.pa) < 0) {
		game.hantei = hantei.kachi;
	}
	else if (self.hand == hand.choki && arr.indexOf(hand.pa) >= 0 && arr.indexOf(hand.gu) < 0) {
		game.hantei = hantei.kachi;
	}
	else if (self.hand == hand.pa && arr.indexOf(hand.gu) >= 0 && arr.indexOf(hand.choki) < 0) {
		game.hantei = hantei.kachi;
	}
	else {
		game.hantei = hantei.make;
	}
}

function judgeByOpponent(){		
	var arr = players.hands.concat();
	arr.splice(arr.indexOf(self.hand), 1);
	
	console.log("players.num:" + players.num);

	if (arr.indexOf(self.hand) >= 0) {
		game.hantei = hantei.aiko;
	}
	else if (self.hand == hand.gu && arr.indexOf(hand.pa) >= 0) {
		game.hantei = hantei.make;
	}
	else if (self.hand == hand.choki && arr.indexOf(hand.gu) >= 0) {
		game.hantei = hantei.make;
	}
	else if (self.hand == hand.pa && arr.indexOf(hand.choki) >= 0) {
		game.hantei = hantei.make;
	}
	else {
		game.hantei = hantei.kachi;
	}
}

function showHantei(){
	if (game.hantei == hantei.kachi) {
		$("#label_mess").text("勝ち！");
	}
	else if (game.hantei == hantei.make) {
		$("#label_mess").text("負け！");
	}
	else if (game.hantei == hantei.aiko) {
		$("#label_mess").text("あいこ！")
	}

	if (game.hantei == hantei.kachi) {
		$("#image_hantei").css('background-image', 'url("images/maru.png")');
	}
	else if (game.hantei == hantei.make) {
		$("#image_hantei").css('background-image', 'url("images/batsu.png")');
	}
	else if (game.hantei == hantei.aiko) {
		$("#image_hantei").css('background-image', 'url("images/sankaku.png")');
	}
	$("#image_hantei").show();
}

function sayHantei(){
	
}

function showKekka(){
	$("#label_mess").text("勝ち：" + players.kachi + "/負け：" + players.make + "/あいこ：" + players.aiko);
}

$(".key").click(function(){
	var buff = $("#input_gameid").text();
	var value = $(this).attr("value");
	if (value == "bs") {
		buff = buff.substr(0, buff.length - 1);
	}
	else {
		buff = buff + value;
	}
	$("#input_gameid").text(buff);
});

