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
	hajime: 0,
	saisho: 1,
	gu: 2,
	janken: 3,
	pon: 4,
	aiko: 5,
	sho: 6,
	kekka: 7
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
	party: 2
};

var kekka = {
	kachi: 1,
	make: 2,
	aiko: 3,
};

var self = {
	stage: stage.hajime,
	hand: undefined,
	role: role.player,
};

var master = {
	stage: stage.hajime,
	hand: undefined,
	role: role.master,
};

var players = {
	num: 0,
	hands: []
}

var game = {
	mode: mode.single,
	id: "2015090522000000",
	kekka: undefined
};

var milkcocoa;
var datastore;
	
function onDeviceReady() {

	$("#page_janken").click(function(){
	});
	
	$("#button_single").click(function(){
		game.mode = mode.single;
		$("#mess").text("シングルモードになりました");
	});
    
	$("#button_group").click(function(){
		game.mode = mode.group;
		$("#mess").text("グループモードになりました");
	});

	$("#button_party").click(function(){
		game.mode = mode.party;
		$("#mess").text("パーティモードになりました");
	});

	$("#button_master").click(function(){
		self.role = role.master;
		$("#mess").text("親になりました");
	});
    
	$("#button_player").click(function(){
		self.role = role.player;
		$("#mess").text("子になりました");
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
				ShowHajime();
				players.num = 0;
				self.stage = stage.hajime;
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

	milkcocoa = new MilkCocoa("flagie73jdt7.mlkcca.com");

	datastore = milkcocoa.dataStore(game.id);

	datastore.on("send", function(data){
		var text = data.value.text;
		console.log("received: " + text);

		if (data.value.role == role.master) {
			master.stage = data.value.stage;
			master.hand = data.value.hand;
		}
		else if (data.value.role == role.player &&
			data.value.stage == stage.gu) {
			players.num++;
			console.log("players.num:" + players.num);
		}
		else if (data.value.role == role.player &&
			data.value.stage == stage.pon) {
			players.hands.push(data.value.hand);
			console.log("data.hand:" + data.value.hand);
		}
		
		if (game.mode == mode.party) {
			if (self.role == role.player &&
				self.stage == stage.pon &&
				master.stage == stage.pon) {

				judgeByMaster();
				showKekka();
				sayKekka();
				if (game.kekka != kekka.aiko) {
					self.stage = stage.kekka;
				}
			}
		}
		else if (game.mode == mode.group) {
			if (self.stage == stage.pon &&
				data.value.stage == stage.pon &&
				players.hands.length >= players.num) {
				
				judgeByPlayers();
				showKekka();
				sayKekka();
				if (game.kekka != kekka.aiko) {
					self.stage = stage.kekka;
				}
			}
		}
	});
}
document.addEventListener("deviceready", onDeviceReady, false);

function ShowHajime(){
	$("#mess").text("はじめるよ！");
	$("#page_janken").css('background-image', 'url("images/Janken.png")');
}

function showSaisho(){
	$("#mess").text("最初は・・");
}

function showJanken(){
	$("#mess").text("じゃんけん・・");
}

function selectHand(){
	var arr = [hand.gu, hand.choki, hand.pa];
    self.hand = arr[Math.floor(Math.random() * 3 + 1) - 1];
}

function showGu(){
	$("#page_janken").css('background-image', 'url("images/gu.png")');
}

function showHand(){
	if (self.hand == hand.gu) {
		$("#page_janken").css('background-image', 'url("images/gu.png")');
	}
	else if (self.hand == hand.choki) {
		$("#page_janken").css('background-image', 'url("images/choki.png")');
	}
	else if (self.hand == hand.pa) {
		$("#page_janken").css('background-image', 'url("images/pa.png")');
	}
}

function showAiko(){
	$("#mess").text("あいこで・・");
}

function getCurrentPath(){
    var str = location.href;
    var i = str.lastIndexOf('/');
    return str.substring(0, i+1);
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

function sendStatus(){
	var text = "role:" + self.role + "/stage:" + self.stage + "/hand:" + self.hand;
	var data = {
		role: self.role,
		stage: self.stage,
		hand: self.hand,
		text: text
	};
	datastore.send(data, function(){
	});
}

function judgeByMaster(){		
	if (self.hand == hand.gu && master.hand == hand.choki) {
		game.kekka = kekka.kachi;	
	}
	else if (self.hand == hand.gu && master.hand == hand.pa) {
		game.kekka = kekka.make;
	}
	else if (self.hand == hand.choki && master.hand == hand.gu) {
		game.kekka = kekka.make;
	}
	else if (self.hand == hand.choki && master.hand == hand.pa) {
		game.kekka = kekka.kachi;
	}
	else if (self.hand == hand.pa && master.hand == hand.gu) {
		game.kekka = kekka.kachi;
	}
	else if (self.hand == hand.pa && master.hand == hand.choki) {
		game.kekka = kekka.make;
	}
	else {
		game.kekka = kekka.aiko;
	}
}

function judgeByPlayers(){
	var arr = players.hands.concat();
	arr.splice(arr.indexOf(self.hand), 1);
	console.log("arr.length:" + arr.length);
	
	if (arr.indexOf(self.hand) >= 0) {
		game.kekka = kekka.aiko;
	}
	else if (self.hand == hand.gu &&
		arr.indexOf(hand.pa) >= 0) {
		game.kekka = kekka.make;
	}
	else if (self.hand == hand.choki &&
		arr.indexOf(hand.gu) >= 0) {
		game.kekka = kekka.make;
	}
	else if (self.hand == hand.pa &&
		arr.indexOf(hand.choki) >= 0) {
		game.kekka = kekka.make;
	}
	else {
		game.kekka = kekka.kachi;
	}
}

function showKekka(){
	if (game.kekka == kekka.kachi) {
		$("#mess").text("勝ち！");
	}
	else if (game.kekka == kekka.make) {
		$("#mess").text("負け！");
	}
	else if (game.kekka == kekka.aiko) {
		$("#mess").text("あいこ！")
	}
}

function sayKekka(){
	
}

