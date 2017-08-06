/*
 * jQuery freezeTable
 * A jQuery Plugin to freeze the Frist Column or Row of a table in the top of page.
 *
 * Copyright 2014 Zhang Guocai
 *
 * Date 2014-04-15，http://www.cvte.cn
 *
 * { The Css Style }
 * .boxfix table{width: auto;}
 * .boxfix td{word-break: break-all; word-wrap:break-word;}
 * .boxfix thead th,.boxfix thead td{background-color: #eaf1f8;}
 * .boxfix .boxfix-colum,.boxfix td{width: 350px;}
 * .boxfix .boxfix-frist-colum{width: 100px;}
 *
 * { The Html }
 * <div class="boxfix">
    <table>
      <thead>
        <tr>
          <!--这里的DIV起辅助作用,用于固定整个表格宽度-->
          <th><div class="boxfix-frist-colum"></div><th>
          <td><div class="boxfix-colum"></div><td>
          <td><div class="boxfix-colum"></div><td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>{标题、1}<th>
          <td>{内容、1}<td>
          <td>{内容、2}<td>
        </tr>
        <tr>
          <th>{标题、2}<th>
          <td>{内容、3}<td>
          <td>{内容、4}<td>
        </tr>
      </tbody>
    </table>
 * </div>
 *
 *
 * { Use }
 * $('.boxfix').freezeTable({'direction':'y','shadow':true,'effect':true,'theadBg':'#eaf1f8'})
 * .freezeTable({'direction':'x','effect':false});
 *
 */

(function($) {

  $.fn.freezeTable = function(options) {

    // 默认配置
    var defaults = {
        'direction' : 'x',//滚动方向
        'zindex' : 99999,//浮动级别
        'shadow' : false,//冻结阴影
        'effect' : false,//动画效果
        'theadBg' : false,//头部背景颜色
    };

    //初始化配置选项
    var opts = $.extend({}, defaults, options);
    console.log(opts);

    // 判断对象是否存在
    var target = $(this);
    var targetId = target.attr('id');

    // 不存在ID则生成
    if (undefined == targetId || '' == targetId) {
        targetId = 'boxfixObj' + Date.parse(new Date());
        target.attr('id', targetId);
    }
    if (undefined == targetId || '' == targetId) {
        return target;
    }

    // 用于记录目标对象与目标方向的初始距离
    var fixShift = 0;
    // 生成浮动头ID并判断是否存在,如果不存在则生成
    var fixKey = targetId + '_fix_' + opts.direction;
    var fixTable = $('#' + fixKey);

    // 不存在则创建
    if (0 >= fixTable.size()) {

        // 复制目标表格头栏目
        var targetTable = target.children('table').eq(0);
        var targetWidth = targetTable.width();
        var tableHeadObj = targetTable.clone(true);
        var tableHeadDiv = $('<div id="' + fixKey + '" class="boxfix-table"></div>');
        tableHeadDiv.css({'width' : targetWidth});
        tableHeadDiv.append(tableHeadObj);
        target.prepend(tableHeadDiv);

        fixTable = $('#' + fixKey);
        fixTable.css({'position':'absolute', 'z-index': opts.zindex});

        // 设置阴影
        if (opts.shadow) {
            fixTable.find('table').css({'-moz-box-shadow':'2px 2px 2px silver','-webkit-box-shadow':'2px 2px 2px silver'});
        };
        // 设置行颜色
        if (opts.theadBg) {
            fixTable.find('table').find('th,td').css({'background-color': opts.theadBg});
        };

        switch (opts.direction) {
            case 'y':
                // 固定表格宽度
                fixTable.find('thead th').each(function(){
                    $(this).css({'width': parseInt($(this).width()) + 'px','height': parseInt($(this).height()) + 'px'});
                });
                fixTable.find('thead td').each(function(){
                    $(this).css({'width': parseInt($(this).width()) + 'px','height': parseInt($(this).height()) + 'px'});
                });
                // 保留表格头
                fixTable.find('tbody').remove();
                fixShift = fixTable.offset().top;
            break;

            default:
                console.log(fixTable);
                // 固定表格宽高度
                fixTable.find('tr th').each(function(){
                    $(this).css({'width': parseInt($(this).width()) + 'px','height': parseInt($(this).height()) + 'px'});
                });
                // 删除不需要的列
                fixTable.find("td").remove();
                fixShift = fixTable.offset().left;
            break;
        }
    }

    // 默认隐藏
    fixTable.css({'display':'none'});

    // 初始化显示状态
    var isShowing = false;

    // 滚动条响应
    switch (opts.direction) {
        case 'y':
            $(window).scroll(function() {
                var windowTop = $(window).scrollTop();
                if (windowTop > fixShift) {//达到目标距离后开始移动
                    if (opts.effect) {//使用动画效果
                        if (false == isShowing) {
                            isShowing = true;
                            fixTable.slideDown(500);
                        }
                    } else {//直接显示
                        fixTable.css({'display':'block'});
                    }
                    fixTable.css({'top': windowTop + 'px'});
                } else {
                    isShowing = false;
                    fixTable.css({'display':'none'});
                }
            });
        break;

        default:
            $(window).scroll(function() {
                var windowLeft = $(window).scrollLeft();
                if (windowLeft > fixShift) {//达到目标距离后开始移动
                    if (opts.effect) {
                        if (isShowing==false) {//使用动画效果
                            isShowing = true;
                            fixTable.fadeIn(500);
                        }
                    } else {//直接显示
                        fixTable.css({'display':'block'});
                    }
                    fixTable.css({'left': windowLeft + 'px'});
                } else {
                    isShowing = false;
                    fixTable.css({'display':'none'});
                }
            });
        break;
    }
    return target;
  };

})(jQuery);