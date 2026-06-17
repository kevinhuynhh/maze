import { create } from 'zustand'

const usePapercraftStore = create((set) => ({
  selectedAnimal: 'fox',

  params: {
    snoutLength: 0.5,
    earHeight: 0.5,
    faceWidth: 0.5,
    cheekPuff: 0.5,
    foreheadSlope: 0.5,
    chinDepth: 0.5,
  },

  faceColors: {},
  defaultColor: '#e8a87c',

  mesh: null,
  netFaces: null,
  netSVG: null,

  activeTab: 'preview',
  isGenerating: false,

  setAnimal: (animal) => set({ selectedAnimal: animal, faceColors: {} }),
  setParam: (key, value) =>
    set((s) => ({
      params: { ...s.params, [key]: value },
    })),
  setFaceColor: (faceIdx, color) =>
    set((s) => ({
      faceColors: { ...s.faceColors, [faceIdx]: color },
    })),
  setDefaultColor: (color) => set({ defaultColor: color }),
  resetColors: () => set({ faceColors: {} }),
  setMesh: (mesh) => set({ mesh }),
  setNetFaces: (netFaces) => set({ netFaces }),
  setNetSVG: (netSVG) => set({ netSVG }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsGenerating: (v) => set({ isGenerating: v }),
}))

export default usePapercraftStore
