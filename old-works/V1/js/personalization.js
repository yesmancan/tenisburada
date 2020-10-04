function packageCallback(id, count) {
    $('[data-product-id="' + id + '"]').trigger('keyup');
}
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/jpg");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
function Upload(options) {
    Upload.counter = Upload.counter || 0;
    Upload.counter++;
    this.opt = {
        instance: 'myUpload',
        url: '', //post edilecek url
        product_id: 0,
        cart_id: 0,
        postParams: {}, //post edilecek parametreler
        buttons: {
            select: {text: LANG.get("select_image", "Resim Seç"), cls: 'selectButton', id: 'selectButton_' + Upload.counter},
            upload: {text: LANG.get("upload", "Yükle"), cls: 'uploadButton', id: 'uploadButton_' + Upload.counter}
        },
        uploadButtonActive: false,
        progressWrapper: '.imagesWrapper', //selector  (Resimler seçildiğinde, resimlerin gözükeceği div)
        progress: function (event, __this) {
            var parent = $(__this).parents('.form:first');
            var percent = (event.loaded / event.total) * 100;
            var total = '' + event.total + '';
            total = total.length > 6
                    ? total.replace(/(\w+)(\w{3})(\w{3})/ig, '$1.$2.$3')
                    : total.replace(/(\w+)(\w{3})/ig, '$1.$2');
            parent.find('.progressBar').css('width', Math.round(percent) + '%');
            parent.find('.progressInfo').html('%' + Math.round(percent) + ' (' + total + ' byte)');
        },
        load: function (response) {

        },
        error: function () {
        },
        abort: function () {
        },
        callback: function (msg) {

        }
    };

    var _this = this;
    Upload.instance = Upload.instance | {};
    Upload.instance.activeUpload = this;
    Upload.instance[_this.opt.instance] = this;

    this.get = function (key) {
        return _this.opt[key];
    };

    this.set = function (key, val) {
        _this.opt[key] = val;
        return true;
    };

//    function getDefault(key, obj, _default) {
//        return typeof _this.obj[key] !== 'undefined' ? _this.obj[key] : _default;
//    }

    for (var i in options) {
        _this.opt[i] = options[i];
    }

    Upload.clickUpload = function (__this) {
        var parent = $(__this).parents('.form:first');
        var ttt = parent.find('input[type="file"]');
        var files = ttt[0].files;
        doUpload(files, ttt[0]);
    };

    Upload.handleFiles = function (__this) {
        var files = __this.files;
        var parent = $(__this).parents('.form:first');

        if (!files.length) {
            $(_this.opt.progressWrapper).find('.imageList').html(LANG.get("not_selected_image", "Resim Seçilmedi !!!"));
        } else {
            parent.find('.imageList').html('');
            for (var i = 0; i < files.length; i++) {
                var img = document.createElement("img");
                img.src = window.URL.createObjectURL(files[i]);
                img.height = 60;
                img.onload = function (e) {
                    window.URL.revokeObjectURL(this.src);

                    if (typeof (Storage) !== "undefined") {
                        var k = 'personalization_product_' + _this.get('product_id') + '_cart_id_' + _this.get('cart_id') + '_img_' + i;
                        k = 'imageData';
                        localStorage.setItem(k, getBase64Image(this));
                    }
                };

                parent.find('.imageList').append('\
                    <div class="fl col-2 comboImage">\n\
                        <div class="fl imageInner">\n\
                            <div class="imgInner" style="position:relative;"></div>\n\
                        </div>\n\
                    </div>\n\
                ');
                parent.find('.imageList .comboImage:last .imgInner').append(img);

            }

            parent.find('.imagesWrapper').fadeIn();

            if (_this.opt.uploadButtonActive === false) {
                var progressCount = parent.find('.progressInfo').text().replace('%', '').trim();

                if (parseInt(progressCount) === 100) {
                    var uploadPopup = new Message({
                        html: LANG.get('error_upload_again'),
                        width: 300
                    });
                    uploadPopup.show();
                } else {

                    doUpload(files, __this);
                }
            }
        }
    };

    function doUpload(files, __this) {
        var formdata = new FormData();
//        var files = files;

        var file_names = [];
        var name = $(__this).attr('data-name');

        //var select = '#' + _this.opt.buttons.upload.id;
        //var element = document.getElementById(_this.opt.buttons.upload.id);
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            file_names.push(file.name);
            formdata.append("file" + i, file);
        }

        for (var key in _this.opt.postParams) {
            formdata.append(key, _this.opt.postParams[key]);
        }

        var ajax = new XMLHttpRequest();
        ajax.upload.addEventListener("progress", function (event) {
            _this.opt.progress(event, __this);
        });
        ajax.addEventListener("load", function () {
            _this.opt.load(this.responseText);
            _this.opt.callback(this.responseText, __this, file_names);
        });
        ajax.addEventListener("error", _this.opt.error);
        ajax.addEventListener("abort", _this.opt.abort);

        ajax.open("POST", _this.opt.url);
        ajax.send(formdata);
    }



    this.getCreatedHtml = function (name) {
        var aaa = _this.opt.uploadButtonActive ? '' : '';
        var html = '';

        if (_this.opt.uploadButtonActive) {
            html = '<form id="image_upload_form" enctype="multipart/form-data" method="post" class="fl col-12">\n\
                        <label for="file' + Upload.counter + '" class="btn col-5 btn-medium btn-success fileInput">\n\
                            ' + LANG.get("select_image", "Resim Seç") + '\n\
                            <input data-name="' + name + '" onchange="Upload.handleFiles(this); return true;" type="file" name="file' + Upload.counter + '" id="file' + Upload.counter + '" multiple/>\n\
                        </label>\n\
                   <div onclick="Upload.clickUpload(this); return false;" class="fr btn col-ml-1 col-6 btn-medium btn-success" >'+LANG.get("upload", "Yükle")+'</div>\n\
                ';
        } else {
            html = '<form id="image_upload_form" enctype="multipart/form-data" method="post" class="fl col-12">\n\
                        <label for="file' + Upload.counter + '" class="btn col-12 btn-medium btn-success fileInput">\n\
                            '+LANG.get("select_image", "Resim Seç")+'\n\
                            <input data-name="' + name + '" onchange="Upload.handleFiles(this); return true;" type="file" name="file' + Upload.counter + '" id="file' + Upload.counter + '" multiple/>\n\
                        </label>';
        }

        //'<div class="btnUpload btn-blue" id="Yukle">Yükle</div> '

        html += '<div class="fl col-12 progressWrapper">\n\
                            <span class="btn col-12 a-center progressInfo">%0</span>\n\
                            <span class="progressBar"></span>\n\
                        </div>\n\
                        <div class="box col-12 hideThis imagesWrapper">\n\
                            <span class="row imageList"></span>\n\
                        </div>\n\
                    </form>';

        return html;
        //$(_this.opt.buttons.select.selector).attr('onclick', 'handleFiles()');
    };

}

