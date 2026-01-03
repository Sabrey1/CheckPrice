// composables/useDevice.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useDevice() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)
  const deviceName = ref('Desktop')
  const screenWidth = ref(0)

  const detectDevice = () => {
    const width = window.innerWidth
    screenWidth.value = width

    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024

    if (width < 768) {
      deviceName.value = 'Mobile'
    } else if (width < 1024) {
      deviceName.value = 'Tablet'
    } else {
      deviceName.value = 'Desktop'
    }
  }

  onMounted(() => {
    detectDevice()
    window.addEventListener('resize', detectDevice)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', detectDevice)
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceName,
    screenWidth
  }
}