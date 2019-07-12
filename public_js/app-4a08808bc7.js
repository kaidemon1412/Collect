toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "800",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};


$(function () {
    //顶部菜单固定
    // var sub_top_bar = $('.sub-top-bar');
    // if(sub_top_bar.length > 0){
    //     var sub_top_bar_height = sub_top_bar.offset().top + sub_top_bar.height();
    //     $(window).on('scroll', function () {
    //         var sTop = $(window).scrollTop();
    //         if(sTop > sub_top_bar_height){
    //             sub_top_bar.css({
    //                 position:'fixed',
    //                 top:0,
    //                 width:'100%',
    //             });
    //         }else{
    //             sub_top_bar.css({
    //                 position:'static'
    //             })
    //         }
    //     });
    // }

    $('img[alt="captcha"]').on('click', function () {
        var timestamp = new Date().getTime();
        var img_src = window.location.origin + '/captcha/default?' + timestamp;
        $(this).attr('src', img_src);
    });

    var csrfToken = $('meta[name="csrf-token"]').attr('content');
    setInterval(refreshToken, 3000000); // half an hour

    function refreshToken() {
        $.get('/refresh-csrf').done(function (data) {
            csrfToken = data; // the new token
        });
    }

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    });



    var path = window.location.pathname;
    // console.log(path);
    $(".login-by-qq").on('click', function () {
        window.location.href = window.location.origin + "/oauth/qq?redirect="+path;
    });

    $(".login-by-wechat").on('click', function () {
        var isWeixinBrowser = (/micromessenger/i).test(navigator.userAgent);
        isWeixinBrowser == true ? window.location.href = "/oauth/wechat?redirect="+path : window.location.href = "/oauth/wechat-web?redirect="+path;
    });

    $(".login-by-weibo").on('click', function () {
        window.location.href = window.location.origin + "/oauth/weibo?redirect="+path;
    });

    $('#bind-more a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });
    $('#bind-info a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });


    // 用户界面左侧菜单高亮
    var current_path = window.location.origin + window.location.pathname;
    var currentMenu = $('.user-info-sidebar a[href="' + current_path + '"]:first');
    if (currentMenu) {
        currentMenu.parent().addClass('current-sidebar');
    }

    //craft 侧边栏高亮
    if (window.location.pathname.split('/')[2] == 'forum' || window.location.pathname.split('/')[2] == 'topic') {
        current_path = window.location.origin + '/mc/forum';
    }
    var craft_item = $('.craft-sidebar a[href="' + current_path + '"]:first');
    //console.log(craft_item);
    if (craft_item) {
        if (craft_item.parent().length > 0) {
            //console.log(craft_item.parent());
            $('.craft-sidebar li').removeClass('active');
            craft_item.parent().addClass('active');
        }
    }



    //var action =$('.action a[href="' + current_path + '"]:first' );
    ////console.log(action);
    //if(action){
    //    action.css(
    //        {
    //            'background': '#2597ef',
    //            'color': '#fff',
    //            'border-radius': '15px'
    //        }
    //    )
    //}

    //var craft_menu_text = $('#craft-dropdown-menu a[href="' + current_path + '"]:first').text();
    //if(craft_menu_text){
    //    $('#craft-menu-text').text(craft_menu_text);
    //}
    //
    //$('#craft-menu-text').append('<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>');

    //todo
    function handleAjaxError(jqXHR, textStatus, errorThrown) {
        
    }

    $(document).on('click', '.get-mail-verify-code', function(e) {
        e.preventDefault();
        var $this = $(this);
        var email = $this.closest('form').find('input[name="email"]').val();

        if (!$.trim(email)) {
            toastr.error('邮箱不能为空');
            return false;
        }
        $.ajax({
            method: 'POST',
            url: "/user/get-email-verify-code",
            data: {email: email},
            dataType:'json',
            success: function (ret) {
                if (ret.status == 1) {
                    swal({type: 'success', title: '验证码发送成功,请登录邮箱查收', showConfirmButton: false, timer: 2000})
                    var get_code_button = $('.get-mail-verify-code');
                    time($this);
                } else {
                    var msg = ret.msg ? ret.msg : '发送失败';
                    swal({type: 'error', title: msg, showConfirmButton: false, timer: 2000});
                }
            },
            fail: function (err) {
                alert('服务器发生错误');
            }
        });
    });



    $('#form-login').on('submit', function (e) {
        e.preventDefault();
        var $btn = $(this).find("[type='submit']");
        var form_data = $(this).serialize();
        // console.log($btn.hasClass('disabled'));
        if($btn.hasClass('disabled')){
            return false;
        }

        $btn.text('正 在 登 录');
        $btn.addClass('disabled');
        $.ajax({
            method: 'POST',
            url: '/ajax-login',
            data: form_data,
            success: function (ret) {
                ret = typeof ret == 'object' ? ret : JSON.parse(ret);
                if (ret.status == 1) {
                    $('.login-modal').modal('hide');
                    location.reload();
                } else {
                    $('#form-login input[name="password"]').val('');
                    if (ret.data.name) {
                        $('.name-error').html('<strong>' + ret.data.name + '</strong>');
                    }
                    if (ret.data.password) {
                        $('.password-error').html('<strong>' + ret.data.password + '</strong>');
                    }
                    if(ret.msg == 'TokenMismatchException'){
                        swal({
                            type:'error',
                            title:'登录失败',
                            text:'请刷新重试',
                            // timer:'2000',
                        },function(){
                            window.location.reload();
                        })
                        // $('.login-modal').modal('show');
                    }
                    // $('img[alt="captcha"]').click();
                    $btn.text('登    录');
                    $btn.removeClass('disabled');
                }
            },
            error: function (err) {
                $btn.text('登    录');
                $btn.removeClass('disabled');
                //console.log(err);
                //alert('服务器发生错误');
            }
        });
        return false;
    });

    // ajax注册

    var wait = 120;
    function time(o) {
        if (wait == 0) {
            o.removeClass("disabled");
            o.text("获取验证码");
            wait = 60;
        } else {
            o.addClass("disabled");
            o.text("已发送(" + wait + "s)");
            wait--;
            setTimeout(function () {
                    time(o)
                },
                1000)
        }
    }
    function validate_form_id(mobile, form_id, btn)
    {
        if (mobile !== null && form_id !== null) {
            check_is_potential(mobile, form_id, btn);
        } else {
            get_verify_code(mobile);
        }
    }

    function check_is_potential(mobile, form_id, btn) {
        $.post('/is_potential_user', {form_id: form_id, mobile: mobile}, function (data) {
            data = JSON.parse(data);
            if (data.status == 0) {
                sweetAlert("提示", data.msg, "error");
            } else {
                get_verify_code(mobile, btn);
            }
        });
    }

    function check_if_share(mobile, btn) {
        $.post('/if_share', {mobile: mobile}, function (data) {
            data = JSON.parse(data);
            if (data.status == 0) {
                // sweetAlert("提示", data.msg, "error");
                toastr.error(data.msg ? data.msg : '发送失败');
            } else {
                get_verify_code(mobile, btn);
            }
        });
    }

    function get_verify_code(mobile, btn) {
        $.ajax({
            method: 'POST',
            url: "/user/get-identify-code",
            data: {mobile: mobile},
            dataType:'json',
            success: function (ret) {
                if (ret.status == 1) {
                   toastr.success('验证码发送成功,请注意在手机上查收');
                    // swal({type: 'success', title: '验证码发送成功,请注意在手机上查收', showConfirmButton: false, timer: 2000})
                    var get_code_button = $('.reg-get-verify-code');
                    if (btn) {
                        $('.free-book-btn').removeClass('disabled');
                        get_code_button = btn;
                    }
                    time(get_code_button);
                } else {
                   toastr.error(ret.msg ? ret.msg : '发送失败');
                    // var msg = ret.msg ? ret.msg : '发送失败';
                    // swal({type: 'error', title: msg, showConfirmButton: false, timer: 2000});
                }
            },
            fail: function (err) {
                alert('服务器发生错误');
            }
        });
        return false;
    }

    $(document).on('click', '.reg-get-verify-code', function (e) {
        e.preventDefault();
        var mobile = $('.reg-mobile').val();
        if (mobile != '') {
            get_verify_code(mobile);
        } else {
            toastr.error('请输入手机号再试');
            return false;
        }
    });

    $(document).on('click', '.gift-reg-get-verify-code', function (e) {
        e.preventDefault();
        var btn = $(this);
        var mobile = $(this).closest('form').find('input[name="mobile"]').val();
        var form_id = $(this).closest('form').find('input[name="_form_id"]').val();
        return validate_form_id(mobile, form_id, btn);
    });

    $(document).on('click', '.share-reg-get-verify-code', function (e) {
        e.preventDefault();
        var btn = $(this);
        var mobile = $(this).closest('form').find('input[name="mobile"]').val();
        return check_if_share(mobile, btn);
    });

    $(document).on('click', '.coupon-get-verify-code', function (e) {
        e.preventDefault();
        var btn = $(this);
        var mobile = $(this).closest('form').find('input[name="mobile"]').val();
        get_verify_code(mobile, btn);
    });


    $('#form-register-mobile').on('submit',function (e) {
        e.preventDefault();
        //var $btn = $(document.activeElement);
        var $btn = $(this).find("[type='submit']");
        var form_data = $(this).serialize();

        if($btn.hasClass('disabled')){
            return false;
        }

        $btn.text('正 在 注 册');
        $btn.addClass('disabled');

        $.ajax({
            method:'POST',
            url:'/ajax-register-mobile',
            data:form_data,
            dataType:'json',
            success:function (res) {
                if(res.status == 1){
                    $('.register-modal').modal('hide');
                    location.reload();
                }else{
                    toastr.error(res.msg);
                    $btn.text('立 即 注 册');
                    $btn.removeClass('disabled');
                }
            },
            error:function (err) {
                toastr.error('发生错误，请刷新重试');
                $btn.text('立 即 注 册');
                $btn.removeClass('disabled');
            }
        })
        return false;
    });
    $('#form-register').on('submit', function (e) {
        e.preventDefault();

        var $btn = $(this).find("[type='submit']");
        var form_data = $(this).serialize();
        // console.log($btn.hasClass('disabled'));
        if($btn.hasClass('disabled')){
            return false;
        }

        $btn.text('正 在 注 册');
        $btn.addClass('disabled');
        $.ajax({
            method: 'POST',
            url: '/ajax-register',
            data: form_data,
            success: function (ret) {
                ret = JSON.parse(ret);
                if (ret.status == 1) {
                    $('.register-modal').modal('hide');

                    $('#bind-mobile-modal').modal('show');

                } else {
                    // console.log(ret.data);
                    $('#form-register input[name="password"]').val('');
                    $('#form-register input[name="password_confirmation"]').val('');
                    // if (ret.data.name) {
                    //     $('.name-error').html('<strong>' + ret.data.name + '</strong>');
                    // }
                    // if (ret.data.email) {
                    //     $('.email-error').html('<strong>' + ret.data.email + '</strong>');
                    // }
                    // if (ret.data.password) {
                    //     $('.password-error').html('<strong>' + ret.data.password + '</strong>');
                    // }
                    // if (ret.data.captcha) {
                    //     $('.captcha-error').html('<strong>' + '验证码不正确' + '</strong>');
                    // }
                    // $('img[alt="captcha"]').click();
                    toastr.error(ret.msg);
                    $btn.text('注   册');
                    $btn.removeClass('disabled');
                }
            },
            error: function (err) {
                $btn.text('注   册');
                $btn.removeClass('disabled');
                alert('服务器发生错误');

            }
        });
        return false;
    });
    
    $('#form-bind-mobile').on('submit',function (e) {
        e.preventDefault();
        var $btn = $(this).find("[type='submit']");
        var form_data = $(this).serialize();
        if($btn.hasClass('disabled')){
            return false;
        }
        $btn.text('正 在 绑 定');
        $btn.addClass('disabled');

        $.ajax({
            method:'POST',
            url:'/user/check-code',
            data:form_data,
            success:function (res) {
                res = JSON.parse(res);
                if(res.status == 1){
                    swal({type: 'success', title: '绑定成功', text:'积分 +60',showConfirmButton: false, timer: 2000});
                    window.location.reload();
                }else{
                    if (res.data.mobile) {
                        $('.mobile-error').html('<strong>' + res.data.mobile + '</strong>');
                    }
                    if (res.data.identify_code) {
                        $('.code-error').html('<strong>' + res.data.identify_code + '</strong>');
                    }
                    $btn.text('绑 定 手 机');
                    $btn.removeClass('disabled');
                }
            },
            error:function (err) {
                $btn.text('绑 定 手 机');
                $btn.removeClass('disabled');
                alert('服务器发生错误');
            }
        });
        return false;
    });

    $('#form-login input[name="name"],#form-register input[name="name"]').on('focus', function () {
        $('.name-error').html('');
    });
    $('#form-register input[name="password"],#form-login input[name="password"]').on('focus', function () {
        $('.password-error').html('');
    });
    $('#form-register input[name="email"]').on('focus', function () {
        $('.email-error').html('');
    });
    $('#form-register input[name="captcha"]').on('focus', function () {
        $('.captcha-error').html('');
    });

    $('.register-modal,.login-modal').on('hidden.bs.modal', function (e) {
        $('.password-error').html('');
        $('.name-error').html('');
        $('.email-error').html('');
        $('.captcha-error').html('');
    })

    $('#load-log-modal').on('click', function () {
        $('.login-modal').modal('hide');
        $('.register-modal').modal('show');
    });



    var wait = 120;
    function time(o) {
        if (wait == 0) {
            o.removeClass("disabled");
            o.text("获取验证码");
            wait = 60;
        } else {
            o.addClass("disabled");
            o.text("已发送(" + wait + "s)");
            wait--;
            setTimeout(function () {
                time(o)
            }, 1000)
        }
    }

    $('#mobile-code').on('click', function (e) {
        e.preventDefault();
        var mobile = $('#bind-mobile-value').val();
        $.ajax({
            method: 'POST',
            url: "/user/get-identify-code",
            data: {mobile: mobile,for_bind:1},
            success: function (ret) {
                ret = JSON.parse(ret);
                if (ret.status == 1) {
                    toastr.success('验证码发送成功,请注意在手机上查收');
                    var get_code_button = $('#mobile-code');
                    time(get_code_button);
                } else {
//                            toastr.error(ret.msg ? ret.msg : '发送失败');
                    var msg = ret.msg ? ret.msg : '发送失败';
                    swal({type: 'error', title: msg, showConfirmButton: false, timer: 2000});
                }
            },
            fail: function (err) {
                alert('服务器发生错误');
            }
        });
    });


    //禁止视频右键
    $('video').bind('contextmenu', function () {
        return false;
    });

    //底部图标控制
    $('#codepku-weixin').hover(function () {
        var _this = $(this);
        _this.popover({html: true});
        _this.popover('show');
    },function () {
        $('#codepku-weixin').popover('hide');
    });

    $('#codepku-qq').popover({html: true});


    //签到
    $('.sign-in').on('click', function () {
        $.ajax({
            method: 'POST',
            url: '/user/signin',
            data: {},
            success: function (res) {
                res = JSON.parse(res);
                // console.log(res);
                if (res.status == 1) {
                    swal({
                        title: '签到成功',
                        timer: 2000,
                        showConfirmButton: true,
                        type: 'success',
                        text: res.msg,
                        confirmButtonText: "确定"
                    });
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);

                } else {
                    swal({title: '每天只能签到一次', timer: 2000, type: 'warning', showConfirmButton: false});
                }
            },
            error: function (err) {
                alert('服务器发生错误');
            }
        })
    });


    swal.setDefaults({
        confirmButtonText:'确定',
        confirmButtonClass:'btn btn-common'
    });


    var VIDEO_PLAYER = null;
    var video_listener = null;
    var $video = null;
    $('video').on('play', function (e) {
        if (video_listener) {
            clearInterval(video_listener);
        }
        $video = $(this);
        VIDEO_PLAYER = videojs($video.attr('id'));
        addWatchVideoLog(VIDEO_PLAYER.currentTime(),'play');
        // videoEndedListener();
        video_listener = setInterval(videoCounter,1000);
    });

    var videoCounter = function () {
        // console.log('video counter');
        if(VIDEO_PLAYER) {
            var current_time = VIDEO_PLAYER.currentTime();
        }

        if (VIDEO_PLAYER && VIDEO_PLAYER.ended()) {
            clearInterval(video_listener);
            addWatchVideoLog(current_time,'ended');
            return;
        }
        if (VIDEO_PLAYER && VIDEO_PLAYER.paused()) {
            clearInterval(video_listener);
            addWatchVideoLog(current_time,'paused');
        }
    };

    var addWatchVideoLog = function (watch_at,action) {
        $.ajax({
            method: 'POST',
            url: '/stats/video_watch',
            data: {
                src: VIDEO_PLAYER.currentSrc(),
                title: $video.attr('title') ? $video.attr('title') : '',
                video_id : $video.attr('id'),
                watch_at: watch_at,
                action: action //play paused ended
            },
            dataType:'json',
            success: function (res) {
            },
            error: function (err) {
                console.log('video log error');
            }
        })
    };
    $(window).on('beforeunload',function () {
        if(VIDEO_PLAYER) {
            addWatchVideoLog(VIDEO_PLAYER.currentTime(),'close');
        }
        clearInterval(video_listener);
    })

    // scratch加载扩展相关
    /*
     var Scratch = document.getElementById('scratch');
     window.ScratchExtensions = {
     loadExternalJS: function (n) {
     var t = document.createElement("script");
     t.src = n;
     document.getElementsByTagName("head")[0].appendChild(t)
     },
     register: function (i, u, f, c) {
     var a = {
     extensionName: i,
     blockSpecs: u.blocks,
     menus: u.menus,
     };
     return Scratch.ASloadExtension(a);
     },
     };
     */

    // bookSelect 字段类型，数据交互
    var $bookSelect = $(".form-field-bookSelect");
    if($bookSelect.length > 0){
        // 获取设置的价格和限制人数。按道理不应该用eval，但是为了方便后台文本形式填写暂时用这个 @todo
        var price = eval("(" + $bookSelect.data('price') + ")");
        var limit = eval("(" + $bookSelect.data('limit') + ")");
        $bookSelect.bind("change", function(selected){
            if(price || limit){
                var $info = $bookSelect.siblings(".book-select-info");
                $info.css({paddingLeft: $bookSelect.prev('label').outerWidth(true)});
                if(price){
                    $info.html("价格：" + (parseInt(price[$bookSelect.val()]) / 100).toFixed(2) );
                }
            }

        });
    }

    // 关联选择字段
    var $relatedSelect = $("select[showonfield]");
    if($relatedSelect.length > 0){
        var setValues = function($el, values){
            $el.find('option').prop({hidden: true, disabled: true});
            if(values.length > 0){
                for(var j = 0; j < values.length; j++){
                    $el.find('option[value=' + values[j] + ']').prop({hidden: false, disabled: false});
                }
                if($el.find('option:selected').prop('disabled')){
                    $el.find('option:enabled:first').prop({'selected': true});
                    $el.trigger('change');
                }
            }
        }
        for(var i = 0; i < $relatedSelect.length; i++){
            //获取关联的字段，以及显示的值
            var $thisField = $relatedSelect.eq(i);
            var showOnField = $thisField.attr('showonfield');
            var showOnValue = $thisField.attr('showonvalue');
            showOnValue = eval('(' + showOnValue + ')');
            //current value
            var $relatedField = $thisField.parents('form').find('[name=' + showOnField + ']');
            //set current state
            var currentValue = $relatedField.val();
            console.log(currentValue);
            var toShowValues = showOnValue[currentValue];
            setValues($thisField, toShowValues);
            //这里用闭包，因为不同元素的thisField showOnValue会不同
            $relatedField.bind('change', (function($el, showOnValue){
                return function(e){
                    var toShowValues = showOnValue[$(this).val()];
                    setValues($el, toShowValues);
                }
            })($thisField, showOnValue));

        }
    }

});

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

function bdClickEvent(type,action,entity){
    _hmt.push(['_trackEvent', type, action, entity]);
}

function getQueryString(name,url)
{
    if (!url) {
        url = window.location.search.substr(1);
    }
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = url.match(reg);
    if(r!=null)return  unescape(r[2]);
    return null;
}

function ifArrVal(arr,value){//多维数组判断是否存在某值
    for(var i = 0;i < arr.length;i++){
        if(arr[i] instanceof Array){//判断是否为多维数组
            return ifArrVal(arr[i],value);
        }else{
            if(arr[i] == value){
                return 1;//存在
            }
        }
    }
    return -1;//不存在
}
function in_array(stringToSearch, arrayToSearch) {
    for (s = 0; s < arrayToSearch.length; s++) {
        thisEntry = arrayToSearch[s].toString();
        if (thisEntry == stringToSearch) {
            return true;
        }
    }
    return false;
}

// 将用户操作的类型提交给后台存放入数据库
function handleInput(behavior, content, url, content_only) {
    content_only = content_only ? content_only : 0;
    $.post('/input/handle', { 'behavior': behavior, 'content': content, 'content_only': content_only }, function (data) {
        if (behavior == 'scratch2-process-info-only' || behavior == 'scratch1-process-info-only' || behavior == 'scratch3-process-info-only' || behavior == 'gift-process-info-only') {
            $('#content_only').val(data);
        }
    });
    if (url !== null) {
        window.location.href = url;
    }
}

// 获取用户填写的信息
function getAllInfo(type)
{
    var name = $('#name').val() ? $('#name').val() : '空';
    var age = $('#age').val() ? $('#age').val() : '空';
    var mobile = $('#mobile').val() ? $('#mobile').val() : '空';
    var content = 'child_name: ' + name + ' child_age: ' + age + ' parent_mobile: ' + mobile;
    var content_only = $("#content_only").val();
    handleInput(type, content, null, content_only);
}


