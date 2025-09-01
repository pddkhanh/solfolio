const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002');
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(3000);
  
  // Try to find and click the Connect Wallet button
  console.log('Looking for Connect Wallet button...');
  const connectButtons = await page.locator('button:has-text("Connect Wallet")').all();
  console.log(`Found ${connectButtons.length} Connect Wallet button(s)`);
  
  if (connectButtons.length > 0) {
    // Check if button is enabled
    const isDisabled = await connectButtons[0].isDisabled();
    console.log(`First button is ${isDisabled ? 'disabled' : 'enabled'}`);
    
    if (!isDisabled) {
      console.log('Clicking Connect Wallet button...');
      await connectButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Check if modal appeared
      const modalTitle = await page.locator('text="Connect Your Wallet"').isVisible();
      console.log(`Modal visible: ${modalTitle}`);
      
      if (modalTitle) {
        console.log('✅ SUCCESS: Wallet modal is working!');
        
        // Check for wallet options
        const wallets = ['Phantom', 'Solflare', 'Ledger', 'Torus'];
        for (const wallet of wallets) {
          const visible = await page.locator(`text="${wallet}"`).isVisible();
          console.log(`  - ${wallet}: ${visible ? '✓' : '✗'}`);
        }
      } else {
        console.log('❌ FAIL: Modal did not appear');
      }
    }
  }
  
  await browser.close();
})();