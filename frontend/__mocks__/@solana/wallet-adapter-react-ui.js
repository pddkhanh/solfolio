module.exports = {
  useWalletModal: jest.fn(() => ({
    setVisible: jest.fn(),
    visible: false,
  })),
  WalletModalProvider: ({ children }) => children,
}