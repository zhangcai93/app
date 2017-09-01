<template>
  <div class="shopcart">
    <div class="content" @click="toggleList">
      <div class="content-left">
        <div class="logo-wrapper">
          <div class="logo" :class="{highlight: totalCount>0}">
            <i class="icon-shopping_cart" :class="{highlight: totalCount>0}"></i>
          </div>
          <div class="num" v-show="totalCount>0">{{totalCount}}</div>
        </div>
        <div class="price" :class="{highlight: totalPrice>0}">￥{{totalPrice}}</div>
        <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
      </div> 
      <div class="content-right" @click.stop.prevent="pay">
        <div class="pay" :class="payClass">
          {{payDesc}}
        </div>
      </div>
    </div>

    <div class="ball-container">
      <div transition="drop" class="ball" v-for="ball in balls" v-show="ball.show">
        <div class="inner inner-hook"></div>
      </div>
    </div>

    <div class="shopcart-list" v-show="listShow" transition="fold">
      <div class="list-header">
        <h1 class="title">购物车</h1>
        <span class="empty" @click="empty">清空</span>
      </div>
      <div class="list-content" v-el:list-content>
        <ul>
          <li class="food border-1px" v-for="food in selectFoods">
            <span class="name">{{food.name}}</span>
            <div class="price">
              <span>￥{{food.price * food.count}}</span>
            </div>
            <div class="cartcontrol-wrapper">
              <cart-control :food="food"></cart-control>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="list-mask" v-show="listShow" transition="fade" @click="hidelist">
    
  </div>
</template>

<script>
  import CartControl from 'components/cartcontrol/cartcontrol.vue';
  import BScroll from 'better-scroll';

  export default {
    props: {
      selectFoods: { // 数组中存放food，food有价格和数量等属性
        type: Array,
        default() {
          return [
            /* {
              price: 10,
              count: 1,
            },*/
          ];
        },
      },
      deliveryPrice: {
        type: Number,
        default: 0,
      },
      minPrice: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        balls: [
          {
            show: false,
          },
          {
            show: false,
          },
          {
            show: false,
          },
          {
            show: false,
          },
          {
            show: false,
          },
        ],
        dropBalls: [],
        fold: true,
      };
    },
    components: {
      CartControl,
    },
    computed: {
      totalPrice() {
        let total = 0;
        this.selectFoods.forEach((food) => {
          total += food.price * food.count;
        });
        return total;
      },
      totalCount() {
        let count = 0;
        this.selectFoods.forEach((food) => {
          count += food.count;
        });
        return count;
      },
      payDesc() {
        if (this.totalPrice === 0) {
          return `￥${this.minPrice}起送`;
        } else if (this.totalPrice < this.minPrice) {
          const diff = this.minPrice - this.totalPrice;
          return `还差￥${diff}起送`;
        } else {
          return '去结算';
        }
      },
      payClass() {
        if (this.totalPrice < this.minPrice) {
          return 'not-enough';
        } else {
          return 'enough';
        }
      },
      listShow() {
        if (!this.totalCount) {
          this.fold = true;
          return false;
        }
        const show = !this.fold;
        if (show) {
          this.$nextTick(() => {
            if (!this.scroll) {
                this.scroll = new BScroll(this.$els.listContent, {
                click: true,
              });
            } else {
              this.scroll.refresh();
            }
          });
        }
        return show;
      },
    },
    methods: {
      drop(el) { // 从所有的balls里面找到一个隐藏的小球，将其设置为true，将这个el保存，存到已经下落的dropBalls数组中
        // console.log(el);
        for (let i = 0; i < this.balls.length; i++) {
          const ball = this.balls[i];
          if (!ball.show) {
            ball.show = true;
            ball.el = el;
            this.dropBalls.push(ball);
            return;
          }
        }
      },
      toggleList() {
        if (!this.totalCount) {
          return;
        }
        this.fold = !this.fold;
      },
      empty() {
        this.selectFoods.forEach((food) => {
          food.count = 0;
        });
      },
      hidelist() {
        this.fold = true;
      },
      pay() {
        if (this.totalPrice < this.minPrice) {
          return;
        }
        alert(`支付${this.totalPrice}元`);
      },
    },
    transitions: {
      drop: {
        beforeEnter(el) { // el就是当前执行动画的DOM对象
          let count = this.balls.length;
          while (count--) {
            const ball = this.balls[count];
            if (ball.show) { // 取到所有为show的小球
              const rect = ball.el.getBoundingClientRect(); // getBoundingClientRect()元素相对于视口的位置
              const x = rect.left - 32; // 32为最终落点的距left位置
              const y = -(window.innerHeight - rect.top - 22);
              el.style.display = '';
              el.style.webkitTransform = `translate3d(0,${y}px,0)`; // 外层的元素做纵向的动画
              el.style.transform = `translate3d(0,${y}px,0)`;
              const inner = el.getElementsByClassName('inner-hook')[0];
              inner.style.webkitTransform = `translate3d(${x}px,0,0)`; // 内层元素做横向运动
              inner.style.transform = `translate3d(${x}px,0,0)`;
            }
          }
        },
        enter(el) {
          /* eslint-disable no-unused-vars */
          const rf = el.offsetHeight; // 触发浏览器重绘
          this.$nextTick(() => { // 在下一个eventLoop中重置样式回去
            el.style.webkitTransform = 'translate3d(0,0,0)';
              el.style.transform = 'translate3d(0,0,0)';
              const inner = el.getElementsByClassName('inner-hook')[0];
              inner.style.webkitTransform = 'translate3d(0,0,0)';
              inner.style.transform = 'translate3d(0,0,0)';
          });
        },
        afterEnter(el) {
          const ball = this.dropBalls.shift();
          if (ball) {
            ball.show = false;
            el.style.display = 'none';
          }
        },
      },
    },
  };