function PersonalizationForm(options) {
    PersonalizationForm.active = true;

    var str = '';
    this.opt = {
        url: '/srv/service/personalization/get/',
        selector: '#product-personalization',
        uploadButtonActive: false,
        data: [],
        form_id: 0,
        product_id: 0,
        cart_id: -1,
        sub_product_id: 0,
        myForm: [],
        instance: 'productDetail',
        callback: function () {

        }
    };

    var _this = this;
    this.get = function (key) {
        return _this.opt[key];
    };
    this.set = function (key, value) {
        _this.opt[key] = value;
    };

    for (var i in options) {
        _this.opt[i] = options[i];
    }
    if ((parseInt(_this.opt.form_id) < 1 || parseInt(_this.opt.product_id) < 1) && _this.opt.data.length < 1) {
        PersonalizationForm.active = false;
        return false;
    }


    PersonalizationForm.instance = PersonalizationForm.instance || {};
    PersonalizationForm.instance['activeForm'] = _this;
    PersonalizationForm.instance[_this.opt.instance] = _this;
    this.validate = function () {
        if ($('.CustomForm').length === 0) {
            return true;
        }
        var r = true;
        tooltip.hideAll();

        function showValidationError(ttt, type, param) {
            r = false;
            var txt = LANG.get('error_' + type);
            $(ttt).addClass('error');
            tooltip.show($(ttt), txt.replace('{' + type + '}', param), false, 'btn-danger');
            $(ttt).on('focus', function () {
                $(ttt).removeClass('error');
                tooltip.hide($(ttt));
            });
        }
        $(_this.opt.selector).find('.personalizationFormElement').removeClass('error');
        $(_this.opt.selector).find('.CustomForm span.error').remove();
        var values = [];
        var sayac = 0;
        var myForm = [];
        $(_this.opt.selector).find('.personalizationFormElement').each(function () {
            var val = $(this).val();
            var cls = $(this).attr('class') || '';
            var zorunlu = typeof $(this).attr('data-required') !== 'undefined';
            myForm[sayac] = {
                baslik: typeof _this.opt.data[sayac] !== 'undefined' ? _this.opt.data[sayac].baslik : '*',
                value: val
            };
            if ($(this).is('label')) {
                myForm[sayac].value = $(this).text();
            } else if ($(this).attr('disabled') === 'disabled') {
                myForm[sayac]['active'] = 0;
            } else {
                if (zorunlu) {
                    if ($(this).is('input[type="checkbox"]')) {
                        if (!$(this).is(':checked')) {
                            showValidationError(this, 'required', '');
                            return false;
                        }
                    } else if (val === '') {
                        showValidationError(this, 'required', '');
                        return false;
                    }
                }
                if ($(this).is('input') || $(this).is('textarea')) {
                    if ($(this).attr('type') == 'checkbox') {
                        myForm[sayac].value = $(this).is(':checked') ? 1 : 0;
                    }
                    var minsize = parseInt($(this).attr('data-minsize'));
                    var maxsize = parseInt($(this).attr('data-maxsize'));
                    if (!zorunlu && val.length === 0) {
                        /*basarili*/
                    } else if ((minsize > 0 && val.length < minsize)) {
                        showValidationError(this, 'minsize', minsize);
                        return false;
                    } else if (maxsize > 0 && val.length > maxsize) {
                        showValidationError(this, 'maxsize', maxsize);
                        return false;
                    } else if (typeof $(this).attr('data-regex') !== 'undefined') {
                        var rgx = new RegExp($(this).attr('data-regex'), "ig");
                        if (rgx.test(val) === false) {
                            showValidationError(this, 'regex', '');
                            return false;
                        }
                    }
                }
                myForm[sayac]['active'] = 1;
            }
            sayac++;
        });

//        console.log("AAAAA");
        _this.opt.myForm = myForm;
        return r;
    };
    this.getFormData = function (callbackFunc) {
//        console.log("BBBBB");
//        console.log(_this.opt.myForm);

        var returnData = {};
        returnData['form_id'] = _this.opt.form_id;
        returnData['product_id'] = _this.opt.product_id;
        ;
        returnData['sub_product_id'] = _this.opt.sub_product_id;
        returnData['data'] = JSON.stringify(_this.opt.myForm);
        return returnData;
    };

    function getDefault(key, obj, _default) {
        return obj[key] === 'undefined' ? _default : obj[key];
    }

    function getElement(tip, name, varsayilan, group, zorunlu, min, max, regex, secenek, label, j) {
        var attr = ['data-indis="' + j + '"'];
        if (zorunlu === '1')
            attr.push('data-required="1"');
        if (varsayilan !== '') {
            attr.push('data-default="' + encodeURI(varsayilan) + '"');
            attr.push('placeholder="' + varsayilan + '"');
        }

        attr.push('class="box col-12 personalizationFormElement withPlace"');
        if (min > 0)
            attr.push('data-minsize="' + min + '"');
        if (max > 0)
            attr.push('data-maxsize="' + max + '"');
        if (regex.length > 0)
            attr.push('data-regex="' + regex.replace(/"/ig, '\\"') + '"');
        if (tip.indexOf('input') > -1) {
            return '<' + tip + ' data-group="' + group + '" name="' + name + '" ' + attr.join(' ') + ' />'
        } else if (tip.indexOf('double_select') > -1) {
            secenekler = '';
            var cls = ' col-' + parseInt(12 / secenek.length);
            for (var m = 0; m < secenek.length; m++) {
                var sArr = secenek[m].secenek.split('-');
                var s = '<option>' + secenek[m].varsayilan + '</option>';
                for (var n = 0; n < sArr.length; n++) {
                    s += '<option>' + sArr[n] + '</option>';
                }
                s = '<select class="selectGroup box ' + cls + '">' + s + '</select>';
                secenekler += s;
            }
            return '<input class="personalizationFormElement"  name="' + name + '" ' + attr.join(' ') + ' type="hidden"/>' + secenekler;
        } else if (tip === 'select') {
            var defaultExist = false;
            var selected = '';
            secenekler = '<option></option>';
            for (var m = 0; m < secenek.length; m++) {
                if (secenek[m].secenek == varsayilan) {
                    defaultExist = true;
                    selected = 'selected';
                } else {
                    selected = '';
                }
                secenekler += '<option value="' + secenek[m].secenek.replace(/[\"\{#\}]/ig, '') + '" ' + selected + '>' + secenek[m].secenek + '</option>';
            }
            if (defaultExist === false && varsayilan != "") {
                var opt = '<option value="" selected>' + varsayilan + '</option>';
                secenekler = secenekler.replace('<option></option>', opt);
            }
            return '<select name="' + name + '" ' + attr.join(' ') + ' >' + secenekler + '</select>';
        } else if (tip.indexOf('imagebox') > -1) {
            var secenekler = '';
            for (var m = 0; m < secenek.length; m++) {
                secenekler += '<li class="box col-12 box-border b-bottom ease">\n\
                                    <span class="fl col-2 comboImage">\n\
                                        <span class="fl imageInner">\n\
                                            <span class="imgInner">\n\
                                                <img src="' + secenek[m].resim + '"/>\n\
                                            </span>\n\
                                        </span>\n\
                                    </span>\n\
                                    <span class="comboLabel"> ' + secenek[m].secenek + '</span>\n\
                                </li>';
            }
            return  '<div class="fl col-12 line-bottom comboWrapper">\n\
                        <span class="arrow_bottom"></span>\n\
                        <div class="box col-12 box-border b-bottom selected">Seçiniz</div>\n\
                        <input type="hidden" name="' + name + '" ' + attr.join(' ') + '/>\n\
                        <div class="col col-12 comboList">\n\
                            <ul class="row tsoftCombo">' + secenekler + '</ul>\n\
                        </div>\n\
                    </div>';
        } else if (tip.indexOf('textarea') > -1) {
            return '<' + tip + ' name="' + name + '" ' + attr.join(' ') + ' ></' + tip + '>';
        } else if (tip.indexOf('label') > -1) {
            return '<label name="' + name + '" ' + attr.join(' ') + ' >' + label + '</label>';
        } else if (tip.indexOf('onlyImage') > -1) {
            return '<img name="' + name + '" ' + attr.join(' ') + ' src="' + label + '"/>';
        } else if (tip === 'price_multiplier_select') {
            var defaultExist = false;
            var selected = '';
            secenekler = '<option></option>';
            for (var m = 0; m < secenek.length; m++) {
                if (secenek[m].value == varsayilan) {
                    defaultExist = true;
                    selected = 'selected';
                } else {
                    selected = '';
                }
                secenekler += '<option value="' + secenek[m].value + '" ' + selected + '>' + secenek[m].secenek + '</option>';
            }
            if (defaultExist === false && varsayilan != "") {
                var opt = '<option value="" selected>' + varsayilan + '</option>';
                secenekler = secenekler.replace('<option></option>', opt);
            }
            return '<select name="' + name + '" ' + attr.join(' ') + ' >' + secenekler + '</select>';
        } else if (tip.indexOf('price_multiplier') > -1) {
            secenekler = '';
            for (var m = 0; m < secenek.length; m++) {
                secenekler += '<input class="price_multiplier withPlace" type="text" name="' + secenek[m].secenek + '" placeholder="' + secenek[m].secenek + '"/>';
            }
            return '<input type="hidden" ' + attr.join(' ') + ' name="' + name + '"/>' + secenekler;
        } else if (tip.indexOf('product_image_text') > -1) {
            secenekler = '';
            for (var m = 0; m < secenek.length; m++) {
                var secAttr = [
                    'type="text"',
                    'class="product_image_text withPlace"',
                    'name="' + secenek[m].secenek + '"',
                    'data-max="' + secenek[m].max + '"',
                    'data-style="' + secenek[m].style + '"',
                    'data-class="' + secenek[m].cls + '"',
                    'data-id="' + m + '"',
                    'data-image-id="' + secenek[m].image_id + '"',
                ];
                secenekler += '<input ' + secAttr.join(" ") + '/>';
            }
            return '<input type="hidden" ' + attr.join(' ') + ' name="' + name + '"/>' + secenekler;
        } else if (tip.indexOf('package') > -1) {
            secenekler = '<div class="col col-12 col-md-12 col-sm-12">';

            var myForm = _this.get('myForm');

            var values = [];
            if (typeof myForm[j] !== 'undefined' && myForm[j].value.length > 0) {
                values = JSON.parse(myForm[j].value);
            }

            var f = '';
            for (var m = 0; m < secenek.length; m++) {

                if (values.length > m) {
                    secenek[m].value = values[m]['value'];
                }

                f = '<span class="pricePackage">' + vat(secenek[m].fiyat, secenek[m].vat) + '</span> ' + secenek[m].currency;
                secenekler += '<div class="row mt text-description package-line">' +
                        '<div class="box col-12 d-flex">' +
                        '<div class="col col-4">' +
                        '<div class="row">' + secenek[m].secenek + '</div>' +
                        '</div>' +
                        '<div class="col col-2 forDesktop">' +
                        '<div class="row">' + vat(secenek[m].fiyat, secenek[m].vat) + ' ' + secenek[m].currency + '</div>' +
                        '</div>' +
                        '<div class="col col-3 col-sm-4">' +
                        '<div class="row qtyBox">' +
                        '<div class="fl col-sm-12 btn-radius qtyBtns" data-increment="1">' +
                        '<a title="-" data-id="' + secenek[m].product_id + '" class="col-4" data-callback="packageCallback">' +
                        '<p class="fl col-12 icon-minus icon-no-space text-center p-bottom"></p>' +
                        '</a>' +
                        '<input type="text" id="Adet' + secenek[m].product_id + '" name="Adet' + secenek[m].product_id + '" value="' + (secenek[m].count || 1) + '" data-price="' + secenek[m].fiyat + '" data-vat="' + secenek[m].vat + '" data-product-id="' + secenek[m].product_id + '" data-min="' + secenek[m].min + '" data-max="' + secenek[m].max + '" class="col-4 withPlace formPackage detayAdet' + secenek[m].product_id + '" />' +
                        '<a title="+" data-id="' + secenek[m].product_id + '" class="col-4" data-callback="packageCallback">' +
                        '<p class="fl col-12 icon-plus icon-no-space text-center p-bottom"></p>' +
                        '</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="col col-3 col-sm-4 p-right">' + f + '</div>' +
                        '</div>' +
                        '</div>';
            }
            secenekler += '</div>';
            return '<input type="hidden" ' + attr.join(' ') + ' name="' + name + '"/>' + secenekler;
        } else if (tip.indexOf('editor') > -1) {
            var myForm = _this.get('myForm');
            var secenekler = '';
            for (var m = 0; m < secenek.length; m++) {
                if (myForm.length > j && myForm[j].value == secenek[m].secenek) {
                    secenekler += secenek[m].icerik;
                } else if (myForm.length < 1) {
                    secenekler += secenek[m].icerik;
                }
            }
            return  '<input type="hidden" name="' + name + '" ' + attr.join(' ') + '/>\n\
            <div class="fl col-12 line-bottom comboWrapper">' + secenekler + '</div>';
        } else if (tip.indexOf('image_upload') > -1) {
            var up = new Upload({
                url: '/conn/product/Personalization/sendImage/' + _this.get('product_id'),
                uploadButtonActive: _this.opt.uploadButtonActive,
                form_id: _this.get('form_id'),
                product_id: _this.get('product_id'),
                cart_id: _this.get('cart_id'),
                postParams: {
                    url: document.URL
                },
                callback: function (response, thisSelector) {
                    var parent = $(thisSelector).parents('.tooltipWrapper:first');

                    var arr = {
                        status: 0,
                        statusText: '1----'
                    };
                    try {
                        arr = JSON.parse(response);
                    } catch (ex) {
                        arr = {
                            status: 0,
                            statusText: '2----'
                        };
                    }

                    if (parseInt(arr.status) === 1) {
                        if (typeof arr.images !== 'undefined' && arr.images.length > 0) {
                            parent.find('.personalizationFormElement').val(arr.images.join(' - '));
                        } else {
                            var file_names = [];
                            for (var i = 0; i < thisSelector.files.length; i++) {
                                file_names.push(thisSelector.files[i].name);
                            }
                            parent.find('.personalizationFormElement').val(file_names.join(' - '));
                        }
                        
                        var uploadPopup = new Message({
                            html: LANG.get('urun_resim_yuklendi'),
                            width: 300
                        });
                        uploadPopup.show();
                        
                    } else {
                        var uploadPopup = new Message({
                            html: LANG.get('error_upload' + arr.status),
                            width: 300
                        });
                        uploadPopup.show();
                        parent.find('.progressInfo').text('%0');
                        parent.find('.progressBar').width(0);
                    }
                }
            });
            return '<input type="hidden" name="' + name + '" ' + attr.join(' ') + '/>' + up.getCreatedHtml(name);
        }
        return tip;
    }
    this.save = function (ajaxCallback) {
        if (_this.validate() === false) {
            return false;
        }
        $.ajax({
            url: '/srv/service/personalization/save/' + _this.get('cart_id'),
            type: 'POST',
            data: {data: _this.get('myForm'), form_id: _this.get('form_id'), product_id: _this.get('product_id')},
            dataType: 'json',
            success: function (msg) {
                if (typeof ajaxCallback === 'function') {
                    ajaxCallback(msg);
                }
            }
        });
        return false;
    };

    this.createForm = function (data) {
        var selectedLang = getLanguage();
        LANG.selected_lang = selectedLang;
        //LANG.load('Product/PersonalizationSite.js');
        $.getScript('/srv/service/conf/load/Blok_Urun_Kisisellestirme/1');

        $(_this.opt.selector).html('<form id="CustomForm" class="box col-12 p-bottom box-border CustomForm"></form>');


        for (var i = 0; i < data.length; i++) {

            var label = getDefault('baslik', data[i], '"');
            var fiyat = parseInt(getDefault('fiyat', data[i], 0));
            var fiyatAciklama = getDefault('fiyatAciklama', data[i], '');
            var secenekler = getDefault('secenekler', data[i], []);
            var name = 'element_' + i;
            var tip = getDefault('tip', data[i], 'input');
            var zorunlu = getDefault('zorunlu', data[i], 0);
            var varsayilan = getDefault('varsayilan', data[i], '');
            var group = getDefault('group', data[i], '');
            var min = getDefault('min', data[i], 0);
            var max = getDefault('max', data[i], 0);
            var regex = getDefault('regex', data[i], '');
            var lang = getDefault('lang', data[i], []);
            var noteArr = [];
            if (fiyat > 0 && parseInt(zorunlu) === 0) {
            }
            if (zorunlu === '1')
                noteArr.push('*');
            var formOptions = '';
            var element = getElement(tip, name, varsayilan, group, zorunlu, min, max, regex, secenekler, label, i);
            if (tip.indexOf('checkbox') > 0) {
                formOptions = '<div class="col col-12">\n\
                                    <span class="row mb form form-control tooltipWrapper">\n\
                                        <span class="input-wrap checkbox">' +
                        element +
                        '</span>\n\
                                        <span style="float:left; margin: 1px 3px;">' + label + '</span>\n\
                                        <span class="fr">' + noteArr.join('-') + '</span>\n\
                                    </span>\n\
                                </div>';
            } else if (['label', 'onlyImage', 'editor'].indexOf(tip) > -1) {
                formOptions = '<div class="col col-12">' + element + '</div>';
            } else {
                formOptions = ' <div class="col col-12">\n\
                                    <label class="row mb fw700 line-label">' +
                        label +
                        '<span class="fr danger">' + noteArr.join('-') + '</span>\n\
                                    </label>\n\
                                    <span class="row mb form large tooltipWrapper">' +
                        element +
                        '</span>\n\
                                </div>';
            }
            if (fiyatAciklama.length > 2) {
                formOptions += '<div class="col col-12">\n\
                                    <div class="row mb fw700 danger">' + fiyatAciklama + '</div>\n\
                                </div>';
            }
            for (var m = 0; m < lang.length; m++) {
                var rgx = new RegExp("\{#" + lang[m].key + "#\}", "ig");
                var val = lang[m][selectedLang] || lang[m]['en'] || lang[m]['tr'] || '';
                formOptions = formOptions.replace(rgx, val);
            }
            $(_this.opt.selector).find('#CustomForm').append(formOptions);
        }
    };

    this.calculate = function(){
        calculatePrice();
    };

    function processForm(data) {
        _this.set('data', data);
        _this.createForm(data);
        setPersonalizationEvents();
    }

    function calculatePrice() {
        if ($('.product-price').length < 0) {
            return false;
        }

        var oldPrice = $('.product-price').attr('data-price') || $('.product-price').text() || "0";
        var notVatPrice = $('.product-price-not-vat').attr('data-price') || $('.product-price-not-vat').text() || "0";
        var moPrice = $('.money-order-price').attr('data-price') || $('.money-order-price').text() || "0";
        $('.product-price').attr('data-price', oldPrice);
        $('.product-price-not-vat').attr('data-price', notVatPrice);
        $('.money-order-price').attr('data-price', moPrice);

        if (SEP_THO === ',') {
            var op = parseFloat(oldPrice.replace(',', ''));
            var nvp = parseFloat(notVatPrice.replace(',', ''));
            var mop = parseFloat(moPrice.replace(',', ''));
        } else if (SEP_DEC == ",") {
            var op = parseFloat(oldPrice.replace('.', '').replace(',', '.'));
            var nvp = parseFloat(notVatPrice.replace('.', '').replace(',', '.'));
            var mop = parseFloat(moPrice.replace('.', '').replace(',', '.'));
        } else {
            var op = parseFloat(oldPrice);
            var nvp = parseFloat(notVatPrice);
            var mop = parseFloat(moPrice);
        }

        var myData = _this.get('data');
        var totalPrice = 0.0;
        for (var i = 0; i < myData.length; i++) {
            var element = $(_this.opt.selector).find('[name=element_' + i + ']');

            var t = myData[i].tip;
            if (typeof element === 'undefined') {
                continue;
            }
            if (t.indexOf('checkbox') && element.is(':checked')) {
                totalPrice += myData[i].fiyat;
            } else if ((t == 'select' || t === 'textarea' || t.indexOf('"text"') > 0) && element.val().trim() !== '') {
                totalPrice += myData[i].fiyat;
            } else if (t === 'price_multiplier') {
                var carp = parseFloat(myData[i].varsayilan);
                carp = carp > 0.0 ? carp : 1;
                var v = {};
                element.parent().find('.price_multiplier').each(function () {
                    var f = parseFloat($(this).val()) || 0;
                    carp = f * carp;
                    v[$(this).attr('name')] = f;
                });
                if (carp > 0) {
                    op = carp * op;
                    mop = carp * mop;
                    nvp = carp * nvp;
                    element.val(JSON.stringify(v));
                } else {
                    element.val('');
                }
            } else if (t === 'price_multiplier_select') {
                var carp = parseFloat(myData[i].varsayilan);
                carp = carp > 0.0 ? carp : 1;

                carp = carp * parseFloat(element.val()) > 0.0 ? parseFloat(element.val()) : 1;

                op = carp * op;
                mop = carp * mop;
                nvp = carp * nvp;
            } else if (t === 'product_image_text') {
                var v = {};
                element.parent().find('.product_image_text').each(function () {
                    var f = $(this).val() || '';
                    if (f.trim().length > 0) {
                        v[$(this).attr('name')] = f;
                    }
                });
                if (Object.keys(v).length > 0) {
                    totalPrice += myData[i].fiyat;
                    element.val(JSON.stringify(v));
                } else {
                    element.val('');
                }
            } else if (t === 'package') {
                element.parent().find('.formPackage').each(function () {
                    var val = parseInt($(this).val()) > 0 ? parseInt($(this).val()) : 0;
                    var p = val * parseFloat($(this).attr('data-price'));
                    totalPrice += p * (100 + parseInt($(this).attr('data-vat'))) / 100;
                });
            }

            if (t == 'select' || t == 'editor') {
                for (var j = 0; j < myData[i].secenekler.length; j++) {
                    var m = myData[i].secenekler[j];
                    if (m.secenek.replace(/[\"\{#\}]/ig, '') === element.val()) {
                        totalPrice += m.fiyat > 0 ? m.fiyat : 0;
                    }
                }
            }
        }

        var priceText = '';
        var indexOf = oldPrice.indexOf(' ');
        if (indexOf > 0) {
            priceText = oldPrice.substr(indexOf);
        }

        $('.product-price').text(format(totalPrice + op) + priceText);
        $('.product-price-not-vat').text(format(totalPrice + nvp) + priceText);
        $('.money-order-price').text(format(totalPrice + mop) + priceText);

        return true;
    }

    function setPersonalizationEvents() {
        /*
         $(_this.opt.selector).find('input.fieldActive').change(function () {
         if ($(this).is(':checked')) {
         $(this).parents('li').find('.personalizationFormElement').removeAttr('disabled');
         } else {
         $(this).parents('li').find('.personalizationFormElement').val('');
         $(this).parents('li').find('.personalizationFormElement').attr('disabled', 'disabled');
         }
         });
         $(_this.opt.selector).find('input.fieldActive').trigger('change');
         */
        $(_this.opt.selector).find('.price_multiplier').keyup(function () {
            var maxLen = parseInt($(this).attr('data-maxsize')) || 999;
            var minLen = parseInt($(this).attr('data-minsize')) || 0;
            var v = $(this).val();
            v = v.replace(',', '.').replace(/[^\d\.]/g, '');
            $(this).val(v);

            var f = parseInt(v) > 0 ? parseInt(v) : 0;
            var indis = parseInt($(this).parent().find('input[type="hidden"]').attr('data-indis'));
            calculatePrice();
        });


        var fnPackage = function () {
            var val = parseInt($(this).val()) > 0 ? parseInt($(this).val()) : 0;
            var p = vat(val * parseFloat($(this).attr('data-price')), $(this).attr('data-vat'));
            $(this).parents('.col:first').parent().find('.pricePackage').text(p);
            calculatePrice();

            var v = [];
            $(this).parents('.tooltipWrapper:first').find('.formPackage').each(function () {
                var c = parseInt($(this).val()) > 0 ? parseInt($(this).val()) : 0;
                v.push({count: c, product_id: $(this).attr('data-product-id')});
            });
            $(this).parents('.tooltipWrapper:first').find('.personalizationFormElement').val(JSON.stringify(v));
        };

        $(_this.opt.selector).find('.formPackage').mouseup(fnPackage);
        $(_this.opt.selector).find('.formPackage').keyup(fnPackage);
        $(_this.opt.selector).find('.formPackage:first').trigger('keyup');

        $(_this.opt.selector).find('.product_image_text').keyup(function () {
            var val = $(this).val() || '';
            var max = parseInt($(this).attr('data-max')) || 30;
            if (val.length > max) {
                val = val.substring(0, max);
                $(this).val(val);
            }

            $('#productThumbs a[data-id="' + $(this).attr('data-image-id') + '"]').trigger('click');
            var id = 'product_image_text' + $(this).attr('data-id');
            if ($('#' + id).length < 1) {
                $('#productImage .current a:first').append('<span id="' + id + '"></span>');
            }
            $('#' + id).text($(this).val());
            $('#' + id).attr('style', $(this).attr('data-style'));
            $('#' + id).attr('class', $(this).attr('data-class'));
            calculatePrice();
        });

        $(_this.opt.selector).find('.personalizationFormElement').keyup(function () {
            var maxLen = parseInt($(this).attr('data-maxsize'));
            if (maxLen > 0) {
                $(this).parents('li').find('span.note u').remove();
                var len = maxLen - $(this).val().length;
                $(this).parents('li').find('span.note').append('<u style="position:absolute; bottom:0px;">' + len + '</u>');
            }
            calculatePrice();
        });

        $(_this.opt.selector).find('.personalizationFormElement').change(function () {
            if ($(this).is(':checkbox') && $(this).attr('data-group') != '' && $(this).is(':checked')) {
                $('input[data-group=' + $(this).attr('data-group') + ']').prop('checked', false);
                $(this).prop('checked', true);
                inputControl();
            }
            calculatePrice();
        });

        $(_this.opt.selector).find('.selectGroup').change(function (e) {
            e.preventDefault();
            var values = [];
            $(this).parent().find('.selectGroup').each(function () {
                values.push($(this).val());
            });
            $(this).parent().find('.personalizationFormElement').val(values.join('-'));
        });

        $(_this.opt.selector).find('.personalizationFormElement').trigger('keyup');
        $(_this.opt.selector).find('.tsoftCombo li').click(function () {
            var content = $(this).html();
            $(this).parents('.comboWrapper').find('div.selected').html(content);
            $(_this.opt.selector).find('.tsoftCombo').hide();
            $(this).parents('.comboWrapper').find('input').val($(this).text().trim());
            tooltip.hide($(this));
        });
        $(_this.opt.selector).find('.comboWrapper div.selected').click(function () {
            $(this).parents('.comboWrapper').find('.tsoftCombo').toggle();
        });
        $(_this.opt.selector).find('.tsoftCombo').toggle();


        var data = _this.get('data');
        var myForm = _this.get('myForm');
        for (var i = 0; i < data.length; i++) {
            var element = $(_this.opt.selector).find('.personalizationFormElement').eq(i);
            if (element.length > 0) {
                if (typeof element.attr('data-default') !== 'undefined') {
                    if (data[i].tip === 'imagebox') {
                        element.parents('li:first').find('.comboLabel').each(function () {
                            if ($(this).text().trim() === element.attr('data-default').trim()) {
                                $(this).parents('li:first').trigger('click');
                            }
                        });
                    } else if (/(input|textarea)/ig.test(data[i].tip) === false) {
//                        console.log(data[i].tip);
//                        element.val(decodeURI(element.attr('data-default')));
                    }
                }

                if (typeof myForm[i] !== 'undefined') {

                    element.val(myForm[i]['value']);
                    if (data[i].tip === 'image_upload') {
                        element.parents('li:first').find('.progressInfo').text('%100');
                        element.parents('li:first').find('.progressBar').css('width', '100%');
                    } else if (data[i].tip === 'imagebox') {
                        element.parents('li:first').find('ul li').each(function () {
                            if (myForm[i]['value'].trim() === $(this).find('.comboLabel').html().trim()) {
                                $(this).trigger('click');
                            }
                        });
                    } else if (data[i].tip.indexOf('checkbox') > -1) {
                        element.val(1);
                        if (parseInt(myForm[i]['value']) === 1) {
                            element.attr('checked', 'checked');
                        }
                    } else if (data[i].tip.indexOf('double_select') > -1) {
                        var vals = (myForm[i].value || '').split('-');
                        element.parent().find('.selectGroup ').each(function (i) {
                            if (typeof vals[i] === 'string') {
                                $(this).val(vals[i]);
                            }
                        });
                    } else if (data[i].tip.indexOf('price_multiplier') > -1) {
                        var myArr = {};
                        try {
                            myArr = JSON.parse(myForm[i].value || '{}');
                        } catch (err) {

                        }
                        for (var k in myArr) {
                            element.parent().find('[name="' + k + '"]').val(myArr[k]);
                        }
                    } else if (data[i].tip.indexOf('product_image_text') > -1) {
                        var myArr = {};
                        try {
                            myArr = JSON.parse(myForm[i].value || '{}');
                            console.log(myArr);
                        } catch (err) {

                        }
                        for (var k in myArr) {
                            element.parent().find('[name="' + k + '"]').val(myArr[k]);
                        }
                    }
                }
            }
        }
        if (typeof inputControl === 'function') {
            inputControl();
        }
        _this.opt.callback();
    }

    if (_this.opt.data.length > 0) {
        if (typeof _this.opt.data !== 'object') {
            console.log('PersonalizationForm Error: InCorrect Data');
        }
        processForm(_this.opt.data);
    } else if (_this.opt.data.length === 0) {
        $.ajax({
            url: _this.opt.url + "" + _this.opt.form_id + '/' + _this.opt.cart_id + '/' + _this.opt.product_id,
            dataType: 'json',
            success: function (r) {
                if (typeof r.data !== 'object') {
                    console.log('PersonalizationForm Error: InCorrect Data');
                } else {
                    _this.set('myForm', r.myForm);
                    processForm(r.data);
                }
            }
        });
    } else {
        console.log('no parameter set');
    }
}