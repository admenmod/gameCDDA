import { Vector2 } from '@ver/Vector2';
import { EventDispatcher, Event } from '@ver/events';
import { TouchesController } from '@ver/TouchesController';
import { MainLoop } from '@ver/MainLoop';
import { CanvasLayer } from '@ver/CanvasLayer';
import { Camera } from '@ver/Camera';
import { MapParser } from '@ver/MapParser';
import type { LayersList } from '@ver/CanvasLayer';

import { Node } from '@/scenes/nodes/Node';
import { MainScene } from '@/scenes/MainScene';
import { SensorCamera } from '@/modules/SensorCamera';


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

export const mapParser = new MapParser();


export const gm = new class GameManager extends EventDispatcher {
	public '@resize' = new Event<this, [Vector2]>(this);
	public '@camera.scale' = new Event<this, [Vector2]>(this);


	public screen = new Vector2(canvas.size);
	public camera = new SensorCamera(new Camera(this.screen, 30));

	public main_scene!: Node;


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


gm.main_scene = new MainScene();


const mainLoop = new MainLoop();

mainLoop.on('update', dt => {
	gm.main_scene.process(dt);
	gm.main_scene.render(layers, gm.camera);

	touches.nullify();
});

mainLoop.start();

gm.main_scene.ready();
