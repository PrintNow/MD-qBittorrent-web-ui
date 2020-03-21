/*!
 * 公共常量
 * MD-qBittorrent-web-ui v0.1.0
 * Copyright 2020 chuwen<wenzhouchan@gmail.com>
 * Licensed under GNU General Public License v3.0
 */

/**
 * 定义　qBittorrent API　地址
 * 末尾不要加　／
 * @type {string}
 */
// const API = "https://192.168.111.11/";
const API = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;

/**
 * 定义公共请求头
 * @type {{"x-auth": string}}
 */
const requestHeader = {
    // 'x-auth': '',
    // 'Content-Type': 'application/x-www-form-urlencoded'
};


const syncMaindata = '/api/v2/sync/maindata',//获取主要数据
    torrentPeers = '/api/v2/sync/torrentPeers',//获取用户列表

    torrentsProperties = '/api/v2/torrents/properties',//获取洪流通用属性，获取种子详细信息
    torrentsTrackers = '/api/v2/torrents/trackers',//获取 trackers 信息
    torrentsFiles = '/api/v2/torrents/files',//获取 内容 信息
    torrentsCategories = '/api/v2/torrents/categories',//获取 分类 列表
    torrentsRemoveCategories = '/api/v2/torrents/removeCategories',//移除分类

    torrentsResume = '/api/v2/torrents/resume',//继续下载
    torrentsPause = '/api/v2/torrents/pause',//暂停下载
    torrentsSetForceStart = '/api/v2/torrents/setForceStart ',//强制开始
    torrentsDelete = '/api/v2/torrents/delete ',//删除种子
    torrentsSetLocation = '/api/v2/torrents/setLocation ',//更改保存路径
    torrentsRename = '/api/v2/torrents/rename',//重命名
    torrentsSetAutoManagement = '/api/v2/torrents/setAutoManagement',//自动种子管理
    torrentsSetDownloadLimit = '/api/v2/torrents/setDownloadLimit',//设置种子下载速率
    torrentsSetUploadLimit = '/api/v2/torrents/setUploadLimit',//设置种子上传速率
    torrentsSetSuperSeeding = '/api/v2/torrents/setSuperSeeding',//设置超级做种模式
    torrentsRecheck = '/api/v2/torrents/recheck',//重新校验种子
    torrentsReannounce = '/api/v2/torrents/reannounce',//强制重新汇报
    torrentsAdd = '/api/v2/torrents/add',//链接-添加种子

    torrentsFilePrio = '/api/v2/torrents/filePrio',//链接-添加种子

    toggleFirstLastPiecePrio = '/api/v2/torrents/toggleFirstLastPiecePrio',//种子-先下载首尾段
    toggleSequentialDownload = '/api/v2/torrents/toggleSequentialDownload',//种子-切换下载顺序


    appPreferences = '/api/v2/app/preferences';//获取应用程序首选项 /index_with_tree.html#get-application-preferences

/**
 * Tracker 服务器状态
 * @param status
 * @param type
 * @returns {string}
 */
Vue.prototype.trackerStatusCN = function(status, type=1){
    let source =[
        'Tracker is disabled (used for DHT, PeX, and LSD)',
        'Tracker has not been contacted yet',
        'Tracker has been contacted and is working',
        'Tracker is updating',
        'Tracker has been contacted, but it is not working (or doesn\'t send proper replies)'
    ];
    let translate = [
        '跟踪器已禁用（用于 DHT、PeX 和 LSD）',
        '尚未联系跟踪器',
        '已联系跟踪器并正在工作',
        '跟踪器正在更新',
        '已联系跟踪器，但无法正常工作（或未发送正确答复）'
    ];

    let abbreviation = [
        '禁用',
        '尚未联系',
        '工作中',
        '正在更新',
        '工作异常'
    ];

    if(type === 0){
        return translate[status];
    }

    return abbreviation[status];
};

/**
 * 整数转百分比
 * @param point
 * @param fractionDigits
 * @returns {string}
 */
Vue.prototype.toPercent = function (point, fractionDigits = 1) {
    var str = Number(point * 100).toFixed(fractionDigits);
    str += "%";
    return str;
};

/**
 * 获取文件大小//
 * @param fileByte
 * @returns {[string, string]|[string, string]}
 */
Vue.prototype.getFileSize = function (fileByte) {
    let value = fileByte;

    if (null == value || value === '' || 0 === value) {
        return ['0.00', 'B'];
    }

    var unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2);//保留的小数位数

    return [size, unitArr[index]];
};

/**
 * 转小时分钟
 * @param minutes
 * @returns {string}
 */
Vue.prototype.toHourMinute = function (minutes) {
    return (Math.floor(minutes / 60) + "小时" + (minutes % 60) + "分");
};

/**
 * 最后活动时间
 * @param seconds
 * @returns {string}
 */
