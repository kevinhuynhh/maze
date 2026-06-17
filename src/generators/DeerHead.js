import { BaseAnimal } from './BaseAnimal.js'

export class DeerHead extends BaseAnimal {
  defineKeypoints() {
    const p = this.params
    const sl = this.lerp(0.3, 0.9, p.snoutLength)
    const eh = this.lerp(0.8, 1.6, p.earHeight)
    const fw = this.lerp(0.55, 0.9, p.faceWidth)
    const cp = this.lerp(0.0, 0.2, p.cheekPuff)
    const fs = this.lerp(0.15, 0.45, p.foreheadSlope)
    const cd = this.lerp(0.0, 0.2, p.chinDepth)

    this.keypoints = {
      crown: [0, 1.1, -0.05],

      // tall narrow ears
      earL_base: [-fw * 0.45, 0.85, 0],
      earL_tip: [-fw * 0.55, 0.85 + eh * 0.55, -0.05],
      earR_base: [fw * 0.45, 0.85, 0],
      earR_tip: [fw * 0.55, 0.85 + eh * 0.55, -0.05],

      // narrow forehead
      foreheadL: [-fw * 0.35, 0.65 + fs, 0.15],
      foreheadR: [fw * 0.35, 0.65 + fs, 0.15],

      // slim cheeks
      cheekL: [-(fw * 0.38 + cp), 0.25, 0.25],
      cheekR: [fw * 0.38 + cp, 0.25, 0.25],

      // long snout
      snoutTopL: [-0.13, 0.3, 0.55 + sl * 0.25],
      snoutTopR: [0.13, 0.3, 0.55 + sl * 0.25],
      snoutMidL: [-0.1, 0.15, 0.7 + sl * 0.3],
      snoutMidR: [0.1, 0.15, 0.7 + sl * 0.3],
      snoutTip: [0, 0.05, 0.85 + sl * 0.35],
      snoutBotL: [-0.09, -0.05, 0.7 + sl * 0.25],
      snoutBotR: [0.09, -0.05, 0.7 + sl * 0.25],

      chinL: [-0.18, -0.15, 0.4],
      chinR: [0.18, -0.15, 0.4],
      chin: [0, -0.28 - cd, 0.3],

      jawL: [-fw * 0.35, -0.2, 0.1],
      jawR: [fw * 0.35, -0.2, 0.1],

      backTopL: [-fw * 0.38, 0.8, -0.3],
      backTopR: [fw * 0.38, 0.8, -0.3],
      backMidL: [-fw * 0.32, 0.25, -0.42],
      backMidR: [fw * 0.32, 0.25, -0.42],
      backBot: [0, -0.15, -0.38],
      neckL: [-0.22, -0.32, -0.1],
      neckR: [0.22, -0.32, -0.1],
    }
  }

  defineFaces() {
    this.faces = [
      // forehead (0-2)
      ['crown', 'earL_base', 'foreheadL'],
      ['crown', 'foreheadL', 'foreheadR'],
      ['crown', 'foreheadR', 'earR_base'],

      // ears (3-4)
      ['earL_base', 'earL_tip', 'foreheadL'],
      ['earR_base', 'foreheadR', 'earR_tip'],

      // upper face (5-8)
      ['foreheadL', 'cheekL', 'snoutTopL'],
      ['foreheadL', 'snoutTopL', 'foreheadR'],
      ['foreheadR', 'snoutTopL', 'snoutTopR'],
      ['foreheadR', 'snoutTopR', 'cheekR'],

      // mid snout (9-12)
      ['snoutTopL', 'snoutMidL', 'snoutTopR'],
      ['snoutTopR', 'snoutMidL', 'snoutMidR'],
      ['snoutTopL', 'cheekL', 'snoutMidL'],
      ['snoutTopR', 'snoutMidR', 'cheekR'],

      // snout tip (13-16)
      ['snoutMidL', 'snoutTip', 'snoutMidR'],
      ['snoutMidL', 'snoutBotL', 'snoutTip'],
      ['snoutMidR', 'snoutTip', 'snoutBotR'],
      ['snoutBotL', 'snoutBotR', 'snoutTip'],

      // under-snout (17-18)
      ['snoutBotL', 'chinL', 'snoutBotR'],
      ['snoutBotR', 'chinL', 'chinR'],

      // cheek lower (19-20)
      ['cheekL', 'chinL', 'snoutMidL'],
      ['snoutMidR', 'chinR', 'cheekR'],
      ['snoutMidL', 'chinL', 'snoutBotL'],
      ['snoutMidR', 'snoutBotR', 'chinR'],

      // chin (23-25)
      ['chinL', 'chinR', 'chin'],
      ['chinL', 'chin', 'jawL'],
      ['chinR', 'jawR', 'chin'],

      // cheek-jaw (26-27)
      ['cheekL', 'jawL', 'chinL'],
      ['cheekR', 'chinR', 'jawR'],

      // back (28-35)
      ['crown', 'backTopL', 'earL_base'],
      ['crown', 'earR_base', 'backTopR'],
      ['crown', 'backTopR', 'backTopL'],
      ['backTopL', 'backMidL', 'earL_base'],
      ['backTopR', 'earR_base', 'backMidR'],
      ['backTopL', 'backTopR', 'backMidR'],
      ['backTopL', 'backMidR', 'backMidL'],
      ['backMidL', 'backBot', 'backMidR'],

      // neck (36-44)
      ['jawL', 'neckL', 'backMidL'],
      ['jawR', 'backMidR', 'neckR'],
      ['jawL', 'backMidL', 'backBot'],
      ['jawR', 'backBot', 'backMidR'],
      ['chin', 'jawL', 'neckL'],
      ['chin', 'neckR', 'jawR'],
      ['chin', 'neckL', 'neckR'],
      ['backBot', 'neckL', 'backMidL'],
      ['backBot', 'backMidR', 'neckR'],
    ]

    this.faceGroups = {
      forehead: [0, 1, 2],
      ears: [3, 4],
      face: [5, 6, 7, 8],
      snout: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22],
      cheeks: [19, 20, 26, 27],
      chin: [23, 24, 25],
      back: [28, 29, 30, 31, 32, 33, 34, 35],
      neck: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    }
  }
}
