// Component/date-picker.js//index.js
/**
 * 单选使用方法：      <date-picker range="{{false}}" bindonselectdate="handleSelecteDate" />
 * 范围选择使用方法：  <date-picker range="{{true}}" bindonselectrangedate="handleSelecteRangeDate" />
 * 范围选择传入默认值使用方法：  <date-picker range="{{true}}" startDate="{{'2020/01/02'}}" endDate="{{'2020/01/05'}}" bindonselectrangedate="handleSelecteRangeDate" />
 * 
 *  <view class="label">日期选择(附带时间)</view>
 *     <date-picker bindonselectdate="handleSelecteDate" enableTime="{{true}}"/>
 *  </view>
 *  <view class="row">
 *     <view class="label">日期选择(传入默认选择时间)</view>
 *     <date-picker date="{{'2018/01/02'}}" bindonselectdate="handleSelecteDate" />
 *  </view>
 */

const today = new Date()

const week = [{
    value: '周日',
    class: 'weekend'
  },
  {
    value: '周一',
    class: ''
  },
  {
    value: '周二',
    class: ''
  },
  {
    value: '周三',
    class: ''
  },
  {
    value: '周四',
    class: ''
  },
  {
    value: '周五',
    class: ''
  },
  {
    value: '周六',
    class: 'weekend'
  },
]

