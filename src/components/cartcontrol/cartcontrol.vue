<template>
  <div class="cartcontrol">
    <div class="cart-decrease" v-show="food.count>0" @click.stop.prevent="decreaseCart" transition="move">
      <span class="inner icon-remove_circle_outline"></span>
    </div>
    <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
    <div class="cart-add icon-add_circle" @click.stop.prevent="addCart"></div>
  </div>
</template>

<script>
  import Vue from 'vue';

  export default {
    props: {
      food: {
        type: Object,
      },
    },
    created() {
      // console.log(this.food);
    },
    methods: {
      addCart(event) {
        // better-scroll的PC端问题：点击时会触发两次，通过传入event判断是否为自身的点击事件,如果不是自己派发的就return掉
        if (!event._constructed) {
          return;
        }
        if (!this.food.count) {
          // this.food.count = 1; 无法监测到新添加属性的变化
          Vue.set(this.food, 'count', 1);
        } else {
          this.food.count ++;
        }
        // console.log(this.food.count);
        this.$dispatch('cart.add', event.target);
      },
      decreaseCart(event) {
        if (!event._constructed) {
          return;
        }
        if (this.food.count) {
          this.food.count --;
        }
      },
    },

  };
</script>

<style lang="stylus">
  .cartcontrol
    font-size: 0 
    .cart-decrease
      display: inline-block
      padding: 6px
      transition: all 0.5s linear
      &.move-transition
        opacity: 1
        transform: translate3d(0, 0, 0)
        .inner
          display: inline-block
          line-height: 24px
          font-size: 24px   
          color: rgb(0, 160, 220)
          transition: all 0.5s linear
          transform: rotate(0)
      &.move-enter, &.move-leave
        opacity: 0
        transform: translate3d(24px, 0, 0) 
        .inner
          transform: rotate(180deg)
    .cart-count
      display: inline-block
      vertical-align: top
      padding-top: 6px   
      width: 12px
      text-align: center
      line-height: 24px
      font-size: 10px
    // .cart-decrease
    .cart-add
      display: inline-block 
      line-height: 24px
      font-size: 24px
      padding: 6px
      color: rgb(0, 160, 220)    
      
</style>