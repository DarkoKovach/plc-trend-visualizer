<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, Menu } from 'lucide-vue-next'
import { cn } from '@/lib/cn'
import { Button, FlagIcon } from '@/components/ui'
import { useMobileMenu } from '@/composables'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n'
import LogoSvg from '@/assets/logo.svg'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const { t, locale } = useI18n()
const { toggle: toggleMobileMenu } = useMobileMenu()

const logoSrc = LogoSvg
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectLanguage(code: SupportedLocale) {
  locale.value = code
  isDropdownOpen.value = false
}

function closeDropdown() {
  isDropdownOpen.value = false
}

const currentLocale = computed(() => {
  return SUPPORTED_LOCALES.find((l) => l.code === locale.value)
})
</script>

<template>
  <header
    :class="
      cn(
        'flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-3 py-3 sm:px-6',
        props.class
      )
    "
  >
    <!-- Left side: Menu button (mobile) + Logo -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Mobile menu button -->
      <Button
        variant="ghost"
        size="sm"
        class="p-2 md:hidden"
        :title="t('header.menu')"
        @click="toggleMobileMenu"
      >
        <Menu class="h-5 w-5" />
      </Button>

      <img :src="logoSrc" alt="PLC Trend Visualizer" class="h-7 sm:h-8">
      <div>
        <h1 class="text-base font-semibold text-slate-100 sm:text-lg">
          {{ t('app.title') }}
        </h1>
        <p class="hidden text-xs text-slate-500 sm:block">
          {{ t('app.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-4">
      <slot />

      <!-- Language dropdown -->
      <div class="relative">
        <Button
          variant="ghost"
          size="sm"
          :title="t('header.language')"
          class="gap-2"
          @click="toggleDropdown"
        >
          <FlagIcon v-if="currentLocale" :code="currentLocale.flagCode" class="h-4 w-5" />
          <ChevronDown
            class="h-3 w-3 transition-transform"
            :class="{ 'rotate-180': isDropdownOpen }"
          />
        </Button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
          >
            <!-- Click outside overlay -->
            <div class="fixed inset-0 -z-10" @click="closeDropdown" />

            <button
              v-for="lang in SUPPORTED_LOCALES"
              :key="lang.code"
              type="button"
              class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-700"
              :class="{ 'bg-slate-700/50': lang.code === locale }"
              @click="selectLanguage(lang.code)"
            >
              <FlagIcon :code="lang.flagCode" class="h-4 w-5" />
              <span>{{ lang.name }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
