/// <reference types="chrome" />

;(() => {
  let currentValue = 4
  let bigModeDisabled = true

  const applyRowSettings = () => {
    const grid = document.querySelector('ytd-rich-grid-renderer')
    if (grid instanceof HTMLElement) {
      const current = grid.style.getPropertyValue(
        '--ytd-rich-grid-items-per-row'
      )
      const newVal = currentValue.toString()
      if (current !== newVal) {
        grid.style.setProperty('--ytd-rich-grid-items-per-row', newVal)
      }
    }
  }

  const applyBigModeSettings = () => {
    const bigModeElements = document.querySelectorAll('[class*="ytp-big-mode"]')
    bigModeElements.forEach((element) => {
      if (bigModeDisabled) {
        element.classList.remove('ytp-big-mode')
        element.classList.add('ytp-big-mode-disabled')
      } else {
        element.classList.remove('ytp-big-mode-disabled')
        element.classList.add('ytp-big-mode')
      }
    })
  }

  const applySettings = () => {
    applyRowSettings()
    applyBigModeSettings()
  }

  const observeDOM = () => {
    const observer = new MutationObserver(() => {
      applySettings()
    })

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  const listenToStorage = () => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return

      if (changes.itemsPerRow?.newValue !== undefined) {
        currentValue = changes.itemsPerRow.newValue
        applyRowSettings()
      }

      if (changes.bigModeDisabled?.newValue !== undefined) {
        bigModeDisabled = changes.bigModeDisabled.newValue
        applyBigModeSettings()
      }
    })
  }

  const init = () => {
    // Read value from storage
    chrome.storage.sync.get(['itemsPerRow', 'bigModeDisabled'], (data) => {
      currentValue = data.itemsPerRow ?? 4
      bigModeDisabled = data.bigModeDisabled ?? true

      applySettings()
      observeDOM()
      listenToStorage()
    })

    // Also reapply on resize
    window.addEventListener('resize', () => {
      applySettings()
    })
  }

  // Wait until document.body is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
