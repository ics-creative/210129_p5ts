import p5 from "p5";

const sketch = (p: p5) => {

  const color1 = p.color("#fffbe3");
  const color2 = p.color("#24495c");
  let color1amount = 1;
  
  /** 初期化処理 */
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
    p.noStroke();
    p.background("#131821");
    p.blendMode(p.LIGHTEST);
  };

  /** フレームごとの描画処理 */
  p.draw = () => {
    p.fill(p.lerpColor(color2, color1, color1amount));
    p.translate(p.width / 2, p.height / 2);
    p.rotate(p.frameCount * 13);
    p.ellipse(p.frameCount / 2, 0, p.frameCount, p.frameCount / 3);
    color1amount *= 0.995;
  }
}

new p5(sketch);