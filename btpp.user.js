// ==UserScript==
// @name          BitcoinTalk++
// @version       0.1.38
var version='0.1.38';
// @author        jackjack-jj
// @description   Adds lot of features to bitcointalk.org, including a vote system
// @namespace     https://github.com/jackjack-jj
// @homepageURL   https://userscripts.org/scripts/show/174546
// @downloadURL   https://userscripts.org/scripts/source/174546.user.js
// @updateURL     https://userscripts.org/scripts/source/174546.meta.js
// @include       https://bitcointalk.org/*
// ==/UserScript==

var server     = 'https://jackjack.alwaysdata.net/btpp/';
var notePage   = 'note.php';
var votePage   = 'vote.php';
var clientName = 'official_'+version;
var updatefile = 'https://raw.github.com/jackjack-jj/btpp/master/btpp-chrome-update.xml';
var BTCSS      = '<link rel="stylesheet" type="text/css" href="https://bitcointalk.org/Themes/custom1/style.css?fin11" />';
var BTPPtitle  = '<h1 style="position:relative;bottom:15px;">BitcoinTalk++ v'+version+'</h1>';

var body = document.getElementsByTagName('body')[0];
var already_running=(document.getElementById('btpp_running')!=undefined);
if(already_running){
    document.getElementById("btpp_settings").style.color='red';
    document.getElementById("infobox").style.backgroundColor='black';
    document.getElementById("infobox").style.fontWeight='bold';
    document.getElementById("infobox").style.padding='6px';
    changeTransp('infobox', 1.0);
    changeinnerHTML('infobox','<a id="twoinstancesofbtpp" href="https://bitcointalk.org/index.php?topic=264337.msg3044502#msg3044502">Two versions of BitcoinTalk++ detected<br />Please uninstall one</a>');
    document.getElementById("twoinstancesofbtpp").style.color='red';
    return;
}

body.innerHTML+="<span id='btpp_running'></span>";

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

var hasGMGV = !(typeof GM_getValue === "undefined" || GM_getValue("a", "b") === undefined);
var cachedSettings = null;
var xml;
if(!hasGMGV){
	GM_getValue = function(name, defaultValue){
		var value = (cachedSettings === null ?
		localStorage.getItem(name) :
		cachedSettings[name]);
		if(value === undefined || value === null){
			return defaultValue;
		}
		if(value==null){return value;}
		var type = value[0];
		value=value.substring(1);
		switch (type){
			case "b":
				return (value === "true");
			case "n":
				return Number(value);
			default:
				return value;
		}
	}
	 
	GM_setValue = function(name, value){
		value = (typeof value)[0] + value;
		if (cachedSettings === null){
			localStorage.setItem(name, value);
		}else{
			cachedSettings[name] = value;
			chrome.extension.sendRequest({type: "setpref", name: name, value: value});
		}
	}

    function Chrome_XMLHttpRequest(a){
    	var oReq = new XMLHttpRequest();
    
    	oReq.open(a.method, a.url, true);
    	oReq.onload = function(r){a.onload(r.currentTarget);}
    	oReq.onerror = a.onerror;
    	oReq.send();
    }
    
    xml = Chrome_XMLHttpRequest;
}else{
    xml = GM_xmlhttpRequest;
};

