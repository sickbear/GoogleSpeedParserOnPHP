'use district';

var sites = [];
var API_KEY = 'AIzaSyB9OW2agMmKueRGBGNylconEFKt4QA1S3U';
var API_URL = 'https://www.googleapis.com/pagespeedonline/v4/runPagespeed?';
var CHART_API_URL = 'http://chart.apis.google.com/chart?';
var currentStrategy = 'mobile';
var callbacks = {};
var classTd, siteID, speedScore;
var count = 0;

function runPagespeed() {
    $('#analysis').attr('disabled', 'true').removeClass('btn_active').addClass('btn_not_active');
    checkStratagy(currentStrategy);
}

function checkStratagy(strategy) {
    currentStrategy = strategy;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    $('#info').val('Проверяется ' + sites[count]);
    var query = [
        'url=' + sites[count],
        'callback=runPagespeedCallbacks',
        'key=' + API_KEY,
        'strategy=' + strategy,
    ].join('&');
    s.src = API_URL + query;
    document.head.insertBefore(s, null);
}

function runPagespeedCallbacks(result) {
    if (result.error) {
        var errors = result.error.errors;
        for (var i = 0, len = errors.length; i < len; ++i) {
            if (errors[i].reason == 'badRequest' && API_KEY == 'AIzaSyB9OW2agMmKueRGBGNylconEFKt4QA1S3U') {
                alert('Please specify your Google API key in the API_KEY variable.');
            } else if (errors[i].reason == 'mainResourceRequestFailed') {
                console.log('Неправильный адрес ' + sites[count]);
            } else {
                alert(errors[i].message);
            }
        }
    }

    for (var fn in callbacks) {
        var f = callbacks[fn];
        if (typeof f == 'function') {
            callbacks[fn](result);
        }
    }

    if (count <= sites.length - 1) {
        if (currentStrategy == 'mobile') {
            currentStrategy = 'desktop';
        } else {
            currentStrategy = 'mobile';
        }
        runPagespeed();
    } else {
        $('#info').val('Проверка закончена. Для сброса результатов нажмите RESET.');
    }
}

$('#parse').click(function() {
    var input = $('#adress').val();
    if (input != '') {
      $.get(
          '/sendRequest.php',
          {siteAdress: input},
          onAjaxSuccess
      );
    } else {
      $('#info').val('Сначала введите адрес сайта');
    }
});

function onAjaxSuccess(data) {
    try {
        var get_result = $.parseJSON(data); 
        $('#parse').attr('disabled', 'true').removeClass('btn_active').addClass('btn_not_active');
        $('#analysis').removeAttr('disabled').removeClass('btn_not_active').addClass('btn_active');
        $('#links').css('display', 'table');
        $('#info').val('Нажмите кнопку ANALYZE для сбора данных или RESET для сброса.');
    } catch(e) {
        if (e.name == 'SyntaxError') {
            $('#info').val('Введён некорректный адрес либо не найден sitemap.');
        }
    }
    getLinks(get_result);
}

$('#analysis').click(function() {
    setTimeout(runPagespeed, 0);
});

$('#reset').click(function() {
    $('#info').val('Введите название сайта полностью (например, https://koptilnya.com), нажмите PARSE для получения адресов.');
    $('#adress').val('');
    window.location.reload();
    $('#analysis').attr('disabled', 'true');
});

function getLinks(links) {
    var countLinks = 0;
    var currentLink;
    for (countLinks = 0; countLinks < links.length; countLinks++) {
        if (countLinks < 9) {
            classTd = 'site' + countLinks;
            currentLink = links[countLinks][0];
            $('#links').append('<tr><td>' + currentLink + '</td><td id="' + classTd + '-m">Пока нет данных</td><td id="' + classTd + '-d">Пока нет данных</td><tr>');
            sites.push(currentLink);
        } else {
            return;
        }
    }
};

callbacks.displayScore = function(result) {
    if (!result.error) {
        checkStrategyNow();
        if (result.responseCode == 404) {
            $(siteID).addClass('low').text('Ошибка 404');
        } else {
            speedScore = result.ruleGroups.SPEED.score;
            if (speedScore > 79) {
                $(siteID).addClass('good');
            } else if (59 < speedScore < 80) {
                $(siteID).addClass('medium');
            } else {
                $(siteID).addClass('low');
            }
            $(siteID).text(speedScore);
        }
    } else {
        checkStrategyNow();
        if (result.error.code == 400) {
            $(siteID).addClass('low').text('Ошибка 400');
        } else {
            $(siteID).addClass('low').text('Непредвиденная ошибка');
        }
    }

    function checkStrategyNow() {
        if (currentStrategy == 'mobile') {
            siteID = '#site' + count + '-m';
        } else {
            siteID = '#site' + count + '-d';
            count++;
        }
        return siteID;
    }

}
