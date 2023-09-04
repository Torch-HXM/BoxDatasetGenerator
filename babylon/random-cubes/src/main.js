import './style.css'
import * as BABYLON from "babylonjs"
// 创建画布
const canvas = document.createElement("canvas");
// 设置画布尺寸
canvas.width = window.innerWidth;
canvas.height= window.innerHeight;
// 将画布添加到body中
document.body.appendChild(canvas);
// 创建引擎， 参数一：渲染部件， 参数二：是否抗锯齿
const engine = new BABYLON.Engine(canvas, true);
// 创建场景
const scene = new BABYLON.Scene(engine);
// 创建相机
const camera = new BABYLON.ArcRotateCamera(
  "camera",                 // 相机名称
  0,                        // 相机水平转角
  0,                        // 相机竖直转角
  10,                       // 相机旋转半径
  BABYLON.Vector3.Zero(),   // 旋转原点
  scene                     // 所在场景
)
// 将相机附加到画布上
camera.attachControl(canvas, true);
