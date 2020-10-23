var timeout;

function processKeyEvent(eventType, event)
{
    if (window.event)
    {
        event = window.event;
    }


    var ul = $('#live-search-box ul');
    var li = $('#live-search-box li');
    var inp = $('#live-search');

    if (event.keyCode == 38) // YukarÄ± ok
    {
        if (li.hasClass('selectedli') == false)
        {
            li.last().addClass('selectedli');
            inp.val(li.last().children().innerHTML);
        } else
        {
            var t = ul.children('li.selectedli');
            if (parseInt(t.index()) != 0 && parseInt(t.index()) < ul.children("li").length)
            {
                t.prev().addClass('selectedli');
                t.removeClass('selectedli');
                inp.val(t.prev().children().text());

            } else
            {
                t.removeClass('selectedli');
                li.last().addClass('selectedli');
                inp.val(li.last().children().text());

            }
        }
    } else if (event.keyCode == 40) // AÅaÄÄ± ok
    {
        if (li.hasClass('selectedli') == false)
        {
            li.first().addClass('selectedli');
            inp.val(li.first().children().text());
        } else
        {
            var t = ul.children('li.selectedli');
            //console.log(ul.children("li").length)
            //console.log(t.index())
            if (parseInt(t.index()) + 1 < ul.children("li").length)
            {
                t.next().addClass('selectedli');
                t.removeClass('selectedli');
                inp.val(t.next().children().text());
            } else
            {
                t.removeClass('selectedli');
                li.first().addClass('selectedli');
                inp.val(li.first().children().text());
            }
        }
    } else if (event.keyCode == 37 || event.keyCode == 39) // SaÄ ve sol ok
    {
    } else if (event.keyCode == 27)
    {
        //ESC
        document.getElementById("live-search-box").style.display = "none";
    } else if (event.keyCode == 13) {
        if (typeof $(".selectedli").find("a").attr("href") != "undefined") {
            window.location = $(".selectedli").find("a").attr("href");
        }
    } else
        showResult();

    //document.getElementById("live-search-box").innerHTML += event.keyCode;
}

function processKeyUp(event)
{
    processKeyEvent("onkeyup", event);
}

function showResult()
{
    // 300 milisaniye bekle ve ara
    if (timeout)
    {
        clearTimeout(timeout);
        timeout = null;
    }
    timeout = setTimeout(function () {
        showResultNow()
    }, 300);
}
function showResultNow()
{
    var boxi = document.getElementById("live-search");
    var boxr = document.getElementById("live-search-box");

    // Explorer 8 ve aÅaÄÄ±sÄ± window.getComputedStyle()
    // fonksiyonunu desteklemiyor

    /*
     if ($.browser && $.browser.msie && 9 > parseInt($.browser.version, 10))
     {
     var boxi_style = boxi.currentStyle;
     }
     else
     {
     var boxi_style = window.getComputedStyle(boxi, null);
     }
     */

    var boxi_style = window.getComputedStyle(boxi, null);
    var boxi_offs = $('#live-search').offset();
    var isPost = $('#live-search').attr('data-post') || '0';

    var searchWord = boxi.value.replace(/^\//g, '');
    if (searchWord.length === 0) {
        document.getElementById("live-search-box").innerHTML = "";
        return;
    }

    if (window.XMLHttpRequest)
    {	// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else
    {	// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function ()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            document.getElementById("live-search-box").innerHTML = xmlhttp.responseText;
            document.getElementById("live-search-box").style.display = "block";
        }
    };
    if (1 === 1 || '1' === isPost) {
        xmlhttp.open("POST", "/srv/service/product/search/", true);
        var formData = new FormData();
        formData.append("searchWord", searchWord);
        xmlhttp.send(formData);
    } else {
        xmlhttp.open("GET", "/srv/service/product/search/" + encodeURIComponent(searchWord));
        xmlhttp.send();
    }
}

$(document).ready(function () {

    document.getElementById("live-search").onkeyup = processKeyUp;

    $("#live-search").on("blur", function (e) {
        if ($("#live-search").val() == '') {
            setTimeout(function () {
                document.getElementById("live-search-box").style.display = "none";
            }, 500)
        }

    });

    $(document).click(function (e) {
        if (!$(e.target).parents('#FormAra').length) {
            $("#live-search").val('');
            $("#live-search-box").hide();
//            document.getElementById("live-search-box").style.display = "none";
        }
    });

});


