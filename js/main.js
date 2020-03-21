/*********************
 * Tab项目 Vue 实例
 *********************/
var _tab = new Vue({
    //el: '#download-state-tab',
    data: {
        tabStateCount: {
            all: 0,
            downloading: 0,
            seeding: 0,
            completed: 0,//完成
            resumed: 0,//进行中
            paused: 0,//完成+暂停
            active: 0,
            inactive: 0,
            errored: 0,
        }
    },
});


/*********************
 * 下载项目 Vue 实例
 *********************/
var tab_contents = new Vue({
    el: 'div[data-tab-contents="true"]',
    data: {
        sortName: '',
        sortType: true,//true:desc false:asc
        maindata: {},
        $rid: 0
    },
    beforeMount() {
        let that = this;

        //获取下载项目 定时器
        window['mainDataTimer'] = setInterval(function () {
            $$.ajax({
                url: API + syncMaindata,
                contentType: "application/json",
                xhrFields: {
                    // 允许携带证书
                    withCredentials: true
                },
                headers: requestHeader,
                data: {
                    //有增量更新功能，节省流量，但暂时无头绪
                    // rid: that.$rid
                },
                dataType: 'json',
                success: function (res) {
                    that.$rid = res['rid'];

                    tab_contents.maindata = res;//下载项目数据

                    //服务器运行状态
                    serverState.server_state = res['server_state'];

                    //Tab 标签统计结果
                    //_tab.tabStateCount = tabStateCount(downloadStateCount(tab_contents.$data.maindata['torrents']));//Tab 标签的那个统计
                }
            });
        }, 1000);
    },
    methods: {
        /**
         * 冒泡排序法，用于下载项目的排序
         * @param obj
         * @param field
         * @param order
         * @returns {*}
         */
        maopao(obj, field = 'name', order = 'asc') {
            for (let i = 0; i < obj.length; i++) {
                for (let j = 0; j < i - 1; j++) {
                    if (order === 'asc') {
                        //从小到大
                        if (obj[j][field] > obj[j + 1][field]) {
                            tmp_obj = obj[j + 1];
                            obj[j + 1] = obj[j];
                            obj[j] = tmp_obj;
                        }
                    } else {
                        //从大到小
                        if (obj[j][field] < obj[j + 1][field]) {
                            tmp_obj = obj[j + 1];
                            obj[j + 1] = obj[j];
                            obj[j] = tmp_obj;
                        }
                    }
                }
            }
            return obj;
        },

        //升序
        compareAscSort(property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];

                return value1 - value2;
            }
        },

        //降序
        compareDescSort(property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value2 - value1;
            }
        },

        //去详细页面
        goToInfo(hash, title) {
            // $$("li[data-uid='"+uid+"']").find(".file-name").html();
            // console.log(e);
            // $li_target = $$(e.target).closest("li");//目标 li DOM 对象

            // _content_menu.uid = $li_target.attr("data-uid");//唯一ID
            window.location = './info.html?hash=' + hash + '&title=' + title;
        },
        //获取可读文件大小
        getFileSize: function (fileByte, fractionDigits = 1) {
            let value = fileByte;

            if (null == value || value === '' || 0 === value) {
                return "0B";
            }

            var unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
            var index = 0;
            var srcsize = parseFloat(value);
            index = Math.floor(Math.log(srcsize) / Math.log(1024));
            var size = srcsize / Math.pow(1024, index);
            size = size.toFixed(fractionDigits);//保留的小数位数
            return size + unitArr[index];
        },
        //转小时分钟
        toHourMinute: function (minutes) {
            return (Math.floor(minutes / 60) + "小时" + (minutes % 60) + "分");
        },
        //数字转百分比
        toPercent: function (point, fractionDigits = 1) {
            var str = Number(point * 100).toFixed(fractionDigits);
            str += "%";
            return str;
        },
        //最后一次活动时间
        lastActiveTime: function (seconds) {
            var val = seconds;
            if (val < 1)
                return '∞';
            else
                return '%1前'.replace('%1', this.friendlyDuration((new Date()) / 1000 - val));
        },
        friendlyDuration: function (seconds) {
            var MAX_ETA = 8640000;
            if (seconds < 0 || seconds >= MAX_ETA)
                return "∞";
            if (seconds === 0)
                return "0";
            if (seconds < 60)
                return "< 1分钟";
            var minutes = seconds / 60;
            if (minutes < 60)
                return "%1分钟".replace("%1", parseInt(minutes));
            var hours = minutes / 60;
            minutes = minutes % 60;
            if (hours < 24)
                return "%1小时%2分钟".replace("%1", parseInt(hours)).replace("%2", parseInt(minutes));
            var days = hours / 24;
            hours = hours % 24;
            if (days < 100)
                return "%1天%2小时".replace("%1", parseInt(days)).replace("%2", parseInt(hours));
            return "∞";
        },
        //格式化时间
        formatTime: function (time) {
            return new Date(time * 1000).format('yyyy/MM/dd hh:mm:ss');
        },
        //转图标
        selectDownloadStateIcon: function (state) {
            return state ? downloadState[state]['icon'] : '';
        },
        //转颜色
        selectDownloadStateColor: function (state) {
            return state ? downloadState[state]['color'] : '';
        }
    },
    computed: {
        /**
         * 计算属性
         * 下载项目排序
         * @returns {[]|*}
         */
        filterMainData: function () {
            let data = this.maindata.torrents;

            if (data === undefined) return data;

            let tmp = [], tmp_;
            for (let item in data) {
                tmp_ = data[item];
                tmp_.hash = item;

                tmp.push(tmp_);
            }

            if (filterItem.active === -1) {
                return tmp;
            }

            return this.maopao(tmp, this.sortName, this.sortType);
        }
    },
});