</script>

<style lang="stylus">
  @import "../../common/stylus/mixin.styl";
  
  .shopcart
    position: fixed
    left: 0
    bottom: 0
    z-index: 50
    height: 48px
    width: 100%
    .content
      display: flex
      background: #141d27
      color: rgba(255, 255, 255, 0.4)
      .content-left
        flex: 1
        font-size: 0
        .logo-wrapper
          display: inline-block
          vertical-align: top
          position: relative
          top: -10px
          margin: 0 12px
          padding: 6px
          width: 56px
          height: 56px
          box-sizing: border-box
          vertical-align: top
          border-radius: 50%
          background: #141d27
          .logo
            width: 100%
            height: 100%
            border-radius: 50%
            background: #2b343c
            text-align: center
            &.highlight
              background: rgb(0, 160, 220)
            .icon-shopping_cart
              line-height: 44px 
              font-size: 24px
              color: #80858a
              &.highlight
                color: #fff      
          .num
            position: absolute
            right: 0px
            top: 0px
            width: 24px
            height: 16px
            line-height: 16px
            text-align: center
            border-radius: 16px    
            color: #fff
            font-size: 9px
            font-weight: 700
            background: rgb(240, 20, 20)
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4)  
            
        .price
          display: inline-block     
          line-height: 24px
          box-sizing: border-box
          margin-top: 12px
          padding-right: 12px
          border-right: 1px solid rgba(255, 255, 255, 0.1)
          font-size: 16px
          font-weight: 700 
          &.highlight
            color: #fff       
        .desc
          display: inline-block
          vertical-align: top
          margin: 12px 0 0 12px
          line-height: 24px
          font-size: 10px        
      .content-right
        flex: 0 0 105px
        width: 105px
        .pay
          height: 48px
          line-height: 48px
          text-align: center
          font-size: 12px
          font-weight: 700
          background: #2b333b
          &.not-enough
            background: #2b333b
          &.enough
            background: #00b43c
            color: #fff     
    .ball-container
      .ball 
        position: fixed
        left: 32px // 最终落点的位置
        bottom: 22px
        z-index: 200
        &.drop-transition
          transition: all 0.4s cubic-bezier(0.73,-0.19,0.91,0.36)
          .inner
            width: 16px // 小球球体
            height: 16px
            border-radius: 50%
            background: rgb(0, 160, 220)
            transition: all 0.4s linear
    .shopcart-list
      position: absolute
      top: 0
      left: 0
      z-index: -1
      width: 100%
      &.fold-transition
        transition: all 0.5s
        transform: translate3d(0, -100%, 0)
      &.fold-enter, &.fold-leave
        transition: all 0.5s
        transform: translate3d(0, 0, 0)
      .list-header
        height: 40px
        line-height: 40px
        padding: 0 18px
        background: #f3f5f7
        border-bottom: 1px solid rgba(7, 17, 27, 0.1)
        .title
          float: left
          font-size: 14px
          font-weight: 200
          color: rgb(7, 17, 27)
        .empty
          float: right
          font-size: 12px
          color: rgb(0, 160, 220)
      .list-content
        padding: 0 18px
        max-height: 217px
        overflow: hidden
        background: #fff
        .food
          position: relative   
          padding: 12px 0
          box-sizing: border-box
          border-1px(rgba(7, 17, 27, 0.1))
          .name
            line-height: 24px
            font-size: 14px
            color: rgb(7, 17, 27)
          .price
            position: absolute
            right: 90px
            bottom: 12px
            line-height: 24px
            font-weight: 700
            font-size: 14px
            color: rgb(240, 20, 20)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 6px
  .list-mask
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 40
    backdrop-filter: blur(10px)
    &.fade-transition
      transition: all 0.5s
      opacity: 1
      background: rgba(7, 17, 27, 0.6)
    &.fade-enter, &.fade-leave
      opacity: 0
      background:  rgba(7, 17, 27, 0)
</style>