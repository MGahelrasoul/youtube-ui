/// <reference types="chrome" />

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['itemsPerRow', 'bigModeDisabled'], (stored) => {
    const update = {}

    if (stored.itemsPerRow === undefined) {
      update.itemsPerRow = 4
    }

    if (stored.bigModeDisabled === undefined) {
      update.bigModeDisabled = true
    }

    if (Object.keys(update).length > 0) {
      chrome.storage.sync.set(update, () => {
        applyToOpenYouTubeTabs()
      })
    } else {
      applyToOpenYouTubeTabs
    }
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url?.includes('youtube.com') && changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    })
  }
})

const applyToOpenYouTubeTabs = () => {
  // Apply to all open YouTube tabs
  chrome.tabs.query({ url: '*://www.youtube.com/*' }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        })
      }
    }
  })
}
