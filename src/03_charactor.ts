import p5 from "p5";
import Eases from "eases";

// Parcelがバンドルした画像を利用するためにimportする
import charaSrc from "./imgs/chara.svg";
import starSrc from "./imgs/star.svg";

/** キャラがジャンプする高さ */
const JUMP_HEIGHT = 100;
/** ジャンプの長さ（フレーム数） */
const JUMP_DUR = 80;
/** 背景色 */
const BG_COLOR = "#133042";
/** 地面の色 */
const GROUND_COLOR = "#64a7b3";
/** ボーダー色 */
const BORDER_COLOR = "#787161";
/** 星の軌跡の色 */
const STAR_STROKE_COLOR = "#ffc62b";
/** 星の数 */
const STAR_COUNT = 15;
/** 星の移動アニメーションの長さ */
const STAR_MOVE_DUR = 100;

/** 星の状態を管理する型 */
type StarState = {
  /** 現在の位置（アニメーション中はアニメーション開始時点の位置） */
  pos: p5.Vector;
  /** アニメーション中の場合、ゴール地点の位置 */
  moveingTo?: p5.Vector;
  /** アニメーション中の場合、開始した時刻（フレーム数） */
  moveStartFrame: number;
  /** 回転速度 */
  rotateSpeed: number;
};

/** キャラの状態を管理する型 */
type CharaState = {
  /** ジャンプ中の場合、開始した時刻（フレーム数） */
  jumpStartFrame: number;
};

const sketch = (p: p5) => {
  // 画像を読み込み
  const chara = p.loadImage(charaSrc);
  const star = p.loadImage(starSrc);

  // キャラと星の状態を空で初期化
  const charaState: CharaState = {
    jumpStartFrame: 0,
  };
  const starStates: StarState[] = [];

  /** キャラを描画する */
  const drawChara = (r: number) => {
    let jumpY = 0;
    // ジャンプ中の場合、進捗度合いを求めて現時点の高さに変換する
    if (charaState.jumpStartFrame) {
      // 進捗度（ジャンプ開始=0 ... 終了=1）
      const progress = Math.min(
        (p.frameCount - charaState.jumpStartFrame) / JUMP_DUR,
        1
      );
      if (progress == 1) {
        charaState.jumpStartFrame = 0;
      }
      // 進捗度をイージング関数でジャンプの高さに変換
      const easedProgress =
        progress < 0.5
          // ジャンプの前半
          ? Eases.expoOut(progress * 2)
          // ジャンプの後半
          : 1 - Eases.bounceOut((progress - 0.5) * 2);
      jumpY = easedProgress * JUMP_HEIGHT;
    }
    // キャラの足元を基準点として、上で求めた位置に描画
    p.image(chara, -chara.width / 2, -chara.height - r - jumpY);
  };

  /** 星を追加する */
  const addStar = () => {
    starStates.push({
      pos: p.createVector(Math.random(), Math.random()),
      moveStartFrame: 0,
      rotateSpeed: p.random(-2, 2),
    });
  };

  /** すべての星を描画する */
  const drawStars = () => {
    starStates.forEach((st) => {
      p.push();
      let pos = st.pos.copy();
      const starStrokeColor = p.color(STAR_STROKE_COLOR);
      // 移動中なら進捗度を求めて実際の表示座標に変換
      if (st.moveingTo) {
        const progress = p.constrain(
          (p.frameCount - st.moveStartFrame) / STAR_MOVE_DUR,
          0,
          1
        );
        const easedProgress = Eases.elasticInOut(progress);
        pos = pos.lerp(st.moveingTo, easedProgress);
        starStrokeColor.setAlpha((1 - progress) * 255);
        // 移動が完了したら、移動後の位置を新たな基準にする
        if (progress == 1) {
          st.moveStartFrame = 0;
          st.pos = st.moveingTo;
          st.moveingTo = undefined;
        }
      }
      const x = pos.x * p.width;
      const y = pos.y * p.height;
      // 移動中なら軌跡を表示
      if (st.moveingTo) {
        p.stroke(starStrokeColor);
        p.strokeWeight(10);
        p.line(st.pos.x * p.width, st.pos.y * p.height, x, y);
      }
      // 計算した位置に星を描画
      p.translate(x, y);
      p.rotate(p.frameCount * st.rotateSpeed);
      p.image(star, -10, -10, 20, 20);
      p.pop();

      // 移動中ではない場合、一定の確率で移動を開始する
      if (!st.moveingTo && Math.random() < 0.001) {
        st.moveStartFrame = p.frameCount;
        st.moveingTo = p.createVector(Math.random(), Math.random());
      }
    });
  };

  /** 初期化処理 */
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
    // 所定の数の星を作成
    for (let index = 0; index < STAR_COUNT; index++) {
      addStar();
    }
  };

  /** 描画処理 */
  p.draw = () => {
    p.background(p.color(BG_COLOR));
    // 星を描画
    drawStars();
    // 座標系を中心に移動して、キャラを描画
    p.translate(p.width / 2, p.height / 2);
    p.rotate(p.frameCount);
    p.fill(p.color(GROUND_COLOR));
    p.stroke(p.color(BORDER_COLOR));
    p.strokeWeight(3);
    p.circle(0, 0, 100);
    drawChara(50);
  };

  /** クリック時にキャラのジャンプを開始する */
  p.mouseClicked = () => {
    if (charaState.jumpStartFrame) {
      return;
    }
    charaState.jumpStartFrame = p.frameCount;
  };
};

new p5(sketch);
