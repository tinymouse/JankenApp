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


// ...additional event handlers here...

function onDeviceReady() {
    var oldz = 0;
    var status = {
        init: 0,
        saisho: 1,
        gu: 2,
        janken: 3,
        pon: 4,
        aoko: 5,
        sho: 6,
		current: 0
    };
	
	$("#page_janken").click(function(){
		$("#mess").text("はじめるよ！")
		status.current = status.init;
	});
    
    var accel = navigator.accelerometer.watchAcceleration(function(acceleration) {
		
        if ((acceleration.z > 0) != (oldz > 0)) {    // 端末を表から裏、裏から表に

			if (status.current == status.init && acceleration.z < 0) {
				showSaisho();
				saySaisho();
				status.current = status.saisho;
			}
			else if (status.current == status.saisho && acceleration.z > 0) {
				showGu();
				sayGu();
				status.current = status.gu;
			}
			else if (status.current == status.gu && acceleration.z < 0) {
				showJanken();
				sayJanken();
				status.current = status.janken;
			}
			else if (status.current == status.janken && acceleration.z > 0) {
				showPon();
				sayPon();
				status.current = status.pon;
			}
			else if (status.current == status.pon && acceleration.z < 0) {
				showAiko();
				sayAiko();
				status.current = status.aiko;
			}
			else if (status.current == status.aiko && acceleration.z > 0) {
				showPon();
				saySho();
				status.current = status.pon;
			}
			else {
				status.current = status.init;
            }
        }
        oldz = acceleration.z;
    },function(){
	  
    },{
        frequency: 30, adjustForRotation: true
    });
}
document.addEventListener("deviceready", onDeviceReady, false);

function showSaisho(){
	$("#mess").text("最初は・・");
}

function showGu(){
	$("#mess").text("グー！");
}

function showJanken(){
	$("#mess").text("じゃんけん・・");
}

function showPon() {
    var index = Math.floor(Math.random() * 3+1) - 1;
    $("#mess").text("index:"+index.toString());
}

function showAiko(){
	$("#mess").text("あいこで・・");
}

function getCurrentPath() {
    var str = location.href;
    var i = str.lastIndexOf('/');
    return str.substring(0, i+1);
}

function play(path) {
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
