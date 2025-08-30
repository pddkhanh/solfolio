// Run this in your browser console to test Phantom wallet detection
console.log('=== Phantom Wallet Test ===');

// Check if window.solana exists (Phantom injected object)
if (window.solana) {
  console.log('✅ window.solana found');
  console.log('Is Phantom:', window.solana.isPhantom);
  console.log('Connected:', window.solana.isConnected);
  console.log('Public Key:', window.solana.publicKey?.toString());
} else {
  console.log('❌ window.solana not found - Phantom may not be installed or enabled');
}

// Check for window.phantom
if (window.phantom) {
  console.log('✅ window.phantom found');
  if (window.phantom.solana) {
    console.log('✅ window.phantom.solana found');
    console.log('Is Phantom:', window.phantom.solana.isPhantom);
  }
} else {
  console.log('❌ window.phantom not found');
}

// Check localStorage for wallet adapter
const walletKey = localStorage.getItem('solfolio-wallet');
if (walletKey) {
  console.log('Previous wallet selection:', walletKey);
}

console.log('=== End Test ===');