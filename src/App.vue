<template>

  <div id="app" class="weather-background">
    <Main/>
  </div>

</template>

<script>
import Main from './components/Main.vue'

export default {
  name: 'app',
  components: {
    Main
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color :white;
}
.weather-background{
      position:absolute; 
      top:0; 
      right:0; 
      bottom:0; 
      left:0;
      width: 100%;
      height: 100%;
      background-image: url(./assets/background.jpg);
    }
</style>
