<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-800 animate-pulse"
  >
    <!-- Image -->
    <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>

    <div class="p-4 space-y-3">
      <!-- Badge placeholder -->
      <div class="flex items-start justify-between">
        <div class="space-y-2 flex-1">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full ml-3"></div>
      </div>

      <!-- Stars + price -->
      <div class="flex items-center gap-4">
        <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <!-- Address -->
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>

      <!-- Button -->
      <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mt-1"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonCard',
}
</script>
