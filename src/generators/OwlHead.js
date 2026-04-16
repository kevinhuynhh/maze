import { BaseAnimal } from './BaseAnimal'

export class OwlHead extends BaseAnimal {
  defineKeypoints() {
    const p = this.params
    // Owl: short beak instead of snout, tufted ears, wide round face
    const bl = this.lerp(0.1, 0.35, p.snoutLength) // beak length
    const eh = this.lerp(0.3, 0.9, p.earHeight) // tuft height
    const fw = this.lerp(0.8, 1.2, p.faceWidth)
    const cp = this.lerp(0.1, 0.35, p.cheekPuff) // disc fullness
    const fs = this.lerp(0.0, 0.25, p.foreheadSlope)
    const cd = this.lerp(0.0, 0.2, p.chinDepth)

    this.keypoints = {
      crown: [0, 1.05, -0.05],

      // ear tufts
      tuftL_base: [-fw * 0.42, 0.85, -0.05],
      tuftL_tip: [-fw * 0.48, 0.85 + eh * 0.6, -0.1],
      tuftR_base: [fw * 0.42, 0.85, -0.05],
      tuftR_tip: [fw * 0.48, 0.85 + eh * 0.6, -0.1],

      // wide forehead / brow
      browL: [-fw * 0.55, 0.55 + fs, 0.15],
      browR: [fw * 0.55, 0.55 + fs, 0.15],
      browMidL: [-0.15, 0.65 + fs, 0.25],
      browMidR: [0.15, 0.65 + fs, 0.25],

      // facial disc outer
      discL: [-(fw * 0.6 + cp), 0.15, 0.15],
      discR: [fw * 0.6 + cp, 0.15, 0.15],
      discBotL: [-fw * 0.4, -0.2, 0.2],
      discBotR: [fw * 0.4, -0.2, 0.2],

      // cheek puff inner
      cheekL: [-0.3, 0.1, 0.35],
      cheekR: [0.3, 0.1, 0.35],

      // beak
      beakTop: [0, 0.25, 0.4 + bl * 0.3],
      beakTip: [0, 0.1, 0.45 + bl * 0.5],
      beakBotL: [-0.06, 0.0, 0.4 + bl * 0.2],
      beakBotR: [0.06, 0.0, 0.4 + bl * 0.2],

      // chin area
      chinL: [-0.18, -0.15, 0.3],
      chinR: [0.18, -0.15, 0.3],
      chin: [0, -0.25 - cd, 0.2],

      // back
      backTopL: [-fw * 0.45, 0.75, -0.35],
      backTopR: [fw * 0.45, 0.75, -0.35],
      backMidL: [-fw * 0.4, 0.15, -0.45],
      backMidR: [fw * 0.4, 0.15, -0.45],
      backBot: [0, -0.2, -0.4],
      neckL: [-0.28, -0.35, -0.12],
      neckR: [0.28, -0.35, -0.12],
    }
  }

  defineFaces() {
    this.faces = [
      // crown / forehead (0-3)
      ['crown', 'tuftL_base', 'browMidL'],
      ['crown', 'browMidL', 'browMidR'],
      ['crown', 'browMidR', 'tuftR_base'],
      ['tuftL_base', 'browL', 'browMidL'],
      ['tuftR_base', 'browMidR', 'browR'],

      // ear tufts (5-6)
      ['tuftL_base', 'tuftL_tip', 'browL'],
      ['tuftR_base', 'browR', 'tuftR_tip'],

      // brow mid bridge (7)
      ['browMidL', 'browMidR', 'beakTop'],

      // brow to cheek (8-11)
      ['browL', 'discL', 'cheekL'],
      ['browL', 'cheekL', 'browMidL'],
      ['browR', 'cheekR', 'discR'],
      ['browR', 'browMidR', 'cheekR'],

      // cheek to beak (12-13)
      ['browMidL', 'cheekL', 'beakTop'],
      ['browMidR', 'beakTop', 'cheekR'],

      // beak (14-17)
      ['beakTop', 'cheekL', 'beakBotL'],
      ['beakTop', 'beakBotR', 'cheekR'],
      ['beakTop', 'beakBotL', 'beakTip'],
      ['beakTop', 'beakTip', 'beakBotR'],
      ['beakBotL', 'beakBotR', 'beakTip'],

      // disc lower (19-22)
      ['discL', 'discBotL', 'cheekL'],
      ['discR', 'cheekR', 'discBotR'],
      ['cheekL', 'discBotL', 'chinL'],
      ['cheekR', 'chinR', 'discBotR'],

      // chin / under beak (23-26)
      ['cheekL', 'chinL', 'beakBotL'],
      ['cheekR', 'beakBotR', 'chinR'],
      ['beakBotL', 'chinL', 'chinR'],
      ['beakBotL', 'chinR', 'beakBotR'],

      // lower chin (27-28)
      ['chinL', 'chin', 'chinR'],
      ['discBotL', 'chin', 'chinL'],
      ['discBotR', 'chinR', 'chin'],

      // back (30-37)
      ['crown', 'backTopL', 'tuftL_base'],
      ['crown', 'tuftR_base', 'backTopR'],
      ['crown', 'backTopR', 'backTopL'],
      ['backTopL', 'backMidL', 'tuftL_base'],
      ['backTopR', 'tuftR_base', 'backMidR'],
      ['backTopL', 'backTopR', 'backMidR'],
      ['backTopL', 'backMidR', 'backMidL'],
      ['backMidL', 'backBot', 'backMidR'],

      // side back to disc (38-39)
      ['tuftL_base', 'backMidL', 'browL'],
      ['tuftR_base', 'browR', 'backMidR'],
      ['browL', 'backMidL', 'discL'],
      ['browR', 'discR', 'backMidR'],

      // neck (42-49)
      ['discL', 'backMidL', 'discBotL'],
      ['discR', 'discBotR', 'backMidR'],
      ['discBotL', 'backMidL', 'backBot'],
      ['discBotR', 'backBot', 'backMidR'],
      ['discBotL', 'backBot', 'chin'],
      ['discBotR', 'chin', 'backBot'],
      ['backBot', 'neckL', 'backMidL'],
      ['backBot', 'backMidR', 'neckR'],
      ['chin', 'neckL', 'backBot'],
      ['chin', 'backBot', 'neckR'],
      ['chin', 'neckR', 'neckL'],
    ]

    this.faceGroups = {
      crown: [0, 1, 2, 3, 4],
      tufts: [5, 6],
      face: [7, 8, 9, 10, 11, 12, 13],
      beak: [14, 15, 16, 17, 18],
      disc: [19, 20, 21, 22, 40, 41, 42, 43],
      chin: [23, 24, 25, 26, 27, 28, 29],
      back: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
      neck: [44, 45, 46, 47, 48, 49, 50, 51, 52],
    }
  }
}