/*********************
 * 下载项目排序 Vue 实例
 *********************/
var filterItem = new Vue({
    el: '#filterItem',
    data: {
        active: -1,
        sorts: [true, true, true, true, true, true],//true: desc, false:asc
        sorts_: 'desc',//true: desc, false:asc
    },
    beforeMount() {
        //暂无头绪，先不搞排序记住了
        /*
        let $tmp;

        //写入排序 Cookie
        if (($tmp = getCookie('sort') === null)) {
            //-1:默认 0: 下载速度 1:上传速度 2:大小 3:名称 4:状态 5:上传比率 6:最后活动时间
            ////desc（降序）  asc（升序）
            return setCookie('chuwen_qb_sort', '-1^^desc', 365);
        }

        $tmp = $tmp.split("^^");
        if ($tmp.length !== 2) {
            return setCookie('chuwen_qb_sort', '-1^^desc', 365);
        }

        this.active = parseInt($tmp[0]);
        this.sorts_ = $tmp[1];
        this.sorts[this.active] = $tmp[1] === 'desc';
        */
    },
    methods: {
        /**
         * 设置 下载任务 排序
         * @param num
         * @returns {boolean}
         */
        setOrderType(num) {
            this.active = num;

            if (num === -1) {
                return false
            }

            this.active = num;
            this.sorts[num] = !this.sorts[num];

            tab_contents.sortName = ['dlspeed', 'upspeed', 'total_size', 'name', 'state', 'ratio', 'last_activity'][this.active];
            tab_contents.sortType = {true: 'desc', false: 'asc'}[this.sorts[this.active]];
            this.sorts_ = {true: 'desc', false: 'asc'}[this.sorts[this.active]];


            //暂无头绪，先不搞排序记住了
            // setCookie('chuwen_qb_sort', '^^desc', 365);
        }
    }
});


/*********************
 * 右击显示菜单的 Vue 实例
 *********************/
