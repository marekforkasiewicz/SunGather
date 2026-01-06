import { create } from 'zustand'

const useSolarStore = create((set) => ({
  registers: {},
  config: {},
  history: [],
  isConnected: false,
  lastUpdate: null,

  setRegisters: (registers) => set({ registers, lastUpdate: new Date() }),
  setConfig: (config) => set({ config }),
  setHistory: (history) => set({ history }),
  setConnected: (isConnected) => set({ isConnected }),
  
  updateRegister: (name, value) => set((state) => ({
    registers: {
      ...state.registers,
      [name]: value,
    },
    lastUpdate: new Date(),
  })),
}))

export default useSolarStore
