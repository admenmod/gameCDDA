import { Vector2 } from '@ver/Vector2';
import { EventDispatcher, Event } from '@ver/events';
import { TouchesController } from '@ver/TouchesController';
import { CanvasLayer } from '@ver/CanvasLayer';
import { MainLoop } from '@ver/MainLoop';
import { Camera } from '@ver/Camera';
import type { LayersList } from '@ver/CanvasLayer';

import { Node } from '@/scenes/Node';
import { MainScene } from '@/scenes/MainScene';
import { SensorCamera } from '@/modules/SensorCamera';

import { ProcessSystem } from '@/scenes/Node';
import { RenderSystem } from '@/scenes/CanvasItem';
import { PhysicsBox2DSystem } from '@/scenes/PhysicsBox2DItem';


export const appElement = document.querySelector<HTMLDivElement>('#app');
if(!appElement) throw new Error('app is not found');

export const canvas = new CanvasLayer();
appElement.append(canvas);
//@ts-ignore
canvas.ondblclick = () => canvas.webkitRequestFullscreen();


export const layers: LayersList = {};

for(let id in canvas.layers) {
	layers[id] = canvas.layers[id].getContext('2d')!;
}


export const touches = new TouchesController(canvas);


export const gm = new class GameManager extends EventDispatcher {
	public '@resize' = new Event<GameManager, [Vector2]>(this);
	public '@camera.scale' = new Event<GameManager, [Vector2]>(this);


	public screen = new Vector2(canvas.size);
	public camera = new SensorCamera(new Camera(this.screen));

	public root!: Node;


	constructor() {
		super();

		canvas['@resize'].on(size => {
			this.screen.set(size);
			this.camera.size.set(size);

			this['@resize'].emit(size);
		});


		this.camera['@scale'].on(scale => this['@camera.scale'].emit(scale));
	}
}


export const mainLoop = new MainLoop();


layers.main.canvas.hidden = true;


export const processSystem = new ProcessSystem();
export const renderSystem = new RenderSystem();
export const physicsBox2DSystem = new PhysicsBox2DSystem();

mainLoop.on('update', dt => processSystem.update(dt), 25);
mainLoop.on('update', dt => renderSystem.update(layers, gm.camera), 50);
mainLoop.on('update', dt => touches.nullify(dt), 10000);
mainLoop.on('update', dt => physicsBox2DSystem.update(16), 20);

mainLoop.on('update', dt => {
	layers.back.clearRect(0, 0, canvas.width, canvas.height);

	if(canvas.layers.webgl) layers.back.drawImage(canvas.layers.webgl, 0, 0);
	else layers.back.drawImage(canvas.layers.main, 0, 0);
});


(async () => {
	await Node.load();
	await MainScene.load();

	gm.root = new Node();
	await gm.root.init();

	const main_scene = new MainScene();
	await main_scene.init();

	processSystem.addRoot(gm.root);
	renderSystem.addRoot(gm.root);
	physicsBox2DSystem.addRoot(gm.root);

	gm.root.addChild(main_scene);

	mainLoop.start();


	// await import('@/webgl/main');
	// await import('@/inspector/index');
})();
