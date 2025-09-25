/// <reference types="chrome" />

import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [rows, setRows] = useState<number>(4)
  const [bigModeDisabled, setBigModeDisabled] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get(['itemsPerRow', 'bigModeDisabled'], (data) => {
      setRows(data.itemsPerRow ?? 4)
      setBigModeDisabled(data.bigModeDisabled ?? true)
    })
  }, [])

  const onSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.currentTarget.value, 10)
    setRows(newVal)

    chrome.storage.sync.set({ itemsPerRow: newVal })

    const tabs = await chrome.tabs.query({ url: '*://www.youtube.com/*' })

    for (const tab of tabs) {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          args: [newVal],
          func: (val: number) => {
            const grid = document.querySelector('ytd-rich-grid-renderer')
            if (grid instanceof HTMLElement) {
              grid.style.setProperty(
                '--ytd-rich-grid-items-per-row',
                String(val)
              )
            }
          },
        })
      }
    }
  }

  const onBigModeToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isDisabled = e.target.checked
    setBigModeDisabled(isDisabled)
    chrome.storage.sync.set({ bigModeDisabled: isDisabled })

    const tabs = await chrome.tabs.query({ url: '*://www.youtube.com/*' })

    for (const tab of tabs) {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          args: [isDisabled],
          func: (shouldDisable: boolean) => {
            const elements = document.querySelectorAll(
              '[class*="ytp-big-mode"]'
            )
            elements.forEach((element) => {
              if (shouldDisable) {
                element.classList.remove('ytp-big-mode')
                element.classList.add('ytp-big-mode-disabled')
              } else {
                element.classList.remove('ytp-big-mode-disabled')
                element.classList.add('ytp-big-mode')
              }
            })
          },
        })
      }
    }
  }

  return (
    <>
      <div>
        <h2>YouTube UI</h2>
        <div className="card">
          <input
            type="range"
            min="1"
            max="10"
            value={rows}
            onChange={onSliderChange}
          />
          <p>Videos per row: {rows}</p>
        </div>
        <div className="card">
          <label className="switch">
            <input
              type="checkbox"
              checked={bigModeDisabled}
              onChange={onBigModeToggle}
            />
            <span className="slider"></span>
          </label>
          <p>Big Mode: {bigModeDisabled ? 'Disabled' : 'Enabled'} </p>
        </div>
      </div>
    </>
  )
}

export default App
