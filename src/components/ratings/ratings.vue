<template>
  <div class="ratings" v-el:ratings>
    <div class="ratings-content">
      <div class="overview">
        <div class="overview-left">
          <h1 class="score">{{seller.score}}</h1>
          <div class="title">综合评分</div>
          <div class="rank">高于周边商家{{seller.rankRate}}%</div>
        </div>
        <div class="overview-right">
          <div class="score-wrapper">
            <span class="title">服务态度</span>
            <star :size="36" :score="seller.serviceScore"></star>
            <span class="score">{{seller.serviceScore}}</span>
          </div>
          <div class="score-wrapper">
            <span class="title">商品评分</span>
            <star :size="36" :score="seller.foodScore"></star>
            <span class="score">{{seller.foodScore}}</span>
          </div>
          <div class="delivery-wrapper">
            <span class="title">送达时间</span>
            <span class="delivery">{{seller.deliveryTime}}分钟</span>
          </div>
        </div>
      </div>

      <split></split> 
      <rating-select :select-type="selectType" :only-content="onlyContent" :ratings="ratings"></rating-select>

      <div class="rating-wrapper">
        <ul>
          <li v-show="needShow(rating.rateType, rating.text)" class="rating-item" v-for="rating in ratings">
            <div class="avatar">
              <img :src="rating.avatar" width="28" height="28">
            </div>
            <div class="content">
              <h1 class="name">{{rating.username}}</h1>
              <div class="star-wrapper">
                <star :size="24" :score="rating.score"></star>
                <span v-show="rating.deliveryTime" class="delivery">{{rating.deliveryTime}}分钟送达</span>
              </div>
              <p class="text">{{rating.text}}</p>
              <div v-show="rating.recommend.length" class="recommend">
                <span class="icon-thumb_up"></span>
                <span class="recommend-item" v-for="item in rating.recommend">{{item}}</span>
              </div>
              <div class="time">
                {{rating.rateTime | formatDate}}
              </div>
            </div>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script>
  import Star from 'components/star/star.vue';
  import Split from 'components/split/split.vue';
  import RatingSelect from 'components/ratingselect/ratingselect.vue';
  import BScroll from 'better-scroll';

  const ALL = 2;
  const ERR_OK = 0;

  export default {
    data() {
      return {
        msg: 'Hello',
        ratings: [],
        selectType: ALL,
        onlyContent: true,
      };
    },
    props: {
      seller: {
        type: Object,
      },
    },
    components: {
      Star,
      Split,
      RatingSelect,
    },
    created() {
      this.$http.get('/api/ratings').then((response) => {
        const res = response.body;
        if (res.errno === ERR_OK) {
          this.ratings = res.data;
          this.$nextTick(() => {
            this.scroll = new BScroll(this.$els.ratings, {
              click: true,
            });
          });
        }
      });
    },
    filters: {
      formatDate(time) {
        // const date = new Date(time);
        // const year = date.getFullYear();
        // const month = date.getMonth() + 1;
        // const day = date.getDate();
        // const hour = date.getHours();
        // const minutes = date.getMinutes();
        const date = new Date(time);
        const year = date.getFullYear();
        const o = {
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minutes: date.getMinutes(),
        };
        function* entries(obj) {
          for (const key of Object.keys(obj)) {
            yield [key, obj[key]];
          }
        }
        for (const [k, val] of entries(o)) {
          // console.log(k = k + 1);
          o[k] = ('00' + val).substr(('' + val).length);
        }
        return `${year}-${o.month}-${o.day} ${o.hour}:${o.minutes}`;
      },
    },
    events: { // 接收子组件派发的事件处理传过来的数据
      'ratingtype.select'(type) {
        this.selectType = type;
        this.$nextTick(() => { // vue中DOM的更新是异步的
          this.scroll.refresh(); // 内容不一样多，better-scroll要重新计算高度
        });
      },
      'content.toggle'(onlyContent) {
        this.onlyContent = onlyContent;
        this.$nextTick(() => {
          this.scroll.refresh();
        });
      },
    },
    methods: {
      needShow(type, text) {
        if (this.onlyContent && !text) {
          return false; // 只显示有内容但此时text为空
        }
        if (this.selectType === ALL) {
          return true; // 显示全部
        } else {
          return type === this.selectType; // 选择类型与评价的类型一致才能被显示
        }
      },
    },
  };

</script>

<style lang="stylus">
  @import "../../common/stylus/mixin.styl";
  .ratings
    position: absolute
    top: 174px
    bottom: 0
    left: 0
    width: 100%
    overflow: hidden
    .overview
      display: flex
      padding: 18px 0
      .overview-left
        flex: 0 0 137px
        padding: 6px 0
        width: 137px
        text-align: center
        border-right: 1px solid rgba(7, 17, 27, 0.1)
        @media only screen and (max-width:320px)
          flex: 0 0 120px
          width: 120px
        .score
          margin-bottom: 6px
          line-height: 28px
          font-size: 24px
          color: rgb(255, 153, 0)         
        .title
          margin-bottom: 8px
          line-height: 12px
          font-size: 12px
          color: rgb(7, 17, 27)
        .rank
          line-height: 10px
          font-size: 10px
          color: rgb(147, 153, 159)
      .overview-right
        flex: 1
        padding: 6px 0 6px 24px
        @media only screen and (max-width:320px)
          padding-left:6px
        .score-wrapper          
          margin-bottom:8px
          font-size: 0
          .title
            display: inline-block
            vertical-align : top
            line-height: 18px
            font-size: 12px
            color: rgb(7, 17, 27)
          .star
            display:inline-block
            vertical-align : top
            margin: 0 12px
          .score
            display: inline-block
            vertical-align : top
            line-height: 18px
            font-size: 12px
            color: rgb(255, 153, 0)
        .delivery-wrapper
          font-size: 0
          .title
            line-height: 18px
            font-size: 12px
            color: rgb(7, 17, 27)
            margin-right: 12px
          .delivery
            font-size: 12px
            color: rgb(147, 153, 159)
    .rating-wrapper
      padding: 0 18px
      .rating-item
        display: flex
        padding: 18px 0
        border-1px(rgba(7, 17, 27, 0.1))
        .avatar
          flex: 0 0 28px
          width: 28px
          margin-right: 12px
          img
            border-radius: 50%
        .content
          flex: 1
          position: relative
          .name
            margin-bottom: 4px
            line-height: 12px
            font-size: 10px
            color: rgb(7, 17, 27)
          .star-wrapper
            margin-bottom: 6px
            font-size: 0
            .star
              display: inline-block
              vertical-align: top
              margin-right: 6px
            .delivery
              display: inline-block
              vertical-align: top
              line-height: 12px
              font-size: 10px
              font-weight: 200
              color: rgb(147, 153, 159)
          .text
            margin-bottom: 8px
            line-height: 18px
            font-size: 12px
            color: rgb(7, 17, 27)
          .recommend
            line-height: 16px
            font-size: 0
            .icon-thumb_up, .recommend-item
              display: inline-block
              margin: 0 8px 4px 0
            .icon-thumb_up
              font-size: 12px
              color: rgb(0, 160, 220)
            .recommend-item
              padding: 0 6px
              border: 1px solid rgba(7, 17, 27, 0.1)
              border-radius: 1px
              font-size: 9px
              color: rgb(147, 153, 159)
              background-color: #fff
          .time
            position: absolute
            right: 0
            top: 0
            line-height: 12px
            font-size: 10px
            color: rgb(147, 153, 159)
              
</style>
