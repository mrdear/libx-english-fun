<template>
  <abbr class="hover-card-wrapper" @mouseover="showCard = true" @mouseleave="showCard = false" @mousemove="updateCardPosition">
    <slot />
    <span v-if="showCard" class="hover-card" :style="cardPosition">
      {{ title }}  <!-- 使用 title prop -->
    </span>
  </abbr>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const showCard = ref(false);

const cardPosition = ref({ top: '0px', left: '0px' });

const updateCardPosition = (event) => {
  showCard.value = true;
  cardPosition.value = {
    top: `${event.clientY + 10}px`, // 鼠标 Y 坐标 + 偏移量
    left: `${event.clientX + 10}px`, // 鼠标 X 坐标 + 偏移量
  };
};

</script>
<style scoped>
.hover-card-wrapper {
  position: relative;
  display: inline; /* 或者 block，根据你的需求 */
}

.hover-card {
  position: fixed; /* 使用 fixed 定位，相对于视口 */
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  z-index: 9999; /* 确保在最上方 */
  white-space: nowrap;
}
</style>