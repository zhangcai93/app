<template>
  <div class="goods">
    <div class="menu-wrapper" v-el:menu-wrapper>
      <ul>
        <li v-for="item in goods" class="menu-item" :class="{'current':currentIndex === $index}" @click="selectMenu($index, $event)">
          <span class="text border-1px">
            <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
          </span>
        </li>
      </ul>
    </div>

    <div class="foods-wrapper" v-el:foods-wrapper>
      <ul>
        <li class="food-list food-list-hook" v-for="item in goods">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li @click="selectFood(food, $event)" class="food-item border-1px" v-for="food in item.foods">
              <div class="icon">
                <img width="57" height="57" :src="food.icon">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                </div>
                <div class="price">
                  <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                </div>

                <div class="cartcontrol-wrapper">
                  <cart-control :food="food"></cart-control>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <shopcart v-ref:shopcart :select-foods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice">     
    </shopcart>

    <food :food="selectedFood" v-ref:food></food>
  </div>  
</template>

<script>
import BScroll from 'better-scroll';
import Shopcart from 'components/shopcart/shopcart.vue';
import CartControl from 'components/cartcontrol/cartcontrol.vue';
import Food from 'components/food/food.vue';

const ERR_OK = 0;

export default {
  data() {
    return {
      goods: [],
      listHeight: [],
      // 一个递增的区间高度的数组
      scrollY: 0,
      selectedFood: {},
    };
  },
  components: {
    Shopcart,
    CartControl,
    Food,
  },
  methods: {
    selectMenu(index, event) {
      // better-scroll的PC端问题：点击时会触发两次，通过传入event判断是否为自身的点击事件,如果不是自己派发的就return掉
      if (!event._constructed) {
        return;
      }
      const foodList = this.$els.foodsWrapper.getElementsByClassName('food-list-hook');
      const el = foodList[index];
      this.foodsScroll.scrollToElement(el, 300);
      // console.log(index);
    },
    selectFood(food, event) {
      if (!event._constructed) {
        return;
      }
      this.selectedFood = food;
      // console.log(this.selectedFood);
      this.$refs.food.show();
    },
    initScroll() {
      this.menuScroll = new BScroll(this.$els.menuWrapper, {
        click: true,
      });
      this.foodsScroll = new BScroll(this.$els.foodsWrapper, {
      probeType: 3, click: true,
      });
      // probeType: 3滚动时实时告诉位置
      this.foodsScroll.on('scroll', (pos) => {
        this.scrollY = Math.abs(Math.round(pos.y));
      });
    },
    calculateHeight() {
      const foodList = this.$els.foodsWrapper.getElementsByClassName('food-list-hook');
      // console.log(foodList);
      // console.log(this.listHeight);
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < foodList.length; i++) {
        const item = foodList[i];
        height += item.clientHeight;
        this.listHeight.push(height);
      }
    },
    _drop(target) {
      this.$nextTick(() => {  // 体验优化，异步执行下落动画
        this.$refs.shopcart.drop(target);
      });
    },
  },
  computed: {
    currentIndex() {
      for (let i = 0; i < this.listHeight.length; i++) {
        const height = this.listHeight[i];
        const heightNext = this.listHeight[i + 1];
        if (!heightNext || (this.scrollY >= height && this.scrollY < heightNext)) {
          // console.log(i);
          return i;
        }
      }
      return 0;
    },
    selectFoods() {
      const foods = [];
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food);
          }
        });
      });
      return foods;
    },
  },
  props: {
    seller: {
      type: Object,
    },
  },
  created() {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
    this.$http.get('/api/goods').then((response) => {
      const res = response.body;
      if (res.errno === ERR_OK) {
        this.goods = res.data;
        this.$nextTick(() => {
          this.initScroll();
          this.calculateHeight();
        });
        // console.log(this.goods);
      }
    });
  },
  events: {
    'cart.add'(target) {
      this._drop(target);
    },
  },
};

</script>

<style lang="stylus">
  @import "../../common/stylus/mixin.styl";
  
  .goods
    display: flex
    position: absolute
    top: 174px  //头部134，公告40
    bottom: 46px   //购物车46
    width: 100%
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px
      width: 80px     
      background: #f3f5f7
      .menu-item
        display: table
        height: 54px
        width: 56px
        padding: 0 12px
        text-align: center
        line-height: 14px
        &.current
          position: relative
          margin-top: -1px
          z-index: 10
          background: #fff
          font-weight: 700px
          .text
            border-none()
        .icon
          display: inline-block
          vertical-align: middle
          width: 12px
          height 12px
          margin-right: 2px
          background-size: 12px 12px
          background-repeat: no-repeat
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3') 
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          border-1px(rgba(7,17,27,0.1))
          font-size: 12px
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7,17,27,0.1))
        &:last-child
          border-none()
          padding-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px         
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7, 17, 27)                      
          .desc, .extra
            font-size: 10px
            line-height: 10px
            color: rgb(147, 153, 159)
          .desc
            margin-bottom: 8px
            line-height: 12px
          .extra
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right:8px
              color: rgb(240,20, 20)
              font-size: 14px
            .old
              text-decoration:line-through
              font-size: 10px
              color: rgb(147, 153, 159)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px
</style>