var _content_menu = new Vue({
    el: '#li-content-menu',
    data: {
        uid: '',//也就是下载任务的唯一标识
        state: '',//下载状态
        auto_tmm: '',//自动 Torrent 管理 状态
        info: {}
    },
    methods: {
        /**
         * 暂停或继续
         * @param event
         */
        pause_or_continue: function (event) {
            let uid = this.uid,
                $operateName = "已暂停",
                $url = API + torrentsPause;//暂停下载;

            if (this.state === 'pausedUP' || this.state === 'pausedDL') {
                $operateName = "已继续";
                $url = API + torrentsResume;//继续下载
            }

            this.requestAPI($url, {
                hashes: uid,
                value: true
            }, requestHeader, $operateName);
        },

        /**
         * 强制继续
         * @param event
         */
        setForceStart: function (event) {
            let uid = this.uid,
                fileName = $$("li[data-uid='" + uid + "']").find(".file-name").html(),//文件名
                $operateName = "已强制继续",
                $url = API + torrentsSetForceStart;//强制继续;

            if (this.state === 'forcedUP') {
                $operateName = "已改为非强制继续";
                $url = API + torrentsResume;//继续
            }

            this.requestAPI($url, {
                hashes: uid,
                value: true
            }, requestHeader, $operateName);
        },

        /**
         * 删除下载项目
         */
        deleteTorrent: function () {
            let html = '<div class="mdui-p-t-3"></div><label class="mdui-checkbox">\n' +
                '    <input id="confirm-delete-file" type="checkbox"/>\n' +
                '    <i class="mdui-checkbox-icon"></i>\n' +
                '<i>同时从硬盘上删除文件</i>\n' +
                '</label>',
                that = this;

            mdui.confirm('你确定要从传输列表中删除选中的 torrents 吗？' + html, '确认删除',
                function () {
                },//关闭
                function () {//确认删除
                    that.requestAPI(API + torrentsDelete, {
                        hashes: that.uid,
                        deleteFiles: $$("#confirm-delete-file").prop('checked').toString()//true:删除文件  false:不删除文件
                    }, requestHeader, '删除成功');
                },
                {
                    history: false,
                    confirmText: '关闭',
                    cancelText: '确认删除',
                    modal: true
                }
            );
        },

        /**
         * 更改保存路径
         */
        setLocation: function () {
            let that = this;

            mdui.prompt('请输入新路径（留空不会更改）：', '更改保存路径',
                function (value) {
                    if (value !== '') {
                        that.requestAPI(API + torrentsSetLocation, {
                            hashes: that.uid,
                            location: value
                        }, requestHeader, '更改保存路径成功', function (stateCode) {
                            if (stateCode === 403) {
                                msg = '保存路径无访问权限，请重新设置！';
                            } else if (stateCode === 400) {
                                msg = '保存路径为空！';
                            } else if (stateCode === 409) {
                                msg = '无法创建保存路径目录！';
                            }
                            new mdui.snackbar({
                                message: msg
                            });
                        });
                    } else {
                        mdui.snackbar({
                            message: '留空不会更改保存路径！'
                        });
                    }
                },
                function (value) {
                },
                {
                    history: false,
                    confirmText: '确认更改',
                    cancelText: '关闭',
                    modal: true,
                    defaultValue: tab_contents.maindata['torrents'][that.uid]['save_path'],
                }
            );
        },

        /**
         * 重命名
         */
        setRename: function () {
            let that = this;

            mdui.prompt('请输入新路径（留空不会更改）：', '更改保存路径',
                function (value) {
                    if (value !== '') {
                        that.requestAPI(API + torrentsRename, {
                            hash: that.uid,
                            name: value
                        }, requestHeader, '重命名成功', function (stateCode) {
                            if (stateCode === 404) {
                                msg = '该下载项不存在！';
                            } else if (stateCode === 400) {
                                msg = '种子名不能为空！';
                            }
                            new mdui.snackbar({
                                message: msg
                            });
                        });
                    } else {
                        mdui.snackbar({
                            message: '留空不会进行重命名操作！'
                        });
                    }
                },
                function (value) {
                },
                {
                    history: false,
                    confirmText: '确认重命名',
                    cancelText: '关闭',
                    modal: true,
                    defaultValue: tab_contents.maindata['torrents'][that.uid]['name'],
                }
            );
        },

        /**
         * 开启/关闭 自动 Torrent 管理
         */
        setAutoManagement: function () {
            let that = this;

            this.requestAPI(API + torrentsSetAutoManagement, {
                hashes: that.uid,
                enable: !that.info['auto_tmm']
            }, requestHeader, '已' + (that.info['auto_tmm'] ? "关闭" : "开启") + '“自动 Torrent 管理”');
        },

        /**
         * 设置种子下载速率限制
         */
        setDownloadLimit: function () {
            let dl_limit = (this.info['dl_limit'] === -1) ? 0 : this.info['dl_limit'] / 1024,
                convent_limit = (this.info['dl_limit'] === -1) ? '无限制' : getFileSize(this.info['dl_limit']),
                that = this;

            let html = '<div class="slider-input-box mdui-p-b-4">\n' +
                '    <label>\n' +
                '    下载速度限制：' +
                '        <input type="number" placeholder="0 为不限制" value="' + dl_limit + '"/>\n' +
                '        <span>KB/s</span>\n' +
                '    </label>\n' +
                '<div class="mdui-p-t-2">= <span id="convent_limit">' + convent_limit + '</span></div>' +
                '</div>' +
                '<label class="mdui-slider mdui-slider-discrete">\n' +
                '  <input id="rateLimit" type="range" step="16" min="0" max="9216" value="' + dl_limit + '"/>\n' +
                '</label>';

            mdui.confirm(html, 'Torrent 下载速度限制',
                function () {
                    let val = $$(".slider-input-box input").val();
                    val = (val === '0') ? 'NaN' : parseInt(val) * 1024;

                    that.requestAPI(API + torrentsSetDownloadLimit, {
                        hashes: that.uid,
                        limit: val
                    }, requestHeader, '下载速度限制修改成功');
                },
                function () {
                },//关闭回调
                {
                    history: false,
                    confirmText: '确认修改',
                    cancelText: '关闭',
                    modal: true,
                }
            );

            mdui.mutation();

            $$(".slider-input-box input").on("change", function () {
                let speed = $$(this).val();
                $$('#rateLimit').val(speed);

                $$("#convent_limit").html(function () {
                    if (speed === 0) {
                        return '无限制';
                    }
                    return getFileSize(parseFloat(speed) * 1024) + "/s";
                }());
                mdui.updateSliders();//刷新滑块
            });
            $$('#rateLimit').on('input propertychange', function () {
                let speed = $$(this).val();
                $$(".slider-input-box input").val(speed);

                $$("#convent_limit").html(function () {
                    if (speed === 0) {
                        return '无限制';
                    }

                    return getFileSize(parseFloat(speed) * 1024) + "/s";
                }());
            })
        },

        /**
         * 设置种子上传速率
         */
        setUploadLimit: function () {
            let up_limit = (this.info['up_limit'] === -1) ? 0 : this.info['up_limit'] / 1024,
                convent_limit = (this.info['up_limit'] === -1) ? '无限制' : getFileSize(this.info['up_limit']),
                that = this;

            let html = '<div class="slider-input-box mdui-p-b-4">\n' +
                '    <label>\n' +
                '    上传速度限制：' +
                '        <input type="number" placeholder="0 为不限制" value="' + up_limit + '"/>\n' +
                '        <span>KB/s</span>\n' +
                '    </label>\n' +
                '<div class="mdui-p-t-2">= <span id="convent_limit">' + convent_limit + '</span></div>' +
                '</div>' +
                '<label class="mdui-slider mdui-slider-discrete">\n' +
                '  <input id="rateLimit" type="range" step="16" min="0" max="9216" value="' + up_limit + '"/>\n' +
                '</label>';

            mdui.confirm(html, 'Torrent 上传速度限制',
                function () {
                    let val = $$(".slider-input-box input").val();
                    val = (val === '0') ? 'NaN' : parseInt(val) * 1024;

                    that.requestAPI(API + torrentsSetUploadLimit, {
                        hashes: that.uid,
                        limit: val
                    }, requestHeader, '上传速度限制修改成功');
                },
                function () {
                },//关闭回调
                {
                    history: false,
                    confirmText: '确认修改',
                    cancelText: '关闭',
                    modal: true,
                }
            );

            //初始化动态生成的表单
            mdui.mutation();

            /**
             * 监听滑块值改变事件
             */
            $$(".slider-input-box input").on("change", function () {
                let speed = $$(this).val();
                $$('#rateLimit').val(speed);

                $$("#convent_limit").html(function () {
                    if (speed === 0) {
                        return '无限制';
                    }
                    return getFileSize(parseFloat(speed) * 1024) + "/s";
                }());
                mdui.updateSliders();//刷新滑块
            });

            /**
             * 监听滑块，然后转换为容易试读的单位
             */
            $$('#rateLimit').on('input propertychange', function () {
                let speed = $$(this).val();
                $$(".slider-input-box input").val(speed);

                $$("#convent_limit").html(function () {
                    if (speed === 0) {
                        return '无限制';
                    }
                    return getFileSize(parseFloat(speed) * 1024) + "/s";
                }());
            })
        },

        /**
         * 设置超级做种模式
         */
        setSuperSeeding: function () {
            let that = this;

            this.requestAPI(API + torrentsSetSuperSeeding, {
                hashes: that.uid,
                value: !that.info['super_seeding']
            }, requestHeader, '已' + (that.info['super_seeding'] ? "关闭" : "开启") + '“超级做种模式”');
        },

        /**
         * 强制重新校验种子
         */
        recheck: function () {
            let that = this;
            this.requestAPI(API + torrentsRecheck, {
                hashes: that.uid,
            }, requestHeader, '已开始“重新校验种子”');
        },

        /**
         * 强制向 Tracker 重新汇报
         */
        reannounce: function () {
            let that = this;
            this.requestAPI(API + torrentsReannounce, {
                hashes: that.uid,
            }, requestHeader, '已开始向 Tracker 服务器“重新汇报”');
        },

        /**
         * 限制分享率
         * @constructor
         */
        ShareRatio: function () {
            let html = '<form>\n' +
                '    <label class="mdui-radio">\n' +
                '        <input type="radio" name="group1" checked/>\n' +
                '        <i class="mdui-radio-icon"></i>\n' +
                '        使用全局分享限制\n' +
                '    </label>\n' +
                '    <label class="mdui-radio">\n' +
                '        <input type="radio" name="group1"/>\n' +
                '        <i class="mdui-radio-icon"></i>\n' +
                '        设置为无分享限制\n' +
                '    </label>\n' +
                '    <label class="mdui-radio">\n' +
                '        <input type="radio" name="group1" disabled/>\n' +
                '        <i class="mdui-radio-icon"></i>\n' +
                '        设置分享限制为\n' +
                '    </label>\n' +
                '</form>\n';
        },

        /**
         * 切换下载首尾段
         */
        toggleFirstLastPiecePrio: function () {
            let that = this;

            this.requestAPI(API + toggleFirstLastPiecePrio, {
                hashes: that.uid,
            }, requestHeader, '已执行“先下载首尾段”');
        },

        /**
         * 切换下载顺序
         */
        toggleSequentialDownload: function () {
            let that = this;
            this.requestAPI(API + toggleSequentialDownload, {
                hashes: that.uid,
            }, requestHeader, '已' + (that.info['seq_dl'] ? '关闭' : '开启') + '“连续顺序下载”');
        },

        /**
         * API 请求
         * @param api
         * @param data
         * @param header
         * @param operateName
         * @param callback
         * @param postFile
         */
        requestAPI: function (api = '', data = {}, header = {}, operateName = '', callback, postFile = false) {
            let uid = this.uid,
                fileName = $$("li[data-uid='" + uid + "']").find(".file-name").html();//文件名

            let opt = {
                url: api,
                method: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                headers: header,
                data: data,
                timeout: 6000,
                beforeSend: function (xhr) {
                    //显示进度指示器
                    $$("#taskState").removeClass("mdui-hidden");
                },
                complete: function () {
                    $$("#taskState").addClass("mdui-hidden");
                },

                /**
                 * HTTP 请求返回的状态码，处理方法
                 * 如果有回调，则回调，不是直接弹出错误提示
                 */
                statusCode: {
                    200: function (data, textStatus, xhr) {
                        if (typeof callback == "function") {
                            return callback(200, data);
                        } else {
                            return mdui.snackbar({
                                message: '“' + fileName + '” <b>' + operateName + '</b>！'
                            });
                        }
                    },
                    400: function () {
                        if (typeof callback == "function") {
                            return callback(400);
                        }
                    },
                    403: function () {
                        if (typeof callback == "function") {
                            return callback(403);
                        }
                    },
                    409: function () {
                        if (typeof callback == "function") {
                            return callback(409);
                        }
                    },
                    415: function (data, textStatus, xhr) {
                        if (typeof callback == "function") {
                            return callback(415, data.response);
                        }
                    }
                },
                error: function (e) {
                    if (typeof callback == "function") {
                    } else {
                        return mdui.snackbar({
                            message: '“' + fileName + '” 操作失败，出现未知的错误，可能是本程序问题，或网络问题！'
                        });
                    }
                }
            };

            if (postFile) {
                opt.processData = false;
                opt.contentType = false;
            }

            $$.ajax(opt);
        },

        /**
         * 复制内容成功方法
         * @param e
         * @returns {Snackbar}
         */
        onCopy: function (e) {
            return mdui.snackbar({
                message: '内容已经复制到剪贴板！'
            });
        },

        /**
         * 复制内容失败方法
         * @param e
         * @returns {Snackbar}
         */
        onError: function (e) {
            return mdui.snackbar({
                message: '内容复制到剪贴板失败，请刷新页面或者使用最新版 Chrome 浏览器吧！'
            });
        },
    }
});