Vue.prototype.lastActiveTime = function (seconds) {
    var val = seconds;
    if (val < 1)
        return '∞';
    else
        return '%1前'.replace('%1', this.friendlyDuration((new Date()) / 1000 - val));
};

Vue.prototype.friendlyDuration = function (seconds) {
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
};

/**
 * 格式化时间 yyyy/MM/dd hh:mm:ss
 * @param time
 */
Vue.prototype.formatTime = function (time) {
    return new Date(time * 1000).format('yyyy/MM/dd hh:mm:ss');
};

//获取cookie
Vue.prototype.getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg)))
        return (arr[2]);
    else
        return null;
};

//设置cookie,增加到vue实例方便全局调用
Vue.prototype.setCookie = function (c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
};

//删除cookie
Vue.prototype.delCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
};

//下载状态
const _downloadState = {
    stalledUP: {
        icon: 'file_upload',
        color: 'mdui-text-color-theme',
        text: '做种'
    },//做种上传<没有活动>

    stalledDL: {
        icon: 'file_download',
        color: 'mdui-text-color-lime-800',
        text: '等待'
    },//等待下载

    downloading: {
        icon: 'file_download',
        color: 'mdui-text-color-green-400',
        text: '下载'
    },//下载中

    uploading: {
        icon: 'cloud_upload',
        // icon: 'file_upload',
        color: 'mdui-text-color-blue'
    },//上传中<活动中>

    pausedDL: {
        icon: 'pause',
        color: 'mdui-text-color-orange',
        text: '暂停'
    },//暂停下载

    pausedUP: {
        icon: 'check',
        color: 'mdui-text-color-green',
        text: '完成'
    },//已暂停（完成下载）

    allocating: {
        icon: 'setting',
        color: '',
        text: '配置'
    },

    error: {
        icon: 'help_outline',
        color: 'mdui-text-color-red',
        text: '未知状态'
    }
};

const downloadState = {
    stalledUP: {
        icon: 'file_upload',
        color: 'mdui-text-color-indigo',
        text: '做种'
    },//做种上传<没有活动>
    stalledDL: {
        icon: 'file_download',
        color: 'mdui-text-color-lime-800',
        text: '等待'
    },//等待下载
    downloading: {
        icon: 'file_download',
        color: 'mdui-text-color-green',
        text: '下载'
    },//下载中
    uploading: {
        icon: 'cloud_upload',
        color: 'mdui-text-color-blue',
        text: '做种'
    },//上传中<活动中>
    pausedDL: {
        icon: 'pause',
        color: 'mdui-text-color-orange',
        text: '暂停'
    },//暂停下载
    pausedUP: {
        icon: 'check',
        color: 'mdui-text-color-green',
        text: '完成'
    },//已暂停（完成下载）
    allocating: {
        icon: 'settings',
        color: '',
        text: '配置'
    },
    error: {
        icon: 'info_outline',
        color: 'mdui-text-color-red',
        text: '错误'
    },
    metaDL: {
        icon: 'file_download',
        color: 'mdui-text-color-indigo',
        text: '下载元数据'
    },
    forcedDL: {
        icon: 'file_download',
        color: 'mdui-text-color-purple',
        text: '[F] 下载'
    },//强制下载
    forcedUP: {
        icon: 'file_upload',
        color: 'mdui-text-color-purple',
        text: '[F] 做种'
    },//强制做种

    queuedDL: {
        //transform: rotate(180deg);
        icon: 'merge_type',
        color: 'mdui-text-color-orange',
        text: '队列'
    },
    queuedUP: {
        icon: 'merge_type',
        color: 'mdui-text-color-orange',
        text: '队列'
    },

    checkingDL: {
        icon: 'compare_arrows',
        color: 'mdui-text-color-green',
        text: '校验'
    },
    checkingUP: {
        icon: 'compare_arrows',
        color: 'mdui-text-color-blue',
        text: '校验'
    },

    queuedForChecking: {
        icon: 'swap_vert',
        color: 'mdui-text-color-green',
        text: '列队校验'
    },

    checkingResumeData: {
        icon: 'autorenew',
        color: 'mdui-text-color-teal',
        text: '校验恢复数据'
    },

    moving: {
        icon: 'hdr_strong',
        color: 'mdui-text-color-teal',
        text: '移动'
    },

    missingFiles: {
        icon: 'warning',
        color: 'mdui-text-color-orange',
        text: '丢失文件'
    },

    weizhi: {
        icon: 'help_outline',
        color: 'mdui-text-color-red',
        text: '未知'
    }
};

const tabList = {
    all: {
        text: '全部'
    },
    downloading: {
        text: '下载'
    },
    seeding: {
        text: '做种'
    },
    completed: {
        text: '完成'
    },
    resumed: {
        text: '进行中'
    },
    paused: {
        text: '暂停'
    },
    active: {
        text: '活动'
    },
    inactive: {
        text: '非活动'
    },
    errored: {
        text: '错误'
    }
};