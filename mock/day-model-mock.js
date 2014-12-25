module.exports = {
    '/clickdial/bill_report.do?m=DayList' : {
        'get' : {
            'data' : {
                'code' : 0,
                'msg' : 'success',
                'data' : {
                    'code' : 0,
                    'msg' : 'success',
                    'data' : {
                        'totalCount|0-1000' : 100,
                        'pageSize' : 8,
                        'currentPage' : 1,
                        'values|0-10' : [
                            {
                                'id|0-100' : 0,
                                'caller' : '@phone',
                                'callee' : '@phone',
                                'callerProv' : '北京',
                                'calleeProv' : '上海',
                                'startDate' : '@DATE(YYYY-MM-DD hh:mm:ss)',
                                'endDate' : '@DATE(YYYY-MM-DD hh:mm:ss)',
                                'duration|0-200' : 0,
                                'state' : '@pickOne(0,1,-1)'
                            }
                        ]
                    }
                }
            }
        }
    }
};