/*********************
 * 服务器状态 Vue 实例
 *********************/
var serverState = new Vue({
    el: '#serverState',
    data: {
        server_state: {}
    }
});


/*********************
 * 输入链接添加任务表单 Vue 实例
 *********************/
var addTaskDialog = new Vue({
    el: '#addTaskDialog',
    data: {
        addType: false,//true 通过上传文件，false：通过链接

        categories: {},//分类

        batchFile: '',
        fileName: '',//文件名

        urls: '',//网址以换行符分隔
        // torrents: '',种子文件的原始数据。torrents可以多次展示。
        autoTMM: 'true',//[可选]{Torrent 管理模式}是否应使用自动洪流管理
        savepath: '',//[可选]保存在哪个路径
        cookie: '',//[可选]已发送Cookie以下载.torrent文件
        category: '',//[可选]种子类别
        skip_checking: false,//[可选]跳过哈希检查。可能的值为true，false（默认值）
        pausedd: true,//[可选]{开始 Torrent}在暂停状态下添加种子。可能的值为true，false（默认值）true：添加后暂停，false：添加后开始
        root_folder: true,//[可选]{创建子文件夹}创建根文件夹。可能的值是true，，未false设置（默认）
        rename: '',//[可选]{重命名 torrent}
        upLimit: '',//[可选]设置种子上传速度限制。单位 KB/s
        dlLimit: '',//[可选]设置种子下载速度限制。单位 KB/s
        sequentialDownload: false,//[可选]{以连续顺序下载}启用顺序下载。可能的值为true，false（默认值）
        firstLastPiecePrio: false,//[可选]{先下载首尾段}优先下载第一块。可能的值为true，false（默认值）

        infos: {},//添加种子 - 配置信息
    },
    methods: {
        //刷新动态生成的表单
        mduiMMutation(e) {
            mdui.mutation();
        },

        //清空选择
        deleteFile(e) {
            this.batchFile = '';
            this.fileName = '';
            // 清空，防止上传后再上传没有反应
            e.target.value = ''
        },

        // 拖拽上传
        fileDragover(e) {
            e.preventDefault()
        },

        //文件拖入
        fileDrop(e) {
            e.preventDefault();
            const file = e.dataTransfer.files[0]; // 获取到第一个上传的文件对象
            if (!file) return;

            this.batchFile = file;
            this.fileName = file.name;

            // 清空，防止上传后再上传没有反应
            e.target.value = ''
        },

        // 点击上传
        chooseUploadFile(e) {
            const file = e.target.files.item(0);
            if (!file) return;

            this.batchFile = file;
            this.fileName = file.name;

            // 清空，防止上传后再上传没有反应
            e.target.value = ''
        },
    },
    watch: {
        autoTMM() {
            mdui.mutation();//初始化动态生成的表单
        },

        /**
         * 检查 category 值变化
         * 主要用于选择“分类”后自动填充路径
         */
        category() {
            let field, savepath;

            if (!(field = this.categories[this.category])) {
                if (!(savepath = field['savepath'])) {
                    this.savepath = savepath;
                }
            }
        }
    }
});


