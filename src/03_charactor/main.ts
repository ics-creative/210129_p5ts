import p5 from "p5";
import Eases from "eases";

// Parcelがバンドルした画像を利用するためにimportする
import charaSrc from "./imgs/chara.svg";
import starSrc from "./imgs/star.svg";

const JUMP_HEIGHT = 100;
const JUMP_DUR = 80;
const BG_COLOR = "#133042";
const GROUND_COLOR = "#64a7b3";
const BORDER_COLOR = "#787161";
const STAR_STROKE_COLOR = "#ffc62b";
const STAR_COUNT = 15;
const STAR_MOVE_DUR = 100;

type StarState = {
  pos: p5.Vector;
  moveingTo?: p5.Vector;
  moveStartFrame: number;
  rotateSpeed: number;
};

const sketch = (p: p5) => {

  const chara = p.loadImage(charaSrc);
  const charaState = {
    jumpStartFrame: 0
  }
  const star = p.loadImage(starSrc);
  const starStates: StarState[] = [];


  const drawChara = (r: number) => {
    let jumpY = 0;
    if (charaState.jumpStartFrame) {
      const progress = Math.min((p.frameCount - charaState.jumpStartFrame) / JUMP_DUR, 1);
      if (progress == 1) {
        charaState.jumpStartFrame = 0;
      }
      const easedProgress = progress < 0.5 ? Eases.expoOut(progress * 2) : (1 - Eases.bounceOut((progress - 0.5) * 2));
      jumpY = easedProgress * JUMP_HEIGHT;
    }
    p.image(chara, -chara.width / 2, -chara.height - r - jumpY);
  }

  const addStar = () => {
    starStates.push({
      pos: p.createVector(Math.random(), Math.random()),
      moveStartFrame: 0,
      rotateSpeed: p.random(-2, 2)
    });
  }

  const drawStars = () => {
    starStates.forEach(st => {
      p.push();
      let pos = st.pos.copy();
      const starStrokeColor = p.color(STAR_STROKE_COLOR);
      if (st.moveingTo) {
        const progress = p.constrain((p.frameCount - st.moveStartFrame) / STAR_MOVE_DUR, 0, 1);
        const easedProgress = Eases.elasticInOut(progress);
        pos = pos.lerp(st.moveingTo, easedProgress);
        starStrokeColor.setAlpha((1 - progress) * 255);
        if (progress ==  1) {
          st.moveStartFrame = 0;
          st.pos = st.moveingTo
          st.moveingTo = undefined;
        }
      }
      const x = pos.x * p.width;
      const y = pos.y * p.height;
      if (st.moveingTo) {
        p.stroke(starStrokeColor);
        p.strokeWeight(10);
        p.line(st.pos.x * p.width, st.pos.y * p.height, x, y);
      }
      p.translate(x, y);
      p.rotate(p.frameCount * st.rotateSpeed);
      p.image(star, -10, -10, 20, 20);
      p.pop();

      if (!st.moveingTo && Math.random() < 0.001) {
        st.moveStartFrame = p.frameCount;
        st.moveingTo = p.createVector(Math.random(), Math.random());
        console.log(st.moveingTo)
      }
    });
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
    for (let index = 0; index < STAR_COUNT; index++) {
      addStar();
    }
  };

  p.draw = () => {
    p.background(p.color(BG_COLOR));
    drawStars();
    p.translate(p.width / 2, p.height / 2);
    p.rotate(p.frameCount);
    p.fill(p.color(GROUND_COLOR));
    p.stroke(p.color(BORDER_COLOR));
    p.strokeWeight(3);
    p.circle(0, 0, 100);
    drawChara(50);
  }

  p.mouseClicked = () => {
    if (charaState.jumpStartFrame) {
      return;
    }
    charaState.jumpStartFrame = p.frameCount;
  }
}

new p5(sketch);