//导航栏动画样式
$('.bar-li').each(function(index, el) {
    $(this).click(function(event) {
        if ($('.bar-li').eq(index).hasClass('open')) {
            $('.bar-li').eq(index).removeClass('open');
            $('.second-i').eq(index).css({
                'transform': 'rotate(0deg)',
                'transition': 'transform 0.3s'
            });
        } else {
            $('.bar-li.open .second-i').css({
                'transform': 'rotate(0deg)',
                'transition': 'transform 0.3s'
            });
            $('.bar-li.open').removeClass('open');
            $('.bar-li').eq(index).addClass('open');
            $('.second-i').eq(index).css({
                'transform': 'rotate(90deg)',
                'transition': 'transform 0.3s'
            });
        }
    });
});
//修改左侧导航栏样式
$('.real-li').each(function(index, el) {
    $(this).click(function(event) {
        $('.real-li.active').removeClass('active');
        $(this).addClass('active');
    });
});
//修改录播课导航栏样式
$('.live-lesson-menu .recordLessonLevels a').each(function(index, el) {
    $(this).click(function(event) {
        $('.live-lesson-menu .recordLessonLevels .active').removeClass('active');
        $(this).addClass('active');
    });
});
//修改直播课导航栏样式
$('.live-lesson-menu .liveLessonLevels a').each(function(index, el) {
    $(this).click(function(event) {
        $('.live-lesson-menu .liveLessonLevels .active').removeClass('active');
        $(this).addClass('active');
    });
});
//确认密码
$('#changePasswordBtn').click(function(event) {
    if ($('#newPassword').val() != $('#rePassword').val()) {
        $('#newPassword').addClass('wrong');
        $('.wrongTip').html("两次输入密码不一致");
        $('#rePassword').val('');
        $('#rePassword').addClass('wrong');
        return false;
    }
});

$(document).on('click', '.accordion-toggle', function(event) {
    event.stopPropagation();
    var $this = $(this);

    var parent = $this.data('parent');
    var actives = parent && $(parent).find('.collapse.in');

    // From bootstrap itself
    if (actives && actives.length) {
        hasData = actives.data('collapse');
        //if (hasData && hasData.transitioning) return;
        actives.collapse('hide');
    }

    var target = $this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''); //strip for ie7

    $(target).collapse('toggle');
})

$.prototype.countdownAnimate = function (orderTime) { //倒计时动画及事件
    /**
     * 获取剩余时间
     * @param  {Number} orderTime  订单时间
     * @param  {Number 设备时间
     * @param  {Number} serverTime 服务端时间
     * @return {Object}            剩余时间对象
     */
    var that = this;
    var getRemainTime = function(orderTime){
        var t = orderTime  + 1800000 - Date.parse(new Date())
        var seconds = Math.floor((t / 1000) % 60)
        var minutes = Math.floor((t / 1000 / 60) % 60)
        return {
            'total': t,
            'minutes': minutes,
            'seconds': seconds
        }
    }
    orderTime = Date.parse(orderTime);//获取订单时间并格式化
    var initializationTime = getRemainTime(orderTime);
    if(initializationTime.minutes - 10 < 0)
        initializationTime.minutes = '0'+initializationTime.minutes;
    if(initializationTime.seconds - 10 < 0)
        initializationTime.seconds = '0'+initializationTime.seconds;
    that.html('00:'+initializationTime.minutes+':'+initializationTime.seconds);
    getServerTime = function(serverTime){
        //设置定时器
        var intervalTimer = setInterval(function(){
            // 得到剩余时间
            var remainTime = getRemainTime(orderTime)
            // 倒计时30分钟内
            if (remainTime.total <= 1800000 && remainTime.total > 0) {
                // do something
                if(remainTime.minutes - 10 < 0)
                    remainTime.minutes = '0'+remainTime.minutes;
                if(remainTime.seconds - 10 < 0)
                    remainTime.seconds = '0'+remainTime.seconds;
                that.html('00:'+ remainTime.minutes  +':'+remainTime.seconds);
            } else if (remainTime.total <= 0) {//倒计时结束
                clearInterval(intervalTimer);
                // do something
            }
        }, 1000)
    };
    getServerTime();
}

function setIframeHeight(iframe) {
    if (iframe) {
        var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
        if (iframeWin.document.body) {
            iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
        }
    }
};
$(function(){
    // ajax提交评论
    $('.btn-comment-submit').click(function() {
        var Editor = $.data($('.comment-create-form .editorArea')[0], 'editor'); //get the simditor object
        var comment = Editor.$txt.text();
        if(! comment){
            //未填写内容
            swal({type:'error',title:'请填写评论内容',showConfirmButton:false,timer:2000});
            return false;
        }


        $.ajax({
            url: "/comment/save",
            method: 'POST',
            data: $('.comment-create-form').serialize(),
            success: function (data) {
                //提交
                if (data.status == 1) {
                    //toastr.success(data.msg);
                    // swal({type:'info',title:'评论成功',text:data.msg,showConfirmButton:false,timer:2000});
                    toastr.success('评论成功');
                    Editor.$txt.html('');
                    //显示新评论
                    template.config('openTag','{%');
                    template.config('closeTag','%}');

                    var mc_card_comment = $('#template-mccard-comment');
                    var html = '';
                    if(mc_card_comment.length > 0){
                        html = template('template-mccard-comment',data);
                    }else{
                        html = template('template-comment', data);
                    }
                    // console.log(html);
                    $('.scratch-comments').prepend(html);

                } else {
                    //toastr.error("评论失败: " + data.msg);
                    swal({type:'error',title:'评论失败',text:data.msg,showConfirmButton:false,timer:5000});
                }
            },
            dataType: 'json'
        });
        return false;
    });

    $('.comments-list').delegate('.comment-reply', 'click', function(){
        var Editor = $.data($('.comment-create-form .editorArea')[0], 'editor'); //get the simditor object
        var $this = $(this);
        var replyTo = $this.parents('.comment-info').find('span.comment-name').text();
        if(Editor.$txt.text()){
            Editor.$txt.html(Editor.$txt.html() + '<p>@' + replyTo + '&nbsp;</p>');
        }else{
            Editor.$txt.html('<p>@' + replyTo + '&nbsp;</p>');
        }

        // 滚动到 输入框
        var top = $('.comment-create-form .editorArea').next().offset().top;
        console.log(top);
        $('html,body').animate({scrollTop: top - 50}, 400);
    });


    //移动端改了 相应的监听元素也改了
    $('.comment-texts').delegate('.comment-reply a', 'click', function(){
        var Editor = $.data($('.comment-create-form .editorArea')[0], 'editor'); //get the simditor object
        var $this = $(this);
        var replyTo = $this.parents('.comment-author-time-reply').find('p.comment-author').text();
        if(Editor.$txt.text()){
            Editor.$txt.html(Editor.$txt.html() + '<p>@' + replyTo + '&nbsp;</p>');
        }else{
            Editor.$txt.html('<p>@' + replyTo + '&nbsp;</p>');
        }

        // 滚动到 输入框
        var top = $('.comment-create-form .editorArea').next().offset().top;
        $('html,body').animate({ scrollTop: top - 60 }, 600, function() {
            hasScroll = false;
        });
    });
});


/*!
 * clipboard.js v1.7.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Clipboard=t()}}(function(){var t,e,n;return function t(e,n,o){function i(a,c){if(!n[a]){if(!e[a]){var l="function"==typeof require&&require;if(!c&&l)return l(a,!0);if(r)return r(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var u=n[a]={exports:{}};e[a][0].call(u.exports,function(t){var n=e[a][1][t];return i(n||t)},u,u.exports,t,e,n,o)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(t,e,n){function o(t,e){for(;t&&t.nodeType!==i;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}var i=9;if("undefined"!=typeof Element&&!Element.prototype.matches){var r=Element.prototype;r.matches=r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector}e.exports=o},{}],2:[function(t,e,n){function o(t,e,n,o,r){var a=i.apply(this,arguments);return t.addEventListener(n,a,r),{destroy:function(){t.removeEventListener(n,a,r)}}}function i(t,e,n,o){return function(n){n.delegateTarget=r(n.target,e),n.delegateTarget&&o.call(t,n)}}var r=t("./closest");e.exports=o},{"./closest":1}],3:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},{}],4:[function(t,e,n){function o(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!c.string(e))throw new TypeError("Second argument must be a String");if(!c.fn(n))throw new TypeError("Third argument must be a Function");if(c.node(t))return i(t,e,n);if(c.nodeList(t))return r(t,e,n);if(c.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function i(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function r(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return l(document.body,t,e,n)}var c=t("./is"),l=t("delegate");e.exports=o},{"./is":3,delegate:2}],5:[function(t,e,n){function o(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var o=window.getSelection(),i=document.createRange();i.selectNodeContents(t),o.removeAllRanges(),o.addRange(i),e=o.toString()}return e}e.exports=o},{}],6:[function(t,e,n){function o(){}o.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function o(){i.off(t,o),e.apply(n,arguments)}var i=this;return o._=e,this.on(t,o,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,i=n.length;for(o;o<i;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],i=[];if(o&&e)for(var r=0,a=o.length;r<a;r++)o[r].fn!==e&&o[r].fn._!==e&&i.push(o[r]);return i.length?n[t]=i:delete n[t],this}},e.exports=o},{}],7:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","select"],r);else if(void 0!==o)r(n,e("select"));else{var a={exports:{}};r(a,i.select),i.clipboardAction=a.exports}}(this,function(t,e){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(e),r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),c=function(){function t(e){o(this,t),this.resolveOptions(e),this.initSelection()}return a(t,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=e.action,this.container=e.container,this.emitter=e.emitter,this.target=e.target,this.text=e.text,this.trigger=e.trigger,this.selectedText=""}},{key:"initSelection",value:function t(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function t(){var e=this,n="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return e.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[n?"right":"left"]="-9999px";var o=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=o+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,i.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function t(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function t(){this.selectedText=(0,i.default)(this.target),this.copyText()}},{key:"copyText",value:function t(){var e=void 0;try{e=document.execCommand(this.action)}catch(t){e=!1}this.handleResult(e)}},{key:"handleResult",value:function t(e){this.emitter.emit(e?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function t(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function t(){this.removeFake()}},{key:"action",set:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=e,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function t(){return this._action}},{key:"target",set:function t(e){if(void 0!==e){if(!e||"object"!==(void 0===e?"undefined":r(e))||1!==e.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&e.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(e.hasAttribute("readonly")||e.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=e}},get:function t(){return this._target}}]),t}();t.exports=c})},{select:5}],8:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","./clipboard-action","tiny-emitter","good-listener"],r);else if(void 0!==o)r(n,e("./clipboard-action"),e("tiny-emitter"),e("good-listener"));else{var a={exports:{}};r(a,i.clipboardAction,i.tinyEmitter,i.goodListener),i.clipboard=a.exports}}(this,function(t,e,n,o){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function c(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function l(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var s=i(e),u=i(n),f=i(o),d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},h=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),p=function(t){function e(t,n){r(this,e);var o=a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return o.resolveOptions(n),o.listenClick(t),o}return c(e,t),h(e,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof e.action?e.action:this.defaultAction,this.target="function"==typeof e.target?e.target:this.defaultTarget,this.text="function"==typeof e.text?e.text:this.defaultText,this.container="object"===d(e.container)?e.container:document.body}},{key:"listenClick",value:function t(e){var n=this;this.listener=(0,f.default)(e,"click",function(t){return n.onClick(t)})}},{key:"onClick",value:function t(e){var n=e.delegateTarget||e.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new s.default({action:this.action(n),target:this.target(n),text:this.text(n),container:this.container,trigger:n,emitter:this})}},{key:"defaultAction",value:function t(e){return l("action",e)}},{key:"defaultTarget",value:function t(e){var n=l("target",e);if(n)return document.querySelector(n)}},{key:"defaultText",value:function t(e){return l("text",e)}},{key:"destroy",value:function t(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["copy","cut"],n="string"==typeof e?[e]:e,o=!!document.queryCommandSupported;return n.forEach(function(t){o=o&&!!document.queryCommandSupported(t)}),o}}]),e}(u.default);t.exports=p})},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)});
/**
 * jQuery plugin "Swipe slider".
 * Image slider that supports swiping function to change slides.
 */
(function ($) {

    $.fn.swipeslider = function (options) {
        var slideContainer = this;
        var slider = this.find('.sw-slides'); // reference to slider
        var defaultSettings = {
            /**
             / How long one slide will change the other.
             */
            transitionDuration: 500,
            /**
             / Enable autoplay
             */
            autoPlay: true,
            /**
             * How frequently slides will be changed.
             */
            autoPlayTimeout: 4000,
            /**
             * Transition effect.
             */
            timingFunction: 'ease-out',
            /**
             * Show 'Next' and 'Previous' buttons.
             */
            prevNextButtons: true,
            /**
             * Show slide switches.
             */
            bullets: true,
            /**
             * Enable swipe function.
             */
            swipe: true,
            /**
             * Overall height of the slider. Set it to percent to make it responsive.
             * Otherwise the slider will keep the height.
             */
            sliderHeight: '26%'
        };

        var settings = $.extend(defaultSettings, options);

        // Privates //
        /** Sliding states:
         * 0 - sliding not started
         * 1 - sliding started
         * 2 - slide released
         */
        var slidingState = 0;
        var startClientX = 0;
        var startPixelOffset = 0;
        var pixelOffset = 0;
        var currentSlide = 0;
        var slideCount = 0;
        // Overall width of sliders.
        var slidesWidth = 0;
        // Flag for disbling swipe function while transition animation is playing.
        var allowSwipe = true;
        var transitionDuration = settings.transitionDuration;
        var swipe = settings.swipe;
        var autoPlayTimeout = settings.autoPlayTimeout;
        // ID of timeout function that waits for animation to end.
        var animationDelayID = undefined;
        var allowSlideSwitch = true;
        var autoPlay = settings.autoPlay;
        /**
         * Set initial values.
         */
        (function init() {
            $(slideContainer).css('padding-top', settings.sliderHeight);

            slidesWidth = slider.width();

            // Change slide width when window changes.
            $(window).resize(resizeSlider);

            if(settings.prevNextButtons) {
                insertPrevNextButtons();
            }

            // Add last slide before first and first before last to seamless and engless transition
            slider.find('.sw-slide:last-child').clone().prependTo(slider);
            slider.find('.sw-slide:nth-child(2)').clone().appendTo(slider);
            slideCount = slider.find('.sw-slide').length;

            if(settings.bullets) {
                insertBullets(slideCount - 2);
            }

            setTransitionDuration(transitionDuration);
            setTimingFunction(settings.timingFunction);
            setTransitionProperty('all');

            if(swipe) {
                // Add event handlers to react when user swipe.
                slider.on('mousedown touchstart', swipeStart);
                $('html').on('mouseup touchend', swipeEnd);
                $('html').on('mousemove touchmove', swiping);
            }

            // Jump to slide 1 (since another slide was added to the beginning of row);
            jumpToSlide(1);

            enableAutoPlay();
        })();

        /**
         * Changes slider size to response on window change.
         */
        function resizeSlider(){
            // Slide width is being changed automatically. Tough slidesWidth used to calculate a distance of transition effect.
            slidesWidth = slider.width();
            switchSlide();
        }

        /**
         * Triggers when user starts swipe.
         * @param event browser event object
         */
        function swipeStart(event) {
            if(!allowSwipe) {
                return;
            }

            disableAutoPlay();
            // If it is mobile device redefine event to first touch point
            if (event.originalEvent.touches)
                event = event.originalEvent.touches[0];

            // Check if slide started on slider
            if (slidingState == 0){
                slidingState = 1; // Status 1 = slide started.
                startClientX = event.clientX;
            }
        }

        /** Triggers when user continues swipe.
         * @param event browser event object
         */
        function swiping(event) {
            var pointerData;

            // Get pointer data from event.
            if (event.originalEvent.touches) {
                pointerData = event.originalEvent.touches[0];
            } else {
                pointerData = event;
            }

            // Distance of slide from the first touch
            var deltaSlide = pointerData.clientX - startClientX;

            // If sliding started first time and there was a distance.
            if (slidingState == 1 && deltaSlide != 0) {
                slidingState = 2; // Set status to 'actually moving'
                startPixelOffset = currentSlide * -slidesWidth; // Store current offset of slide
            }

            //  When user move image
            if (slidingState == 2) {
                event.preventDefault(); // Disable default action to prevent unwanted selection. Can't prevent touches.

                // Means that user slide 1 pixel for every 1 pixel of mouse movement.
                var touchPixelRatio = 1;
                // Check for user doesn't slide out of boundaries
                if ((currentSlide == 0 && pointerData.clientX > startClientX) ||
                    (currentSlide == slideCount - 1 && pointerData.clientX < startClientX)) {
                    // Set ratio to 3 means image will be moving by 3 pixels each time user moves it's pointer by 1 pixel. (Rubber-band effect)
                    touchPixelRatio = 3;
                }

                // How far to translate slide while dragging.
                pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;
                enableTransition(false);
                // Apply moving and remove animation class
                translateX(pixelOffset);
            }
        }

        /** Triggers when user finishes swipe.
         * @param event browser event object
         */
        function swipeEnd(event) {
            if (slidingState == 2) {
                // Reset sliding state.
                slidingState = 0;

                // Calculate which slide need to be in view.
                currentSlide = pixelOffset < startPixelOffset ? currentSlide + 1 : currentSlide -1;

                // Make sure that unexisting slides weren't selected.
                currentSlide = Math.min(Math.max(currentSlide, 0), slideCount - 1);

                // Since in this example slide is full viewport width offset can be calculated according to it.
                pixelOffset = currentSlide * -slidesWidth;

                disableSwipe();
                switchSlide();
                enableAutoPlay();
            }

            slidingState = 0;

        }

        /**
         * Disables reaction on swipe while transition effect is playing.
         */
        function disableSwipe() {
            allowSwipe = false;
            window.setTimeout(enableSwipe, transitionDuration)
        }

        /**
         * Enables reaction on swipe.
         */
        function enableSwipe() {
            allowSwipe = true;
        }

        /**
         * Disables autoplay function.
         * Used while performing manual operations.
         */
        function disableAutoPlay() {
            allowSlideSwitch = false;
            window.clearTimeout(animationDelayID);
        }

        /**
         * Enables autoplay function.
         * Used to prevent auto play when user performs manual switching.
         */
        function enableAutoPlay() {
            if(autoPlay) {
                allowSlideSwitch = true;
                startAutoPlay();
            }
        }

        /**
         * Launches autoPlay function with delay.
         */
        function startAutoPlay() {
            if(allowSlideSwitch) {
                animationDelayID = window.setTimeout(performAutoPlay, autoPlayTimeout);
            }
        }

        /**
         * Switches between slides in autoplay mode.
         */
        function performAutoPlay() {
            switchForward();
            startAutoPlay();
        }

        /**
         * Switches slideshow one slide forward.
         */
        function switchForward() {
            currentSlide += 1;
            switchSlide();
        }

        /**
         * Switches slideshow one slide backward.
         */
        function switchBackward() {
            currentSlide -= 1;
            switchSlide();
        }

        /**
         * Switches slideshow to currentSlide.
         */
        function switchSlide() {
            enableTransition(true);
            translateX(-currentSlide * slidesWidth);

            if(currentSlide == 0) {
                window.setTimeout(jumpToEnd, transitionDuration);
            } else if (currentSlide == slideCount - 1) {
                window.setTimeout(jumpToStart, transitionDuration);
            }
            setActiveBullet(currentSlide);
        }

        /**
         * Switches slideshow to the first slide.
         * Remark: the first slide from html elements, not the slide that was added for smooth transition effect.
         */
        function jumpToStart() {
            jumpToSlide(1);
        }

        /**
         * Switches slideshow to the last slide.
         * Remark: the last slide from html elements, not the slide that was added for smooth transition effect.
         */
        function jumpToEnd() {
            jumpToSlide(slideCount - 2);
        }

        /**
         * Switches slideshow to exact slide number.
         * Remark: respecting two slides that were added for smooth transaction effect.
         */
        function jumpToSlide(slideNumber) {
            enableTransition(false);
            currentSlide = slideNumber;
            translateX(-slidesWidth * currentSlide);
            window.setTimeout(returnTransitionAfterJump, 50);
        }

        /**
         * Returns transition effect after jumpToSlide function call.
         */
        function returnTransitionAfterJump() {
            enableTransition(true);
        }

        /**
         * Enables or disables transition
         * @param {bool} true to enable traintion.
         */
        function enableTransition(enable) {
            if (enable) {
                setTransitionProperty('all');
            } else {
                setTransitionProperty('none');
            }
        }

        /**
         * Translates slides on certain amount.
         * @param distance {Number} distance of transition. If negative, transition from right to left.
         */
        function translateX(distance) {
            slider
            // Prefixes are being set automatically.
                 .css('-webkit-transform','translateX(' + distance + 'px)')
                 .css('-ms-transform','translateX(' + distance + 'px)')
                .css('transform','translateX(' + distance + 'px)');
        }

        /**
         * Sets duration of transition between slides.
         * @param duration {Number} amount in milliseconds.
         */
        function setTransitionDuration(duration) {
            slider
            //      .css('-webkit-transition-duration', duration + 'ms')
                .css('transition-duration', duration + 'ms');
        }

        /**
         * Sets transition function.
         */
        function setTimingFunction(functionDescription) {
            slider
            //      .css('-webkit-transition-timing-function', functionDescription)
                .css('transition-timing-function', functionDescription);
        }

        /**
         * Sets property that will be used in transition effect.
         */
        function setTransitionProperty(property) {
            slider
            //      .css('-webkit-transition-property', property)
                .css('transition-property', property);
        }

        /**
         * Next slide and Previous slide buttons.
         */
        function insertPrevNextButtons() {
            slider.after('<span class="sw-next-prev sw-prev"></span>');
            slideContainer.find('.sw-prev').click(function(){
                if(allowSlideSwitch){
                    disableAutoPlay();
                    switchBackward();
                    enableAutoPlay();
                }
            });
            slider.after('<span class="sw-next-prev sw-next"></span>');
            slideContainer.find('.sw-next').click(function(){
                if(allowSlideSwitch) {
                    disableAutoPlay();
                    switchForward();
                    enableAutoPlay();
                }
            });
        }

        /**
         * Add bullet indicator of current slide.
         */
        function insertBullets(count) {
            slider.after('<ul class="sw-bullet"></ul>');
            var bulletList = slider.parent().find('.sw-bullet');
            for (var i = 0; i < count; i++) {

                if (i == 0) {
                    bulletList.append('<li class="sw-slide-' + i + ' active"></li>');
                } else {
                    bulletList.append('<li class="sw-slide-' + i + '"></li>');
                }

                var item = slideContainer.find('.sw-slide-' + i);

                // Workaround a problem when iterator i will have max value due to closure nature.
                (function(lockedIndex) {
                    item.click(function() {
                        // Disable autoplay on time of transition.
                        disableAutoPlay();
                        currentSlide = lockedIndex + 1;
                        switchSlide();
                        enableAutoPlay();
                    });
                })(i);
            }
        }

        /**
         * Sets active bullet mark of active slide.
         * @param number {Number} active slide with respect of two added slides.
         */
        function setActiveBullet(number) {
            var activeBullet = 0;

            if(number == 0) {
                activeBullet = slideCount - 3;
            } else if (number == slideCount - 1) {
                activeBullet = 0;
            } else {
                activeBullet = number - 1;
            }

            slideContainer.find('.sw-bullet').find('li').removeClass('active');
            slideContainer.find('.sw-slide-' + activeBullet).addClass('active');
        }

        return slideContainer;
    }
}(jQuery));