/**************************
 * 添加种子任务事件监听
 **************************/
$$("#addTaskDialog").on({
    'open.mdui.dialog': function () {
        //选择文件 还是 输入链接
        // console.log(addTaskDialog.addType ? '文件' : '链接');

        //获取分类
        $$.ajax({
            method: 'POST',
            url: API + torrentsCategories,//获取分类列表
            headers: requestHeader,
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            timeout: 6000,
            success: function (res) {
                addTaskDialog.categories = res;
            },
            error: function (e) {
                return mdui.snackbar({
                    message: '获取分类列表失败，可能是本程序问题，或网络问题！请刷新页面再试！'
                });
            }
        });

        //获取配置信息
        $$.ajax({
            method: 'POST',
            url: API + appPreferences,
            headers: requestHeader,
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            timeout: 6000,
            success: function (res) {
                addTaskDialog.infos = res;
                addTaskDialog.savepath = res.save_path;
            },
            error: function (e) {
                return mdui.snackbar({
                    message: '获取默认添加设置失败，可能是本程序问题，或网络问题！请刷新页面再试！'
                });
            }
        });
    },
    'closed.mdui.dialog': function () {
        addTaskDialog.urls = '';
        addTaskDialog.fileName = '';
        addTaskDialog.batchFile = {};
    },
    'confirm.mdui.dialog': function () {
        let that = addTaskDialog;

        let requestData = {
            urls: that.urls,
            autoTMM: !that.autoTMM,
            cookie: that.cookie,
            rename: that.rename,
            category: that.category,
            paused: !that.pausedd,
            root_folder: that.root_folder,
            dlLimit: parseInt(that.dlLimit).toString(),
            upLimit: parseInt(that.upLimit).toString(),
        };

        //如果选择的不是自动
        if (!requestData.autoTMM) {
            requestData.savepath = that.savepath;
        }

        if (requestData.category === '') {
            requestData.category = '未分类';
        }

        filePostData = requestData;

        //判断类型，是文件还是URL
        if (addTaskDialog.addType) {
            if (!addTaskDialog.batchFile || !addTaskDialog.fileName) {
                return mdui.snackbar({
                    message: '请选择要上传的文件！'
                });
            }

            var filePostData = new FormData();
            filePostData.append("file", addTaskDialog.batchFile);
            for (let item in requestData) {
                if (item === 'urls') continue;
                filePostData.append(item, requestData[item]);
            }
        }

        return _content_menu.requestAPI(API + torrentsAdd, filePostData, requestHeader, "添加下载任务成功",
            function (code, msg = '') {
                if (code === 200) {
                    console.log(msg);

                    if (msg === 'Ok.') {
                        $msg = '添加完成！注意，这是由 qBittorrent API 返回的结果，这并不代表着已经成功添加 Torrent 任务';
                    } else if (msg === 'Fails.') {
                        $msg = '添加失败，请检查你输入文件，或者该任务已经添加！';
                        if (requestData['urls']) {
                            $msg = '添加失败，请检查你输入链接，或者该任务已经添加！';
                        }
                    } else {
                        $msg = '其它未知原因：' + msg;
                    }
                } else if (code === 415) {
                    $msg = '种子文件无效，请检查你输入的链接';
                    if (msg !== '' || !msg) {
                        $msg = data;
                    }
                } else if (code === 400) {
                    $msg = '错误的请求，可能是你上传的种子文件无效！';
                }

                return mdui.snackbar({
                    message: $msg
                });
            }, addTaskDialog.addType);
    }
});


