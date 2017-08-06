(function($) {

    $.fn.PrintPaging = function(options) {

        /**
         * 默认配置
         *
         * @type {Object}
         */
        var defaults = {
            page : {//定义打印对应及其高度
                'obj' : '.auto-paging-main',
                'height' : 980,
                'num' : 0,//初始化页数
            },
            fixedObjs: 'div.auto-full-fixed',
            fullObjs : 'div.auto-full-item',
            dynamic: {
                'box': '.auto-paging-main > div.auto-content-table', //存放动态行的容器
                'rows': '.auto-paging-main .auto-paging-main-box tr', //动态行
            },
            paging: { //定义页码
                'show' : true,
                'html' : '<div class="auto-paging-num"><div class="paging-num"><span class="p-num">1</span>/<span class="p-count">1</span></div></div>',
            }
        };

        var _prints = {
            Target: $(this),
            Clone: null,
            DynamicObj: null,
            DynamicClone: null,
            DynamicRowBox: null,
            Prev: null,//上一页对象
            FullObjs: null,
        };

        // 合并参数
        var opts = $.extend({}, defaults, options);
        opts.page.num = (parseInt(opts.page.num) == opts.page.num) ? opts.page.num : 0;

        // 生成随机码
        this.pageRandomString = function(len) {
            len = len || 32;
            var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
            var maxPos = chars.length;
            var code = '';
            for (i = 0; i < len; i++) {
                code += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return code;
        }

        this.console = {
            'title' : function(str) {
                var css = '';
                css+= 'text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,';
                css+= '0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),';
                css+= '0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),';
                css+= '0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);font-size:2em';
                console.log("%c" + str, css);
            },
            li : function(str) {
                //console.log('%cRainbow Text ', 'background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #2f2),color-stop(0.75, #2f2), color-stop(0.9, #ff2), color-stop(1, #f22) );color:transparent;-webkit-background-clip: text;font-size:5em;');
                var css = '';
                css+= 'text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,';
                css+= '0 4px 0 #b9b9b9,0 2px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 2px rgba(0,0,0,.1),';
                css+= '0 1px 3px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.2),0 2px 2px rgba(0,0,0,.25),';
                css+= '0 2px 2px rgba(0,0,0,.2),0 2px 2px rgba(0,0,0,.15);font-size:14px';
                console.log("%c" + str, css);
            }
        }

        // 复制页面
        this.pageClone = function() {

            // 累加页数
            opts.page.num++;

            // 复制模板且加追到原目标前(这里加追的位置会影响显示的先后效果)
            var cloneObj = _prints.Target.clone(true);
            _prints.Target.before(cloneObj);

            // 生成随机key,用于识别不同的克隆对象
            var cloneKey = this.pageRandomString();
            cloneObj.attr('id', cloneKey);
            cloneObj.addClass('auto-paging-page-box');

            console.log('创建第' + opts.page.num + '张克隆页, #ID:' + cloneKey);

            // 记录上一页对象
            if (_prints.Clone) {
                _prints.Prev = _prints.Clone;
            };

            // 对上一页增加分页样式
            if (_prints.Prev) {
                _prints.Prev.css({'page-break-before': 'always', 'page-break-after': 'always'});
            };

            // 记录新的克隆页并添加分页样式
            _prints.Clone = $('#' + cloneKey);
            _prints.Clone.css({'page-break-before': 'auto', 'page-break-after': 'auto'});
            _prints.Clone.find(opts.page.obj).html('');//清除内容

            return _prints.Clone;
        }

        // 复制动态表格容器
        this.dynamicClone = function() {

            if (!_prints.DynamicObj) {
                console.log('未发现动态表格,无法进行复制。');
                return;
            };

            console.log('创建存放动态表格的容器...');

            // 创建克隆动态项并加追在原来的元素后
            var cloneObj = _prints.DynamicObj.clone(true);
            _prints.Clone.find(opts.page.obj).append(cloneObj);

            // 生成随机key,用于识别不同的克隆对象
            var cloneKey = this.pageRandomString();
            cloneObj.attr('id', cloneKey);

            // 记录新的克隆元素
            _prints.DynamicClone = $('#' + cloneKey);
            _prints.DynamicRowBox = _prints.DynamicClone.find(opts.dynamic.rows).parent(); //记录存放动态行的容器
            _prints.DynamicClone.find(opts.dynamic.rows).remove();//清除内容

            return _prints.DynamicClone;
        }

        // 根据计算指定元素是否超出指定高度范围,判断是否需要分页
        this.isNeedPagIng = function() {
            if (!_prints.Clone) {
                console.log('还没发现克隆页面。');
                return false;
            };

            var limitObjHeight = _prints.Clone.find(opts.page.obj).height();
            if (limitObjHeight > opts.page.height) {
                console.log('第' + opts.page.num + '页,目标表格height: ' + limitObjHeight + ' > 限制高度: ' + opts.page.height + ', 需要分页.');
                return true;
            } else {
                console.log('第' + opts.page.num + '页,目标表格height: ' + limitObjHeight + ' <= 限制高度: ' + opts.page.height + ', 不需要分页.');
                return false;
            };
        }

        // 判断插入新行后，是否会超出页面限定的高度
        this.insertRow = function(row) {

            if (!_prints.Clone) {
                console.log('还没发现克隆页面，无法执行插入元素。');
                return false;
            };
            // 对当前动态表格插入新行
            _prints.DynamicRowBox.append(row);

            // 检测是否超出范围,是否产生新的分页
            if (this.isNeedPagIng()) {
                _prints.DynamicClone.find(opts.dynamic.rows + ':last').remove();//如果需要分页,那么原来插入的行需要删除
                console.log('由于插入的新行,导致超出限定的高度范围,因此需要删除该项。');
                return false;
            } else {
                // 如果不需要分页,则表示成功插入
                console.log('新行插入成功。');
                return true;
            };
        }

        // 参数检测
        this.pagIngCheak = function() {

            if (!_prints.Target) {
                console.log('缺少参数:_prints.Target');
                return false;
            };

            if ($(opts.fullObjs).size() <= 0) {
                console.log('目标对象没找到:fullObjs');
                return false;
            };

            if (_prints.Target.find(opts.dynamic.rows).size() <= 0) {
                console.log('目标对象缺少:dynamic.rows');
                return false;
            };

            return true;
        }


        // 判断插入一个对象,判断是否超出范围
        // 如果超出范围，那么创建新的克隆页面
        // 如果没有超出，那么返回true
        this.insertfullObjs = function(obj) {

            console.log('[插入元素]...');

            _prints.Clone.find(opts.page.obj).append(obj);

            // 检测是否超出范围,是否产生新的分页
            if (this.isNeedPagIng()) {
                _prints.Clone.find(opts.fullObjs + ':last').remove();//如果需要分页,那么原来插入的行需要删除
                console.log('如果插入该元素会导致超出限定的高度范围,因此需要不插入该元素。');
                return false;
            } else {
                // 如果不需要分页,则表示成功插入
                console.log('元素插入成功。');
                return true;
            };
        }

        this.insertDynamicObjs = function(obj) {
            _prints.DynamicObj = obj;

            var _this = this;
            var dynamicRows = obj.find(opts.dynamic.rows);//找出动态表格
            var dynamicRowIndex = dynamicRows.size() - 1; //动态表格行最大索引

            // 检测目标对象中一共有多少行
            dynamicRows.each(function(itemIndex) {

                if (0 == itemIndex) {
                    _this.dynamicClone(); //创建克隆表格
                };

                var isInsert = _this.insertRow($(this));
                if (false == isInsert) {
                    _this.pageClone();
                    _this.dynamicClone(); //创建克隆表格
                    _this.insertRow($(this));
                }
            });
        }

        // 插入新元素,如果无法存放,那么创建新的页面存放
        this.insertObjsPage = function(obj) {
            if (obj.hasClass('auto-content-table')) {
            // 动态表格包含可变因素,因此不能直接插入
                _prints.DynamicBox = obj; //记录动态表格
                this.console.li('[动态表格]...');
                this.insertDynamicObjs(obj);
            } else {
            // 将该项完整插入表格中,如果可以超出目标表格高度,那么创建新的页面存放
                this.console.li('[普通表格]...');
                if (this.insertfullObjs(obj)) {
                    return true;
                } else {//创建新的页面存放
                    this.pageClone();
                    return this.insertfullObjs(obj);
                }
            }
        }

        // 分页执行完成后的检测
        this.createPaging = function() { //是否需要创建页码
            if (opts.paging.show && _prints.Clone) {
                var printPageObjs = _prints.Clone.parent().find('.auto-paging-page-box');
                var pageCount = printPageObjs.size();
                if (pageCount > 1) {
                    printPageObjs.each(function(boxIndex) {
                        $(this).append(opts.paging.html);
                        $(this).find('.auto-paging-num .p-num').text(boxIndex+1);
                        $(this).find('.auto-paging-num .p-count').text(pageCount);
                        $(this).css({'position': 'relative'});
                        $(this).find('.auto-paging-num').css({'width': '100%', 'text-align': 'center'});
                    });
                };
            };
        }

        // 执行分页
        this.pagIng = function() {

            var _this = this;
            var fullObjs = _prints.Target.find(opts.fullObjs); //获取必须完整显示在一页的元素

            // 查找所有需要在一页显示的元素
            fullObjs.each(function(fullObjIndex) {

                // 第一项,需要初始化克隆页面
                if (0 == fullObjIndex) {
                    _this.pageClone();
                };

                // 根据元素类型,选中不同的方式插入元素
                _this.insertObjsPage($(this));
            });

            // 创建分页
            this.createPaging();

            // 清理原页面
            _prints.Target.remove();
        }

        this.init = function() {

            this.console.title('[jQuery] Print Paging...');

            // 检测如果已经配置参数并执行分页
            if (this.pagIngCheak()) {
                _prints.Target.find(opts.page.obj).parent().css({'height' : opts.page.height});
                this.pagIng();
            };
        }

        this.init();
    };

})(jQuery);



/**
 * 打印内容自动分页
 *
 * @Author   zhangguocai
 *
 * @DateTime 2015-11-12T21:30:51+0800
 *
 * @param    {[type]}                 obj  [description]
 * @param    {[type]}                 fun  [description]
 * @param    {[type]}                 page [description]
 *
 * @return   {[type]}                      [description]
 */
function printAutoPaging(fun, page) {

    this.pageNum = 0; //初始化页数
    this.targetObj = null;
    this.cloneObj = null;
    this.prevPageObj = null;//上一页对象
    this.fixedObjs = [];//所有页面都出现的元素(常用于页头页尾)
    this.firstPageObjs = [];//只在首页出现的元素
    this.endPageObjs = [];//只在页尾出现的元素
    this.dynamic = {
        'box': null, //存放动态行的最高层容器
        'rows': null, //动态行
        'limitObj': null, //动态行变化时,不允许指定对象超出指定高度范围,否则自动分页
        'limitHeight': 0,
        'rowBox': null, //存放行的容器
    };
    this.sign = null; //设置盖章

    // 定义页码
    this.paging = {
        'show' : true,
        'html' : '<div class="auto-paging-num"><div class="paging-num"><span class="p-num">1</span>/<span class="p-count">1</span></div></div>',
    };

    // 生成随机码
    this.pageRandomString = function(len) {
        len = len || 32;
        var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
        var maxPos = chars.length;
        var code = '';
        for (i = 0; i < len; i++) {
            code += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return code;
    }

    // 复制页面
    this.pageClone = function() {

        // 复制模板且加追到原目标前(这里加追的位置会影响显示的先后效果)
        var cloneObj = this.targetObj.clone(true);
        this.targetObj.before(cloneObj);

        // 生成随机key,用于识别不同的克隆对象
        var clonePageKey = this.pageRandomString();
        cloneObj.attr('id', clonePageKey);
        cloneObj.addClass('auto-paging-page-box');

        // 记录上一页对象
        if (this.cloneObj) {
            this.prevPageObj = this.cloneObj;
        };

        // 记录新的克隆页
        this.cloneObj = $('#' + clonePageKey);

        // 对上一页增加分页符
        if (this.prevPageObj) {
            this.prevPageObj.css({'page-break-before': 'always', 'page-break-after': 'always'});
        };
        this.cloneObj.css({'page-break-before': 'auto', 'page-break-after': 'auto'});

        // 记录存放行的容器,并移除动态内容行
        this.dynamic.rowBox = this.cloneObj.find(this.dynamic.rows).parent();
        this.cloneObj.find(this.dynamic.rows).remove();//移除行
        this.pageNum++;

        // 只要创建克隆页面,就可以根据页数,判断是否需要删除firstPageObjs中的元素
        if (1 != this.pageNum && this.firstPageObjs) {
            this.delObjs(this.firstPageObjs);
            console.log('由于不是在第一页,因此需要删除firstPageObjs里的元素');
        };

        return this.cloneObj;
    }

    // 根据计算指定元素是否超出指定高度范围,判断是否需要分页
    this.isNeedPagIng = function() {
        if (!this.cloneObj) {
            console.log('还没发现克隆页面。');
            return false;
        };

        var limitObjHeight = this.cloneObj.find(this.dynamic.limitObj).height();
        if (limitObjHeight > this.dynamic.limitHeight) {
            console.log('第' + this.pageNum + '页,目标表格height: ' + limitObjHeight + ' > 限制高度: ' + this.dynamic.limitHeight + ', 需要分页.');
            return true;
        } else {
            console.log('第' + this.pageNum + '页,目标表格height: ' + limitObjHeight + ' <= 限制高度: ' + this.dynamic.limitHeight + ', 不需要分页.');
            return false;
        };
    }

    // 删除元素
    this.delObjs = function(objs) {
        if (!this.cloneObj) {
            console.log('还没发现克隆页面，无法执行删除元素。');
            return false;
        };

        if (!objs) {
            return false;
        };

        for (var i = objs.length - 1; i >= 0; i--) {
            this.cloneObj.find(objs[i]).remove();
        };
    }

    // 判断插入新行后，是否会超出页面限定的高度
    this.insertRow = function(row) {
        if (!this.cloneObj) {
            console.log('还没发现克隆页面，无法执行插入元素。');
            return false;
        };

        // 插入新行
        this.dynamic.rowBox.append(row);

        // 检测是否超出范围,是否产生新的分页
        if (this.isNeedPagIng()) {
            this.cloneObj.find(this.dynamic.rows + ':last').remove();//如果需要分页,那么原来插入的行需要删除
            console.log('由于插入的新行,导致超出限定的高度范围,因此需要删除该项。');
            return false;
        } else {
            // 如果不需要分页,则表示成功插入
            console.log('新行插入成功。');
            return true;
        };
    }

    // 参数检测
    this.paramCheak = function() {
        if (!this.targetObj) {
            console.log('缺少参数:this.targetObj');
            return false;
        };
        return true;
    }

    // 检测是否需要创建新的克隆页
    this.pageCheckAndClone = function() {
        if (!this.endPageObjs) {
            return false;
        };

        // 检测是否需要产生新的分页存放页尾元素
        var isNeedPagIng = false;
        for (var i = this.endPageObjs.length - 1; i >= 0; i--) {
            // 如果目标元素中和克隆元素不一致,那么需要创建新的克隆页
            if (this.targetObj.find(this.endPageObjs[i]).size() != this.cloneObj.find(this.endPageObjs[i]).size()) {
                isNeedPagIng = true;
                break;
            };
        };

        if (isNeedPagIng) {
            this.pageClone();
            return true;
        } else {
            return false;
        };
    }

    // 分页执行完成后的检测
    this.pageEndCheck = function() { //是否需要创建页码
        if (this.paging.show && this.cloneObj) {
            var parent = this;
            var pageCount = parent.cloneObj.parent().find('.auto-paging-page-box').size();
            if (pageCount > 0) {
                parent.cloneObj.parent().find('.auto-paging-page-box').each(function(boxIndex) {
                    $(this).append(parent.paging.html);
                    $(this).find('.auto-paging-num .p-num').text(boxIndex+1);
                    $(this).find('.auto-paging-num .p-count').text(pageCount);
                    $(this).css({'position': 'relative'});
                    $(this).find('.auto-paging-num').css({'position': 'absolute', 'bottom': '75px', 'width': '100%', 'text-align': 'center'});
                });
            };
        };
    }

    // 执行分页
    this.pagIng = function() {

        var parent = this;
        var dynamicRows = parent.targetObj.find(parent.dynamic.rows);
        var dynamicRowIndex = dynamicRows.size() - 1;

        // 检测目标对象中一共有多少行
        dynamicRows.each(function(itemIndex) {

            // 第一项,需要初始化克隆页面,或者通过检测高度判断出需要创建分页
            if (0 == itemIndex) {
                parent.pageClone();
            };

            var isInsert = parent.insertRow($(this));

            // 如果没有插入成功那么
            // 1、需要检测非必要元素是否存在,如果存在则删除
            // 2、删除非必要元素后,再次插入,如果依然无法插入,则克隆新的页面
            //
            // 什么是非必要元素？
            // 只要不是在第一页,那么firstPageObjs里的元素都可以删除
            // 只要插入不成功,那么endPageObjs里的元素都可以删除
            if (false == isInsert) {
                parent.delObjs(parent.endPageObjs);//删除只在页尾出现的元素,如果不能插入元素,那么创建新的克隆页
                isInsert = parent.insertRow($(this));
                if (false == isInsert) {
                    parent.pageClone();
                    parent.insertRow($(this));
                }
            }

            // 最后一项插入成功的话,需要验证是否再创建一页存放页尾信息
            if ((dynamicRowIndex == itemIndex) && isInsert) {
                if (parent.pageCheckAndClone()) {
                    parent.cloneObj.find(parent.dynamic.box).remove();//因为上面已经是最后一项了,因此这里需要移除新克隆处理的动态表格
                };
            };
        });

        // 完成最后一项后,需要检测是否需要生成分页等信息
        parent.pageEndCheck();
        parent.targetObj.remove();
    }

    this.init = function() {
        this.paramCheak(); //检测是否已经配置参数
        this.pagIng();//执行分页
    }

    return this;
}