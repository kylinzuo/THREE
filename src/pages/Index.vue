<template>
  <div id="home-page">
    <canvas id='webgl'></canvas>
  </div>
</template>

<script>
import { main } from '../lib/webgl'
export default {
  name: 'home',
  data () {
    return {
      msg: 'here is home page'
    }
  },
  mounted () {
    let canvas = document.getElementById('webgl')
    let config = null
    main(canvas, config)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  #home-page {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
