let title = decodeURIComponent(getQueryVariable('title'));//标题
$$("#_title").html(title);//设置标题
document.title = title+" - 种子详细信息";

let HASH = getQueryVariable('hash');//获取 HASH 值
HASH = HASH ? HASH : '';

var tabVM = new Vue({
    el: '#tab-contents',
    data: {
        tabID: -1,
        info: {
            share_ratio: 0,
            piece_size: 0,
            save_path: 'NaN',
            pieces_num: 'NaN',
            comment: 'None'
        },
        tracker: [
            {
                "msg": "N/A",
                "num_downloaded": 0,
                "num_leeches": 0,
                "num_peers": 0,
                "num_seeds": 0,
                "status": 0,
                "tier": "",
                "url": "** [DHT] **"
            }
        ],
        hash: 'None',
        tabTimer: {},
        content: {},//内容数据
        userIPs: [],//用户IP
    },
    beforeMount() {
        this.tabID = 0;

        this.infoInterval();
        this.trackerInterval();
        this.contentInterval();
    },
    methods: {
        //API 请求
        requestInfoAPI(url, callback) {
            $$.ajax({
                url: url,
                data: {
                    hash: HASH
                },
                dataType: 'json',
                success(res) {
                    if (typeof callback === "function") {
                        return callback(res);
                    }
                },
            });

            this.$nextTick(function () {
                mdui.mutation();
            })
        },

        toFixedd(num, d = 2) {
            return num.toFixed(2);
        },

        //信息 数据更新
        infoInterval() {
            this.requestInfoAPI(API + torrentsProperties, function (res) {
                tabVM.hash = HASH;
                tabVM.info = res;
            });
        },

        //Tracker 服务器列表
        trackerInterval() {
            this.requestInfoAPI(API + torrentsTrackers, function (res) {
                tabVM.tracker = res;
            });
        },

        //内容
        contentInterval() {
            this.requestInfoAPI(API + torrentsFiles, function (res) {
                tabVM.content = res;
            });
        },

        num_na(num) {
            return num < 0 ? 'N/A' : num;
        },

        /**
         * 调整文件优先顺序，我也不太懂是不是这个意思，反正 API 文档里是这么写的
         * @param id
         * @param event
         * @returns {Snackbar|Snackbar|boolean}
         */
        filePrio(id, event) {
            this.content[id]['priority'] = !this.content[id]['priority'];
            flag = this.content[id]['priority'] ? 1 : 0;

            $$.ajax({
                url: API + torrentsFilePrio,
                data: {
                    hash: HASH,
                    id: id,
                    priority: flag
                },
                header: requestHeader,
                statusCode: {
                    200: function (text) {
                        if (!text) {
                            mdui.snackbar({
                                message: '调整优先顺序成功'
                            });
                        } else {
                            mdui.snackbar({
                                message: text
                            });
                        }
                    },
                    400: function () {
                        mdui.snackbar({
                            message: '调整优先顺序失败，原因：优先顺序无效'
                        });
                    },
                    404: function () {
                        mdui.snackbar({
                            message: '该种子为找到，请刷新页面'
                        });
                    },
                    409: function () {
                        mdui.snackbar({
                            message: '种子文件尚未下载'
                        });
                    }
                },
                error() {
                    return mdui.snackbar({
                        message: '出现未知的错误，请重试'
                    });
                }
            });

            // console.log(id);

            if (event.preventDefault) event.preventDefault();  //标准技术
            if (event.returnValue) event.returnValue = false;  //IE
            return false;//用于处理使用对象属性注册的处理程序
        }
    },
    computed: {},
    watch: {
        //监视 tabID 值的变化，变化了会触发此事件
        tabID() {
            //遍历清理有关 tab 任务定时器
            for (let item in this.tabTimer) {
                clearInterval(this.tabTimer[item]);
            }

            if (this.tabID === 0) {
                this.tabTimer['info'] = setInterval(this.infoInterval, 1000);
            } else if (this.tabID === 1) {
                this.tabTimer['tracker'] = setInterval(this.trackerInterval, 4000);
            } else if (this.tabID === 4) {
                this.tabTimer['content'] = setInterval(this.contentInterval, 4000);
            }

            this.$nextTick(function () {
                mdui.mutation();
            });
        },
        tracker() {
            mdui.mutation();
        }
    }
});

/**
 * 用户 - 表格
 */
layui.use(['table'], function () {
    var table = layui.table;
    //执行渲染
    table.render({
        id: 'userTable',
        elem: '#userTable' //指定原始表格元素选择器（推荐id选择器）
        , height: 600 //容器高度
        , toolbar: '#tableToolbar'
        , defaultToolbar: ["filter", "exports", "print"]
        , cols: [[ //表头
            // {
            //     field: '国家', title: '', width: 41, templet: function (d) {
            //         return '<div class="country icon-cn"></div>';
            //     }
            // },
            {
                field: 'ip', title: 'IP', sort: true, minWidth: 120
            },
            {field: 'port', title: '端口', sort: true, minWidth: 50},
            {field: 'client', title: '客户端', sort: true, minWidth: 90},
            {
                field: 'dl_speed', title: '下载速度', sort: true, minWidth: 100, templet: function (d) {
                    return tabVM.getFileSize(d.dl_speed).join(' ') + '/s';
                }
            },
            {
                field: 'up_speed', title: '上传速度', sort: true, minWidth: 100, templet: function (d) {
                    return tabVM.getFileSize(d.up_speed).join(' ') + '/s';
                }
            },
            {
                field: 'downloaded', title: '已下载', sort: true, minWidth: 90, templet: function (d) {
                    return tabVM.getFileSize(d.downloaded).join('');
                }
            },
            {
                field: 'uploaded', title: '已上传', sort: true, minWidth: 90, templet: function (d) {
                    return tabVM.getFileSize(d.uploaded).join('');
                }
            },
            {field: 'connection', title: '连接', sort: true, minWidth: 60},
            {field: 'flags', title: '标识', sort: true, minWidth: 60},
            {field: 'relevance', title: '文件关联', sort: true, minWidth: 80},
            {field: 'files', title: '文件', sort: true, minWidth: 200},
        ]]
        , url: API + torrentPeers + '?hash=' + HASH
        , parseData: function (res) { //res 即为原始返回的数据
            let data = function (peers) {
                let tmp = [], tmp_, ips = [];

                for (let item in peers) {
                    tmp_ = peers[item];
                    ips.push(tmp_['ip']);
                }

                for (let item in peers) {
                    tmp_ = peers[item];
                    tmp_.user = item;
                    tmp_.country = res.data[tmp_['ip']]['country']['code'];

                    ips.push(tmp_['ip']);
                    tmp.push(tmp_);
                }
                return tmp;
            };

            return {
                "code": 0, //解析接口状态
                "msg": "ok", //解析提示文本
                "count": 2, //解析数据长度
                "data": data(res.peers)
            };
        }
    });
});


//事件委托
//阻止冒泡，阻止点击内容时选中复选框
$$(document).on("click", "#tab-content .mdui-list-item-content", function (e) {
    var event = event || window.event;  //用于IE
    if (event.preventDefault) event.preventDefault();  //标准技术
    if (event.returnValue) event.returnValue = false;  //IE
    return false;//用于处理使用对象属性注册的处理程序
});


//Tab 切换事件监听
$$("#tab-info").on('change.mdui.tab', function (event) {
    tabVM.tabID = event._detail.index;
});


/**
 * 获取 GET 参数
 * @param variable
 * @returns {string|boolean}
 */
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
}