function cfl(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function GMGV(p,d,m){
    n=p.indexOf(m);
    return GM_getValue(p[n], d[n]);
}


var params      = new Array('','uploadpicserv','gotolastreadpost','displaynoteformat','displaycustomtags','btcusdcurrency','btcusdsource','displaybtcusd','btcusdrefresh','buttonsinbold','newlineBS','formataddresses','formattx','presetpost','presetpm',"colorp1","colorm1","colorbpm","symbolp1","symbolm1");
var pdefaults   = new Array('','imgur','y','note','y','usd','mtgox','y','60','n','n','n','n','','',"#bbbbbb","#bbbbbb","#dddddd","+","&minus;");
var butnames    = new Array('','server for uploaded pics','make thread titles link to the last read post','format of note display','display BT++ tags','currency for Bitcoin price','source for Bitcoin price','display Bitcoin price','Bitcoin price refresh in seconds','put [+-] in bold','newline before score','format addresses','format transactions','text automatically added in your posts','text automatically added in your PMs',"color of +1","color of -1","color of surrounding []","symbol of +1","symbol of -1");

var listsOfChoices={};
var YesNo={'y':'Yes','n':'No'};
listsOfChoices['gotolastreadpost']=YesNo;
listsOfChoices['displaycustomtags']=YesNo;
listsOfChoices['displaynoteformat']={'note':'Note: (+1s)-(-1s)','pctnote':'PctNote: (+1s)/total','pctplus':'Pct+1: Note/total'};
listsOfChoices['btcusdsource']={'mtgox':'MtGox','btcavg':'BitcoinAverage','btcavgnogox':'BitcoinAverage w/o MtGox','btce':'BTC-e','stamp':'Bitstamp'};
listsOfChoices['displaybtcusd']=YesNo;
listsOfChoices['buttonsinbold']=YesNo;
listsOfChoices['newlineBS']=YesNo;
listsOfChoices['formataddresses']=YesNo;
listsOfChoices['formattx']=YesNo;
listsOfChoices['uploadpicserv']={'imgur':'imgur.com'};

var settingsDisplay={
    'Votes': ['password','newlineBS','displaynoteformat','symbolp1','symbolm1','colorp1','colorm1','colorbpm','buttonsinbold'],
    'Ticker':['displaybtcusd','btcusdsource','btcusdcurrency','btcusdrefresh'],
    'Features': ['gotolastreadpost','displaycustomtags','formataddresses','formattx','presetpost','presetpm','uploadpicserv'],
};

var colorPlusOne       = GMGV(params,pdefaults,'colorp1');
var colorMinusOne      = GMGV(params,pdefaults,'colorm1');
var colorBorderPM      = GMGV(params,pdefaults,'colorbpm');
var symbolPlusOne      = GMGV(params,pdefaults,'symbolp1');
var symbolMinusOne     = GMGV(params,pdefaults,'symbolm1');
var formatAddresses    = GMGV(params,pdefaults,'formataddresses');
var formatTransactions = GMGV(params,pdefaults,'formattx');
var presetPost         = GMGV(params,pdefaults,'presetpost');
var newlineBeforeScore = GMGV(params,pdefaults,'newlineBS');
var buttonsInBold      = GMGV(params,pdefaults,'buttonsinbold');
var BTCUSDrefresh      = GMGV(params,pdefaults,'btcusdrefresh');
var displayBTCUSD      = GMGV(params,pdefaults,'displaybtcusd');
var btcusdSource       = GMGV(params,pdefaults,'btcusdsource');
var btcusdCurrency     = GMGV(params,pdefaults,'btcusdcurrency').toUpperCase();
var displayCustomTags  = GMGV(params,pdefaults,'displaycustomtags');
var displayNoteFormat  = GMGV(params,pdefaults,'displaynoteformat');
var goToLastReadPost   = GMGV(params,pdefaults,'gotolastreadpost');
var presetPM           = GMGV(params,pdefaults,'presetpm');

function formatChoice(v,param){
    if(param in listsOfChoices){return listsOfChoices[param][v];}
    return v;
}

function noteNumber(n,v,p,m,type){
    var r=[0,'',''];
    if(type=='pctnote'){
        if(v>0){
            r[0]=Math.round(100.0*n/v);
        }
        r[2]='%';
    }else if(type=='pctplus'){
        if(v>0){
            r[0]=Math.round(100.0*p/v);
        }
        r[2]='%';
    }else{
        r[0]=n;
    }
    return r;
}

function formatNote(data,type){
    var n=data['note'];
    var v=data['votes'];
    var p=(v+n)/2;
    var m=(v-n)/2;

    var vals=noteNumber(n,v,p,m,type);
    var val=vals[0];
    var before=vals[1];
    var after=vals[2];
    
    var ns='';
    if(val>0){ns+='+';}
    ns+=val;
    
    if(n>0){ns='<span style="font-weight:bold;color:#33bb33;">'+before+ns+after+'</span>';}
    if(n<0){ns='<span style="font-weight:bold;color:red;">'+before+ns+after+'</span>';}
    if(n==0 && v>0){ns='<span style="font-weight:bold;color:blue;">'+before+ns+after+'</span>';}
    
    return ns+"<span style='font-size:50%;'>/"+v+"</span>";
}


function writeScoresGetPage(uurl, classname, error) {
    error = error || function (){};
    callback=function (r){
        var data;
       	eval("data="+r.responseText+';');
        for (j=0; j<document.getElementsByClassName('score_'+classname).length; j++){
            document.getElementsByClassName('score_'+classname)[j].innerHTML=formatNote(data,displayNoteFormat);
        }
        if(displayCustomTags=='y'){
            for (j=0; j<document.getElementsByClassName('tag_'+classname).length; j++){
                document.getElementsByClassName('tag_'+classname)[j].innerHTML=(data['tag']!=''?'<br />':'')+'<span style="'+data['tag']['style']+'">'+data['tag']['name'].replace('\n','<br />')+'</span>';
            }
        }
    }
    var arg = {
        method: 'GET',
        url: uurl,
        headers: {
            'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
            'Accept': 'application/atom+xml,application/xml,text/xml',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: '',
        onload: callback,
        onerror: error
    };
    xml(arg);
};

function getPageWithData(uurl, callback, error, d) {
    error = error || function (){};
    var arg = {
        method: 'POST',
        url: uurl,
        headers: {
            'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
            'Accept': 'application/atom+xml,application/xml,text/xml',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        //synchronous: true, // FF will crash if the network is slow. 
        data: d,
        onload: callback,
        onerror: error
    };
    xml(arg);
}
function getPage(uurl, callback, error) {
    getPageWithData(uurl, callback, error, '');
}

function saveSetting(param){
    return function(){
        var v=document.getElementById(param).value;
        GM_setValue(param, v);
//        document.getElementById(param+'done').innerHTML=' Done';
        var current=document.getElementById('current_'+param);
        if(current){current.innerHTML=formatChoice(v,param);}
//        setTimeout(function(){document.getElementById(param+'done').innerHTML='';},2000);
    }
}

function cfa(a){return '<span style="color:green;">'+a+'</span>';}
var translators=[
//    ['John','Chinese','1d4c5az42gr84fvre3qszd'],
];
if(document.location.href.split('/btppcontributors.ph').length>1){
    p=document.location.href.split('/btppcontributors.php?u=')[1];
    body.innerHTML='<title>BT++ Settings</title>'+BTCSS+BTPPtitle+'\
    <a href="https://bitcointalk.org/">Bitcoin Forum</a> > <a href="https://bitcointalk.org/btppconf.php?user='+p+'">BT++ Settings</a> > Contributors<br /><br /><br /><br />\
    <span style="position:relative;right:0px;">BitcoinTalk++ support address:</span> '+cfa('1Pxeccscj1ygseTdSV1qUqQCanp2B2NMM2')+'<br />\
    <span style="position:relative;right:0px;">Administrator, jackjack:</span> '+cfa('19QkqAza7BHFTuoz9N8UQkryP4E9jHo4N3')+'<br />\
    <br />\
    ';
    for(i=0;i<translators.length;i++){
        if(!i){body.innerHTML+='<b style="position:relative;right:10px;">Translators</b><br />';}
        t=translators[i];
        body.innerHTML+=t[0]+', '+t[1]+': '+t[2]+'<br />';
    }
    return;
    
}
if(document.location.href.split('/btppconf.ph').length>1){ // btpp config page
    pseudo=document.location.href.split('user=')[1].split('&')[0];
    pseudo=decodeURIComponent(pseudo);
    butnames[0]='password for '+pseudo;
    params[0]='password_'+pseudo;
    
    body.innerHTML='<title>BT++ Settings</title>'+BTCSS+BTPPtitle+'\
    <a href="https://bitcointalk.org/">Bitcoin Forum</a> > BT++ Settings<br /><br />\
    <b style="position:relative;right:10px;"><h3>Links</h3></b>\
    <a href="https://bitcointalk.org/btppcontributors.php?u='+pseudo+'">Bitcointalk++ contributors</a><br />\
    <a href="https://bitcointalk.org/privatemessages.php">List of your PMs</a><br />\
    <a href="'+server+'/list/">Lists of all BT++ scores</a><br />\
    <a href="'+server+'/voteslist.php">Lists of all BT++ votes</a><br />\
    <a href="'+server+'/scamreports/">List of reported potential scammers</a><br />\
    <br />\
    <b style="position:relative;right:10px;"><h3>Settings</h3></b>';

    table='<table border=0 style="position:relative;bottom:10px;">';
    for(setting in settingsDisplay){
        paramz=settingsDisplay[setting];
        table+='<tr><td colspan=4 style="font-weight:bold;"><span style="position:relative;right:5px;top:5px;">'+setting+'</span></td></tr>';
        for(j=0;j<paramz.length;j++){
            if(paramz[j]=='password'){i=0;}
            else{i=params.indexOf(paramz[j]);}
            
            param   = params[i];
            butname = butnames[i];
            def     = pdefaults[i];
            type    = '';
            current = GMGV(params,pdefaults,param);
            pwbreaker='';
            if(i==0){type=' type="password" ';current='*hidden*';pwbreaker='no';}
            input='<input '+type+' id="'+param+'" />';
            
            if(param in listsOfChoices){
                choices=listsOfChoices[param];
                input='<select id="'+param+'">';
                for(var l_value in choices){if(choices.hasOwnProperty(l_value)){
                        selected='';
                        if(current==l_value){selected='selected';}
                        l_name=choices[l_value];
                        input+='<option value="'+l_value+'" '+selected+'>'+l_name+'</option>';
                }}
                input+='</select>';
            }
            showbutton='';
            if(i==0){showbutton='<td><input id="show_password" type=button value="Show" /></td>';}
            table+='<tr><td>'+cfl(butname)+' <a href="" onclick="document.getElementById(\''+param+'\').value=\''+def+'\';return false;">(default='+def+')</span></td><td>Current: <span id="'+pwbreaker+'current_'+param+'">'+formatChoice(current,param)+'</span></td><td>'+input+'</td><td><input type=button id="'+param+'b" value="Change" /><span id="'+param+'done"></span></td>'+showbutton+'</tr>';
            
        }
    }
    table+='</table>';
    
    body.innerHTML+=table;

    el=document.getElementById('show_password');
    if(el){el.addEventListener('click',function(){alert(params[0]+': '+GM_getValue(params[0], 'None'));}, false);}
    for(i=0;i<params.length;i++){
        param=params[i];
        butname=butnames[i];
        el=document.getElementById(param+'b');
        if(el){el.addEventListener('click',saveSetting(param), false);}
    }
    
    return;
}

BTCUSDrefresh=Number(BTCUSDrefresh);

var regexpPMS = new RegExp('\n\t\t<tr><td((.|\n)*?)</table>\n\t\t</td></tr>', "g");
var PMfaits=0;
var listPM='';


function callbackPMEnd(){
    body.innerHTML=BTCSS+BTPPtitle+'<a href="https://bitcointalk.org">Bitcoin Forum</a> > All your PMs\
        <br /><br />\
        <table cellpadding="4" cellspacing="0" border="0" width="100%" class="bordercolor">\
        '+listPM+'</table>';
}

function concatPM(r,i,max,c){
    var resp = r.responseText;
    result = regexpPMS.exec(resp);
    
    body.innerHTML=BTCSS+BTPPtitle+'<a href="https://bitcointalk.org">Bitcoin Forum</a> > All your PMs\
        <br /><br />Downloading PMs: '+i+'/'+max;
    
    while(result != null){
        PMfaits+=1;
        listPM+='<tr><td'+result[1]+'</table>\n\t\t</td></tr>';
        result = regexpPMS.exec(resp);
    }   
    
    if(i<maxpagePM){
        var pmpage='https://bitcointalk.org/index.php?action=pm;f=inbox;sort=date;start='+String(i+20);
        getPage(pmpage, function(r){concatPM(r,i+20,maxpagePM,c);}, 0);
    }else{
        c();
    }
}

function callbackPM(r){
    var reg = new RegExp('f=inbox;start=([0-9]{0,10})" method=');
    maxpagePM = reg.exec(r.responseText)[1];
    body.innerHTML=BTCSS+'Downloading PMs';
    getPage('https://bitcointalk.org/index.php?action=pm;f=inbox;sort=date;start=0', function(r){concatPM(r,0,maxpagePM,callbackPMEnd);}, 0);
}

if(document.location.href.split('/privatemessages.ph').length>1){
  body.innerHTML='';
  getPage('https://bitcointalk.org/index.php?action=pm', callbackPM, 0);
  return;
}



var myPseudo   = '__NotConnected__'; //Don't change this
var myPassword = ''; //Don't change this

var hellotext = document.getElementById('hellomember');
if(hellotext){
    var reg = new RegExp('Hello <b>([^>]*)<\/b>', "g");
    var chaine = hellotext.innerHTML;
    myPseudo = reg.exec(chaine)[1];
    
    myPassword=GM_getValue("password_"+myPseudo, "");
}else{
    //  Not connected
}




threadview=(body.innerHTML.indexOf('">With a <i>Quick-Reply</i> you can use bulletin board code and smileys as you would in a normal post, but much more conveniently.')>-1);
var smileyspacer='&nbsp;&nbsp;';
smileys='<a href="javascript:void(0);" onclick="surroundText(\'[b]\', \'[/b]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/bold.gif" align="bottom" width="23" height="22" alt="Bold" title="Bold" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[i]\', \'[/i]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/italicize.gif" align="bottom" width="23" height="22" alt="Italicized" title="Italicized" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[u]\', \'[/u]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/underline.gif" align="bottom" width="23" height="22" alt="Underline" title="Underline" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[s]\', \'[/s]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/strike.gif" align="bottom" width="23" height="22" alt="Strikethrough" title="Strikethrough" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="replaceText(\'[btc]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/BTC.gif" align="bottom" width="23" height="22" alt="Insert Bitcoin symbol" title="Insert Bitcoin symbol" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[glow=red,2,300]\', \'[/glow]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/glow.gif" align="bottom" width="23" height="22" alt="Glow" title="Glow" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[shadow=red,left]\', \'[/shadow]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/shadow.gif" align="bottom" width="23" height="22" alt="Shadow" title="Shadow" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[pre]\', \'[/pre]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/pre.gif" align="bottom" width="23" height="22" alt="Preformatted Text" title="Preformatted Text" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[left]\', \'[/left]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/left.gif" align="bottom" width="23" height="22" alt="Left Align" title="Left Align" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[center]\', \'[/center]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/center.gif" align="bottom" width="23" height="22" alt="Centered" title="Centered" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[right]\', \'[/right]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/right.gif" align="bottom" width="23" height="22" alt="Right Align" title="Right Align" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="replaceText(\'[hr]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/hr.gif" align="bottom" width="23" height="22" alt="Horizontal Rule" title="Horizontal Rule" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[size=10pt]\', \'[/size]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/size.gif" align="bottom" width="23" height="22" alt="Font Size" title="Font Size" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[font=Verdana]\', \'[/font]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/face.gif" align="bottom" width="23" height="22" alt="Font Face" title="Font Face" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a>'+
'<br /><a href="javascript:void(0);" onclick="surroundText(\'[flash=200,200]\', \'[/flash]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/flash.gif" align="bottom" width="23" height="22" alt="Insert Flash" title="Insert Flash" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[img]\', \'[/img]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/img.gif" align="bottom" width="23" height="22" alt="Insert Image" title="Insert Image" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[url]\', \'[/url]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/url.gif" align="bottom" width="23" height="22" alt="Insert Hyperlink" title="Insert Hyperlink" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[email]\', \'[/email]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/email.gif" align="bottom" width="23" height="22" alt="Insert Email" title="Insert Email" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[ftp]\', \'[/ftp]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/ftp.gif" align="bottom" width="23" height="22" alt="Insert FTP Link" title="Insert FTP Link" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[table]\', \'[/table]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/table.gif" align="bottom" width="23" height="22" alt="Insert Table" title="Insert Table" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[tr]\', \'[/tr]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/tr.gif" align="bottom" width="23" height="22" alt="Insert Table Row" title="Insert Table Row" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[td]\', \'[/td]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/td.gif" align="bottom" width="23" height="22" alt="Insert Table Column" title="Insert Table Column" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[sup]\', \'[/sup]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/sup.gif" align="bottom" width="23" height="22" alt="Superscript" title="Superscript" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[sub]\', \'[/sub]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/sub.gif" align="bottom" width="23" height="22" alt="Subscript" title="Subscript" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[tt]\', \'[/tt]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/tele.gif" align="bottom" width="23" height="22" alt="Teletype" title="Teletype" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[code]\', \'[/code]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/code.gif" align="bottom" width="23" height="22" alt="Insert Code" title="Insert Code" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><a href="javascript:void(0);" onclick="surroundText(\'[quote]\', \'[/quote]\', document.forms.postmodify.message); return false;"><img onmouseover="bbc_highlight(this, true);" onmouseout="if (window.bbc_highlight) bbc_highlight(this, false);" src="https://bitcointalk.org/Themes/custom1/images/bbc/quote.gif" align="bottom" width="23" height="22" alt="Insert Quote" title="Insert Quote" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a><img src="https://bitcointalk.org/Themes/custom1/images/bbc/divider.gif" alt="|" style="margin: 0 3px 0 3px;" /><a href="javascript:void(0);" onclick="surroundText(\'[list]\\n[li]\', \'[/li]\\n[li][/li]\\n[/list]\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Themes/custom1/images/bbc/list.gif" align="bottom" width="23" height="22" alt="Insert List" title="Insert List" style="background-image: url(https://bitcointalk.org/Themes/custom1/images/bbc/bbc_bg.gif); margin: 1px 2px 1px 1px;" /></a>'+
'<br /><a href="javascript:void(0);" onclick="replaceText(\' :)\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/smiley.gif" align="bottom" alt="Smiley" title="Smiley" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' ;)\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/wink.gif" align="bottom" alt="Wink" title="Wink" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :D\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/cheesy.gif" align="bottom" alt="Cheesy" title="Cheesy" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' ;D\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/grin.gif" align="bottom" alt="Grin" title="Grin" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' >:(\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/angry.gif" align="bottom" alt="Angry" title="Angry" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :(\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/sad.gif" align="bottom" alt="Sad" title="Sad" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :o\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/shocked.gif" align="bottom" alt="Shocked" title="Shocked" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' 8)\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/cool.gif" align="bottom" alt="Cool" title="Cool" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' ???\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/huh.gif" align="bottom" alt="Huh" title="Huh" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' ::)\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/rolleyes.gif" align="bottom" alt="Roll Eyes" title="Roll Eyes" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :P\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/tongue.gif" align="bottom" alt="Tongue" title="Tongue" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :-[\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/embarrassed.gif" align="bottom" alt="Embarrassed" title="Embarrassed" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :-X\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/lipsrsealed.gif" align="bottom" alt="Lips sealed" title="Lips sealed" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :-\\\\\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/undecided.gif" align="bottom" alt="Undecided" title="Undecided" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :-*\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/kiss.gif" align="bottom" alt="Kiss" title="Kiss" /></a>'+
smileyspacer+'<a href="javascript:void(0);" onclick="replaceText(\' :\\\\\'(\', document.forms.postmodify.message); return false;"><img src="https://bitcointalk.org/Smileys/default/cry.gif" align="bottom" alt="Cry" title="Cry" /></a>';





function changeTransp(id, pct){
  document.getElementById(id).style.opacity=pct;
}

function changeinnerHTML(id,txt){
  document.getElementById(id).innerHTML=txt;
}

function resetPassword(){
    pass='';
    while(pass == ''){
      pass = window.prompt('BT++ password for '+myPseudo);
    }
    if(pass == null){
        if(GM_getValue("password_"+myPseudo, '')!=''){
            return;
        }
    }
    
    GM_setValue("password_"+myPseudo, pass);
}


var infobox='<div id="infobox" style="\
  background-color:#ddddff;\
  border:1px solid #bbbbdd;\
  max-width:500px;\
  position:fixed;\
  top:2px;\
  right:2px;\
  padding:2px 2px 2px 2px;\
  "></div>';
body.innerHTML+=infobox;
if(displayBTCUSD=='y'){
  body.innerHTML+='<div id="pricediv" style="position:fixed;top:0px;left:0px;right:0px;width:200px;margin-right:auto;margin-left:auto;background-color:#E5E5F3;text-align:center;border:solid 1px #333399;font-weight:bold;padding:2px;">Contacting ticker...</div>';
}



//   Make address links
if(formatAddresses=='y' && document.location.href.split('sa=forumProfil').length==1){
    body.innerHTML=body.innerHTML.replace(
      /([^0-9a-zA-Z:\/>])(1[1-9A-HJ-Za-km-z]{25,33})([^0-9a-zA-Z"])/g,
      '$1<a href="https://blockchain.info/address/$2">$2</a>$3'
    );
}

if(formatTransactions=='y'){
    body.innerHTML=body.innerHTML.replace(
      /tx:([0-9a-fA-F]{64})/g,
      '<a href="https://blockchain.info/tx/$1">$1</a>'
    );
}


body.innerHTML=body.innerHTML.replace(
  /action=ignore;u=([^;]*?);topic=(?:[^;]*?);msg=(?:[^;]*?);sesc=(?:[^;]*?)">Ignore<\/a>/g,
  '$&<br /><a class="reportscammerlink" href="#" onclick="return false;" cible="$1" nomcible="">Report scammer</a>'
);


if(goToLastReadPost=='y'){
    body.innerHTML=body.innerHTML.replace(
      /<span id="msg_([0-9]{0,10})"><a href="https:\/\/bitcointalk.org\/index.php\?topic=([0-9]{0,10}).0">/g,
      '<span id="msg_$1"><a href="https://bitcointalk.org/index.php?topic=$2.new;topicseen#new">'
    );
    body.innerHTML=body.innerHTML.replace(
      /<a href="https:\/\/bitcointalk.org\/index.php\?topic=([0-9]{0,10}).0;topicseen">/g,
      '<a href="https://bitcointalk.org/index.php?topic=$1.new;topicseen#new">'
    );
}






var PMpage=(body.innerHTML.indexOf('Bcc:')>-1);
if(PMpage){
    if(document.getElementById('message')){
//        document.getElementById('message').innerHTML+=''+presetPM.replace(/\\n/g,'\n');
        if(presetPM!='')body.innerHTML=body.innerHTML.replace(
          /<tr>\n\t\t\t\t<td(?:.{0,30})td>\n\t\t\t\t<td>\n\t\t\t\t\t<textarea/g,
          '<tr><td align="right"></td><td valign="middle"><a href="#" onclick="document.getElementById(\'message\').value+=\''+presetPM+'\';">Add your signature</tr>$&'
        );
    }
}

if(threadview){
    if(document.forms.postmodify){
        document.forms.postmodify.innerHTML=smileys+document.forms.postmodify.innerHTML;
        if(document.forms.postmodify.elements['message'].innerHTML==''){
            document.forms.postmodify.elements['message'].innerHTML=presetPost;
        }
    }
}


var uploadImage = function(e) {
    var uis=document.getElementById('uploadimgsubmit');
    uis.value='Uploading...';
    uis.disabled='disabled';
    var f=document.getElementById('uploadedfile').files[0];
    if(f==undefined){return;}
      var reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {
          if(theFile.size>10000000){return;}
          var res=e.target.result;
          var filename=escape(theFile.name);
          var content=encodeURIComponent(res);
            getPageWithData(server+'/uploadpic.php', 
                function(r){
                    var d;
                	eval("d="+r.responseText+';');
                	if(d['error']!='none'){return;}
                	var txt='<a href="javascript:void(0);" onclick="replaceText(\'[img]'+d['link']+'[/img]\', document.forms.postmodify.message); return false;">Insert "'+filename+'"</a>';
                    document.getElementById("listofuploadedpics").innerHTML+='<br />'+txt;
                    uis.value='Upload';
                    uis.disabled=false;
                }
                ,0,'pseudo='+myPseudo+'&pass='+myPassword+'&fname='+filename+'&v='+content
            );
        };
      })(f);
      reader.readAsDataURL(f);
}


body.innerHTML=body.innerHTML.replace(
        /<textarea class="editor" name="message"/g,
      'Upload image: <input name="uploadedfile" id="uploadedfile" type="file" />\
<input type="button" id="uploadimgsubmit" value="Upload" /><span id="listofuploadedpics"></span>\
</td></tr><tr><td valign="top" align="right"></td><td>$&');
body.innerHTML=body.innerHTML.replace(
        /<textarea cols=/g,
      '<br />Upload image: <input name="uploadedfile" id="uploadedfile" type="file" />\
<input type="button" id="uploadimgsubmit" value="Upload" /><span id="listofuploadedpics"></span>\
$&');


body.innerHTML = 
body.innerHTML.replace(
    /<a href="https:\/\/bitcointalk.org\/index.php\?action=help">Help<\/a>/g,
    '<a href="https://bitcointalk.org/btppconf.php?user='+myPseudo+'"><span id="btpp_settings">BT++ settings</span></a><a href="https://bitcointalk.org/index.php?topic=264337.new;topicseen#new"><span id="needupdate" title="BT++ is not up-to-date">'+GM_getValue('lastversion','')+'</span></a>\
    </td><td valign="top" class="maintab_back"><a href="https://bitcointalk.org/index.php?action=help">Help</a>'
);



var meanLVRefresh=5;
if(myPseudo=='jackjack' && version[version.length-1]=='b'){
    document.getElementById('needupdate').innerHTML='';
}else{
    if(Math.random()<1.0/meanLVRefresh || GM_getValue('myversion','')!=version){
        getPage(server+'/lastversion.php?v='+version, 
            function(r){
                if(r.responseText!=version){
                    GM_setValue('lastversion','*');
                }else{
                    GM_setValue('lastversion','');
                }
                document.getElementById('needupdate').innerHTML=GM_getValue('lastversion','');
            }
            ,0
        );
    }
}
GM_setValue('myversion',version);

//   Add partial quote buttons
function pqbf(s){
    var u=s.getAttribute('user');
    var t=s.getAttribute('thread');
    var p=s.getAttribute('post');

    var start='[quote author='+u+' link=topic='+t+'.msg'+p+'#msg'+p+' date=0]';
    var end='[/quote]';
    document.forms.postmodify.elements['message'].value+=start+getSelectionHtml()+end+'\n';
}

function makepqbf(s){
    return function(){pqbf(s);};
}

body.innerHTML=body.innerHTML.replace(
  /View the profile of ([^"]*?)"(?:(.|\n)*?)<a href="(?:.*?)quote=(.*?);topic=(.*?)\.(.*?)" (.*?)><(.*?)alt="Reply with quote"(.*?)><\/a>/g,
  '$&&nbsp;<a href="#" onclick="return false;"><span class="partialquotebutton" user="$1" thread="$4" post="$3"><img src="http://img15.hostingpics.net/pics/663907pquote.png" /></span></a>'
);


function votingURL(no,val,nom){
    var url=server+'/'+votePage+'?pseudo='+myPseudo+'&pass='+myPassword+'&cible='+no+'&nomcible='+nom+'&score='+val
    return url;
}

function bouton(text,color,val){
    var r="<a class='boutonvote' nom='$2' val="+val+" no=$1 onClick='return;'><span style='cursor:pointer;color:"+color+";'>"+text+"</span></a>";
    return r;
}

var boutonPlus=bouton(symbolPlusOne,colorPlusOne,1);
var boutonMoins=bouton(symbolMinusOne,colorMinusOne,-1);

var jjsep='JJ##SEP';
var listPseudos=new Array();
var listPseudosNos=new Array();
var headers = document.getElementsByTagName('td');
beforescore='';
if(newlineBeforeScore=='y'){
    beforescore='<br />';
}
fontweightbuttons='normal';
if(buttonsInBold=='y'){
    fontweightbuttons='bold';
}

for (i=0; i<headers.length; i++)
{

  var thismenu = headers[i].innerHTML;
  var tm = thismenu.replace(
    /<a href="https:\/\/bitcointalk.org\/index\.php\?action=profile;u=([^>]*)" title=[^>]*>([^<]*)<\/a><\/b>/g,
    jjsep+'$1'+jjsep+'$2'+jjsep+'<a href="index.php?action=profile;u=$1">$2</a></b>'+beforescore+'&nbsp;&nbsp;<span style="font-weight:normal;">[</span><span class="score_$1"></span><span style="font-weight:normal;">]</span>&nbsp;<span style="font-weight:'+fontweightbuttons+';color:'+colorBorderPM+';">['+boutonPlus+'&nbsp;'+boutonMoins+']</span><span class="tag_$1"></span>'
  );
  if(tm.indexOf(jjsep)==-1){
      tm = thismenu.replace(
        /<a href="https:\/\/bitcointalk.org\/index\.php\?action=profile;u=([^>]*)" title=[^>]*>([^<]*)<\/a>/g,
        jjsep+'$1'+jjsep+'$2'+jjsep+'<a href="index.php?action=profile;u=$1">$2</a>&nbsp;&nbsp;<span style="font-weight:normal;">[</span><span class="score_$1"></span><span style="font-weight:normal;">]</span>&nbsp;<span style="font-weight:'+fontweightbuttons+';color:'+colorBorderPM+';">['+boutonPlus+'&nbsp;'+boutonMoins+']</span>'
      );
  }
  
  if(tm.indexOf(jjsep)==-1){continue;}
  
  tm = tm.split(jjsep);

  var tm2 = tm[0];
  for (j=0; j<(tm.length-1)/3; j++){
    listPseudosNos.push(tm[3*j+1]);
    listPseudos.push(tm[3*j+2]);
    tm2 += tm[3*j+3];
  }

  headers[i].innerHTML=tm2;

}



function makeFctDisplayTransp(i,dt,steps){
    return function (){
      changeTransp('infobox', 1.0-1.0*i/steps);
    }
}

function displayInfobox(tsec,dt){  //dt in ms
  changeTransp('infobox', 1.0);
  t=1000.0*tsec;
  steps=t/dt;
  for(i=1;i<=steps;i++){
    setTimeout(makeFctDisplayTransp(i,dt,steps),dt*i);
  }
}


function callbackVoted(r){
  if(r.responseText=='Error: Bad password'){
    time=20;
    changeinnerHTML('infobox',r.responseText);
    displayInfobox(time,50);
  }else{
    changeinnerHTML('infobox',r.responseText);
    displayInfobox(3,50);
  }
}

function makeFuncGP(noz,valz,nomz){
  return function(){ 
    getPage(votingURL(noz,valz,nomz), callbackVoted,0); 
    setTimeout(function(){
        writeScoresGetPage(
            server+'/'+notePage+'?json=1&client=official&clientversion='+version+'&pseudo='+nomz+'&no='+noz+'&p='+myPseudo,
            noz
        );
    },2000);
  }
}

function changePriceDiv(a){
    document.getElementById('pricediv').innerHTML=a;
}

function currToSymbol(c){
    if(c=='EUR'){
        return Array('',' €');
    }
    else if(c=='USD'){
        return Array('$','');
    }
    else{
        return Array('',' '+c);
    }
}

function callbackTicker(r){
    var c=btcusdCurrency;
    var s=btcusdSource;
    var symbol=currToSymbol(c);
    var data;
    
	eval("data="+r.responseText+';');
    if(s=='btcavg'){
        changePriceDiv('BTCaverage: '+symbol[0]+data[c]['averages']['last']+symbol[1]);
        document.getElementById('pricediv').style.width='180px';
    }else if(s=='btcavgnogox'){
        changePriceDiv('BTCaverage: '+symbol[0]+data[c]['last']+symbol[1]);
        document.getElementById('pricediv').style.width='180px';
    }else if(s=='btce'){
        changePriceDiv('BTC-e: '+symbol[0]+data['ticker']['last']+symbol[1]);
        document.getElementById('pricediv').style.width='150px';
    }else if(s=='stamp'){
        changePriceDiv('Bitstamp: '+symbol[0]+data['ask']+symbol[1]);
        document.getElementById('pricediv').style.width='130px';
    }else{
        changePriceDiv('MtGox: '+data['return']['last_all']['display']);
        document.getElementById('pricediv').style.width='130px';
    }

}

function priceSourceToURL(s, curr){
    if(s=='btcavg'){
        return 'http://api.bitcoinaverage.com/all';
    }else if(s=='btcavgnogox'){
        return 'http://api.bitcoinaverage.com/no-mtgox/ticker/all';
    }else if(s=='btce'){
        return 'https://btc-e.com/api/2/btc_'+curr.toLowerCase()+'/ticker';
    }else if(s=='stamp'){
        return 'https://www.bitstamp.net/api/ticker/';
    }else{
        return 'https://data.mtgox.com/api/1/BTC'+curr+'/ticker';
    }
}

if(displayBTCUSD=='y'){
    var ticker = priceSourceToURL(btcusdSource, btcusdCurrency);

    getPage(ticker, callbackTicker, 0);
    setInterval(
        function(){
            getPage(ticker, callbackTicker, 0);
        }
        ,BTCUSDrefresh*1000);
}

changeTransp('infobox', 0.0);
changeinnerHTML('infobox','');


function makeFuncRSL(c){
  return function(){ 
    page=server+'/reportscammer.php?pseudo='+myPseudo+'&pass='+myPassword+'&cible='+c+'&nomcible=';
    getPage(page, callbackVoted,0); 
  }
}

var rsls = document.getElementsByClassName('reportscammerlink');
for (i=0; i<rsls.length; i++)
{
    rsl=rsls[i];
    rsl.addEventListener('click',makeFuncRSL(rsl.getAttribute('cible')), false);
}

var headers = document.getElementsByClassName('boutonvote');
for (i=0; i<headers.length; i++)
{
    var hi=headers[i];
    noz=hi.getAttribute('no');
    nomz=hi.getAttribute('nom');
    valz=hi.getAttribute('val');
    hi.addEventListener('click',makeFuncGP(noz,valz,nomz), false);
}

var pqb = document.getElementsByClassName('partialquotebutton');
for(i=0;i<pqb.length;i++){
    var p=pqb[i];
    p.addEventListener('click',makepqbf(p), false);
}


for (i=0; i<listPseudosNos.length; i++)
{
    pseudono=listPseudosNos[i];
    writeScoresGetPage(
        server+'/'+notePage+'?json=1&client=official&clientversion='+version+'&pseudo='+listPseudos[i]+'&no='+listPseudosNos[i]+'&p='+myPseudo,
        pseudono
    );
}

var element = window.document.getElementById("uploadimgsubmit");
if (element && element.addEventListener) {
    element.addEventListener("click", uploadImage, false);
}