/******************************
 * 【开始】监听鼠标右击事件 / 移动端长按事件
 ******************************/
$$(document).on('contextmenu', function (e) {
    // console.log(e);
    //0：移动端长按（iOS 端测试未通过）
    //2：电脑端右键
    if (e.button === 2 || e.button === 0) {
        if ($$(e.target).closest("li").attr("data-dl-item") === "true") {
            e.preventDefault();//阻止冒泡，阻止默认的浏览器菜单
            activeContentMenu(e);
        }
    }
});
var timer = null;
var startTime = '';
var endTime = '';
$$(document).on('touchstart', "#download-tab li", function (e) {
    var that = this;
    startTime = +new Date();
    timer = setTimeout(function () {
        if ($$(e.target).closest("li").attr("data-dl-item") === "true") {
            e.preventDefault();//阻止冒泡，阻止默认的浏览器菜单
            activeContentMenu(e);
        }
    }, 1000)
});
$$(document).on('touchend', "#download-tab li", function (e) {
    endTime = +new Date();
    clearTimeout(timer);
    // if (endTime - startTime < 1000) {
    //     console.info("长按时间不够长");
    // }
});
/******************************
 【结束】监听鼠标右击事件 / 移动端长按事件
 ******************************/


/**
 * 激活右键菜单
 * @param e
 */
