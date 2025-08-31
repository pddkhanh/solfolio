import { Page } from '@playwright/test'

/**
 * Touch gesture helpers for E2E testing
 * Provides utilities for simulating touch interactions in Playwright tests
 */

/**
 * Simulate a touch swipe gesture
 */
export async function simulateTouchSwipe(
  page: Page,
  selector: string,
  direction: 'left' | 'right' | 'up' | 'down',
  distance = 100,
  duration = 300
) {
  const element = await page.locator(selector).first()
  const box = await element.boundingBox()
  if (!box) throw new Error(`Element not found: ${selector}`)

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  
  let endX = startX
  let endY = startY
  
  switch (direction) {
    case 'left':
      endX = startX - distance
      break
    case 'right':
      endX = startX + distance
      break
    case 'up':
      endY = startY - distance
      break
    case 'down':
      endY = startY + distance
      break
  }

  // Calculate steps for smooth animation
  const steps = Math.max(10, Math.floor(duration / 20))
  
  // Simulate touch swipe with touchstart, touchmove, touchend
  await page.evaluate(
    ({ startX, startY, endX, endY, steps }) => {
      const element = document.elementFromPoint(startX, startY) as HTMLElement
      if (!element) return

      // Create touch events
      const createTouchEvent = (type: string, x: number, y: number) => {
        const touch = new Touch({
          identifier: Date.now(),
          target: element,
          clientX: x,
          clientY: y,
          pageX: x,
          pageY: y,
          screenX: x,
          screenY: y,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1,
        })
        
        return new TouchEvent(type, {
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        })
      }

      // Dispatch touchstart
      element.dispatchEvent(createTouchEvent('touchstart', startX, startY))

      // Dispatch touchmove events
      for (let i = 1; i <= steps; i++) {
        const progress = i / steps
        const x = startX + (endX - startX) * progress
        const y = startY + (endY - startY) * progress
        element.dispatchEvent(createTouchEvent('touchmove', x, y))
      }

      // Dispatch touchend
      element.dispatchEvent(createTouchEvent('touchend', endX, endY))
    },
    { startX, startY, endX, endY, steps }
  )

  // Also simulate with mouse as fallback
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY, { steps })
  await page.mouse.up()
}

/**
 * Simulate pull-to-refresh gesture
 */
export async function simulatePullToRefresh(
  page: Page,
  containerSelector = '[data-testid="token-list-container"], .overflow-auto',
  pullDistance = 150
) {
  const scrollContainer = await page.locator(containerSelector).first()
  const box = await scrollContainer.boundingBox()
  if (!box) throw new Error('Scrollable container not found')
  
  const startX = box.x + box.width / 2
  const startY = box.y + 50
  const endY = startY + pullDistance
  
  // Ensure we're at the top of the scroll container
  await scrollContainer.evaluate((el) => el.scrollTop = 0)
  
  // Simulate pull down gesture with touch events
  await page.evaluate(
    ({ startX, startY, endY }) => {
      const createTouchEvent = (type: string, x: number, y: number) => {
        const touch = new Touch({
          identifier: Date.now(),
          target: document.body,
          clientX: x,
          clientY: y,
          pageX: x,
          pageY: y,
          screenX: x,
          screenY: y,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1,
        })
        
        return new TouchEvent(type, {
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        })
      }

      // Dispatch pull sequence
      document.dispatchEvent(createTouchEvent('touchstart', startX, startY))
      
      // Slowly pull down
      for (let y = startY; y <= endY; y += 5) {
        document.dispatchEvent(createTouchEvent('touchmove', startX, y))
      }
      
      // Hold at bottom
      setTimeout(() => {
        document.dispatchEvent(createTouchEvent('touchend', startX, endY))
      }, 500)
    },
    { startX, startY, endY }
  )
  
  // Also simulate with mouse
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  
  // Slowly pull down to trigger refresh
  for (let y = startY; y <= endY; y += 10) {
    await page.mouse.move(startX, y)
    await page.waitForTimeout(20)
  }
  
  // Hold for a moment then release
  await page.waitForTimeout(500)
  await page.mouse.up()
}

/**
 * Simulate long press gesture
 */
export async function simulateLongPress(
  page: Page,
  selector: string,
  duration = 500
) {
  const element = await page.locator(selector).first()
  const box = await element.boundingBox()
  if (!box) throw new Error(`Element not found: ${selector}`)
  
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  
  // Simulate touch long press
  await page.evaluate(
    ({ x, y, duration, selector }) => {
      const element = document.querySelector(selector) as HTMLElement
      if (!element) return

      const createTouchEvent = (type: string) => {
        const touch = new Touch({
          identifier: Date.now(),
          target: element,
          clientX: x,
          clientY: y,
          pageX: x,
          pageY: y,
          screenX: x,
          screenY: y,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1,
        })
        
        return new TouchEvent(type, {
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        })
      }

      // Dispatch touchstart
      element.dispatchEvent(createTouchEvent('touchstart'))
      
      // Hold for duration
      setTimeout(() => {
        element.dispatchEvent(createTouchEvent('touchend'))
      }, duration)
    },
    { x, y, duration, selector }
  )
  
  // Also simulate with mouse
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(duration)
  await page.mouse.up()
}

/**
 * Simulate pinch-to-zoom gesture (limited support in Playwright)
 */
