import { Vector2 } from '@ver/Vector2';
import { EventDispatcher, Event } from '@ver/events';
import { Scene } from '@ver/Scene';
import { TouchesController } from '@ver/TouchesController';
import { MainLoop } from '@ver/MainLoop';
import { CanvasLayer } from '@ver/CanvasLayer';
import { Camera } from '@ver/Camera';
import { MapParser } from '@ver/MapParser';
import { KeyboardInputInterceptor } from '@ver/KeyboardInputInterceptor';
import type { LayersList } from '@ver/CanvasLayer';

import { MainScene } from '@/scenes/MainScene';
import { SensorCamera } from '@/modules/SensorCamera';


export const appElement = document.querySelector<HTMLDivElement>('#app');
if(!appElement) throw new Error('app is not found');

export const canvas = new CanvasLayer();
appElement.append(canvas);

const helpPopup = document.createElement('div');
helpPopup.classList.add('help-popup');
helpPopup.innerHTML += `<span>
w + Arrow - взять в руки <br>
d + Arrow - выбросить предмет в руках <br>
i + i - open inventory <br>
a + a - default action <br>
<br>
dblclick - полноэкранный режим
</span>`;
canvas.append(helpPopup);
helpPopup.ondblclick = () => helpPopup.remove();

//@ts-ignore
canvas.ondblclick = () => canvas.webkitRequestFullscreen();


export const layers: LayersList = {};

for(let id in canvas.layers) {
	layers[id] = canvas.layers[id].getContext('2d')!;
}


export const touches = new TouchesController(canvas);


export const hiddenInput = document.createElement('input');
hiddenInput.style.position = 'fixed';
hiddenInput.style.top = '-1000px';
canvas.append(hiddenInput);

export const keyboardInputInterceptor = new KeyboardInputInterceptor(hiddenInput);
keyboardInputInterceptor.init();
canvas.addEventListener('click', () => keyboardInputInterceptor.focus());


export const gm = new class GameManager extends EventDispatcher {
	public '@resize' = new Event<this, [Vector2]>(this);
	public '@camera.scale' = new Event<this, [Vector2]>(this);


	public screen = new Vector2(canvas.size);
	public camera = new SensorCamera(new Camera(this.screen, 30));


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


const mainLoop = new MainLoop();

mainLoop.on('update', dt => {
	main_scene.process(dt);
	main_scene.render(layers, gm.camera);

	touches.nullify();
});


export let main_scene: MainScene;

MainScene.load().then(() => {
	main_scene = new MainScene();
	main_scene.init();

	mainLoop.start();
});
