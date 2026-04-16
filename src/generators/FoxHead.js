import { BaseAnimal } from './BaseAnimal'

export class FoxHead extends BaseAnimal {
  defineKeypoints() {
    const p = this.params
    const sl = this.lerp(0.2, 0.8, p.snoutLength)
    const eh = this.lerp(0.6, 1.4, p.earHeight)
    const fw = this.lerp(0.6, 1.0, p.faceWidth)
    const cp = this.lerp(0.0, 0.3, p.cheekPuff)
    const fs = this.lerp(0.1, 0.5, p.foreheadSlope)
    const cd = this.lerp(0.0, 0.25, p.chinDepth)

    this.keypoints = {
      crown: [0, 1.0, 0],

      earL_base: [-fw * 0.5, 0.75, 0],
      earL_tip: [-fw * 0.35, 0.75 + eh * 0.5, 0.05],
      earR_base: [fw * 0.5, 0.75, 0],
      earR_tip: [fw * 0.35, 0.75 + eh * 0.5, 0.05],

      foreheadL: [-fw * 0.45, 0.6 + fs, 0.2],
      foreheadR: [fw * 0.45, 0.6 + fs, 0.2],

      cheekL: [-(fw * 0.5 + cp), 0.25, 0.3],
      cheekR: [fw * 0.5 + cp, 0.25, 0.3],

      snoutTopL: [-0.15, 0.3, 0.5 + sl * 0.2],
      snoutTopR: [0.15, 0.3, 0.5 + sl * 0.2],
      snoutTip: [0, 0.15, 0.6 + sl * 0.3],
      snoutBotL: [-0.12, 0.05, 0.55 + sl * 0.2],
      snoutBotR: [0.12, 0.05, 0.55 + sl * 0.2],

      chinL: [-0.2, -0.1, 0.35],
      chinR: [0.2, -0.1, 0.35],
      chin: [0, -0.2 - cd, 0.25],

      jawL: [-fw * 0.4, -0.15, 0.1],
      jawR: [fw * 0.4, -0.15, 0.1],

      backTopL: [-fw * 0.4, 0.7, -0.3],
      backTopR: [fw * 0.4, 0.7, -0.3],
      backMidL: [-fw * 0.35, 0.2, -0.4],
      backMidR: [fw * 0.35, 0.2, -0.4],
      backBot: [0, -0.1, -0.35],
      neckL: [-0.25, -0.3, -0.1],
      neckR: [0.25, -0.3, -0.1],
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

      // snout (9-13)
      ['snoutTopL', 'snoutTip', 'snoutTopR'],
      ['snoutTopL', 'snoutBotL', 'snoutTip'],
      ['snoutTopR', 'snoutTip', 'snoutBotR'],
      ['snoutBotL', 'snoutBotR', 'snoutTip'],
      ['snoutBotL', 'chinL', 'snoutBotR'],

      // cheeks (14-15)
      ['cheekL', 'chinL', 'snoutTopL'],
      ['cheekR', 'snoutTopR', 'chinR'],

      // lower face (16-19)
      ['snoutBotR', 'chinR', 'chinL'],
      ['chinL', 'chinR', 'chin'],
      ['chinL', 'chin', 'jawL'],
      ['chinR', 'jawR', 'chin'],

      // back (20-27)
      ['crown', 'backTopL', 'earL_base'],
      ['crown', 'earR_base', 'backTopR'],
      ['crown', 'backTopR', 'backTopL'],
      ['backTopL', 'backMidL', 'earL_base'],
      ['backTopR', 'earR_base', 'backMidR'],
      ['backTopL', 'backTopR', 'backMidR'],
      ['backTopL', 'backMidR', 'backMidL'],
      ['backMidL', 'backBot', 'backMidR'],

      // neck (28-36)
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
      snout: [9, 10, 11, 12, 13],
      cheeks: [14, 15],
      chin: [16, 17, 18, 19],
      back: [20, 21, 22, 23, 24, 25, 26, 27],
      neck: [28, 29, 30, 31, 32, 33, 34, 35, 36],
    }
  }
}