export async function simulatePinchZoom(
  page: Page,
  selector: string,
  scale: number
) {
  const element = await page.locator(selector).first()
  const box = await element.boundingBox()
  if (!box) throw new Error(`Element not found: ${selector}`)
  
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  
  // Playwright doesn't have native pinch support
  // Simulate with double-tap or wheel event as alternatives
  
  if (scale > 1) {
    // Zoom in - double tap
    await page.mouse.click(centerX, centerY, { clickCount: 2 })
  } else {
    // Zoom out - can use wheel event
    await page.mouse.move(centerX, centerY)
    await page.mouse.wheel(0, scale < 1 ? 100 : -100)
  }
  
  // Also try to trigger via JavaScript
  await page.evaluate(
    ({ selector, scale }) => {
      const element = document.querySelector(selector) as HTMLElement
      if (!element) return
      
      // Dispatch gesture events if supported
      if ('GestureEvent' in window) {
        const gestureEvent = new (window as any).GestureEvent('gesturechange', {
          scale,
          bubbles: true,
          cancelable: true,
        })
        element.dispatchEvent(gestureEvent)
      }
      
      // Apply transform as fallback
      element.style.transform = `scale(${scale})`
    },
    { selector, scale }
  )
}

/**
 * Simulate double tap gesture
 */
export async function simulateDoubleTap(
  page: Page,
  selector: string
) {
  const element = await page.locator(selector).first()
  const box = await element.boundingBox()
  if (!box) throw new Error(`Element not found: ${selector}`)
  
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  
  // Simulate touch double tap
  await page.evaluate(
    ({ x, y, selector }) => {
      const element = document.querySelector(selector) as HTMLElement
      if (!element) return

      const createTouchEvent = (type: string) => {
        const touch = new Touch({
          identifier: Date.now(),
          target: element,
          clientX: x,
          clientY: y,
          pageX: x,
          pageY: y,
          screenX: x,
          screenY: y,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1,
        })
        
        return new TouchEvent(type, {
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        })
      }

      // First tap
      element.dispatchEvent(createTouchEvent('touchstart'))
      element.dispatchEvent(createTouchEvent('touchend'))
      
      // Second tap after short delay
      setTimeout(() => {
        element.dispatchEvent(createTouchEvent('touchstart'))
        element.dispatchEvent(createTouchEvent('touchend'))
      }, 100)
    },
    { x, y, selector }
  )
  
  // Also simulate with mouse
  await page.mouse.click(x, y, { clickCount: 2 })
}

/**
 * Check if element meets minimum touch target size
 */
export async function checkTouchTargetSize(
  page: Page,
  selector: string,
  minSize = 44
): Promise<{ width: number; height: number; meetsRequirement: boolean }> {
  const element = await page.locator(selector).first()
  const box = await element.boundingBox()
  
  if (!box) {
    throw new Error(`Element not found: ${selector}`)
  }
  
  // Check actual size
  let meetsRequirement = box.width >= minSize && box.height >= minSize
  
  // If not meeting requirement, check with padding
  if (!meetsRequirement) {
    const effectiveSize = await element.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      
      // Parse padding values
      const paddingTop = parseFloat(computed.paddingTop) || 0
      const paddingBottom = parseFloat(computed.paddingBottom) || 0
      const paddingLeft = parseFloat(computed.paddingLeft) || 0
      const paddingRight = parseFloat(computed.paddingRight) || 0
      
      return {
        width: rect.width + paddingLeft + paddingRight,
        height: rect.height + paddingTop + paddingBottom
      }
    })
    
    meetsRequirement = effectiveSize.width >= minSize && effectiveSize.height >= minSize
  }
  
  return {
    width: box.width,
    height: box.height,
    meetsRequirement
  }
}

/**
 * Test haptic feedback support
 */
export async function testHapticFeedback(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    // Check if Vibration API is supported
    if ('vibrate' in navigator) {
      // Try to trigger a short vibration
      navigator.vibrate(10)
      return true
    }
    return false
  })
}

/**
 * Simulate device rotation
 */
export async function simulateDeviceRotation(
  page: Page,
  orientation: 'portrait' | 'landscape'
) {
  const viewport = orientation === 'portrait'
    ? { width: 390, height: 844 }
    : { width: 844, height: 390 }
  
  await page.setViewportSize(viewport)
  
  // Dispatch orientation change event
  await page.evaluate((orientation) => {
    const event = new Event('orientationchange')
    ;(window as any).orientation = orientation === 'portrait' ? 0 : 90
    window.dispatchEvent(event)
  }, orientation)
}

/**
 * Get all touch-interactive elements on the page
 */
export async function getTouchInteractiveElements(page: Page) {
  return await page.evaluate(() => {
    const selectors = [
      'button',
      'a',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[onclick]',
      '[data-testid*="clickable"]',
      '[data-testid*="swipeable"]',
      '.cursor-pointer'
    ]
    
    const elements: Array<{
      selector: string
      count: number
      examples: string[]
    }> = []
    
    selectors.forEach(selector => {
      const matches = document.querySelectorAll(selector)
      if (matches.length > 0) {
        elements.push({
          selector,
          count: matches.length,
          examples: Array.from(matches).slice(0, 3).map(el => 
            el.textContent?.trim().substring(0, 30) || el.getAttribute('aria-label') || 'unnamed'
          )
        })
      }
    })
    
    return elements
  })
}