(function(window){var svgSprite='<svg><symbol id="icon-qq1193403easyiconnet" viewBox="0 0 1024 1024"><path d="M459.352747 89.050453c-121.173333 26.965333-205.824 126.634667-215.722667 252.928-1.024 15.701333-3.413333 28.330667-5.12 28.330667-5.12 0-16.384 21.845333-16.384 31.744 0 5.12-2.389333 13.312-5.461333 17.749333-4.096 6.485333-5.12 14.336-4.096 33.109333l1.365333 24.917333-21.504 28.330667c-52.565333 68.949333-73.045333 142.336-57.344 203.776 7.168 26.96192 11.605333 31.402667 25.6 25.6 10.922667-4.437333 39.253333-33.792 45.397333-47.104 3.754667-8.192 9.216-10.24 9.216-3.413333 0 8.188587 20.821333 48.46592 36.181333 70.314667 8.533333 11.946667 15.018667 22.186667 14.336 22.528-0.341333 0.682667-7.168 4.440747-14.677333 8.192-27.989333 14.336-40.277333 35.157333-40.618667 70.656-0.341333 12.288 1.706667 20.135253 6.485333 26.96192 3.754667 5.464747 8.533333 12.629333 10.581333 16.042667 11.946667 20.48 33.792 30.72 79.530667 37.546667 34.133333 4.778667 57.685333 2.730667 124.928-10.581333 67.925333-13.312 96.252587-13.312 166.912 0.682667 100.007253 19.797333 160.768 13.308587 192.853333-20.48 23.893333-25.944747 31.061333-47.107413 22.86592-67.242667-2.730667-6.144-4.092587-12.291413-3.072-12.970667 0.68608-1.027413-1.020587-6.485333-3.754667-12.291413-6.485333-11.946667-22.86592-25.255253-40.618667-32.768l-12.288-5.12 18.09408-26.624c9.895253-14.680747 22.186667-37.546667 27.648-51.2l9.557333-24.576 12.629333 19.456c13.312 20.48 31.744 39.594667 41.639253 43.008 14.339413 5.12 26.28608-24.576 29.013333-70.997333 1.365333-24.576 0.344747-36.864-5.461333-59.733333-8.192-33.792-34.812587-88.746667-55.978667-117.077333-14.67392-19.456-15.015253-19.456-11.60192-37.546667 4.096-23.210667-1.36192-50.858667-14.677333-72.021333-8.192-12.629333-10.922667-22.186667-13.653333-45.738667-12.629333-111.274667-90.794667-204.8-199.68-239.616C560.725333 83.58912 494.168747 81.199787 459.352747 89.050453zM606.467413 211.930453c15.018667 9.898667 25.941333 33.450667 27.989333 59.050667 5.464747 79.189333-55.975253 116.394667-88.746667 53.589333-11.264-20.821333-10.922667-65.877333 0.344747-88.405333C559.018667 209.199787 585.987413 198.618453 606.467413 211.930453zM463.107413 215.343787c15.36 10.24 26.282667 33.450667 27.989333 60.757333 1.706667 30.72-3.413333 50.176-18.432 66.56-13.653333 15.36-27.648 19.456-43.349333 12.629333-24.576-10.581333-37.546667-35.498667-37.546667-73.728 0-28.672 8.192-50.176 24.234667-63.829333C427.267413 208.175787 450.47808 207.151787 463.107413 215.343787zM610.563413 380.207787c44.373333 11.264 92.842667 36.181333 92.842667 48.128 0 6.485333-30.040747 25.6-48.469333 30.72-10.922667 3.413333-10.584747 2.389333 3.413333-16.384 12.291413-16.384 7.171413-16.725333-13.653333-1.024-75.776 57.002667-167.253333 58.368-240.981333 3.072-10.24-7.509333-19.114667-12.970667-19.797333-11.946667-1.024 0.682667 1.706667 7.168 5.802667 13.994667 4.096 6.826667 6.485333 13.312 5.461333 14.336-2.389333 2.389333-30.72-9.898667-43.349333-19.114667-5.802667-4.096-10.24-10.24-10.24-13.994667 0-14.336 62.122667-42.325333 115.712-52.565333C494.168747 368.26112 573.016747 370.991787 610.563413 380.207787L610.563413 380.207787zM390.06208 499.674453c28.330667 9.898667 78.506667 17.408 114.346667 17.408 21.504 0 31.744 1.36192 31.744 4.096 0 5.12-67.242667 1.36192-104.448-5.802667-29.354667-5.461333-59.392-14.677333-64.170667-19.114667C362.072747 491.482453 369.240747 492.506453 390.06208 499.674453L390.06208 499.674453zM585.64608 517.082453c-5.461333 1.36192-18.773333 2.389333-29.013333 2.389333l-18.773333 0 20.48-2.389333c11.264-1.365333 24.234667-2.389333 29.013333-2.389333C594.858667 514.351787 594.520747 514.69312 585.64608 517.082453zM309.848747 567.599787c2.730667 1.706667 2.048 13.653333-2.730667 46.762667-8.192 54.954667-6.485333 76.117333 7.850667 92.16 12.970667 15.015253 35.498667 23.210667 63.829333 23.548587 47.104 0.682667 51.541333-5.461333 51.541333-71.68l0-43.34592 28.330667 3.068587c103.082667 10.922667 202.410667-9.895253 275.11808-58.368 10.24-6.826667 19.79392-10.922667 21.159253-9.557333 12.629333 12.62592 17.408 95.573333 8.192 132.437333-27.306667 105.468587-121.173333 179.882667-233.813333 185.002667-79.189333 3.754667-144.042667-20.48-197.973333-74.069333-40.96-40.96-64.512-89.429333-69.973333-145.411413-2.389333-26.279253 2.730667-70.652587 10.581333-89.42592l4.778667-11.267413 14.336 8.87808C299.267413 561.114453 307.459413 566.234453 309.848747 567.599787L309.848747 567.599787zM280.49408 795.610453c2.730667 3.072 10.24 9.216 16.725333 13.312 6.485333 4.437333 18.090667 13.653333 25.941333 20.821333 7.509333 7.509333 24.917333 22.186667 38.229333 33.109333 17.749333 14.336 24.576 22.186667 24.576 27.648 0 10.24-6.826667 12.291413-47.104 12.291413-56.32 0-99.669333-15.704747-110.592-39.59808-3.754667-7.850667-3.072-11.264 4.778667-25.6 8.192-15.701333 8.533333-16.72192 2.389333-18.428587-8.533333-2.730667-4.778667-9.216 10.581333-20.48C260.01408 789.12512 274.008747 787.759787 280.49408 795.610453L280.49408 795.610453zM774.403413 794.927787c19.11808 9.898667 26.624 25.944747 11.946667 25.944747-4.775253 0-4.775253 1.024 0.682667 6.826667 3.413333 3.754667 6.826667 13.994667 7.850667 23.210667 1.36192 15.36 0.682667 17.066667-10.922667 27.306667-19.114667 16.725333-44.373333 22.869333-93.525333 22.186667-31.399253 0-43.687253-1.365333-47.100587-5.12-7.171413-6.826667 1.020587-16.725333 25.255253-30.378667 30.375253-17.408 42.32192-26.624 46.424747-34.474667 2.048-4.096 8.533333-8.533333 14.332587-10.24 6.826667-1.706667 13.994667-7.509333 20.138667-16.384C760.067413 788.442453 761.432747 788.10112 774.403413 794.927787zM562.432 260.399787c-8.188587 8.874667-13.308587 24.917333-10.919253 34.133333 2.730667 11.264 9.212587 7.850667 13.653333-8.192 4.437333-16.725333 17.408-20.821333 20.48-6.826667l3.413333 17.749333c3.413333 15.36 10.24 7.168 10.24-12.288-0.341333-14.677333-1.706667-19.114667-8.192-24.234667C581.205333 252.54912 569.603413 252.54912 562.432 260.399787L562.432 260.399787zM446.040747 257.327787c-13.312 14.677333-12.288 43.008 2.048 53.248 10.581333 7.168 15.36 6.485333 24.917333-3.413333 6.485333-6.144 8.533333-11.946667 8.533333-23.893333C481.539413 257.66912 460.035413 241.967787 446.040747 257.327787L446.040747 257.327787zM469.592747 278.490453c0 9.557333-9.898667 12.970667-13.312 4.437333-2.389333-6.485333 3.754667-16.042667 9.557333-13.994667C467.88608 269.615787 469.592747 273.711787 469.592747 278.490453L469.592747 278.490453z"  ></path></symbol><symbol id="icon-weixin" viewBox="0 0 1024 1024"><path d="M692.699238 336.887706c11.619123 0 23.117414 0.831898 34.517504 2.108006C696.19497 194.549965 541.769728 87.227597 365.488742 87.227597 168.405197 87.227597 6.977229 221.535539 6.977229 392.107418c0 98.493235 53.707366 179.306803 143.459123 242.033357l-35.857101 107.840102 125.329408-62.837146c44.84311 8.861798 80.827085 18.002022 125.578138 18.002022 11.250688 0 22.40215-0.561766 33.469645-1.428582-7.001702-23.95351-11.06647-49.054208-11.06647-75.120947C387.891917 463.976243 522.3936 336.887706 692.699238 336.887706zM497.405542 232.406118c30.611456 0 55.425536 24.815206 55.425536 55.427379s-24.814182 55.426355-55.425536 55.426355c-30.613504 0-55.427584-24.815206-55.427584-55.426355S466.794086 232.406118 497.405542 232.406118zM246.567526 344.377344c-30.611456 0-55.427584-24.815206-55.427584-55.426355 0-30.611149 24.81623-55.426355 55.427584-55.426355 30.613504 0 55.428608 24.815206 55.428608 55.426355C301.996134 319.561114 277.18103 344.377344 246.567526 344.377344zM1017.379942 617.455821c0-143.330406-143.423283-260.165325-304.515686-260.165325-170.58089 0-304.924979 116.834918-304.924979 260.165325 0 143.57801 134.34409 260.158157 304.924979 260.158157 35.697459 0 71.712154-9.0112 107.569254-17.99895l98.340659 53.861683-26.969293-89.592525C963.769856 769.897677 1017.379942 698.309222 1017.379942 617.455821zM619.184947 577.275699c-21.799322 0-39.469466-17.673523-39.469466-39.471002 0-21.799526 17.671168-39.468954 39.469466-39.468954s39.469466 17.670451 39.469466 39.468954C658.656563 559.6032 640.983347 577.275699 619.184947 577.275699zM816.270541 579.514675c-21.80137 0-39.47049-17.672499-39.47049-39.468954 0-21.80055 17.670144-39.468954 39.47049-39.468954 21.798298 0 39.469466 17.669427 39.469466 39.468954C855.741133 561.842176 838.068941 579.514675 816.270541 579.514675z"  ></path></symbol><symbol id="icon-rili" viewBox="0 0 1024 1024"><path d="M822.272 98.368h-68.928V63.872a34.56 34.56 0 0 0-69.056 0v34.496H339.648V63.872a34.432 34.432 0 1 0-68.928 0v34.496H201.728A172.416 172.416 0 0 0 29.376 270.656v551.616a172.544 172.544 0 0 0 172.352 172.288h620.48a172.48 172.48 0 0 0 172.288-172.288V270.656a172.288 172.288 0 0 0-172.224-172.288z m103.36 723.968c0 57.024-46.4 103.36-103.36 103.36H201.728a103.552 103.552 0 0 1-103.424-103.36v-551.68c0-57.024 46.464-103.424 103.424-103.424h68.928v103.424a34.496 34.496 0 1 0 68.928 0V167.232h344.704v103.424a34.56 34.56 0 0 0 68.992 0V167.232h68.928c57.024 0 103.36 46.464 103.36 103.424v551.68h0.064z" fill="" ></path><path d="M339.648 443.072H270.656a34.496 34.496 0 0 0 0 68.928h68.928a34.56 34.56 0 0 0 0.064-68.928zM546.432 443.072H477.504a34.432 34.432 0 0 0 0 68.928h68.928a34.496 34.496 0 1 0 0-68.928zM753.344 443.072h-68.992A34.496 34.496 0 0 0 684.288 512h68.992a34.56 34.56 0 0 0 0.064-68.928zM339.648 649.92H270.656a34.432 34.432 0 1 0 0 68.864h68.928a34.496 34.496 0 0 0 0.064-68.864zM546.432 649.92H477.504a34.432 34.432 0 1 0 0 68.864h68.928a34.432 34.432 0 1 0 0-68.864zM753.344 649.92h-68.992a34.432 34.432 0 1 0 0 68.864h68.992a34.496 34.496 0 0 0 0-68.864z" fill="" ></path></symbol><symbol id="icon-weixin1" viewBox="0 0 1252 1024"><path d="M846.769231 311.138462c15.753846 0 27.569231 0 43.323077 3.938461-39.384615-177.230769-228.430769-311.138462-445.046154-311.138461C200.861538 3.938462 3.938462 169.353846 3.938462 382.030769c0 122.092308 66.953846 220.553846 177.230769 299.323077l-43.323077 133.907692 153.6-78.76923c55.138462 11.815385 98.461538 23.630769 153.6 23.630769h43.323077c-7.876923-31.507692-11.815385-59.076923-11.815385-94.523077-7.876923-196.923077 161.476923-354.461538 370.215385-354.461538z m-236.307693-122.092308c31.507692 0 55.138462 23.630769 55.138462 55.138461 0 31.507692-23.630769 55.138462-55.138462 55.138462-31.507692 0-66.953846-23.630769-66.953846-55.138462 0-31.507692 31.507692-55.138462 66.953846-55.138461zM299.323077 299.323077c-31.507692 0-66.953846-23.630769-66.953846-55.138462 0-31.507692 31.507692-55.138462 66.953846-55.138461 31.507692 0 55.138462 23.630769 55.138461 55.138461 0 35.446154-23.630769 55.138462-55.138461 55.138462z m953.107692 358.4c0-177.230769-177.230769-322.953846-374.153846-322.953846-212.676923 0-378.092308 145.723077-378.092308 322.953846 0 177.230769 165.415385 322.953846 378.092308 322.953846 43.323077 0 86.646154-11.815385 133.907692-23.630769l122.092308 66.953846-31.507692-110.276923c82.707692-66.953846 149.661538-157.538462 149.661538-256z m-500.184615-59.076923c-23.630769 0-43.323077-23.630769-43.323077-43.323077 0-23.630769 23.630769-43.323077 43.323077-43.323077 35.446154 0 55.138462 23.630769 55.138461 43.323077 0 23.630769-19.692308 43.323077-55.138461 43.323077z m244.184615 0c-23.630769 0-43.323077-23.630769-43.323077-43.323077 0-23.630769 23.630769-43.323077 43.323077-43.323077 31.507692 0 55.138462 23.630769 55.138462 43.323077 0 23.630769-23.630769 43.323077-55.138462 43.323077z" fill="#67C213" ></path></symbol><symbol id="icon-xiugai" viewBox="0 0 1024 1024"><path d="M150.130688 624.482304L686.3872 88.31488c31.736832-31.760384 71.737344-32.330752 101.890048-2.154496l149.618688 149.588992c30.164992 30.1824 29.58848 70.124544-2.171904 101.890048L399.492096 873.814016l-283.469824 83.968c-39.259136 9.1648-59.005952-10.570752-49.85344-49.876992l83.961856-283.42272z m55.421952 44.338176l-61.966336 211.544064 211.585024-61.960192-149.618688-149.583872z m673.52576-358.708224c25.921536-25.703424 24.267776-25.326592-2.766848-52.719616l-111.013888-111.0016c-26.409984-27.981824-28.91776-28.335104-52.72576-2.7904l-58.269696 58.27584L820.80768 368.364544l58.27072-58.252288M404.559872 784.560128l374.624256-374.559744-166.52288-166.499328-374.606848 374.565888c16.126976 16.162816 109.536256 109.50656 166.505472 166.493184"  ></path></symbol><symbol id="icon-weibo" viewBox="0 0 1024 1024"><path d="M96 659.2c0 115.2 147.2 204.8 332.8 204.8 185.6 0 332.8-89.6 332.8-204.8 0-115.2-147.2-204.8-332.8-204.8-185.6 0-332.8 89.6-332.8 204.8" fill="#FFFFFF" ></path><path d="M755.2 499.2c-12.8-6.4-25.6-6.4-19.2-25.6 12.8-38.4 19.2-70.4 0-96-32-44.8-121.6-44.8-217.6 0 0 0-32 12.8-25.6-12.8 25.6-51.2 19.2-96 0-115.2-51.2-51.2-198.4 0-320 128C83.2 467.2 25.6 569.6 25.6 652.8c0 160 204.8 262.4 409.6 262.4 268.8 0 441.6-153.6 441.6-275.2 0-83.2-64-128-121.6-140.8z m-320 352c-160 19.2-300.8-57.6-313.6-166.4-12.8-102.4 108.8-204.8 275.2-217.6 160-19.2 300.8 57.6 313.6 166.4 6.4 102.4-115.2 198.4-275.2 217.6z" fill="#D52B2A" ></path><path d="M934.4 198.4c-64-70.4-160-96-249.6-76.8-19.2 6.4-32 25.6-32 44.8 12.8 19.2 32 32 51.2 25.6 64-12.8 128 6.4 172.8 57.6 44.8 51.2 57.6 121.6 38.4 179.2-6.4 19.2 6.4 38.4 25.6 44.8 19.2 6.4 38.4-6.4 44.8-25.6 32-76.8 12.8-172.8-51.2-249.6" fill="#E89214" ></path><path d="M838.4 288c-32-32-76.8-44.8-121.6-38.4-19.2 6.4-25.6 19.2-25.6 38.4 6.4 19.2 19.2 25.6 38.4 25.6 19.2-6.4 44.8 0 57.6 19.2 12.8 19.2 19.2 38.4 12.8 57.6-6.4 19.2 6.4 32 19.2 38.4 19.2 6.4 32-6.4 38.4-19.2 19.2-38.4 12.8-83.2-19.2-121.6" fill="#E89214" ></path><path d="M448 544c-76.8-19.2-160 19.2-198.4 89.6-32 70.4 0 147.2 76.8 172.8 83.2 25.6 179.2-12.8 211.2-89.6S531.2 569.6 448 544z m-57.6 179.2c-12.8 25.6-51.2 38.4-76.8 25.6-25.6-12.8-32-38.4-19.2-64s44.8-32 70.4-25.6c32 12.8 38.4 38.4 25.6 64z m51.2-64c-6.4 12.8-19.2 12.8-25.6 12.8-12.8-6.4-12.8-12.8-6.4-25.6 6.4-6.4 19.2-12.8 25.6-12.8 6.4 6.4 12.8 12.8 6.4 25.6z" fill="#040000" ></path></symbol><symbol id="icon-qq1" viewBox="0 0 1024 1024"><path d="M505.100496 933.754956c0 49.769286-72.758538 90.122761-162.514449 90.122761s-162.392166-40.353475-162.392167-90.122761S252.952419 843.754478 342.70833 843.754478s162.514449 40.353475 162.514449 90.122761zM680.576971 843.754478c-89.755911 0-162.514449 40.353475-162.51445 90.122761s72.758538 90.122761 162.51445 90.122761 162.514449-40.353475 162.514449-90.122761S770.210599 843.754478 680.576971 843.754478z" fill="#FFC716" ></path><path d="M870.84972 501.361357s-12.228326-12.228326-25.434918-24.456652V333.466444a333.466444 333.466444 0 1 0-666.932887 0V476.904705C165.15304 489.133031 152.924714 501.361357 152.924714 501.361357c-21.644137 33.01648-73.369955 117.269644-73.369955 196.876044s21.76642 93.179842 29.959398 93.791259S145.098585 785.058514 178.359632 733.699546c45.122522 149.919274 177.18844 258.506807 333.221877 258.506807S800.169997 883.61882 845.047953 733.699546c33.505613 51.603535 61.753045 59.30738 69.334607 58.573681s29.959398-14.307141 29.959398-93.791259-51.725818-163.859565-73.369955-196.509195z" fill="#37464F" ></path><path d="M266.648144 558.834488a429.336518 429.336518 0 0 0-3.668498 58.451397c0 182.079771 113.478863 330.164796 253.37091 330.164796s253.37091-147.595892 253.37091-330.164796a429.336518 429.336518 0 0 0-3.913064-58.451397z m157.623119-405.858133c-36.684977 0-67.255792 40.842608-67.255792 91.223311s30.081681 91.22331 67.255792 91.22331 67.255792-40.842608 67.255792-91.22331-30.081681-91.22331-67.255792-91.223311zM435.399039 281.251493c-13.573442 0-24.456652-16.752806-24.456651-37.418677s11.005493-37.418677 24.456651-37.418677 24.456652 16.752806 24.456652 37.418677-11.005493 37.418677-24.456652 37.418677z m166.305231-128.275138c-36.684977 0-67.255792 40.842608-67.255792 91.223311s30.081681 91.22331 67.255792 91.22331 67.255792-40.842608 67.255791-91.22331-30.081681-91.22331-67.255791-91.223311z m11.372343 94.647242a1.834249 1.834249 0 0 1-1.834249 1.834249 1.711966 1.711966 0 0 1-1.711966-1.345116 24.456652 24.456652 0 0 0-20.66587-17.853356A24.456652 24.456652 0 0 0 568.68779 248.357296a1.711966 1.711966 0 0 1-1.589682 1.10055 1.834249 1.834249 0 0 1-1.834249-1.834249V244.566515c0-20.665871 11.005493-37.418677 24.456651-37.418676s24.456652 16.752806 24.456652 37.418676v3.179365z" fill="#FFFFFF" ></path><path d="M247.938805 540.491999c-6.114163 30.570814-19.076188 167.894913-12.962025 198.465727s31.793647 25.434918 68.723191 25.801768 77.527585 10.14951 78.139001-34.728446 0.7337-133.288751 10.88321-165.93838-144.783377-23.600669-144.783377-23.600669z" fill="#FF3A2F" ></path><path d="M239.86811 606.035825l143.560545 46.467638a416.863626 416.863626 0 0 1 9.415811-88.166229c10.14951-32.64963-144.783377-23.845235-144.783378-23.845235-2.201099 11.127776-5.380463 36.684977-8.192978 65.543826z" fill="#DD2C00" ></path><path d="M512.559775 462.230714c111.889181 0 202.867925-40.720325 202.867924-65.910676 0-19.076188-90.734177-38.763793-202.623358-38.763792s-202.623358 17.731072-202.623358 38.763792c0 23.845235 90.734177 65.910676 202.623358 65.910676z" fill="#FFC716" ></path><path d="M514.63859 486.809649s128.519704 1.345116 231.115357-42.187724 101.617387-48.913303 112.867447-48.913303 24.456652 16.14139 30.081682 45.244805 12.228326 52.092668-12.228326 66.399809-180.979221 106.508717-357.923096 106.508718h-8.804394c-176.943874 0-333.955577-92.32386-357.923095-106.508718s-17.364223-36.684977-12.228326-66.399809 18.831622-45.244805 30.081681-45.244805 10.14951 4.89133 112.867447 48.913303 231.115357 42.187724 231.115357 42.187724z" fill="#FF3A2F" ></path></symbol><symbol id="icon-wb" viewBox="0 0 1024 1024"><path d="M738.2 523.6c-35.3-6.8-18.2-25.8-18.2-25.8s34.6-57-6.8-98.4c-51.3-51.3-176.1 6.5-176.1 6.5-47.6 14.8-35-6.7-28.3-43.4 0-43.2-14.8-116.2-141.7-73.1-126.8 43.4-235.6 195.4-235.6 195.4-75.7 101-65.7 179.1-65.7 179.1 18.9 172.3 202 219.7 344.5 230.9 149.9 11.7 352.1-51.7 413.4-181.9 61.4-130.6-50.1-182.3-85.5-189.3zM421.4 846.1c-148.7 7-269-67.6-269-166.9 0-99.4 120.3-179.1 269-186 148.9-6.9 269.4 54.5 269.4 153.6 0 99.3-120.5 192.5-269.4 199.3z"  ></path><path d="M391.7 558.7c-149.6 17.5-132.3 157.7-132.3 157.7s-1.5 44.4 40.1 67c87.5 47.4 177.7 18.7 223.2-40.1 45.6-58.9 18.9-202-131-184.6zM354 755.4c-27.9 3.3-50.4-12.8-50.4-36.2 0-23.3 20-47.6 47.9-50.5 32.1-3.1 53 15.4 53 38.8 0 23.2-22.7 44.7-50.5 47.9z m88.2-75.1c-9.5 7.1-21.1 6-26.1-2.4-5.2-8.3-3.3-21.5 6.3-28.5 11.1-8.2 22.6-5.9 27.6 2.4 5 8.4 1.4 21.2-7.8 28.5zM954.7 445c0.7-2.8 1.2-5.6 1.2-8.6 2-13.2 3.3-26.7 3.3-40.1 0-147.7-120.1-267.8-267.8-267.8-20.5 0-37 16.6-37 37s16.6 37 37 37c106.8 0 193.7 86.9 193.7 193.7 0 11.9-1.1 23.8-3.2 35.4l0.4 0.1c-0.1 1.4-0.4 2.8-0.4 4.2 0 20.4 16.6 37 37 37 17.3 0 31.6-11.9 35.7-27.8 0.1 0.1 0.1 0 0.1-0.1z"  ></path><path d="M838.8 410.3c0.4-4.6 0.9-9.2 0.9-13.9 0-81.8-66.5-148.3-148.3-148.3-17 0-30.9 13.8-30.9 30.9 0 17 13.8 30.9 30.9 30.9 47.7 0 86.6 38.9 86.6 86.6 0 3.8-0.2 7.5-0.7 11.1l0.7 0.1c-0.1 1.2-0.7 2.3-0.7 3.6 0 17 13.8 30.9 30.9 30.9 15.6 0 27.9-11.8 30-26.8h0.3c0.1-0.8 0-1.6 0.1-2.4 0-0.6 0.4-1.1 0.4-1.8 0-0.4-0.2-0.6-0.2-0.9z"  ></path></symbol><symbol id="icon-qq1-copy" viewBox="0 0 1024 1024"><path d="M505.100496 933.754956c0 49.769286-72.758538 90.122761-162.514449 90.122761s-162.392166-40.353475-162.392167-90.122761S252.952419 843.754478 342.70833 843.754478s162.514449 40.353475 162.514449 90.122761zM680.576971 843.754478c-89.755911 0-162.514449 40.353475-162.51445 90.122761s72.758538 90.122761 162.51445 90.122761 162.514449-40.353475 162.514449-90.122761S770.210599 843.754478 680.576971 843.754478z" fill="#707070" ></path><path d="M870.84972 501.361357s-12.228326-12.228326-25.434918-24.456652V333.466444a333.466444 333.466444 0 1 0-666.932887 0V476.904705C165.15304 489.133031 152.924714 501.361357 152.924714 501.361357c-21.644137 33.01648-73.369955 117.269644-73.369955 196.876044s21.76642 93.179842 29.959398 93.791259S145.098585 785.058514 178.359632 733.699546c45.122522 149.919274 177.18844 258.506807 333.221877 258.506807S800.169997 883.61882 845.047953 733.699546c33.505613 51.603535 61.753045 59.30738 69.334607 58.573681s29.959398-14.307141 29.959398-93.791259-51.725818-163.859565-73.369955-196.509195z" fill="#707070" ></path><path d="M266.648144 558.834488a429.336518 429.336518 0 0 0-3.668498 58.451397c0 182.079771 113.478863 330.164796 253.37091 330.164796s253.37091-147.595892 253.37091-330.164796a429.336518 429.336518 0 0 0-3.913064-58.451397z m157.623119-405.858133c-36.684977 0-67.255792 40.842608-67.255792 91.223311s30.081681 91.22331 67.255792 91.22331 67.255792-40.842608 67.255792-91.22331-30.081681-91.22331-67.255792-91.223311zM435.399039 281.251493c-13.573442 0-24.456652-16.752806-24.456651-37.418677s11.005493-37.418677 24.456651-37.418677 24.456652 16.752806 24.456652 37.418677-11.005493 37.418677-24.456652 37.418677z m166.305231-128.275138c-36.684977 0-67.255792 40.842608-67.255792 91.223311s30.081681 91.22331 67.255792 91.22331 67.255792-40.842608 67.255791-91.22331-30.081681-91.22331-67.255791-91.223311z m11.372343 94.647242a1.834249 1.834249 0 0 1-1.834249 1.834249 1.711966 1.711966 0 0 1-1.711966-1.345116 24.456652 24.456652 0 0 0-20.66587-17.853356A24.456652 24.456652 0 0 0 568.68779 248.357296a1.711966 1.711966 0 0 1-1.589682 1.10055 1.834249 1.834249 0 0 1-1.834249-1.834249V244.566515c0-20.665871 11.005493-37.418677 24.456651-37.418676s24.456652 16.752806 24.456652 37.418676v3.179365z" fill="#ffffff" ></path><path d="M247.938805 540.491999c-6.114163 30.570814-19.076188 167.894913-12.962025 198.465727s31.793647 25.434918 68.723191 25.801768 77.527585 10.14951 78.139001-34.728446 0.7337-133.288751 10.88321-165.93838-144.783377-23.600669-144.783377-23.600669z" fill="#707070" ></path><path d="M239.86811 606.035825l143.560545 46.467638a416.863626 416.863626 0 0 1 9.415811-88.166229c10.14951-32.64963-144.783377-23.845235-144.783378-23.845235-2.201099 11.127776-5.380463 36.684977-8.192978 65.543826z" fill="#707070" ></path><path d="M512.559775 462.230714c111.889181 0 202.867925-40.720325 202.867924-65.910676 0-19.076188-90.734177-38.763793-202.623358-38.763792s-202.623358 17.731072-202.623358 38.763792c0 23.845235 90.734177 65.910676 202.623358 65.910676z" fill="#ffffff" ></path><path d="M514.63859 486.809649s128.519704 1.345116 231.115357-42.187724 101.617387-48.913303 112.867447-48.913303 24.456652 16.14139 30.081682 45.244805 12.228326 52.092668-12.228326 66.399809-180.979221 106.508717-357.923096 106.508718h-8.804394c-176.943874 0-333.955577-92.32386-357.923095-106.508718s-17.364223-36.684977-12.228326-66.399809 18.831622-45.244805 30.081681-45.244805 10.14951 4.89133 112.867447 48.913303 231.115357 42.187724 231.115357 42.187724z" fill="#707070" ></path></symbol></svg>';var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)
//! moment.js
//! version : 2.17.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return od.apply(null,arguments)}
// This is done to register the method called with moment()
// without creating circular dependencies.
function b(a){od=a}function c(a){return a instanceof Array||"[object Array]"===Object.prototype.toString.call(a)}function d(a){
// IE8 will treat undefined and null as object if it wasn't for
// input != null
return null!=a&&"[object Object]"===Object.prototype.toString.call(a)}function e(a){var b;for(b in a)
// even if its not own property I'd still call it non-empty
return!1;return!0}function f(a){return"number"==typeof a||"[object Number]"===Object.prototype.toString.call(a)}function g(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function h(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function i(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function j(a,b){for(var c in b)i(b,c)&&(a[c]=b[c]);return i(b,"toString")&&(a.toString=b.toString),i(b,"valueOf")&&(a.valueOf=b.valueOf),a}function k(a,b,c,d){return rb(a,b,c,d,!0).utc()}function l(){
// We need to deep clone this object.
return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null}}function m(a){return null==a._pf&&(a._pf=l()),a._pf}function n(a){if(null==a._isValid){var b=m(a),c=qd.call(b.parsedDateParts,function(a){return null!=a}),d=!isNaN(a._d.getTime())&&b.overflow<0&&!b.empty&&!b.invalidMonth&&!b.invalidWeekday&&!b.nullInput&&!b.invalidFormat&&!b.userInvalidated&&(!b.meridiem||b.meridiem&&c);if(a._strict&&(d=d&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour),null!=Object.isFrozen&&Object.isFrozen(a))return d;a._isValid=d}return a._isValid}function o(a){var b=k(NaN);return null!=a?j(m(b),a):m(b).userInvalidated=!0,b}function p(a){return void 0===a}function q(a,b){var c,d,e;if(p(b._isAMomentObject)||(a._isAMomentObject=b._isAMomentObject),p(b._i)||(a._i=b._i),p(b._f)||(a._f=b._f),p(b._l)||(a._l=b._l),p(b._strict)||(a._strict=b._strict),p(b._tzm)||(a._tzm=b._tzm),p(b._isUTC)||(a._isUTC=b._isUTC),p(b._offset)||(a._offset=b._offset),p(b._pf)||(a._pf=m(b)),p(b._locale)||(a._locale=b._locale),rd.length>0)for(c in rd)d=rd[c],e=b[d],p(e)||(a[d]=e);return a}
// Moment prototype object
function r(b){q(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),
// Prevent infinite loop in case updateOffset creates new moment
// objects.
sd===!1&&(sd=!0,a.updateOffset(this),sd=!1)}function s(a){return a instanceof r||null!=a&&null!=a._isAMomentObject}function t(a){return a<0?Math.ceil(a)||0:Math.floor(a)}function u(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=t(b)),c}
// compare two arrays, return the number of differences
function v(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;d<e;d++)(c&&a[d]!==b[d]||!c&&u(a[d])!==u(b[d]))&&g++;return g+f}function w(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function x(b,c){var d=!0;return j(function(){if(null!=a.deprecationHandler&&a.deprecationHandler(null,b),d){for(var e,f=[],g=0;g<arguments.length;g++){if(e="","object"==typeof arguments[g]){e+="\n["+g+"] ";for(var h in arguments[0])e+=h+": "+arguments[0][h]+", ";e=e.slice(0,-2)}else e=arguments[g];f.push(e)}w(b+"\nArguments: "+Array.prototype.slice.call(f).join("")+"\n"+(new Error).stack),d=!1}return c.apply(this,arguments)},c)}function y(b,c){null!=a.deprecationHandler&&a.deprecationHandler(b,c),td[b]||(w(c),td[b]=!0)}function z(a){return a instanceof Function||"[object Function]"===Object.prototype.toString.call(a)}function A(a){var b,c;for(c in a)b=a[c],z(b)?this[c]=b:this["_"+c]=b;this._config=a,
// Lenient ordinal parsing accepts just a number in addition to
// number + (possibly) stuff coming from _ordinalParseLenient.
this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function B(a,b){var c,e=j({},a);for(c in b)i(b,c)&&(d(a[c])&&d(b[c])?(e[c]={},j(e[c],a[c]),j(e[c],b[c])):null!=b[c]?e[c]=b[c]:delete e[c]);for(c in a)i(a,c)&&!i(b,c)&&d(a[c])&&(
// make sure changes to properties don't modify parent config
e[c]=j({},e[c]));return e}function C(a){null!=a&&this.set(a)}function D(a,b,c){var d=this._calendar[a]||this._calendar.sameElse;return z(d)?d.call(b,c):d}function E(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function F(){return this._invalidDate}function G(a){return this._ordinal.replace("%d",a)}function H(a,b,c,d){var e=this._relativeTime[c];return z(e)?e(a,b,c,d):e.replace(/%d/i,a)}function I(a,b){var c=this._relativeTime[a>0?"future":"past"];return z(c)?c(b):c.replace(/%s/i,b)}function J(a,b){var c=a.toLowerCase();Dd[c]=Dd[c+"s"]=Dd[b]=a}function K(a){return"string"==typeof a?Dd[a]||Dd[a.toLowerCase()]:void 0}function L(a){var b,c,d={};for(c in a)i(a,c)&&(b=K(c),b&&(d[b]=a[c]));return d}function M(a,b){Ed[a]=b}function N(a){var b=[];for(var c in a)b.push({unit:c,priority:Ed[c]});return b.sort(function(a,b){return a.priority-b.priority}),b}function O(b,c){return function(d){return null!=d?(Q(this,b,d),a.updateOffset(this,c),this):P(this,b)}}function P(a,b){return a.isValid()?a._d["get"+(a._isUTC?"UTC":"")+b]():NaN}function Q(a,b,c){a.isValid()&&a._d["set"+(a._isUTC?"UTC":"")+b](c)}
// MOMENTS
function R(a){return a=K(a),z(this[a])?this[a]():this}function S(a,b){if("object"==typeof a){a=L(a);for(var c=N(a),d=0;d<c.length;d++)this[c[d].unit](a[c[d].unit])}else if(a=K(a),z(this[a]))return this[a](b);return this}function T(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}
// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function U(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Id[a]=e),b&&(Id[b[0]]=function(){return T(e.apply(this,arguments),b[1],b[2])}),c&&(Id[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function V(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function W(a){var b,c,d=a.match(Fd);for(b=0,c=d.length;b<c;b++)Id[d[b]]?d[b]=Id[d[b]]:d[b]=V(d[b]);return function(b){var e,f="";for(e=0;e<c;e++)f+=d[e]instanceof Function?d[e].call(b,a):d[e];return f}}
// format date using native date object
function X(a,b){return a.isValid()?(b=Y(b,a.localeData()),Hd[b]=Hd[b]||W(b),Hd[b](a)):a.localeData().invalidDate()}function Y(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Gd.lastIndex=0;d>=0&&Gd.test(a);)a=a.replace(Gd,c),Gd.lastIndex=0,d-=1;return a}function Z(a,b,c){$d[a]=z(b)?b:function(a,d){return a&&c?c:b}}function $(a,b){return i($d,a)?$d[a](b._strict,b._locale):new RegExp(_(a))}
// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function _(a){return aa(a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}))}function aa(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function ba(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),f(b)&&(d=function(a,c){c[b]=u(a)}),c=0;c<a.length;c++)_d[a[c]]=d}function ca(a,b){ba(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function da(a,b,c){null!=b&&i(_d,a)&&_d[a](b,c._a,c,a)}function ea(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function fa(a,b){return a?c(this._months)?this._months[a.month()]:this._months[(this._months.isFormat||ke).test(b)?"format":"standalone"][a.month()]:this._months}function ga(a,b){return a?c(this._monthsShort)?this._monthsShort[a.month()]:this._monthsShort[ke.test(b)?"format":"standalone"][a.month()]:this._monthsShort}function ha(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._monthsParse)for(
// this is not used
this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],d=0;d<12;++d)f=k([2e3,d]),this._shortMonthsParse[d]=this.monthsShort(f,"").toLocaleLowerCase(),this._longMonthsParse[d]=this.months(f,"").toLocaleLowerCase();return c?"MMM"===b?(e=je.call(this._shortMonthsParse,g),e!==-1?e:null):(e=je.call(this._longMonthsParse,g),e!==-1?e:null):"MMM"===b?(e=je.call(this._shortMonthsParse,g),e!==-1?e:(e=je.call(this._longMonthsParse,g),e!==-1?e:null)):(e=je.call(this._longMonthsParse,g),e!==-1?e:(e=je.call(this._shortMonthsParse,g),e!==-1?e:null))}function ia(a,b,c){var d,e,f;if(this._monthsParseExact)return ha.call(this,a,b,c);
// TODO: add sorting
// Sorting makes sure if one month (or abbr) is a prefix of another
// see sorting in computeMonthsParse
for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;d<12;d++){
// test the regex
if(
// make the regex if we don't have it already
e=k([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}
// MOMENTS
function ja(a,b){var c;if(!a.isValid())
// No op
return a;if("string"==typeof b)if(/^\d+$/.test(b))b=u(b);else
// TODO: Another silent failure?
if(b=a.localeData().monthsParse(b),!f(b))return a;return c=Math.min(a.date(),ea(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a}function ka(b){return null!=b?(ja(this,b),a.updateOffset(this,!0),this):P(this,"Month")}function la(){return ea(this.year(),this.month())}function ma(a){return this._monthsParseExact?(i(this,"_monthsRegex")||oa.call(this),a?this._monthsShortStrictRegex:this._monthsShortRegex):(i(this,"_monthsShortRegex")||(this._monthsShortRegex=ne),this._monthsShortStrictRegex&&a?this._monthsShortStrictRegex:this._monthsShortRegex)}function na(a){return this._monthsParseExact?(i(this,"_monthsRegex")||oa.call(this),a?this._monthsStrictRegex:this._monthsRegex):(i(this,"_monthsRegex")||(this._monthsRegex=oe),this._monthsStrictRegex&&a?this._monthsStrictRegex:this._monthsRegex)}function oa(){function a(a,b){return b.length-a.length}var b,c,d=[],e=[],f=[];for(b=0;b<12;b++)
// make the regex if we don't have it already
c=k([2e3,b]),d.push(this.monthsShort(c,"")),e.push(this.months(c,"")),f.push(this.months(c,"")),f.push(this.monthsShort(c,""));for(
// Sorting makes sure if one month (or abbr) is a prefix of another it
// will match the longer piece.
d.sort(a),e.sort(a),f.sort(a),b=0;b<12;b++)d[b]=aa(d[b]),e[b]=aa(e[b]);for(b=0;b<24;b++)f[b]=aa(f[b]);this._monthsRegex=new RegExp("^("+f.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+e.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+d.join("|")+")","i")}
// HELPERS
function pa(a){return qa(a)?366:365}function qa(a){return a%4===0&&a%100!==0||a%400===0}function ra(){return qa(this.year())}function sa(a,b,c,d,e,f,g){
//can't just apply() to create a date:
//http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
var h=new Date(a,b,c,d,e,f,g);
//the date constructor remaps years 0-99 to 1900-1999
return a<100&&a>=0&&isFinite(h.getFullYear())&&h.setFullYear(a),h}function ta(a){var b=new Date(Date.UTC.apply(null,arguments));
//the Date.UTC function remaps years 0-99 to 1900-1999
return a<100&&a>=0&&isFinite(b.getUTCFullYear())&&b.setUTCFullYear(a),b}
// start-of-first-week - start-of-year
function ua(a,b,c){var// first-week day -- which january is always in the first week (4 for iso, 1 for other)
d=7+b-c,
// first-week day local weekday -- which local weekday is fwd
e=(7+ta(a,0,d).getUTCDay()-b)%7;return-e+d-1}
//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function va(a,b,c,d,e){var f,g,h=(7+c-d)%7,i=ua(a,d,e),j=1+7*(b-1)+h+i;return j<=0?(f=a-1,g=pa(f)+j):j>pa(a)?(f=a+1,g=j-pa(a)):(f=a,g=j),{year:f,dayOfYear:g}}function wa(a,b,c){var d,e,f=ua(a.year(),b,c),g=Math.floor((a.dayOfYear()-f-1)/7)+1;return g<1?(e=a.year()-1,d=g+xa(e,b,c)):g>xa(a.year(),b,c)?(d=g-xa(a.year(),b,c),e=a.year()+1):(e=a.year(),d=g),{week:d,year:e}}function xa(a,b,c){var d=ua(a,b,c),e=ua(a+1,b,c);return(pa(a)-d+e)/7}
// HELPERS
// LOCALES
function ya(a){return wa(a,this._week.dow,this._week.doy).week}function za(){return this._week.dow}function Aa(){return this._week.doy}
// MOMENTS
function Ba(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function Ca(a){var b=wa(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}
// HELPERS
function Da(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Ea(a,b){return"string"==typeof a?b.weekdaysParse(a)%7||7:isNaN(a)?null:a}function Fa(a,b){return a?c(this._weekdays)?this._weekdays[a.day()]:this._weekdays[this._weekdays.isFormat.test(b)?"format":"standalone"][a.day()]:this._weekdays}function Ga(a){return a?this._weekdaysShort[a.day()]:this._weekdaysShort}function Ha(a){return a?this._weekdaysMin[a.day()]:this._weekdaysMin}function Ia(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],d=0;d<7;++d)f=k([2e3,1]).day(d),this._minWeekdaysParse[d]=this.weekdaysMin(f,"").toLocaleLowerCase(),this._shortWeekdaysParse[d]=this.weekdaysShort(f,"").toLocaleLowerCase(),this._weekdaysParse[d]=this.weekdays(f,"").toLocaleLowerCase();return c?"dddd"===b?(e=je.call(this._weekdaysParse,g),e!==-1?e:null):"ddd"===b?(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:null):(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null):"dddd"===b?(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null))):"ddd"===b?(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null))):(e=je.call(this._minWeekdaysParse,g),e!==-1?e:(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:null)))}function Ja(a,b,c){var d,e,f;if(this._weekdaysParseExact)return Ia.call(this,a,b,c);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),d=0;d<7;d++){
// test the regex
if(
// make the regex if we don't have it already
e=k([2e3,1]).day(d),c&&!this._fullWeekdaysParse[d]&&(this._fullWeekdaysParse[d]=new RegExp("^"+this.weekdays(e,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[d]=new RegExp("^"+this.weekdaysShort(e,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[d]=new RegExp("^"+this.weekdaysMin(e,"").replace(".",".?")+"$","i")),this._weekdaysParse[d]||(f="^"+this.weekdays(e,"")+"|^"+this.weekdaysShort(e,"")+"|^"+this.weekdaysMin(e,""),this._weekdaysParse[d]=new RegExp(f.replace(".",""),"i")),c&&"dddd"===b&&this._fullWeekdaysParse[d].test(a))return d;if(c&&"ddd"===b&&this._shortWeekdaysParse[d].test(a))return d;if(c&&"dd"===b&&this._minWeekdaysParse[d].test(a))return d;if(!c&&this._weekdaysParse[d].test(a))return d}}
// MOMENTS
function Ka(a){if(!this.isValid())return null!=a?this:NaN;var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Da(a,this.localeData()),this.add(a-b,"d")):b}function La(a){if(!this.isValid())return null!=a?this:NaN;var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Ma(a){if(!this.isValid())return null!=a?this:NaN;
// behaves the same as moment#day except
// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
// as a setter, sunday should belong to the previous week.
if(null!=a){var b=Ea(a,this.localeData());return this.day(this.day()%7?b:b-7)}return this.day()||7}function Na(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysStrictRegex:this._weekdaysRegex):(i(this,"_weekdaysRegex")||(this._weekdaysRegex=ue),this._weekdaysStrictRegex&&a?this._weekdaysStrictRegex:this._weekdaysRegex)}function Oa(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(i(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ve),this._weekdaysShortStrictRegex&&a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Pa(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(i(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=we),this._weekdaysMinStrictRegex&&a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Qa(){function a(a,b){return b.length-a.length}var b,c,d,e,f,g=[],h=[],i=[],j=[];for(b=0;b<7;b++)
// make the regex if we don't have it already
c=k([2e3,1]).day(b),d=this.weekdaysMin(c,""),e=this.weekdaysShort(c,""),f=this.weekdays(c,""),g.push(d),h.push(e),i.push(f),j.push(d),j.push(e),j.push(f);for(
// Sorting makes sure if one weekday (or abbr) is a prefix of another it
// will match the longer piece.
g.sort(a),h.sort(a),i.sort(a),j.sort(a),b=0;b<7;b++)h[b]=aa(h[b]),i[b]=aa(i[b]),j[b]=aa(j[b]);this._weekdaysRegex=new RegExp("^("+j.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+g.join("|")+")","i")}
// FORMATTING
function Ra(){return this.hours()%12||12}function Sa(){return this.hours()||24}function Ta(a,b){U(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}
// PARSING
function Ua(a,b){return b._meridiemParse}
// LOCALES
function Va(a){
// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
// Using charAt should be more compatible.
return"p"===(a+"").toLowerCase().charAt(0)}function Wa(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Xa(a){return a?a.toLowerCase().replace("_","-"):a}
// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function Ya(a){for(var b,c,d,e,f=0;f<a.length;){for(e=Xa(a[f]).split("-"),b=e.length,c=Xa(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=Za(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&v(e,c,!0)>=b-1)
//the next array item is better than a shallower substring of this one
break;b--}f++}return null}function Za(a){var b=null;
// TODO: Find a better way to register and load all the locales in Node
if(!Be[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=xe._abbr,require("./locale/"+a),
// because defineLocale currently also sets the global locale, we
// want to undo that for lazy loaded locales
$a(b)}catch(a){}return Be[a]}
// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function $a(a,b){var c;
// moment.duration._locale = moment._locale = data;
return a&&(c=p(b)?bb(a):_a(a,b),c&&(xe=c)),xe._abbr}function _a(a,b){if(null!==b){var c=Ae;if(b.abbr=a,null!=Be[a])y("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),c=Be[a]._config;else if(null!=b.parentLocale){if(null==Be[b.parentLocale])return Ce[b.parentLocale]||(Ce[b.parentLocale]=[]),Ce[b.parentLocale].push({name:a,config:b}),null;c=Be[b.parentLocale]._config}
// backwards compat for now: also set the locale
// make sure we set the locale AFTER all child locales have been
// created, so we won't end up with the child locale set.
return Be[a]=new C(B(c,b)),Ce[a]&&Ce[a].forEach(function(a){_a(a.name,a.config)}),$a(a),Be[a]}
// useful for testing
return delete Be[a],null}function ab(a,b){if(null!=b){var c,d=Ae;
// MERGE
null!=Be[a]&&(d=Be[a]._config),b=B(d,b),c=new C(b),c.parentLocale=Be[a],Be[a]=c,
// backwards compat for now: also set the locale
$a(a)}else
// pass null for config to unupdate, useful for tests
null!=Be[a]&&(null!=Be[a].parentLocale?Be[a]=Be[a].parentLocale:null!=Be[a]&&delete Be[a]);return Be[a]}
// returns locale data
function bb(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return xe;if(!c(a)){if(
//short-circuit everything else
b=Za(a))return b;a=[a]}return Ya(a)}function cb(){return wd(Be)}function db(a){var b,c=a._a;return c&&m(a).overflow===-2&&(b=c[be]<0||c[be]>11?be:c[ce]<1||c[ce]>ea(c[ae],c[be])?ce:c[de]<0||c[de]>24||24===c[de]&&(0!==c[ee]||0!==c[fe]||0!==c[ge])?de:c[ee]<0||c[ee]>59?ee:c[fe]<0||c[fe]>59?fe:c[ge]<0||c[ge]>999?ge:-1,m(a)._overflowDayOfYear&&(b<ae||b>ce)&&(b=ce),m(a)._overflowWeeks&&b===-1&&(b=he),m(a)._overflowWeekday&&b===-1&&(b=ie),m(a).overflow=b),a}
// date from iso format
function eb(a){var b,c,d,e,f,g,h=a._i,i=De.exec(h)||Ee.exec(h);if(i){for(m(a).iso=!0,b=0,c=Ge.length;b<c;b++)if(Ge[b][1].exec(i[1])){e=Ge[b][0],d=Ge[b][2]!==!1;break}if(null==e)return void(a._isValid=!1);if(i[3]){for(b=0,c=He.length;b<c;b++)if(He[b][1].exec(i[3])){
// match[2] should be 'T' or space
f=(i[2]||" ")+He[b][0];break}if(null==f)return void(a._isValid=!1)}if(!d&&null!=f)return void(a._isValid=!1);if(i[4]){if(!Fe.exec(i[4]))return void(a._isValid=!1);g="Z"}a._f=e+(f||"")+(g||""),kb(a)}else a._isValid=!1}
// date from iso format or fallback
function fb(b){var c=Ie.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(eb(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}
// Pick the first defined of two or three arguments.
function gb(a,b,c){return null!=a?a:null!=b?b:c}function hb(b){
// hooks is actually the exported moment object
var c=new Date(a.now());return b._useUTC?[c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate()]:[c.getFullYear(),c.getMonth(),c.getDate()]}
// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function ib(a){var b,c,d,e,f=[];if(!a._d){
// Default to current date.
// * if no year, month, day of month are given, default to today
// * if day of month is given, default month and year
// * if month is given, default only year
// * if year is given, don't default anything
for(d=hb(a),
//compute day of the year from weeks and weekdays
a._w&&null==a._a[ce]&&null==a._a[be]&&jb(a),
//if the day of the year is set, figure out what it is
a._dayOfYear&&(e=gb(a._a[ae],d[ae]),a._dayOfYear>pa(e)&&(m(a)._overflowDayOfYear=!0),c=ta(e,0,a._dayOfYear),a._a[be]=c.getUTCMonth(),a._a[ce]=c.getUTCDate()),b=0;b<3&&null==a._a[b];++b)a._a[b]=f[b]=d[b];
// Zero out whatever was not defaulted, including time
for(;b<7;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];
// Check for 24:00:00.000
24===a._a[de]&&0===a._a[ee]&&0===a._a[fe]&&0===a._a[ge]&&(a._nextDay=!0,a._a[de]=0),a._d=(a._useUTC?ta:sa).apply(null,f),
// Apply timezone offset from input. The actual utcOffset can be changed
// with parseZone.
null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[de]=24)}}function jb(a){var b,c,d,e,f,g,h,i;if(b=a._w,null!=b.GG||null!=b.W||null!=b.E)f=1,g=4,
// TODO: We need to take the current isoWeekYear, but that depends on
// how we interpret now (local, utc, fixed offset). So create
// a now version of current config (take local/utc/offset flags, and
// create now).
c=gb(b.GG,a._a[ae],wa(sb(),1,4).year),d=gb(b.W,1),e=gb(b.E,1),(e<1||e>7)&&(i=!0);else{f=a._locale._week.dow,g=a._locale._week.doy;var j=wa(sb(),f,g);c=gb(b.gg,a._a[ae],j.year),
// Default to current week.
d=gb(b.w,j.week),null!=b.d?(
// weekday -- low day numbers are considered next week
e=b.d,(e<0||e>6)&&(i=!0)):null!=b.e?(
// local weekday -- counting starts from begining of week
e=b.e+f,(b.e<0||b.e>6)&&(i=!0)):
// default to begining of week
e=f}d<1||d>xa(c,f,g)?m(a)._overflowWeeks=!0:null!=i?m(a)._overflowWeekday=!0:(h=va(c,d,e,f,g),a._a[ae]=h.year,a._dayOfYear=h.dayOfYear)}
// date from string and format string
function kb(b){
// TODO: Move this to another part of the creation flow to prevent circular deps
if(b._f===a.ISO_8601)return void eb(b);b._a=[],m(b).empty=!0;
// This array is used to make a Date, either with `new Date` or `Date.UTC`
var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=Y(b._f,b._locale).match(Fd)||[],c=0;c<e.length;c++)f=e[c],d=(h.match($(f,b))||[])[0],
// console.log('token', token, 'parsedInput', parsedInput,
//         'regex', getParseRegexForToken(token, config));
d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&m(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),
// don't parse if it's not a known token
Id[f]?(d?m(b).empty=!1:m(b).unusedTokens.push(f),da(f,d,b)):b._strict&&!d&&m(b).unusedTokens.push(f);
// add remaining unparsed input length to the string
m(b).charsLeftOver=i-j,h.length>0&&m(b).unusedInput.push(h),
// clear _12h flag if hour is <= 12
b._a[de]<=12&&m(b).bigHour===!0&&b._a[de]>0&&(m(b).bigHour=void 0),m(b).parsedDateParts=b._a.slice(0),m(b).meridiem=b._meridiem,
// handle meridiem
b._a[de]=lb(b._locale,b._a[de],b._meridiem),ib(b),db(b)}function lb(a,b,c){var d;
// Fallback
return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&b<12&&(b+=12),d||12!==b||(b=0),b):b}
// date from string and array of format strings
function mb(a){var b,c,d,e,f;if(0===a._f.length)return m(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=q({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],kb(b),n(b)&&(
// if there is any input that was not parsed add a penalty for that format
f+=m(b).charsLeftOver,
//or tokens
f+=10*m(b).unusedTokens.length,m(b).score=f,(null==d||f<d)&&(d=f,c=b));j(a,c||b)}function nb(a){if(!a._d){var b=L(a._i);a._a=h([b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],function(a){return a&&parseInt(a,10)}),ib(a)}}function ob(a){var b=new r(db(pb(a)));
// Adding is smart enough around DST
return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function pb(a){var b=a._i,d=a._f;return a._locale=a._locale||bb(a._l),null===b||void 0===d&&""===b?o({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),s(b)?new r(db(b)):(g(b)?a._d=b:c(d)?mb(a):d?kb(a):qb(a),n(a)||(a._d=null),a))}function qb(b){var d=b._i;void 0===d?b._d=new Date(a.now()):g(d)?b._d=new Date(d.valueOf()):"string"==typeof d?fb(b):c(d)?(b._a=h(d.slice(0),function(a){return parseInt(a,10)}),ib(b)):"object"==typeof d?nb(b):f(d)?
// from milliseconds
b._d=new Date(d):a.createFromInputFallback(b)}function rb(a,b,f,g,h){var i={};
// object construction must be done this way.
// https://github.com/moment/moment/issues/1423
return f!==!0&&f!==!1||(g=f,f=void 0),(d(a)&&e(a)||c(a)&&0===a.length)&&(a=void 0),i._isAMomentObject=!0,i._useUTC=i._isUTC=h,i._l=f,i._i=a,i._f=b,i._strict=g,ob(i)}function sb(a,b,c,d){return rb(a,b,c,d,!1)}
// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function tb(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return sb();for(d=b[0],e=1;e<b.length;++e)b[e].isValid()&&!b[e][a](d)||(d=b[e]);return d}
// TODO: Use [].sort instead?
function ub(){var a=[].slice.call(arguments,0);return tb("isBefore",a)}function vb(){var a=[].slice.call(arguments,0);return tb("isAfter",a)}function wb(a){var b=L(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;
// representation for dateAddRemove
this._milliseconds=+k+1e3*j+// 1000
6e4*i+// 1000 * 60
1e3*h*60*60,//using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
// Because of dateAddRemove treats 24 hours as different from a
// day when working around DST, we need to store them separately
this._days=+g+7*f,
// It is impossible translate months into days without knowing
// which months you are are talking about, so we have to store
// it separately.
this._months=+e+3*d+12*c,this._data={},this._locale=bb(),this._bubble()}function xb(a){return a instanceof wb}function yb(a){return a<0?Math.round(-1*a)*-1:Math.round(a)}
// FORMATTING
function zb(a,b){U(a,0,0,function(){var a=this.utcOffset(),c="+";return a<0&&(a=-a,c="-"),c+T(~~(a/60),2)+b+T(~~a%60,2)})}function Ab(a,b){var c=(b||"").match(a);if(null===c)return null;var d=c[c.length-1]||[],e=(d+"").match(Me)||["-",0,0],f=+(60*e[1])+u(e[2]);return 0===f?0:"+"===e[0]?f:-f}
// Return a moment from input, that is local/utc/zone equivalent to model.
function Bb(b,c){var d,e;
// Use low-level api, because this fn is low-level api.
return c._isUTC?(d=c.clone(),e=(s(b)||g(b)?b.valueOf():sb(b).valueOf())-d.valueOf(),d._d.setTime(d._d.valueOf()+e),a.updateOffset(d,!1),d):sb(b).local()}function Cb(a){
// On Firefox.24 Date#getTimezoneOffset returns a floating point.
// https://github.com/moment/moment/pull/1871
return 15*-Math.round(a._d.getTimezoneOffset()/15)}
// MOMENTS
// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function Db(b,c){var d,e=this._offset||0;if(!this.isValid())return null!=b?this:NaN;if(null!=b){if("string"==typeof b){if(b=Ab(Xd,b),null===b)return this}else Math.abs(b)<16&&(b=60*b);return!this._isUTC&&c&&(d=Cb(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?Tb(this,Ob(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?e:Cb(this)}function Eb(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Fb(a){return this.utcOffset(0,a)}function Gb(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Cb(this),"m")),this}function Hb(){if(null!=this._tzm)this.utcOffset(this._tzm);else if("string"==typeof this._i){var a=Ab(Wd,this._i);null!=a?this.utcOffset(a):this.utcOffset(0,!0)}return this}function Ib(a){return!!this.isValid()&&(a=a?sb(a).utcOffset():0,(this.utcOffset()-a)%60===0)}function Jb(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Kb(){if(!p(this._isDSTShifted))return this._isDSTShifted;var a={};if(q(a,this),a=pb(a),a._a){var b=a._isUTC?k(a._a):sb(a._a);this._isDSTShifted=this.isValid()&&v(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Lb(){return!!this.isValid()&&!this._isUTC}function Mb(){return!!this.isValid()&&this._isUTC}function Nb(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}function Ob(a,b){var c,d,e,g=a,
// matching against regexp is expensive, do it on demand
h=null;// checks for null or undefined
return xb(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:f(a)?(g={},b?g[b]=a:g.milliseconds=a):(h=Ne.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:u(h[ce])*c,h:u(h[de])*c,m:u(h[ee])*c,s:u(h[fe])*c,ms:u(yb(1e3*h[ge]))*c}):(h=Oe.exec(a))?(c="-"===h[1]?-1:1,g={y:Pb(h[2],c),M:Pb(h[3],c),w:Pb(h[4],c),d:Pb(h[5],c),h:Pb(h[6],c),m:Pb(h[7],c),s:Pb(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=Rb(sb(g.from),sb(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new wb(g),xb(a)&&i(a,"_locale")&&(d._locale=a._locale),d}function Pb(a,b){
// We'd normally use ~~inp for this, but unfortunately it also
// converts floats to ints.
// inp may be undefined, so careful calling replace on it.
var c=a&&parseFloat(a.replace(",","."));
// apply sign while we're at it
return(isNaN(c)?0:c)*b}function Qb(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function Rb(a,b){var c;return a.isValid()&&b.isValid()?(b=Bb(b,a),a.isBefore(b)?c=Qb(a,b):(c=Qb(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c):{milliseconds:0,months:0}}
// TODO: remove 'name' arg after deprecation is removed
function Sb(a,b){return function(c,d){var e,f;
//invert the arguments, but complain about it
return null===d||isNaN(+d)||(y(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Ob(c,d),Tb(this,e,a),this}}function Tb(b,c,d,e){var f=c._milliseconds,g=yb(c._days),h=yb(c._months);b.isValid()&&(e=null==e||e,f&&b._d.setTime(b._d.valueOf()+f*d),g&&Q(b,"Date",P(b,"Date")+g*d),h&&ja(b,P(b,"Month")+h*d),e&&a.updateOffset(b,g||h))}function Ub(a,b){var c=a.diff(b,"days",!0);return c<-6?"sameElse":c<-1?"lastWeek":c<0?"lastDay":c<1?"sameDay":c<2?"nextDay":c<7?"nextWeek":"sameElse"}function Vb(b,c){
// We want to compare the start of today, vs this.
// Getting start-of-today depends on whether we're local/utc/offset or not.
var d=b||sb(),e=Bb(d,this).startOf("day"),f=a.calendarFormat(this,e)||"sameElse",g=c&&(z(c[f])?c[f].call(this,d):c[f]);return this.format(g||this.localeData().calendar(f,this,sb(d)))}function Wb(){return new r(this)}function Xb(a,b){var c=s(a)?a:sb(a);return!(!this.isValid()||!c.isValid())&&(b=K(p(b)?"millisecond":b),"millisecond"===b?this.valueOf()>c.valueOf():c.valueOf()<this.clone().startOf(b).valueOf())}function Yb(a,b){var c=s(a)?a:sb(a);return!(!this.isValid()||!c.isValid())&&(b=K(p(b)?"millisecond":b),"millisecond"===b?this.valueOf()<c.valueOf():this.clone().endOf(b).valueOf()<c.valueOf())}function Zb(a,b,c,d){return d=d||"()",("("===d[0]?this.isAfter(a,c):!this.isBefore(a,c))&&(")"===d[1]?this.isBefore(b,c):!this.isAfter(b,c))}function $b(a,b){var c,d=s(a)?a:sb(a);return!(!this.isValid()||!d.isValid())&&(b=K(b||"millisecond"),"millisecond"===b?this.valueOf()===d.valueOf():(c=d.valueOf(),this.clone().startOf(b).valueOf()<=c&&c<=this.clone().endOf(b).valueOf()))}function _b(a,b){return this.isSame(a,b)||this.isAfter(a,b)}function ac(a,b){return this.isSame(a,b)||this.isBefore(a,b)}function bc(a,b,c){var d,e,f,g;// 1000
// 1000 * 60
// 1000 * 60 * 60
// 1000 * 60 * 60 * 24, negate dst
// 1000 * 60 * 60 * 24 * 7, negate dst
return this.isValid()?(d=Bb(a,this),d.isValid()?(e=6e4*(d.utcOffset()-this.utcOffset()),b=K(b),"year"===b||"month"===b||"quarter"===b?(g=cc(this,d),"quarter"===b?g/=3:"year"===b&&(g/=12)):(f=this-d,g="second"===b?f/1e3:"minute"===b?f/6e4:"hour"===b?f/36e5:"day"===b?(f-e)/864e5:"week"===b?(f-e)/6048e5:f),c?g:t(g)):NaN):NaN}function cc(a,b){
// difference in months
var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),
// b is in (anchor - 1 month, anchor + 1 month)
f=a.clone().add(e,"months");
//check for negative zero, return zero if negative zero
// linear across the month
// linear across the month
return b-f<0?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)||0}function dc(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ec(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?z(Date.prototype.toISOString)?this.toDate().toISOString():X(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):X(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function fc(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var a="moment",b="";this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",b="Z");var c="["+a+'("]',d=0<this.year()&&this.year()<=9999?"YYYY":"YYYYYY",e="-MM-DD[T]HH:mm:ss.SSS",f=b+'[")]';return this.format(c+d+e+f)}function gc(b){b||(b=this.isUtc()?a.defaultFormatUtc:a.defaultFormat);var c=X(this,b);return this.localeData().postformat(c)}function hc(a,b){return this.isValid()&&(s(a)&&a.isValid()||sb(a).isValid())?Ob({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ic(a){return this.from(sb(),a)}function jc(a,b){return this.isValid()&&(s(a)&&a.isValid()||sb(a).isValid())?Ob({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function kc(a){return this.to(sb(),a)}
// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function lc(a){var b;return void 0===a?this._locale._abbr:(b=bb(a),null!=b&&(this._locale=b),this)}function mc(){return this._locale}function nc(a){
// the following switch intentionally omits break keywords
// to utilize falling through the cases.
switch(a=K(a)){case"year":this.month(0);/* falls through */
case"quarter":case"month":this.date(1);/* falls through */
case"week":case"isoWeek":case"day":case"date":this.hours(0);/* falls through */
case"hour":this.minutes(0);/* falls through */
case"minute":this.seconds(0);/* falls through */
case"second":this.milliseconds(0)}
// weeks are a special case
// quarters are also special
return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function oc(a){
// 'date' is an alias for 'day', so it should be considered as such.
return a=K(a),void 0===a||"millisecond"===a?this:("date"===a&&(a="day"),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms"))}function pc(){return this._d.valueOf()-6e4*(this._offset||0)}function qc(){return Math.floor(this.valueOf()/1e3)}function rc(){return new Date(this.valueOf())}function sc(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function tc(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function uc(){
// new Date(NaN).toJSON() === null
return this.isValid()?this.toISOString():null}function vc(){return n(this)}function wc(){return j({},m(this))}function xc(){return m(this).overflow}function yc(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function zc(a,b){U(0,[a,a.length],0,b)}
// MOMENTS
function Ac(a){return Ec.call(this,a,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)}function Bc(a){return Ec.call(this,a,this.isoWeek(),this.isoWeekday(),1,4)}function Cc(){return xa(this.year(),1,4)}function Dc(){var a=this.localeData()._week;return xa(this.year(),a.dow,a.doy)}function Ec(a,b,c,d,e){var f;return null==a?wa(this,d,e).year:(f=xa(a,d,e),b>f&&(b=f),Fc.call(this,a,b,c,d,e))}function Fc(a,b,c,d,e){var f=va(a,b,c,d,e),g=ta(f.year,0,f.dayOfYear);return this.year(g.getUTCFullYear()),this.month(g.getUTCMonth()),this.date(g.getUTCDate()),this}
// MOMENTS
function Gc(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}
// HELPERS
// MOMENTS
function Hc(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function Ic(a,b){b[ge]=u(1e3*("0."+a))}
// MOMENTS
function Jc(){return this._isUTC?"UTC":""}function Kc(){return this._isUTC?"Coordinated Universal Time":""}function Lc(a){return sb(1e3*a)}function Mc(){return sb.apply(null,arguments).parseZone()}function Nc(a){return a}function Oc(a,b,c,d){var e=bb(),f=k().set(d,b);return e[c](f,a)}function Pc(a,b,c){if(f(a)&&(b=a,a=void 0),a=a||"",null!=b)return Oc(a,b,c,"month");var d,e=[];for(d=0;d<12;d++)e[d]=Oc(a,d,c,"month");return e}
// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function Qc(a,b,c,d){"boolean"==typeof a?(f(b)&&(c=b,b=void 0),b=b||""):(b=a,c=b,a=!1,f(b)&&(c=b,b=void 0),b=b||"");var e=bb(),g=a?e._week.dow:0;if(null!=c)return Oc(b,(c+g)%7,d,"day");var h,i=[];for(h=0;h<7;h++)i[h]=Oc(b,(h+g)%7,d,"day");return i}function Rc(a,b){return Pc(a,b,"months")}function Sc(a,b){return Pc(a,b,"monthsShort")}function Tc(a,b,c){return Qc(a,b,c,"weekdays")}function Uc(a,b,c){return Qc(a,b,c,"weekdaysShort")}function Vc(a,b,c){return Qc(a,b,c,"weekdaysMin")}function Wc(){var a=this._data;return this._milliseconds=Ze(this._milliseconds),this._days=Ze(this._days),this._months=Ze(this._months),a.milliseconds=Ze(a.milliseconds),a.seconds=Ze(a.seconds),a.minutes=Ze(a.minutes),a.hours=Ze(a.hours),a.months=Ze(a.months),a.years=Ze(a.years),this}function Xc(a,b,c,d){var e=Ob(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}
// supports only 2.0-style add(1, 's') or add(duration)
function Yc(a,b){return Xc(this,a,b,1)}
// supports only 2.0-style subtract(1, 's') or subtract(duration)
function Zc(a,b){return Xc(this,a,b,-1)}function $c(a){return a<0?Math.floor(a):Math.ceil(a)}function _c(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;
// if we have a mix of positive and negative values, bubble down first
// check: https://github.com/moment/moment/issues/2166
// The following code bubbles up values, see the tests for
// examples of what that means.
// convert days to months
// 12 months -> 1 year
return f>=0&&g>=0&&h>=0||f<=0&&g<=0&&h<=0||(f+=864e5*$c(bd(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=t(f/1e3),i.seconds=a%60,b=t(a/60),i.minutes=b%60,c=t(b/60),i.hours=c%24,g+=t(c/24),e=t(ad(g)),h+=e,g-=$c(bd(e)),d=t(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function ad(a){
// 400 years have 146097 days (taking into account leap year rules)
// 400 years have 12 months === 4800
return 4800*a/146097}function bd(a){
// the reverse of daysToMonths
return 146097*a/4800}function cd(a){var b,c,d=this._milliseconds;if(a=K(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+ad(b),"month"===a?c:c/12;switch(
// handle milliseconds separately because of floating point math errors (issue #1867)
b=this._days+Math.round(bd(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;
// Math.floor prevents floating point math errors here
case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}
// TODO: Use this.as('ms')?
function dd(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*u(this._months/12)}function ed(a){return function(){return this.as(a)}}function fd(a){return a=K(a),this[a+"s"]()}function gd(a){return function(){return this._data[a]}}function hd(){return t(this.days()/7)}
// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function id(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function jd(a,b,c){var d=Ob(a).abs(),e=of(d.as("s")),f=of(d.as("m")),g=of(d.as("h")),h=of(d.as("d")),i=of(d.as("M")),j=of(d.as("y")),k=e<pf.s&&["s",e]||f<=1&&["m"]||f<pf.m&&["mm",f]||g<=1&&["h"]||g<pf.h&&["hh",g]||h<=1&&["d"]||h<pf.d&&["dd",h]||i<=1&&["M"]||i<pf.M&&["MM",i]||j<=1&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,id.apply(null,k)}
// This function allows you to set the rounding function for relative time strings
function kd(a){return void 0===a?of:"function"==typeof a&&(of=a,!0)}
// This function allows you to set a threshold for relative time strings
function ld(a,b){return void 0!==pf[a]&&(void 0===b?pf[a]:(pf[a]=b,!0))}function md(a){var b=this.localeData(),c=jd(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function nd(){
// for ISO strings we do not use the normal bubbling rules:
//  * milliseconds bubble up until they become hours
//  * days do not bubble at all
//  * months bubble up until they become years
// This is because there is no context-free conversion between hours and days
// (think of clock changes)
// and also not between days and months (28-31 days per month)
var a,b,c,d=qf(this._milliseconds)/1e3,e=qf(this._days),f=qf(this._months);
// 3600 seconds -> 60 minutes -> 1 hour
a=t(d/60),b=t(a/60),d%=60,a%=60,
// 12 months -> 1 year
c=t(f/12),f%=12;
// inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(m<0?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var od,pd;pd=Array.prototype.some?Array.prototype.some:function(a){for(var b=Object(this),c=b.length>>>0,d=0;d<c;d++)if(d in b&&a.call(this,b[d],d,b))return!0;return!1};var qd=pd,rd=a.momentProperties=[],sd=!1,td={};a.suppressDeprecationWarnings=!1,a.deprecationHandler=null;var ud;ud=Object.keys?Object.keys:function(a){var b,c=[];for(b in a)i(a,b)&&c.push(b);return c};var vd,wd=ud,xd={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},yd={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},zd="Invalid date",Ad="%d",Bd=/\d{1,2}/,Cd={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Dd={},Ed={},Fd=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Gd=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Hd={},Id={},Jd=/\d/,Kd=/\d\d/,Ld=/\d{3}/,Md=/\d{4}/,Nd=/[+-]?\d{6}/,Od=/\d\d?/,Pd=/\d\d\d\d?/,Qd=/\d\d\d\d\d\d?/,Rd=/\d{1,3}/,Sd=/\d{1,4}/,Td=/[+-]?\d{1,6}/,Ud=/\d+/,Vd=/[+-]?\d+/,Wd=/Z|[+-]\d\d:?\d\d/gi,Xd=/Z|[+-]\d\d(?::?\d\d)?/gi,Yd=/[+-]?\d+(\.\d{1,3})?/,Zd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,$d={},_d={},ae=0,be=1,ce=2,de=3,ee=4,fe=5,ge=6,he=7,ie=8;vd=Array.prototype.indexOf?Array.prototype.indexOf:function(a){
// I know
var b;for(b=0;b<this.length;++b)if(this[b]===a)return b;return-1};var je=vd;
// FORMATTING
U("M",["MM",2],"Mo",function(){return this.month()+1}),U("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),U("MMMM",0,0,function(a){return this.localeData().months(this,a)}),
// ALIASES
J("month","M"),
// PRIORITY
M("month",8),
// PARSING
Z("M",Od),Z("MM",Od,Kd),Z("MMM",function(a,b){return b.monthsShortRegex(a)}),Z("MMMM",function(a,b){return b.monthsRegex(a)}),ba(["M","MM"],function(a,b){b[be]=u(a)-1}),ba(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);
// if we didn't find a month name, mark the date as invalid.
null!=e?b[be]=e:m(c).invalidMonth=a});
// LOCALES
var ke=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,le="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),me="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),ne=Zd,oe=Zd;
// FORMATTING
U("Y",0,0,function(){var a=this.year();return a<=9999?""+a:"+"+a}),U(0,["YY",2],0,function(){return this.year()%100}),U(0,["YYYY",4],0,"year"),U(0,["YYYYY",5],0,"year"),U(0,["YYYYYY",6,!0],0,"year"),
// ALIASES
J("year","y"),
// PRIORITIES
M("year",1),
// PARSING
Z("Y",Vd),Z("YY",Od,Kd),Z("YYYY",Sd,Md),Z("YYYYY",Td,Nd),Z("YYYYYY",Td,Nd),ba(["YYYYY","YYYYYY"],ae),ba("YYYY",function(b,c){c[ae]=2===b.length?a.parseTwoDigitYear(b):u(b)}),ba("YY",function(b,c){c[ae]=a.parseTwoDigitYear(b)}),ba("Y",function(a,b){b[ae]=parseInt(a,10)}),
// HOOKS
a.parseTwoDigitYear=function(a){return u(a)+(u(a)>68?1900:2e3)};
// MOMENTS
var pe=O("FullYear",!0);
// FORMATTING
U("w",["ww",2],"wo","week"),U("W",["WW",2],"Wo","isoWeek"),
// ALIASES
J("week","w"),J("isoWeek","W"),
// PRIORITIES
M("week",5),M("isoWeek",5),
// PARSING
Z("w",Od),Z("ww",Od,Kd),Z("W",Od),Z("WW",Od,Kd),ca(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=u(a)});var qe={dow:0,// Sunday is the first day of the week.
doy:6};
// FORMATTING
U("d",0,"do","day"),U("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),U("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),U("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),U("e",0,0,"weekday"),U("E",0,0,"isoWeekday"),
// ALIASES
J("day","d"),J("weekday","e"),J("isoWeekday","E"),
// PRIORITY
M("day",11),M("weekday",11),M("isoWeekday",11),
// PARSING
Z("d",Od),Z("e",Od),Z("E",Od),Z("dd",function(a,b){return b.weekdaysMinRegex(a)}),Z("ddd",function(a,b){return b.weekdaysShortRegex(a)}),Z("dddd",function(a,b){return b.weekdaysRegex(a)}),ca(["dd","ddd","dddd"],function(a,b,c,d){var e=c._locale.weekdaysParse(a,d,c._strict);
// if we didn't get a weekday name, mark the date as invalid
null!=e?b.d=e:m(c).invalidWeekday=a}),ca(["d","e","E"],function(a,b,c,d){b[d]=u(a)});
// LOCALES
var re="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),se="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),te="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),ue=Zd,ve=Zd,we=Zd;U("H",["HH",2],0,"hour"),U("h",["hh",2],0,Ra),U("k",["kk",2],0,Sa),U("hmm",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)}),U("hmmss",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)+T(this.seconds(),2)}),U("Hmm",0,0,function(){return""+this.hours()+T(this.minutes(),2)}),U("Hmmss",0,0,function(){return""+this.hours()+T(this.minutes(),2)+T(this.seconds(),2)}),Ta("a",!0),Ta("A",!1),
// ALIASES
J("hour","h"),
// PRIORITY
M("hour",13),Z("a",Ua),Z("A",Ua),Z("H",Od),Z("h",Od),Z("HH",Od,Kd),Z("hh",Od,Kd),Z("hmm",Pd),Z("hmmss",Qd),Z("Hmm",Pd),Z("Hmmss",Qd),ba(["H","HH"],de),ba(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),ba(["h","hh"],function(a,b,c){b[de]=u(a),m(c).bigHour=!0}),ba("hmm",function(a,b,c){var d=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d)),m(c).bigHour=!0}),ba("hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d,2)),b[fe]=u(a.substr(e)),m(c).bigHour=!0}),ba("Hmm",function(a,b,c){var d=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d))}),ba("Hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d,2)),b[fe]=u(a.substr(e))});var xe,ye=/[ap]\.?m?\.?/i,ze=O("Hours",!0),Ae={calendar:xd,longDateFormat:yd,invalidDate:zd,ordinal:Ad,ordinalParse:Bd,relativeTime:Cd,months:le,monthsShort:me,week:qe,weekdays:re,weekdaysMin:te,weekdaysShort:se,meridiemParse:ye},Be={},Ce={},De=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ee=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Fe=/Z|[+-]\d\d(?::?\d\d)?/,Ge=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],
// YYYYMM is NOT allowed by the standard
["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],He=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Ie=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=x("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),
// constant that refers to the ISO standard
a.ISO_8601=function(){};var Je=x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=sb.apply(null,arguments);return this.isValid()&&a.isValid()?a<this?this:a:o()}),Ke=x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=sb.apply(null,arguments);return this.isValid()&&a.isValid()?a>this?this:a:o()}),Le=function(){return Date.now?Date.now():+new Date};zb("Z",":"),zb("ZZ",""),
// PARSING
Z("Z",Xd),Z("ZZ",Xd),ba(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Ab(Xd,a)});
// HELPERS
// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var Me=/([\+\-]|\d\d)/gi;
// HOOKS
// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
a.updateOffset=function(){};
// ASP.NET json date format regex
var Ne=/^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,Oe=/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;Ob.fn=wb.prototype;var Pe=Sb(1,"add"),Qe=Sb(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",a.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Re=x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});
// FORMATTING
U(0,["gg",2],0,function(){return this.weekYear()%100}),U(0,["GG",2],0,function(){return this.isoWeekYear()%100}),zc("gggg","weekYear"),zc("ggggg","weekYear"),zc("GGGG","isoWeekYear"),zc("GGGGG","isoWeekYear"),
// ALIASES
J("weekYear","gg"),J("isoWeekYear","GG"),
// PRIORITY
M("weekYear",1),M("isoWeekYear",1),
// PARSING
Z("G",Vd),Z("g",Vd),Z("GG",Od,Kd),Z("gg",Od,Kd),Z("GGGG",Sd,Md),Z("gggg",Sd,Md),Z("GGGGG",Td,Nd),Z("ggggg",Td,Nd),ca(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=u(a)}),ca(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),
// FORMATTING
U("Q",0,"Qo","quarter"),
// ALIASES
J("quarter","Q"),
// PRIORITY
M("quarter",7),
// PARSING
Z("Q",Jd),ba("Q",function(a,b){b[be]=3*(u(a)-1)}),
// FORMATTING
U("D",["DD",2],"Do","date"),
// ALIASES
J("date","D"),
// PRIOROITY
M("date",9),
// PARSING
Z("D",Od),Z("DD",Od,Kd),Z("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),ba(["D","DD"],ce),ba("Do",function(a,b){b[ce]=u(a.match(Od)[0],10)});
// MOMENTS
var Se=O("Date",!0);
// FORMATTING
U("DDD",["DDDD",3],"DDDo","dayOfYear"),
// ALIASES
J("dayOfYear","DDD"),
// PRIORITY
M("dayOfYear",4),
// PARSING
Z("DDD",Rd),Z("DDDD",Ld),ba(["DDD","DDDD"],function(a,b,c){c._dayOfYear=u(a)}),
// FORMATTING
U("m",["mm",2],0,"minute"),
// ALIASES
J("minute","m"),
// PRIORITY
M("minute",14),
// PARSING
Z("m",Od),Z("mm",Od,Kd),ba(["m","mm"],ee);
// MOMENTS
var Te=O("Minutes",!1);
// FORMATTING
U("s",["ss",2],0,"second"),
// ALIASES
J("second","s"),
// PRIORITY
M("second",15),
// PARSING
Z("s",Od),Z("ss",Od,Kd),ba(["s","ss"],fe);
// MOMENTS
var Ue=O("Seconds",!1);
// FORMATTING
U("S",0,0,function(){return~~(this.millisecond()/100)}),U(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),U(0,["SSS",3],0,"millisecond"),U(0,["SSSS",4],0,function(){return 10*this.millisecond()}),U(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),U(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),U(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),U(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),U(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),
// ALIASES
J("millisecond","ms"),
// PRIORITY
M("millisecond",16),
// PARSING
Z("S",Rd,Jd),Z("SS",Rd,Kd),Z("SSS",Rd,Ld);var Ve;for(Ve="SSSS";Ve.length<=9;Ve+="S")Z(Ve,Ud);for(Ve="S";Ve.length<=9;Ve+="S")ba(Ve,Ic);
// MOMENTS
var We=O("Milliseconds",!1);
// FORMATTING
U("z",0,0,"zoneAbbr"),U("zz",0,0,"zoneName");var Xe=r.prototype;Xe.add=Pe,Xe.calendar=Vb,Xe.clone=Wb,Xe.diff=bc,Xe.endOf=oc,Xe.format=gc,Xe.from=hc,Xe.fromNow=ic,Xe.to=jc,Xe.toNow=kc,Xe.get=R,Xe.invalidAt=xc,Xe.isAfter=Xb,Xe.isBefore=Yb,Xe.isBetween=Zb,Xe.isSame=$b,Xe.isSameOrAfter=_b,Xe.isSameOrBefore=ac,Xe.isValid=vc,Xe.lang=Re,Xe.locale=lc,Xe.localeData=mc,Xe.max=Ke,Xe.min=Je,Xe.parsingFlags=wc,Xe.set=S,Xe.startOf=nc,Xe.subtract=Qe,Xe.toArray=sc,Xe.toObject=tc,Xe.toDate=rc,Xe.toISOString=ec,Xe.inspect=fc,Xe.toJSON=uc,Xe.toString=dc,Xe.unix=qc,Xe.valueOf=pc,Xe.creationData=yc,
// Year
Xe.year=pe,Xe.isLeapYear=ra,
// Week Year
Xe.weekYear=Ac,Xe.isoWeekYear=Bc,
// Quarter
Xe.quarter=Xe.quarters=Gc,
// Month
Xe.month=ka,Xe.daysInMonth=la,
// Week
Xe.week=Xe.weeks=Ba,Xe.isoWeek=Xe.isoWeeks=Ca,Xe.weeksInYear=Dc,Xe.isoWeeksInYear=Cc,
// Day
Xe.date=Se,Xe.day=Xe.days=Ka,Xe.weekday=La,Xe.isoWeekday=Ma,Xe.dayOfYear=Hc,
// Hour
Xe.hour=Xe.hours=ze,
// Minute
Xe.minute=Xe.minutes=Te,
// Second
Xe.second=Xe.seconds=Ue,
// Millisecond
Xe.millisecond=Xe.milliseconds=We,
// Offset
Xe.utcOffset=Db,Xe.utc=Fb,Xe.local=Gb,Xe.parseZone=Hb,Xe.hasAlignedHourOffset=Ib,Xe.isDST=Jb,Xe.isLocal=Lb,Xe.isUtcOffset=Mb,Xe.isUtc=Nb,Xe.isUTC=Nb,
// Timezone
Xe.zoneAbbr=Jc,Xe.zoneName=Kc,
// Deprecations
Xe.dates=x("dates accessor is deprecated. Use date instead.",Se),Xe.months=x("months accessor is deprecated. Use month instead",ka),Xe.years=x("years accessor is deprecated. Use year instead",pe),Xe.zone=x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",Eb),Xe.isDSTShifted=x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Kb);var Ye=C.prototype;Ye.calendar=D,Ye.longDateFormat=E,Ye.invalidDate=F,Ye.ordinal=G,Ye.preparse=Nc,Ye.postformat=Nc,Ye.relativeTime=H,Ye.pastFuture=I,Ye.set=A,
// Month
Ye.months=fa,Ye.monthsShort=ga,Ye.monthsParse=ia,Ye.monthsRegex=na,Ye.monthsShortRegex=ma,
// Week
Ye.week=ya,Ye.firstDayOfYear=Aa,Ye.firstDayOfWeek=za,
// Day of Week
Ye.weekdays=Fa,Ye.weekdaysMin=Ha,Ye.weekdaysShort=Ga,Ye.weekdaysParse=Ja,Ye.weekdaysRegex=Na,Ye.weekdaysShortRegex=Oa,Ye.weekdaysMinRegex=Pa,
// Hours
Ye.isPM=Va,Ye.meridiem=Wa,$a("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===u(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),
// Side effect imports
a.lang=x("moment.lang is deprecated. Use moment.locale instead.",$a),a.langData=x("moment.langData is deprecated. Use moment.localeData instead.",bb);var Ze=Math.abs,$e=ed("ms"),_e=ed("s"),af=ed("m"),bf=ed("h"),cf=ed("d"),df=ed("w"),ef=ed("M"),ff=ed("y"),gf=gd("milliseconds"),hf=gd("seconds"),jf=gd("minutes"),kf=gd("hours"),lf=gd("days"),mf=gd("months"),nf=gd("years"),of=Math.round,pf={s:45,// seconds to minute
m:45,// minutes to hour
h:22,// hours to day
d:26,// days to month
M:11},qf=Math.abs,rf=wb.prototype;
// Deprecations
// Side effect imports
// FORMATTING
// PARSING
// Side effect imports
return rf.abs=Wc,rf.add=Yc,rf.subtract=Zc,rf.as=cd,rf.asMilliseconds=$e,rf.asSeconds=_e,rf.asMinutes=af,rf.asHours=bf,rf.asDays=cf,rf.asWeeks=df,rf.asMonths=ef,rf.asYears=ff,rf.valueOf=dd,rf._bubble=_c,rf.get=fd,rf.milliseconds=gf,rf.seconds=hf,rf.minutes=jf,rf.hours=kf,rf.days=lf,rf.weeks=hd,rf.months=mf,rf.years=nf,rf.humanize=md,rf.toISOString=nd,rf.toString=nd,rf.toJSON=nd,rf.locale=lc,rf.localeData=mc,rf.toIsoString=x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",nd),rf.lang=Re,U("X",0,0,"unix"),U("x",0,0,"valueOf"),Z("x",Vd),Z("X",Yd),ba("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),ba("x",function(a,b,c){c._d=new Date(u(a))}),a.version="2.17.1",b(sb),a.fn=Xe,a.min=ub,a.max=vb,a.now=Le,a.utc=k,a.unix=Lc,a.months=Rc,a.isDate=g,a.locale=$a,a.invalid=o,a.duration=Ob,a.isMoment=s,a.weekdays=Tc,a.parseZone=Mc,a.localeData=bb,a.isDuration=xb,a.monthsShort=Sc,a.weekdaysMin=Vc,a.defineLocale=_a,a.updateLocale=ab,a.locales=cb,a.weekdaysShort=Uc,a.normalizeUnits=K,a.relativeTimeRounding=kd,a.relativeTimeThreshold=ld,a.calendarFormat=Ub,a.prototype=Xe,a});
/**
 * BxSlider v4.1.2 - Fully loaded, responsive content slider
 * http://bxslider.com
 *
 * Copyright 2014, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
 * Written while drinking Belgian ales and listening to jazz
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

;(function($){

    var plugin = {};

    var defaults = {

        // GENERAL
        mode: 'horizontal',
        slideSelector: '',
        infiniteLoop: true,
        hideControlOnEnd: false,
        speed: 500,
        easing: null,
        slideMargin: 0,
        startSlide: 0,
        randomStart: false,
        captions: false,
        ticker: false,
        tickerHover: false,
        adaptiveHeight: false,
        adaptiveHeightSpeed: 500,
        video: false,
        useCSS: true,
        preloadImages: 'visible',
        responsive: true,
        slideZIndex: 50,
        wrapperClass: 'bx-wrapper',

        // TOUCH
        touchEnabled: true,
        swipeThreshold: 50,
        oneToOneTouch: true,
        preventDefaultSwipeX: true,
        preventDefaultSwipeY: false,

        // PAGER
        pager: true,
        pagerType: 'full',
        pagerShortSeparator: ' / ',
        pagerSelector: null,
        buildPager: null,
        pagerCustom: null,

        // CONTROLS
        controls: true,
        nextText: 'Next',
        prevText: 'Prev',
        nextSelector: null,
        prevSelector: null,
        autoControls: false,
        startText: 'Start',
        stopText: 'Stop',
        autoControlsCombine: false,
        autoControlsSelector: null,

        // AUTO
        auto: false,
        pause: 4000,
        autoStart: true,
        autoDirection: 'next',
        autoHover: false,
        autoDelay: 0,
        autoSlideForOnePage: false,

        // CAROUSEL
        minSlides: 1,
        maxSlides: 1,
        moveSlides: 0,
        slideWidth: 0,

        // CALLBACKS
        onSliderLoad: function() {},
        onSlideBefore: function() {},
        onSlideAfter: function() {},
        onSlideNext: function() {},
        onSlidePrev: function() {},
        onSliderResize: function() {}
    }

    $.fn.bxSlider = function(options){

        if(this.length == 0) return this;

        // support mutltiple elements
        if(this.length > 1){
            this.each(function(){$(this).bxSlider(options)});
            return this;
        }

        // create a namespace to be used throughout the plugin
        var slider = {};
        // set a reference to our slider element
        var el = this;
        plugin.el = this;

        /**
         * Makes slideshow responsive
         */
            // first get the original window dimens (thanks alot IE)
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();



        /**
         * ===================================================================================
         * = PRIVATE FUNCTIONS
         * ===================================================================================
         */

        /**
         * Initializes namespace settings to be used throughout plugin
         */
        var init = function(){
            // merge user-supplied options with the defaults
            slider.settings = $.extend({}, defaults, options);
            // parse slideWidth setting
            slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
            // store the original children
            slider.children = el.children(slider.settings.slideSelector);
            // check if actual number of slides is less than minSlides / maxSlides
            if(slider.children.length < slider.settings.minSlides) slider.settings.minSlides = slider.children.length;
            if(slider.children.length < slider.settings.maxSlides) slider.settings.maxSlides = slider.children.length;
            // if random start, set the startSlide setting to random number
            if(slider.settings.randomStart) slider.settings.startSlide = Math.floor(Math.random() * slider.children.length);
            // store active slide information
            slider.active = { index: slider.settings.startSlide }
            // store if the slider is in carousel mode (displaying / moving multiple slides)
            slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
            // if carousel, force preloadImages = 'all'
            if(slider.carousel) slider.settings.preloadImages = 'all';
            // calculate the min / max width thresholds based on min / max number of slides
            // used to setup and update carousel slides dimensions
            slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
            slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
            // store the current state of the slider (if currently animating, working is true)
            slider.working = false;
            // initialize the controls object
            slider.controls = {};
            // initialize an auto interval
            slider.interval = null;
            // determine which property to use for transitions
            slider.animProp = slider.settings.mode == 'vertical' ? 'top' : 'left';
            // determine if hardware acceleration can be used
            slider.usingCSS = slider.settings.useCSS && slider.settings.mode != 'fade' && (function(){
                // create our test div element
                var div = document.createElement('div');
                // css transition properties
                var props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
                // test for each property
                for(var i in props){
                    if(div.style[props[i]] !== undefined){
                        slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
                        slider.animProp = '-' + slider.cssPrefix + '-transform';
                        return true;
                    }
                }
                return false;
            }());
            // if vertical mode always make maxSlides and minSlides equal
            if(slider.settings.mode == 'vertical') slider.settings.maxSlides = slider.settings.minSlides;
            // save original style data
            el.data("origStyle", el.attr("style"));
            el.children(slider.settings.slideSelector).each(function() {
                $(this).data("origStyle", $(this).attr("style"));
            });
            // perform all DOM / CSS modifications
            setup();
        }

        /**
         * Performs all DOM and CSS modifications
         */
        var setup = function(){
            // wrap el in a wrapper
            el.wrap('<div class="' + slider.settings.wrapperClass + '"><div class="bx-viewport"></div></div>');
            // store a namspace reference to .bx-viewport
            slider.viewport = el.parent();
            // add a loading div to display while images are loading
            slider.loader = $('<div class="bx-loading" />');
            slider.viewport.prepend(slider.loader);
            // set el to a massive width, to hold any needed slides
            // also strip any margin and padding from el
            el.css({
                width: slider.settings.mode == 'horizontal' ? (slider.children.length * 100 + 215) + '%' : 'auto',
                position: 'relative'
            });
            // if using CSS, add the easing property
            if(slider.usingCSS && slider.settings.easing){
                el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
                // if not using CSS and no easing value was supplied, use the default JS animation easing (swing)
            }else if(!slider.settings.easing){
                slider.settings.easing = 'swing';
            }
            var slidesShowing = getNumberSlidesShowing();
            // make modifications to the viewport (.bx-viewport)
            slider.viewport.css({
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                background: '#f7f7f7'
            });
            slider.viewport.parent().css({
                maxWidth: getViewportMaxWidth()
            });
            // make modification to the wrapper (.bx-wrapper)
            if(!slider.settings.pager) {
                slider.viewport.parent().css({
                    margin: '0 auto 0px'
                });
            }
            // apply css to all slider children
            slider.children.css({
                'float': slider.settings.mode == 'horizontal' ? 'left' : 'none',
                listStyle: 'none',
                position: 'relative'
            });
            // apply the calculated width after the float is applied to prevent scrollbar interference
            slider.children.css('width', getSlideWidth());
            // if slideMargin is supplied, add the css
            if(slider.settings.mode == 'horizontal' && slider.settings.slideMargin > 0) slider.children.css('marginRight', slider.settings.slideMargin);
            if(slider.settings.mode == 'vertical' && slider.settings.slideMargin > 0) slider.children.css('marginBottom', slider.settings.slideMargin);
            // if "fade" mode, add positioning and z-index CSS
            if(slider.settings.mode == 'fade'){
                slider.children.css({
                    position: 'absolute',
                    zIndex: 0,
                    display: 'none'
                });
                // prepare the z-index on the showing element
                slider.children.eq(slider.settings.startSlide).css({zIndex: slider.settings.slideZIndex, display: 'block'});
            }
            // create an element to contain all slider controls (pager, start / stop, etc)
            slider.controls.el = $('<div class="bx-controls" />');
            // if captions are requested, add them
            if(slider.settings.captions) appendCaptions();
            // check if startSlide is last slide
            slider.active.last = slider.settings.startSlide == getPagerQty() - 1;
            // if video is true, set up the fitVids plugin
            if(slider.settings.video) el.fitVids();
            // set the default preload selector (visible)
            var preloadSelector = slider.children.eq(slider.settings.startSlide);
            if (slider.settings.preloadImages == "all") preloadSelector = slider.children;
            // only check for control addition if not in "ticker" mode
            if(!slider.settings.ticker){
                // if pager is requested, add it
                if(slider.settings.pager) appendPager();
                // if controls are requested, add them
                if(slider.settings.controls) appendControls();
                // if auto is true, and auto controls are requested, add them
                if(slider.settings.auto && slider.settings.autoControls) appendControlsAuto();
                // if any control option is requested, add the controls wrapper
                if(slider.settings.controls || slider.settings.autoControls || slider.settings.pager) slider.viewport.after(slider.controls.el);
                // if ticker mode, do not allow a pager
            }else{
                slider.settings.pager = false;
            }
            // preload all images, then perform final DOM / CSS modifications that depend on images being loaded
            loadElements(preloadSelector, start);
        }

        var loadElements = function(selector, callback){
            var total = selector.find('img, iframe').length;
            if (total == 0){
                callback();
                return;
            }
            var count = 0;
            selector.find('img, iframe').each(function(){
                $(this).one('load', function() {
                    if(++count == total) callback();
                }).each(function() {
                    if(this.complete) $(this).load();
                });
            });
        }

        /**
         * Start the slider
         */
        var start = function(){
            // if infinite loop, prepare additional slides
            if(slider.settings.infiniteLoop && slider.settings.mode != 'fade' && !slider.settings.ticker){
                var slice = slider.settings.mode == 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides;
                var sliceAppend = slider.children.slice(0, slice).clone().addClass('bx-clone');
                var slicePrepend = slider.children.slice(-slice).clone().addClass('bx-clone');
                el.append(sliceAppend).prepend(slicePrepend);
            }
            // remove the loading DOM element
            slider.loader.remove();
            // set the left / top position of "el"
            setSlidePosition();
            // if "vertical" mode, always use adaptiveHeight to prevent odd behavior
            if (slider.settings.mode == 'vertical') slider.settings.adaptiveHeight = true;
            // set the viewport height
            slider.viewport.height(getViewportHeight());
            // make sure everything is positioned just right (same as a window resize)
            el.redrawSlider();
            // onSliderLoad callback
            slider.settings.onSliderLoad(slider.active.index);
            // slider has been fully initialized
            slider.initialized = true;
            // bind the resize call to the window
            if (slider.settings.responsive) $(window).bind('resize', resizeWindow);
            // if auto is true and has more than 1 page, start the show
            if (slider.settings.auto && slider.settings.autoStart && (getPagerQty() > 1 || slider.settings.autoSlideForOnePage)) initAuto();
            // if ticker is true, start the ticker
            if (slider.settings.ticker) initTicker();
            // if pager is requested, make the appropriate pager link active
            if (slider.settings.pager) updatePagerActive(slider.settings.startSlide);
            // check for any updates to the controls (like hideControlOnEnd updates)
            if (slider.settings.controls) updateDirectionControls();
            // if touchEnabled is true, setup the touch events
            if (slider.settings.touchEnabled && !slider.settings.ticker) initTouch();
        }

        /**
         * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
         */
        var getViewportHeight = function(){
            var height = 0;
            // first determine which children (slides) should be used in our height calculation
            var children = $();
            // if mode is not "vertical" and adaptiveHeight is false, include all children
            if(slider.settings.mode != 'vertical' && !slider.settings.adaptiveHeight){
                children = slider.children;
            }else{
                // if not carousel, return the single active child
                if(!slider.carousel){
                    children = slider.children.eq(slider.active.index);
                    // if carousel, return a slice of children
                }else{
                    // get the individual slide index
                    var currentIndex = slider.settings.moveSlides == 1 ? slider.active.index : slider.active.index * getMoveBy();
                    // add the current slide to the children
                    children = slider.children.eq(currentIndex);
                    // cycle through the remaining "showing" slides
                    for (i = 1; i <= slider.settings.maxSlides - 1; i++){
                        // if looped back to the start
                        if(currentIndex + i >= slider.children.length){
                            children = children.add(slider.children.eq(i - 1));
                        }else{
                            children = children.add(slider.children.eq(currentIndex + i));
                        }
                    }
                }
            }
            // if "vertical" mode, calculate the sum of the heights of the children
            if(slider.settings.mode == 'vertical'){
                children.each(function(index) {
                    height += $(this).outerHeight();
                });
                // add user-supplied margins
                if(slider.settings.slideMargin > 0){
                    height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
                }
                // if not "vertical" mode, calculate the max height of the children
            }else{
                height = Math.max.apply(Math, children.map(function(){
                    return $(this).outerHeight(false);
                }).get());
            }

            if(slider.viewport.css('box-sizing') == 'border-box'){
                height +=	parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom')) +
                    parseFloat(slider.viewport.css('border-top-width')) + parseFloat(slider.viewport.css('border-bottom-width'));
            }else if(slider.viewport.css('box-sizing') == 'padding-box'){
                height +=	parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom'));
            }

            return height;
        }

        /**
         * Returns the calculated width to be used for the outer wrapper / viewport
         */
        var getViewportMaxWidth = function(){
            var width = '100%';
            if(slider.settings.slideWidth > 0){
                if(slider.settings.mode == 'horizontal'){
                    width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
                }else{
                    width = slider.settings.slideWidth;
                }
            }
            return width;
        }

        /**
         * Returns the calculated width to be applied to each slide
         */
        var getSlideWidth = function(){
            // start with any user-supplied slide width
            var newElWidth = slider.settings.slideWidth;
            // get the current viewport width
            var wrapWidth = slider.viewport.width();
            // if slide width was not supplied, or is larger than the viewport use the viewport width
            if(slider.settings.slideWidth == 0 ||
                (slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
                slider.settings.mode == 'vertical'){
                newElWidth = wrapWidth;
                // if carousel, use the thresholds to determine the width
            }else if(slider.settings.maxSlides > 1 && slider.settings.mode == 'horizontal'){
                if(wrapWidth > slider.maxThreshold){
                    // newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.maxSlides - 1))) / slider.settings.maxSlides;
                }else if(wrapWidth < slider.minThreshold){
                    newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
                }
            }
            return newElWidth;
        }

        /**
         * Returns the number of slides currently visible in the viewport (includes partially visible slides)
         */
        var getNumberSlidesShowing = function(){
            var slidesShowing = 1;
            if(slider.settings.mode == 'horizontal' && slider.settings.slideWidth > 0){
                // if viewport is smaller than minThreshold, return minSlides
                if(slider.viewport.width() < slider.minThreshold){
                    slidesShowing = slider.settings.minSlides;
                    // if viewport is larger than minThreshold, return maxSlides
                }else if(slider.viewport.width() > slider.maxThreshold){
                    slidesShowing = slider.settings.maxSlides;
                    // if viewport is between min / max thresholds, divide viewport width by first child width
                }else{
                    var childWidth = slider.children.first().width() + slider.settings.slideMargin;
                    slidesShowing = Math.floor((slider.viewport.width() +
                        slider.settings.slideMargin) / childWidth);
                }
                // if "vertical" mode, slides showing will always be minSlides
            }else if(slider.settings.mode == 'vertical'){
                slidesShowing = slider.settings.minSlides;
            }
            return slidesShowing;
        }

        /**
         * Returns the number of pages (one full viewport of slides is one "page")
         */
        var getPagerQty = function(){
            var pagerQty = 0;
            // if moveSlides is specified by the user
            if(slider.settings.moveSlides > 0){
                if(slider.settings.infiniteLoop){
                    pagerQty = Math.ceil(slider.children.length / getMoveBy());
                }else{
                    // use a while loop to determine pages
                    var breakPoint = 0;
                    var counter = 0
                    // when breakpoint goes above children length, counter is the number of pages
                    while (breakPoint < slider.children.length){
                        ++pagerQty;
                        breakPoint = counter + getNumberSlidesShowing();
                        counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
                    }
                }
                // if moveSlides is 0 (auto) divide children length by sides showing, then round up
            }else{
                pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
            }
            return pagerQty;
        }

        /**
         * Returns the number of indivual slides by which to shift the slider
         */
        var getMoveBy = function(){
            // if moveSlides was set by the user and moveSlides is less than number of slides showing
            if(slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()){
                return slider.settings.moveSlides;
            }
            // if moveSlides is 0 (auto)
            return getNumberSlidesShowing();
        }

        /**
         * Sets the slider's (el) left or top position
         */
        var setSlidePosition = function(){
            // if last slide, not infinite loop, and number of children is larger than specified maxSlides
            if(slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop){
                if (slider.settings.mode == 'horizontal'){
                    // get the last child's position
                    var lastChild = slider.children.last();
                    var position = lastChild.position();
                    // set the left position
                    setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.outerWidth())), 'reset', 0);
                }else if(slider.settings.mode == 'vertical'){
                    // get the last showing index's position
                    var lastShowingIndex = slider.children.length - slider.settings.minSlides;
                    var position = slider.children.eq(lastShowingIndex).position();
                    // set the top position
                    setPositionProperty(-position.top, 'reset', 0);
                }
                // if not last slide
            }else{
                // get the position of the first showing slide
                var position = slider.children.eq(slider.active.index * getMoveBy()).position();
                // check for last slide
                if (slider.active.index == getPagerQty() - 1) slider.active.last = true;
                // set the repective position
                if (position != undefined){
                    if (slider.settings.mode == 'horizontal') setPositionProperty(-position.left, 'reset', 0);
                    else if (slider.settings.mode == 'vertical') setPositionProperty(-position.top, 'reset', 0);
                }
            }
        }

        /**
         * Sets the el's animating property position (which in turn will sometimes animate el).
         * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
         *
         * @param value (int)
         *  - the animating property's value
         *
         * @param type (string) 'slider', 'reset', 'ticker'
         *  - the type of instance for which the function is being
         *
         * @param duration (int)
         *  - the amount of time (in ms) the transition should occupy
         *
         * @param params (array) optional
         *  - an optional parameter containing any variables that need to be passed in
         */
        var setPositionProperty = function(value, type, duration, params){
            // use CSS transform
            if(slider.usingCSS){
                // determine the translate3d value
                var propValue = slider.settings.mode == 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
                // add the CSS transition-duration
                el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
                if(type == 'slide'){
                    // set the property value
                    el.css(slider.animProp, propValue);
                    // bind a callback method - executes when CSS transition completes
                    el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
                        // unbind the callback
                        el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
                        updateAfterSlideTransition();
                    });
                }else if(type == 'reset'){
                    el.css(slider.animProp, propValue);
                }else if(type == 'ticker'){
                    // make the transition use 'linear'
                    el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
                    el.css(slider.animProp, propValue);
                    // bind a callback method - executes when CSS transition completes
                    el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
                        // unbind the callback
                        el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
                        // reset the position
                        setPositionProperty(params['resetValue'], 'reset', 0);
                        // start the loop again
                        tickerLoop();
                    });
                }
                // use JS animate
            }else{
                var animateObj = {};
                animateObj[slider.animProp] = value;
                if(type == 'slide'){
                    el.animate(animateObj, duration, slider.settings.easing, function(){
                        updateAfterSlideTransition();
                    });
                }else if(type == 'reset'){
                    el.css(slider.animProp, value)
                }else if(type == 'ticker'){
                    el.animate(animateObj, speed, 'linear', function(){
                        setPositionProperty(params['resetValue'], 'reset', 0);
                        // run the recursive loop after animation
                        tickerLoop();
                    });
                }
            }
        }

        /**
         * Populates the pager with proper amount of pages
         */
        var populatePager = function(){
            var pagerHtml = '';
            var pagerQty = getPagerQty();
            // loop through each pager item
            for(var i=0; i < pagerQty; i++){
                var linkContent = '';
                // if a buildPager function is supplied, use it to get pager link value, else use index + 1
                if(slider.settings.buildPager && $.isFunction(slider.settings.buildPager)){
                    linkContent = slider.settings.buildPager(i);
                    slider.pagerEl.addClass('bx-custom-pager');
                }else{
                    linkContent = i + 1;
                    slider.pagerEl.addClass('bx-default-pager');
                }
                // var linkContent = slider.settings.buildPager && $.isFunction(slider.settings.buildPager) ? slider.settings.buildPager(i) : i + 1;
                // add the markup to the string
                pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
            };
            // populate the pager element with pager links
            slider.pagerEl.html(pagerHtml);
        }

        /**
         * Appends the pager to the controls element
         */
        var appendPager = function(){
            if(!slider.settings.pagerCustom){
                // create the pager DOM element
                slider.pagerEl = $('<div class="bx-pager" />');
                // if a pager selector was supplied, populate it with the pager
                if(slider.settings.pagerSelector){
                    $(slider.settings.pagerSelector).html(slider.pagerEl);
                    // if no pager selector was supplied, add it after the wrapper
                }else{
                    slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
                }
                // populate the pager
                populatePager();
            }else{
                slider.pagerEl = $(slider.settings.pagerCustom);
            }
            // assign the pager click binding
            slider.pagerEl.on('click', 'a', clickPagerBind);
        }

        /**
         * Appends prev / next controls to the controls element
         */
        var appendControls = function(){
            slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
            slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
            // bind click actions to the controls
            slider.controls.next.bind('click', clickNextBind);
            slider.controls.prev.bind('click', clickPrevBind);
            // if nextSlector was supplied, populate it
            if(slider.settings.nextSelector){
                $(slider.settings.nextSelector).append(slider.controls.next);
            }
            // if prevSlector was supplied, populate it
            if(slider.settings.prevSelector){
                $(slider.settings.prevSelector).append(slider.controls.prev);
            }
            // if no custom selectors were supplied
            if(!slider.settings.nextSelector && !slider.settings.prevSelector){
                // add the controls to the DOM
                slider.controls.directionEl = $('<div class="bx-controls-direction" />');
                // add the control elements to the directionEl
                slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
                // slider.viewport.append(slider.controls.directionEl);
                slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
            }
        }

        /**
         * Appends start / stop auto controls to the controls element
         */
        var appendControlsAuto = function(){
            slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
            slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
            // add the controls to the DOM
            slider.controls.autoEl = $('<div class="bx-controls-auto" />');
            // bind click actions to the controls
            slider.controls.autoEl.on('click', '.bx-start', clickStartBind);
            slider.controls.autoEl.on('click', '.bx-stop', clickStopBind);
            // if autoControlsCombine, insert only the "start" control
            if(slider.settings.autoControlsCombine){
                slider.controls.autoEl.append(slider.controls.start);
                // if autoControlsCombine is false, insert both controls
            }else{
                slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
            }
            // if auto controls selector was supplied, populate it with the controls
            if(slider.settings.autoControlsSelector){
                $(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
                // if auto controls selector was not supplied, add it after the wrapper
            }else{
                slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
            }
            // update the auto controls
            updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
        }

        /**
         * Appends image captions to the DOM
         */
        var appendCaptions = function(){
            // cycle through each child
            slider.children.each(function(index){
                // get the image title attribute
                var title = $(this).find('img:first').attr('title');
                // append the caption
                if (title != undefined && ('' + title).length) {
                    $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
                }
            });
        }

        /**
         * Click next binding
         *
         * @param e (event)
         *  - DOM event object
         */
        var clickNextBind = function(e){
            // if auto show is running, stop it
            if (slider.settings.auto) el.stopAuto();
            el.goToNextSlide();
            e.preventDefault();
        }

        /**
         * Click prev binding
         *
         * @param e (event)
         *  - DOM event object
         */
        var clickPrevBind = function(e){
            // if auto show is running, stop it
            if (slider.settings.auto) el.stopAuto();
            el.goToPrevSlide();
            e.preventDefault();
        }

        /**
         * Click start binding
         *
         * @param e (event)
         *  - DOM event object
         */
        var clickStartBind = function(e){
            el.startAuto();
            e.preventDefault();
        }

        /**
         * Click stop binding
         *
         * @param e (event)
         *  - DOM event object
         */
        var clickStopBind = function(e){
            el.stopAuto();
            e.preventDefault();
        }

        /**
         * Click pager binding
         *
         * @param e (event)
         *  - DOM event object
         */
        var clickPagerBind = function(e){
            // if auto show is running, stop it
            if (slider.settings.auto) el.stopAuto();
            var pagerLink = $(e.currentTarget);
            if(pagerLink.attr('data-slide-index') !== undefined){
                var pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
                // if clicked pager link is not active, continue with the goToSlide call
                if(pagerIndex != slider.active.index) el.goToSlide(pagerIndex);
                e.preventDefault();
            }
        }

        /**
         * Updates the pager links with an active class
         *
         * @param slideIndex (int)
         *  - index of slide to make active
         */
        var updatePagerActive = function(slideIndex){
            // if "short" pager type
            var len = slider.children.length; // nb of children
            if(slider.settings.pagerType == 'short'){
                if(slider.settings.maxSlides > 1) {
                    len = Math.ceil(slider.children.length/slider.settings.maxSlides);
                }
                slider.pagerEl.html( (slideIndex + 1) + slider.settings.pagerShortSeparator + len);
                return;
            }
            // remove all pager active classes
            slider.pagerEl.find('a').removeClass('active');
            // apply the active class for all pagers
            slider.pagerEl.each(function(i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
        }

        /**
         * Performs needed actions after a slide transition
         */
        var updateAfterSlideTransition = function(){
            // if infinte loop is true
            if(slider.settings.infiniteLoop){
                var position = '';
                // first slide
                if(slider.active.index == 0){
                    // set the new position
                    position = slider.children.eq(0).position();
                    // carousel, last slide
                }else if(slider.active.index == getPagerQty() - 1 && slider.carousel){
                    position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
                    // last slide
                }else if(slider.active.index == slider.children.length - 1){
                    position = slider.children.eq(slider.children.length - 1).position();
                }
                if(position){
                    if (slider.settings.mode == 'horizontal') { setPositionProperty(-position.left, 'reset', 0); }
                    else if (slider.settings.mode == 'vertical') { setPositionProperty(-position.top, 'reset', 0); }
                }
            }
            // declare that the transition is complete
            slider.working = false;
            // onSlideAfter callback
            slider.settings.onSlideAfter(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
        }

        /**
         * Updates the auto controls state (either active, or combined switch)
         *
         * @param state (string) "start", "stop"
         *  - the new state of the auto show
         */
        var updateAutoControls = function(state){
            // if autoControlsCombine is true, replace the current control with the new state
            if(slider.settings.autoControlsCombine){
                slider.controls.autoEl.html(slider.controls[state]);
                // if autoControlsCombine is false, apply the "active" class to the appropriate control
            }else{
                slider.controls.autoEl.find('a').removeClass('active');
                slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
            }
        }

        /**
         * Updates the direction controls (checks if either should be hidden)
         */
        var updateDirectionControls = function(){
            if(getPagerQty() == 1){
                slider.controls.prev.addClass('disabled');
                slider.controls.next.addClass('disabled');
            }else if(!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd){
                // if first slide
                if (slider.active.index == 0){
                    slider.controls.prev.addClass('disabled');
                    slider.controls.next.removeClass('disabled');
                    // if last slide
                }else if(slider.active.index == getPagerQty() - 1){
                    slider.controls.next.addClass('disabled');
                    slider.controls.prev.removeClass('disabled');
                    // if any slide in the middle
                }else{
                    slider.controls.prev.removeClass('disabled');
                    slider.controls.next.removeClass('disabled');
                }
            }
        }

        /**
         * Initialzes the auto process
         */
        var initAuto = function(){
            // if autoDelay was supplied, launch the auto show using a setTimeout() call
            if(slider.settings.autoDelay > 0){
                var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
                // if autoDelay was not supplied, start the auto show normally
            }else{
                el.startAuto();
            }
            // if autoHover is requested
            if(slider.settings.autoHover){
                // on el hover
                el.hover(function(){
                    // if the auto show is currently playing (has an active interval)
                    if(slider.interval){
                        // stop the auto show and pass true agument which will prevent control update
                        el.stopAuto(true);
                        // create a new autoPaused value which will be used by the relative "mouseout" event
                        slider.autoPaused = true;
                    }
                }, function(){
                    // if the autoPaused value was created be the prior "mouseover" event
                    if(slider.autoPaused){
                        // start the auto show and pass true agument which will prevent control update
                        el.startAuto(true);
                        // reset the autoPaused value
                        slider.autoPaused = null;
                    }
                });
            }
        }

        /**
         * Initialzes the ticker process
         */
        var initTicker = function(){
            var startPosition = 0;
            // if autoDirection is "next", append a clone of the entire slider
            if(slider.settings.autoDirection == 'next'){
                el.append(slider.children.clone().addClass('bx-clone'));
                // if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
            }else{
                el.prepend(slider.children.clone().addClass('bx-clone'));
                var position = slider.children.first().position();
                startPosition = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
            }
            setPositionProperty(startPosition, 'reset', 0);
            // do not allow controls in ticker mode
            slider.settings.pager = false;
            slider.settings.controls = false;
            slider.settings.autoControls = false;
            // if autoHover is requested
            if(slider.settings.tickerHover && !slider.usingCSS){
                // on el hover
                slider.viewport.hover(function(){
                    el.stop();
                }, function(){
                    // calculate the total width of children (used to calculate the speed ratio)
                    var totalDimens = 0;
                    slider.children.each(function(index){
                        totalDimens += slider.settings.mode == 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
                    });
                    // calculate the speed ratio (used to determine the new speed to finish the paused animation)
                    var ratio = slider.settings.speed / totalDimens;
                    // determine which property to use
                    var property = slider.settings.mode == 'horizontal' ? 'left' : 'top';
                    // calculate the new speed
                    var newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
                    tickerLoop(newSpeed);
                });
            }
            // start the ticker loop
            tickerLoop();
        }

        /**
         * Runs a continuous loop, news ticker-style
         */
        var tickerLoop = function(resumeSpeed){
            speed = resumeSpeed ? resumeSpeed : slider.settings.speed;
            var position = {left: 0, top: 0};
            var reset = {left: 0, top: 0};
            // if "next" animate left position to last child, then reset left to 0
            if(slider.settings.autoDirection == 'next'){
                position = el.find('.bx-clone').first().position();
                // if "prev" animate left position to 0, then reset left to first non-clone child
            }else{
                reset = slider.children.first().position();
            }
            var animateProperty = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
            var resetValue = slider.settings.mode == 'horizontal' ? -reset.left : -reset.top;
            var params = {resetValue: resetValue};
            setPositionProperty(animateProperty, 'ticker', speed, params);
        }

        /**
         * Initializes touch events
         */
        var initTouch = function(){
            // initialize object to contain all touch values
            slider.touch = {
                start: {x: 0, y: 0},
                end: {x: 0, y: 0}
            }
            slider.viewport.bind('touchstart', onTouchStart);
        }

        /**
         * Event handler for "touchstart"
         *
         * @param e (event)
         *  - DOM event object
         */
        var onTouchStart = function(e){
            if(slider.working){
                e.preventDefault();
            }else{
                // record the original position when touch starts
                slider.touch.originalPos = el.position();
                var orig = e.originalEvent;
                // record the starting touch x, y coordinates
                slider.touch.start.x = orig.changedTouches[0].pageX;
                slider.touch.start.y = orig.changedTouches[0].pageY;
                // bind a "touchmove" event to the viewport
                slider.viewport.bind('touchmove', onTouchMove);
                // bind a "touchend" event to the viewport
                slider.viewport.bind('touchend', onTouchEnd);
            }
        }

        /**
         * Event handler for "touchmove"
         *
         * @param e (event)
         *  - DOM event object
         */
        var onTouchMove = function(e){
            var orig = e.originalEvent;
            // if scrolling on y axis, do not prevent default
            var xMovement = Math.abs(orig.changedTouches[0].pageX - slider.touch.start.x);
            var yMovement = Math.abs(orig.changedTouches[0].pageY - slider.touch.start.y);
            // x axis swipe
            if((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX){
                e.preventDefault();
                // y axis swipe
            }else if((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY){
                e.preventDefault();
            }
            if(slider.settings.mode != 'fade' && slider.settings.oneToOneTouch){
                var value = 0;
                // if horizontal, drag along x axis
                if(slider.settings.mode == 'horizontal'){
                    var change = orig.changedTouches[0].pageX - slider.touch.start.x;
                    value = slider.touch.originalPos.left + change;
                    // if vertical, drag along y axis
                }else{
                    var change = orig.changedTouches[0].pageY - slider.touch.start.y;
                    value = slider.touch.originalPos.top + change;
                }
                setPositionProperty(value, 'reset', 0);
            }
        }

        /**
         * Event handler for "touchend"
         *
         * @param e (event)
         *  - DOM event object
         */
        var onTouchEnd = function(e){
            slider.viewport.unbind('touchmove', onTouchMove);
            var orig = e.originalEvent;
            var value = 0;
            // record end x, y positions
            slider.touch.end.x = orig.changedTouches[0].pageX;
            slider.touch.end.y = orig.changedTouches[0].pageY;
            // if fade mode, check if absolute x distance clears the threshold
            if(slider.settings.mode == 'fade'){
                var distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
                if(distance >= slider.settings.swipeThreshold){
                    slider.touch.start.x > slider.touch.end.x ? el.goToNextSlide() : el.goToPrevSlide();
                    el.stopAuto();
                }
                // not fade mode
            }else{
                var distance = 0;
                // calculate distance and el's animate property
                if(slider.settings.mode == 'horizontal'){
                    distance = slider.touch.end.x - slider.touch.start.x;
                    value = slider.touch.originalPos.left;
                }else{
                    distance = slider.touch.end.y - slider.touch.start.y;
                    value = slider.touch.originalPos.top;
                }
                // if not infinite loop and first / last slide, do not attempt a slide transition
                if(!slider.settings.infiniteLoop && ((slider.active.index == 0 && distance > 0) || (slider.active.last && distance < 0))){
                    setPositionProperty(value, 'reset', 200);
                }else{
                    // check if distance clears threshold
                    if(Math.abs(distance) >= slider.settings.swipeThreshold){
                        distance < 0 ? el.goToNextSlide() : el.goToPrevSlide();
                        el.stopAuto();
                    }else{
                        // el.animate(property, 200);
                        setPositionProperty(value, 'reset', 200);
                    }
                }
            }
            slider.viewport.unbind('touchend', onTouchEnd);
        }

        /**
         * Window resize event callback
         */
        var resizeWindow = function(e){
            // don't do anything if slider isn't initialized.
            if(!slider.initialized) return;
            // get the new window dimens (again, thank you IE)
            var windowWidthNew = $(window).width();
            var windowHeightNew = $(window).height();
            // make sure that it is a true window resize
            // *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
            // are resized. Can you just die already?*
            if(windowWidth != windowWidthNew || windowHeight != windowHeightNew){
                // set the new window dimens
                windowWidth = windowWidthNew;
                windowHeight = windowHeightNew;
                // update all dynamic elements
                el.redrawSlider();
                // Call user resize handler
                slider.settings.onSliderResize.call(el, slider.active.index);
            }
        }

        /**
         * ===================================================================================
         * = PUBLIC FUNCTIONS
         * ===================================================================================
         */

        /**
         * Performs slide transition to the specified slide
         *
         * @param slideIndex (int)
         *  - the destination slide's index (zero-based)
         *
         * @param direction (string)
         *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
         */
        el.goToSlide = function(slideIndex, direction){
            // if plugin is currently in motion, ignore request
            if(slider.working || slider.active.index == slideIndex) return;
            // declare that plugin is in motion
            slider.working = true;
            // store the old index
            slider.oldIndex = slider.active.index;
            // if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
            if(slideIndex < 0){
                slider.active.index = getPagerQty() - 1;
                // if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
            }else if(slideIndex >= getPagerQty()){
                slider.active.index = 0;
                // set active index to requested slide
            }else{
                slider.active.index = slideIndex;
            }
            // onSlideBefore, onSlideNext, onSlidePrev callbacks
            slider.settings.onSlideBefore(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
            if(direction == 'next'){
                slider.settings.onSlideNext(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
            }else if(direction == 'prev'){
                slider.settings.onSlidePrev(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
            }
            // check if last slide
            slider.active.last = slider.active.index >= getPagerQty() - 1;
            // update the pager with active class
            if(slider.settings.pager) updatePagerActive(slider.active.index);
            // // check for direction control update
            if(slider.settings.controls) updateDirectionControls();
            // if slider is set to mode: "fade"
            if(slider.settings.mode == 'fade'){
                // if adaptiveHeight is true and next height is different from current height, animate to the new height
                if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
                    slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
                }
                // fade out the visible child and reset its z-index value
                slider.children.filter(':visible').fadeOut(slider.settings.speed).css({zIndex: 0});
                // fade in the newly requested slide
                slider.children.eq(slider.active.index).css('zIndex', slider.settings.slideZIndex+1).fadeIn(slider.settings.speed, function(){
                    $(this).css('zIndex', slider.settings.slideZIndex);
                    updateAfterSlideTransition();
                });
                // slider mode is not "fade"
            }else{
                // if adaptiveHeight is true and next height is different from current height, animate to the new height
                if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
                    slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
                }
                var moveBy = 0;
                var position = {left: 0, top: 0};
                // if carousel and not infinite loop
                if(!slider.settings.infiniteLoop && slider.carousel && slider.active.last){
                    if(slider.settings.mode == 'horizontal'){
                        // get the last child position
                        var lastChild = slider.children.eq(slider.children.length - 1);
                        position = lastChild.position();
                        // calculate the position of the last slide
                        moveBy = slider.viewport.width() - lastChild.outerWidth();
                    }else{
                        // get last showing index position
                        var lastShowingIndex = slider.children.length - slider.settings.minSlides;
                        position = slider.children.eq(lastShowingIndex).position();
                    }
                    // horizontal carousel, going previous while on first slide (infiniteLoop mode)
                }else if(slider.carousel && slider.active.last && direction == 'prev'){
                    // get the last child position
                    var eq = slider.settings.moveSlides == 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
                    var lastChild = el.children('.bx-clone').eq(eq);
                    position = lastChild.position();
                    // if infinite loop and "Next" is clicked on the last slide
                }else if(direction == 'next' && slider.active.index == 0){
                    // get the last clone position
                    position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
                    slider.active.last = false;
                    // normal non-zero requests
                }else if(slideIndex >= 0){
                    var requestEl = slideIndex * getMoveBy();
                    position = slider.children.eq(requestEl).position();
                }

                /* If the position doesn't exist
                 * (e.g. if you destroy the slider on a next click),
                 * it doesn't throw an error.
                 */
                if ("undefined" !== typeof(position)) {
                    var value = slider.settings.mode == 'horizontal' ? -(position.left - moveBy) : -position.top;
                    // plugin values to be animated
                    setPositionProperty(value, 'slide', slider.settings.speed);
                }
            }
        }

        /**
         * Transitions to the next slide in the show
         */
        el.goToNextSlide = function(){
            // if infiniteLoop is false and last page is showing, disregard call
            if (!slider.settings.infiniteLoop && slider.active.last) return;
            var pagerIndex = parseInt(slider.active.index) + 1;
            el.goToSlide(pagerIndex, 'next');
        }

        /**
         * Transitions to the prev slide in the show
         */
        el.goToPrevSlide = function(){
            // if infiniteLoop is false and last page is showing, disregard call
            if (!slider.settings.infiniteLoop && slider.active.index == 0) return;
            var pagerIndex = parseInt(slider.active.index) - 1;
            el.goToSlide(pagerIndex, 'prev');
        }

        /**
         * Starts the auto show
         *
         * @param preventControlUpdate (boolean)
         *  - if true, auto controls state will not be updated
         */
        el.startAuto = function(preventControlUpdate){
            // if an interval already exists, disregard call
            if(slider.interval) return;
            // create an interval
            slider.interval = setInterval(function(){
                slider.settings.autoDirection == 'next' ? el.goToNextSlide() : el.goToPrevSlide();
            }, slider.settings.pause);
            // if auto controls are displayed and preventControlUpdate is not true
            if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('stop');
        }

        /**
         * Stops the auto show
         *
         * @param preventControlUpdate (boolean)
         *  - if true, auto controls state will not be updated
         */
        el.stopAuto = function(preventControlUpdate){
            // if no interval exists, disregard call
            if(!slider.interval) return;
            // clear the interval
            clearInterval(slider.interval);
            slider.interval = null;
            // if auto controls are displayed and preventControlUpdate is not true
            if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('start');
        }

        /**
         * Returns current slide index (zero-based)
         */
        el.getCurrentSlide = function(){
            return slider.active.index;
        }

        /**
         * Returns current slide element
         */
        el.getCurrentSlideElement = function(){
            return slider.children.eq(slider.active.index);
        }

        /**
         * Returns number of slides in show
         */
        el.getSlideCount = function(){
            return slider.children.length;
        }

        /**
         * Update all dynamic slider elements
         */
        el.redrawSlider = function(){
            // resize all children in ratio to new screen size
            slider.children.add(el.find('.bx-clone')).width(getSlideWidth());
            // adjust the height
            slider.viewport.css('height', getViewportHeight());
            // update the slide position
            if(!slider.settings.ticker) setSlidePosition();
            // if active.last was true before the screen resize, we want
            // to keep it last no matter what screen size we end on
            if (slider.active.last) slider.active.index = getPagerQty() - 1;
            // if the active index (page) no longer exists due to the resize, simply set the index as last
            if (slider.active.index >= getPagerQty()) slider.active.last = true;
            // if a pager is being displayed and a custom pager is not being used, update it
            if(slider.settings.pager && !slider.settings.pagerCustom){
                populatePager();
                updatePagerActive(slider.active.index);
            }
        }

        /**
         * Destroy the current instance of the slider (revert everything back to original state)
         */
        el.destroySlider = function(){
            // don't do anything if slider has already been destroyed
            if(!slider.initialized) return;
            slider.initialized = false;
            $('.bx-clone', this).remove();
            slider.children.each(function() {
                $(this).data("origStyle") != undefined ? $(this).attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
            });
            $(this).data("origStyle") != undefined ? this.attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
            $(this).unwrap().unwrap();
            if(slider.controls.el) slider.controls.el.remove();
            if(slider.controls.next) slider.controls.next.remove();
            if(slider.controls.prev) slider.controls.prev.remove();
            if(slider.pagerEl && slider.settings.controls) slider.pagerEl.remove();
            $('.bx-caption', this).remove();
            if(slider.controls.autoEl) slider.controls.autoEl.remove();
            clearInterval(slider.interval);
            if(slider.settings.responsive) $(window).unbind('resize', resizeWindow);
        }

        /**
         * Reload the slider (revert all DOM changes, and re-initialize)
         */
        el.reloadSlider = function(settings){
            if (settings != undefined) options = settings;
            el.destroySlider();
            init();
        }

        init();

        // returns the current jQuery object
        return this;
    }

})(jQuery);
