<script setup lang="ts">
import {ref,computed} from 'vue'
const props = defineProps<{items: string[], title?: string}>()
const count = ref(0)
const doubled = computed(() => count.value*2)
</script>

<template>
  <div :class="{active: isActive, 'text-danger': hasError}" @click="count++; emit('change', count)" v-if="items.length>0">
    <h1 v-text="title"></h1>
    <li v-for="(item,index) in items" :key="index" v-bind:title="item + ' title'">{{ item|capitalize }} {{index+1}}</li>
    <my-component v-model="value" #default="{ item }" @custom-event="(payload) => handle(payload, 'a')"><span>{{item.name}}</span></my-component>
    <p v-else-if="loading">Loading, which is long enough to be wrapped onto another line when it is formatted.</p>
  </div>
</template>

<style scoped lang="scss">
.a{color:red;&:hover{color:blue}}
</style>

<i18n>
{"en":{"hello":"Hello"}}
</i18n>
