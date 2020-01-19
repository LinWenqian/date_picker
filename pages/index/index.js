//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showSelectDateBox:false,
    showSelectRangeDateBox:false
  },
  onLoad: function () {
  },
  selectedDate:function(){
    this.setData({
      showSelectDateBox:true,
      showSelectRangeDateBox:false
    })
  },
  handleSelecteDate:function(e){
    console.log(e)
    this.setData({
      date:e.detail.date,
      showSelectDateBox:false
    })
  },
  selectedRangeDate:function(){
    this.setData({
      showSelectRangeDateBox:true,
      showSelectDateBox:false
    })
  },
  handleSelecteRangeDate:function(e){
    console.log(e)
    this.setData({
      startDate:e.detail.startDate,
      endDate:e.detail.endDate,
      showSelectRangeDateBox:false
    })
  }
})