Component({
  behaviors: [],

  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    enableTime: {
      type: Boolean,
      value: false,
    },
    date: {
      type: String,
      value: '',
      observer: 'init',
    },
    range: {
      type: Boolean,
      value: false
    },
    startDate: {
      type: String,
      value: ''
    },
    endDate: {
      type: String,
      value: ''
    }
  },

  data: {
    rangeFirst: [],
    rangeLast: [],
    clickNum: 0, //点击次数
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  ready: function () {
    this.init()
  },

  methods: {
    formatTime(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
      //author: meizz
      var o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds(), //毫秒
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
      return fmt
    },

    isDate(date) {
      if (date == null || date == undefined) {
        return false
      }
      return new Date(date).getDate() == date.substring(date.length - 2)
    },

    isLeapYear(y) {
      return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0)
    },

    isToday(y, m, d) {
      return y == today.getFullYear() && m == today.getMonth() + 1 && d == today.getDate()
    },

    isWeekend(emptyGrids, d) {
      return (emptyGrids + d) % 7 == 0 || (emptyGrids + d - 1) % 7 == 0
    },

    calEmptyGrid(y, m) {
      const result = new Date(`${y}/${m}/01 00:00:00`).getUTCDay()
      return result + 1 || ''
    },

    calDaysInMonth(y, m) {
      let leapYear = this.isLeapYear(y)
      if (m == 2 && leapYear) {
        return 29
      }
      if (m == 2 && !leapYear) {
        return 28
      }
      if ([4, 6, 9, 11].includes(m)) {
        return 30
      }
      return 31
    },

    calWeekDay(y, m, d) {
      return new Date(`${y}/${m}/${d} 00:00:00`).getUTCDay() || ''
    },

    calDays(y, m) {
      let {
        selected
      } = this.data
      let emptyGrids = this.calEmptyGrid(y, m)
      let days = []
      for (let i = 1; i <= 31; i++) {
        let ifToday = this.isToday(y, m, i)
        let isSelected = selected[0] == y && selected[1] == m && selected[2] == i
        let today = ifToday ? 'today' : ''
        let select = isSelected ? 'selected' : ''
        let weekend = this.isWeekend(emptyGrids, i) ? 'weekend' : ''
        let todaySelected = ifToday && isSelected ? 'today-selected' : ''
        let day = {
          value: i,
          class: `date-bg ${weekend} ${today} ${select} ${todaySelected}`,
        }
        days.push(day)
      }
      return days.slice(0, this.calDaysInMonth(y, m))
    },

    changeMonth: function (e) {
      let id = e.currentTarget.dataset.id
      let currYear = this.data.currYear
      let currMonth = this.data.currMonth
      currMonth = id == 'prev' ? currMonth - 1 : currMonth + 1
      if (id == 'prev' && currMonth < 1) {
        currYear -= 1
        currMonth = 12
      }
      if (id == 'next' && currMonth > 12) {
        currYear += 1
        currMonth = 1
      }

      const emptyGrids = this.calEmptyGrid(currYear, currMonth)
      let days = this.calDays(currYear, currMonth)
      if (this.data.range) {
        this.setRangeFirstAndLast()
        days = this.renderRangeBody(days, currYear, currMonth, 0)
      }

      this.setData({
        currYear,
        currMonth,
        emptyGrids,
        days
      })


    },

    handleSelectDate: function (e) {
      let data = e.target.dataset.selected
      const selected = [data[0], data[1], data[2]]
      this.setData({
        selected
      })

      let days = this.calDays(data[0], data[1])
      this.setData({
        currYear: data[0],
        currMonth: data[1],
        days: days,
      })
    },

    handleDatePickerChange(e) {
      let [year, month] = e.detail.value.split('-')
      year = parseInt(year)
      month = parseInt(month)
      this.setData({
        currYear: year,
        currMonth: month
      })
      const emptyGrids = this.calEmptyGrid(year, month)
      let days = this.calDays(year, month)
      if (this.data.range) {
        this.setRangeFirstAndLast()
        days = this.renderRangeBody(days, year, month, 0)
      }
      this.setData({
        emptyGrids,
        days
      })

    },

    handleTimePickerChange(e) {
      const time = e.detail.value
      this.setData({
        time
      })
    },

    /**
     * 清空
     */
    handleReset(e) {
      this.setData({
        selected: [],
        time: '',
        rangeFirst: [],
        rangeLast: [],
        clickNum: 0
      })
      const days = this.calDays(this.data.currYear, this.data.currMonth)
      this.setData({
        days
      })
      // this.triggerEvent('onselectdate', {})
    },

    init() {
      if (this.data.range) {
        this.setData({
          date: this.data.startDate
        })
      }
      const {
        date
      } = this.data
      console.log(this.data.date)
      const dateTime = this.isDate(date) ? new Date(date) : today

      const year = dateTime.getFullYear()
      const month = dateTime.getMonth() + 1
      const dayInMonth = dateTime.getDate()
      const dayInWeek = dateTime.getDay()
      const time = this.formatTime(dateTime, 'hh:mm')

      let selected = [year, month, dayInMonth]
      this.setData({
        currYear: year,
        currMonth: month,
        dayInWeek,
        dayInMonth,
        week,
        time,
        selected
      })
      const emptyGrids = this.calEmptyGrid(year, month)
      let days = this.calDays(year, month)

      if (this.data.range) {
        console.log(this.data.startDate)
        if(this.data.startDate){
          let start = new Date(this.data.startDate)
          let end = new Date(this.data.endDate)
          this.setData({
            rangeFirst: [start.getFullYear(), start.getMonth() + 1, start.getDate()],
            rangeLast: [end.getFullYear(), end.getMonth() + 1, end.getDate()],
            selected: []
          })
        }else{
          this.setData({
            select:[]
          })
        }
        this.setRangeFirstAndLast()
        days = this.renderRangeBody(days, year, month, 0)
      }

      this.setData({
        emptyGrids,
        days
      })
    },

    handleChooseToday() {
      this.setData({
        date: today.toString()
      })
      this.init()
    },

    /**
     * 单选点击确定
     */
    handleConfirm(e) {
      const {
        selected,
        enableTime
      } = this.data
      console.log(selected)
      if (selected && selected.length > 0) {
        const dateStr = selected.join('/') + ' ' + this.data.time
        const dateStr1 = this.formatTime(new Date(dateStr), enableTime ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd')
        this.triggerEvent('onselectdate', {
          date: dateStr1
        })
      } else {
        this.triggerEvent('onselectdate', {
          date: ''
        })
      }
    },

    /**
     * 范围选择
     */
    rangeSelect: function (e) {
      var clickNum = this.data.clickNum + 1;
      this.setData({
        clickNum: clickNum
      })
      let data = e.target.dataset.selected
      const selected = [data[0], data[1], data[2]]
      this.setData({
        selected
      })
      // 首次点击
      if (clickNum % 2 == 1) {
        this.setData({
          rangeFirst: e.target.dataset.selected
        })
      } else {
        this.setData({
          rangeLast: e.target.dataset.selected
        })
      }
      // 设置范围起止
      this.setRangeFirstAndLast()
      let days = this.renderRangeBody(this.data.days, data[0], data[1], data[2])
      this.setData({
        days: days
      })

    },

    /**
     * 判断日期大小
     * startDate<endDate    true
     */
    checkStartDateLessthenEndDate(startDate, endDate) {
      if (startDate[0] > endDate[0]) {
        return false;
      } else {
        if (startDate[1] > endDate[1]) {
          return false;
        } else if (startDate[1] == endDate[1]) {
          if (startDate[2] > endDate[2]) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      }
    },

    /**
     * 判断是否当前日期
     */
    isCurrentDay(date, y, m, d) {
      if (date.length > 0 && date[0] == y && date[1] == m && date[2] == d) {
        return true
      }
      return false;
    },

    /**
     * 判断日期是否在startDate和endDate之间
     */
    isCenterDay(startDate, endDate, y, m, d) {
      var armDate = new Date(`${y}/${m}/${d}`)
      var oDate1 = new Date(`${startDate[0]}/${startDate[1]}/${startDate[2]}`);
      var oDate2 = new Date(`${endDate[0]}/${endDate[1]}/${endDate[2]}`);
      if (oDate1.getTime() <= armDate.getTime() && oDate2.getTime() >= armDate.getTime()) {
        return true
      }
      return false;
    },

    /**
     * 渲染日期选择范围部分
     */
    renderRangeBody(days, y, m, d) {
      // let days = this.data.days
      let emptyGrids = this.calEmptyGrid(y, m)
      let rangeLast = this.data.rangeLast
      let hasRangeLast = rangeLast.length > 0 && !isNaN(rangeLast[0])
      let theSameDay = this.isTheSameDay(this.data.rangeFirst, this.data.rangeLast)
      for (let i = 1; i <= 31; i++) {
        let isSelected = d == i
        let select = isSelected ? 'selected' : ''
        let weekend = this.isWeekend(emptyGrids, i) ? 'weekend' : ''
        let isStart_day = this.isCurrentDay(this.data.rangeFirst, y, m, i)
        let start_day = isStart_day && hasRangeLast && !theSameDay ? 'range_start' : ''
        let isEnd_day = this.isCurrentDay(this.data.rangeLast, y, m, i)
        let end_day = isEnd_day && !theSameDay ? 'range_end' : ''
        let center_day = this.isCenterDay(this.data.rangeFirst, this.data.rangeLast, y, m, i) ? 'range_center' : ''
        let day = {
          value: i,
          class: `range_date_bg ${select} ${weekend} ${start_day} ${end_day} ${center_day} `,
        }
        days[i - 1] = day
      }
      return days.slice(0, this.calDaysInMonth(y, m))
    },

    /**
     * 设置范围起止
     */
    setRangeFirstAndLast() {
      // 比较第一次点击与第二次点击的大小
      let checked = this.checkStartDateLessthenEndDate(this.data.rangeFirst, this.data.rangeLast)
      if (!checked) {
        let startDate = this.data.rangeFirst
        let endDate = this.data.rangeLast
        this.setData({
          rangeFirst: endDate,
          rangeLast: startDate
        })
      }
    },

    /**
     * 判断是否是同一天
     */
    isTheSameDay(startDay, endDay) {
      if (startDay.length > 0 && endDay.length > 0 && startDay[0] == endDay[0] && startDay[1] == endDay[1] && startDay[2] == endDay[2]) {
        return true
      }
      return false
    },

    /**
     * 范围选择点击确定
     */
    handleRangeConfirm() {
      // 获取起止日期
      console.log(this.data.rangeFirst, this.data.rangeLast)
      const {
        selected,
      } = this.data
      console.log(selected)
      if (this.data.rangeFirst &&  this.data.rangeFirst.length > 0) {
        console.log(12154)
        let startDate = this.data.rangeFirst.join("-")
        let endDate = this.data.rangeLast.join("-")
        // const dateStr = selected.join('/') + ' ' + this.data.time
        // const dateStr1 = this.formatTime(new Date(dateStr), enableTime ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd')
        this.triggerEvent('onselectrangedate', {
          startDate: startDate,
          endDate: endDate
        })
      } else {
        this.triggerEvent('onselectrangedate', {
          startDate: '',
          endDate: ''
        })
      }
    }

  },
})