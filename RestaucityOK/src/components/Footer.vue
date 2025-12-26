<template>
  <!-- Added pb-20 md:pb-6 for mobile bottom navigation bar spacing -->
  <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto lg:ml-64 pb-20 md:pb-6">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        <!-- Copyright -->
        <div class="text-center lg:text-left w-full lg:w-auto">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © {{ currentYear }} <span class="font-semibold text-gray-900 dark:text-gray-100">Styve M'BOUMBA</span>
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">Tous droits réservés</p>
        </div>

        <!-- Social Links -->
        <div class="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          <!-- LinkedIn -->
          <a 
            href="https://www.linkedin.com/in/styve-mboumba-49899b31b" 
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors group"
            title="LinkedIn"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors hidden sm:inline">LinkedIn</span>
          </a>

          <!-- Phone -->
          <a 
            href="tel:+242065209949" 
            class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors group"
            title="+242 065209949"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors hidden md:inline">Téléphone</span>
          </a>

          <!-- Email -->
          <a 
            href="mailto:styvem51@gmail.com" 
            class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors group"
            title="styvem51@gmail.com"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors hidden md:inline">Email</span>
          </a>

          <!-- Portfolio -->
          <a 
            href="https://styvefolio.vercel.app/" 
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors group"
            title="Portfolio"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span class="text-sm font-medium hidden sm:inline">Portfolio</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>
