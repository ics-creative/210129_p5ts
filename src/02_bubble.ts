import p5 from "p5";

/** バブルの情報を定義する型 */
type Bubble = {
  /** 位置（画面サイズに対する0〜1の相対位置） */
  pos: {
    x: number;
    y: number;
  };
  /** サイズ(px) */
  size: number;
  /** 上昇スピード（画面高さに対する0〜1の相対値） */
  speed: number;
  /** 塗りつぶすか？ */
  isFill: boolean;
};

const sketch = (p: p5) => {
  /** バブルの数 */
  const COUNT = 40;
  /** 最小サイズ（画面幅を1） */
  const MINSIZE = 0.005;
  /** 最大サイズ（画面幅を1） */
  const MAXSIZE = 0.2;
  /** 最小速度（画面の高さを1として、1フレームごとに動く量の最小値） */
  const MINSPEED = 0.005;
  /** 最大速度（画面の高さを1として、1フレームごとに動く量の最大値） */
  const MAXSPEED = 0.02;
  /** カーソル移動後、その位置からバブルを出し続ける時間（フレーム） */
  const MOUSE_ACTIVE_FRAMES = 120;
  /** 背景色 */
  const BG_COLOR = "#171d21";
  /** バブルの色 */
  const BUBBLE_COLOR = "#77acb5";
  /** 生成したバブルを格納する配列 */
  let bubbles: Bubble[] = [];
  /** 最後にカーソルが動いた時間（フレーム） */
  let lastMouseMoved = -MOUSE_ACTIVE_FRAMES;

  /**
   * バブルを追加します。
   * カーソルを動かしている場合にはカーソル位置に、停止している場合は画面下のランダムな位置に配置します。
   */
  const addBubble = () => {
    // 仮想的な奥行きを決める（0=奥 ... 1=手前）
    // 累乗することで奥の方が多めになるよう偏りをつける
    const zDist = p.random() ** 3;
    // カーソルの位置に配置するか？　カーソルを移動してから一定時間はカーソル位置を利用する
    const isUseMousePos = p.frameCount - lastMouseMoved < MOUSE_ACTIVE_FRAMES;
    // 初期位置のx, y座標を決定
    const x = isUseMousePos
      ? p.mouseX / p.width + p.random(-0.05, 0.05)
      : p.random();
    const y = isUseMousePos ? p.mouseY / p.height + p.random(-0.05, 0.05) : 1.2;
    // バブルを追加
    // 奥行きが手前にあるほど、サイズが大きくなり見かけの動きも早くなる
    bubbles.push({
      pos: { x, y },
      size: p.map(zDist, 0, 1, MINSIZE, MAXSIZE),
      speed: p.map(zDist, 0, 1, MINSPEED, MAXSPEED),
      isFill: Math.random() > 0.5,
    });
  };

  /** 画面外に出たバブルを配列から除去する */
  const removeOutBubbles = () => {
    bubbles = bubbles.filter((b) => b.pos.y * p.height + b.size >= 0);
  };

  /** バブルの位置を更新する */
  const updateBubbles = () => {
    bubbles.forEach((b) => {
      b.pos.y -= b.speed;
    });
  };

  /** バブルを描画する */
  const drawBubbles = () => {
    bubbles.forEach((b) => {
      // ノイズを使って左右の揺れの値を作る
      const noise = p.noise(b.pos.x * 20, b.pos.y * 20);
      const xShift = p.map(noise, 0, 1, -15, 15);
      const color = p.color(BUBBLE_COLOR);
      p.stroke(color);
      b.isFill ? p.fill(color) : p.noFill();
      // バブルの位置に計算したノイズを加えて円を描画する
      p.circle(
        b.pos.x * p.width + xShift,
        b.pos.y * p.height,
        b.size * p.width
      );
    });
  };

  /** 初期化処理 */
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  /** フレームごとの描画処理 */
  p.draw = () => {
    p.push();
    p.background(p.color(BG_COLOR));
    p.blendMode(p.SCREEN);
    removeOutBubbles();
    while (bubbles.length < COUNT) {
      addBubble();
    }
    updateBubbles();
    drawBubbles();
    p.pop();
  };

  p.mouseMoved = () => {
    lastMouseMoved = p.frameCount;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