function activeContentMenu(e) {
    $li_target = $$(e.target).closest("li");//目标 li DOM 对象

    _content_menu.uid = $li_target.attr("data-uid");//唯一ID
    _content_menu.state = $li_target.attr("data-state");//下载状态
    _content_menu.state = $li_target.attr("data-state");//下载状态
    _content_menu.info = tab_contents.maindata['torrents'][_content_menu.uid];//种子信息

    var _x = e.pageX;
    _y = e.pageY;

    let $div = $$("<div></div>").css({
        position: 'absolute',
        top: _y + 'px',
        left: _x + 'px',
    });
    $$('body').append($div);//创建临时DOM

    var inst = new mdui.Menu($div, '#li-content-menu', {
        fixed: true
    });
    inst.open();//打开菜单栏
    $div.remove();//销毁创建的临时DOM
}

/**
 * 统计种子下载状态（只是下载状态，非 tab 标签的那个）
 * @param torrents
 * @returns {{}}
 */
function downloadStateCount(torrents) {
    var downloadStateCounts = {};
    for (let item in downloadState) {
        downloadStateCounts[item] = onceArrKeyCount(torrents, 'state', item);
    }

    return downloadStateCounts;
}

/**
 * 将 Byte 转换为可读文件大小
 * @param fileByte
 * @param fractionDigits
 * @returns {string}
 */
function getFileSize(fileByte, fractionDigits = 1) {
    let value = fileByte;

    if (null == value || value === '' || 0 === value) {
        return "0B";
    }

    var unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(fractionDigits);//保留的小数位数
    return size + unitArr[index];
}