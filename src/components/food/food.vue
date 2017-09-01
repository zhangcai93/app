<template>
  <div class="food" v-show="showFlag" transition="move" v-el:food>
    <div class="food-content">
      <div class="image-header">
        <img :src="food.image">
        <div class="back" @click="hide">
          <i class="icon-arrow_lift"></i>
        </div>        
      </div>

      <div class="content">
        <h1 class="title">{{food.name}}</h1>
        <div class="detail">
          <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
        </div>  
        <div class="price">
          <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
        </div>
        <div class="cartcontrol-wrapper">
          <cart-control :food="food"></cart-control>
        </div>
        <div @click.stop.prevent="addFirst($event)" class="buy" v-show="!food.count || food.count === 0" transition="fade">加入购物车</div>
      </div>

      <split v-show="food.info"></split>
      <div class="info" v-show="food.info">
        <h1 class="title">商品信息</h1>
        <p class="text">{{food.info}}</p>
      </div>

      <split></split>
      <div class="rating">
        <h1 class="title">商品评价</h1>
        <rating-select :desc="desc" :select-type="selectType" :only-content="onlyContent" :ratings="food.ratings"></rating-select>

        <div class="rating-wrapper">
          <ul v-show="food.ratings && food.ratings.length">

            <li v-show="needShow(rating.rateType, rating.text)" v-for="rating in food.ratings" class="rating-item border-1px">

              <div class="user">
                <span class="name">{{rating.username}}</span>
                <img class="avatar" :src="rating.avatar" width="12" height="12">
              </div>
              <div class="time">
                {{ rating.rateTime | formatDate}}
              </div>
              <p class="text">
                <span :class="{'icon-thumb_up':rating.rateType === 0, 'icon-thumb_down':rating.rateType === 1}"></span>
                {{rating.text}}
              </p>
            </li>
          </ul>
          <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>          
        </div>
      </div>

    </div>  
  </div>
</template>

<script>
  import Vue from 'vue';
  import BScroll from 'better-scroll';
  import CartControl from 'components/cartcontrol/cartcontrol.vue';
  import Split from 'components/split/split.vue';
  import RatingSelect from 'components/ratingselect/ratingselect.vue';
  // import { formatDate } from 'common/js/date.js';

  
  const ALL = 2;

  export default {
    props: {
      food: {
        type: Object,
      },
    },
    components: {
      CartControl,
      Split,
      RatingSelect,
    },
    filters: {
      formatDate(time) {
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
        /* const date = new Date(time);
        formatDate(date, 'yyyy-MM-dd hh:mm');*/
      },
    },
    data() {
      return {
        showFlag: false,
        selectType: ALL,
        onlyContent: true,
        desc: {
          all: '全部',
          positive: '推荐',
          negative: '吐槽',
        },
      };
    },
    methods: {
      show() {
        this.showFlag = true;
        this.selectType = ALL; // 组件可能被多次应用，每次show页面的时候都要讲这个页面保持这个初始化状态
        this.onlyContent = false;
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$els.food, {
              click: true,
            });
          } else {
            this.scroll.refresh();
          }
        });
      },
      hide() {
        this.showFlag = false;
      },
      addFirst(event) {
        if (!event._constructed) {
          return; // 解决PC端多次点击问题(better-scroll相关的文题)
        }
        Vue.set(this.food, 'count', 1); // 第一次添加不确定是否count属性存在，用Vue的set方法将数量置为1
        // console.log(event.target);
        this.$dispatch('cart.add', event.target); // 抛物线小球的动画
      },
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
  };
</script>

<style lang="stylus">
  @import "../../common/stylus/mixin.styl";
  
  .food
    position: fixed
    left: 0
    top: 0
    bottom: 48px
    z-index: 30
    width: 100%
    background: #fff
    &.move-transition // 动画的最终状态
      transition: all 0.2s linear
      transform: translate3d(0, 0, 0)
    &.move-enter, &.move-leave // 动画开始和离开的位置
      transform: translate3d(100%, 0, 0) // x轴位置相对于自身便宜100%
    .food-content
      .image-header
        position: relative
        width: 100%
        height: 0
        padding-top: 100%
        img
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
        .back
          position: absolute
          top: 10px
          left: 0
          .icon-arrow_lift
            display: block
            padding: 10px
            font-size: 20px
            color: #fff
      .content
        position: relative
        padding: 18px
        .title
          margin-bottom: 8px
          line-height: 14px
          font-size: 14px
          font-weight: 700
          color: rgb(7, 17, 27)
        .detail
          margin-bottom: 18px
          line-height: 10px
          height: 10px
          font-size: 10px
          color: rgb(147, 153, 159)
          .count
            margin-right: 12px
        .price
          line-height: 24px
          font-weight: 700 
          .now
            margin-right: 12px
            font-size: 14px
            color: rgb(240, 20, 20)
          .old
            text-decoration: line-through
            font-size: 10px
            color: rgb(147, 153, 159)  
        .cartcontrol-wrapper
          position: absolute
          right: 12px // cartcontrol组件中已经有了6px的padding
          bottom: 12px
        .buy
          position: absolute
          right: 18px
          bottom: 18px
          z-index: 10 
          height: 24px
          line-height: 24px
          padding: 0 12px
          box-sizing: border-box
          text-align: center
          border-radius: 12px
          background-color: rgb(0, 160, 220)
          color: #fff
          font-size: 10px
          &.fade-transition // 购物车这个元素立刻消失会导致抛物线小球动画计算位置出错，这里给购物车的消失加一个动画，是元素的消失有一段时间，就可以正确拿到元素的位置在消失了
            transition: all 0.5s
            opacity: 1
          &.fade-enter, &.fade-leave
            opacity: 0
      .info
        padding: 18px
        .title
          line-height: 14px
          margin-bottom: 6px
          font-size: 14px
          font-weight: 500
          color: rgb(7, 17, 27)
        .text
          padding: 0 8px
          line-height: 24px
          font-size: 12px
          font-weight: 200
          color: rgb(77, 85, 93)
      .rating
        padding-top: 18px
        .title
          line-height: 14px
          margin-left: 18px
          font-size: 14px
          font-weight: 500
          color: rgb(7, 17, 27)
        .rating-wrapper  
          padding: 0 18px
          .rating-item
            position: relative
            padding: 16px 0
            border-1px(rgba(7, 17, 27, 0.1))
            .user
              position: absolute
              right: 0
              top: 16px
              font-size: 0
              line-height: 12px
              .name
                display: inline-block
                vertical-align: top
                margin-right: 6px
                font-size: 10px
                color: rgb(147, 153, 159)
              .avatar
                display: inline-block
                vertical-align: top
                border-radius: 50%
            .time
              margin-bottom: 6px
              line-height: 12px
              font-size: 10px
              color: rgb(147, 153, 159)
            .text
              line-height: 16px
              font-size: 12px
              color: rgb(7, 17, 27)
              .icon-thumb_up, .icon-thumb_down
                // line-height: 24px
                margin-right: 4px
                font-size: 12px
              .icon-thumb_up
                color: rgb(0, 160, 220)
              .icon-thumb_down
                color: rgb(147, 153, 159)
          .no-rating
            padding: 16px 0
            font-size: 12px
            color: rgb(147, 153, 159)
              
</style>