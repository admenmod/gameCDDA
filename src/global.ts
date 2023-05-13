import { Vector2 } from '@ver/Vector2';
import { EventDispatcher, Event } from '@ver/events';
import { TouchesController } from '@ver/TouchesController';
import { CanvasLayer } from '@ver/CanvasLayer';
import { MainLoop } from '@ver/MainLoop';
import { Camera } from '@ver/Camera';
import { KeyboardInputInterceptor } from '@ver/KeyboardInputInterceptor';
import type { LayersList } from '@ver/CanvasLayer';

import { MainScene } from '@/scenes/MainScene';
import { SensorCamera } from '@/modules/SensorCamera';

import { RenderSystem } from '@/scenes/CanvasItem';
import { ProcessSystem } from '@/scenes/Node';


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
// canvas.append(helpPopup);
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
	public '@resize' = new Event<GameManager, [Vector2]>(this);
	public '@camera.scale' = new Event<GameManager, [Vector2]>(this);


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


export const mainLoop = new MainLoop();


layers.main.canvas.hidden = true;


export const processSystem = new ProcessSystem();
export const renderSystem = new RenderSystem();

mainLoop.on('update', dt => processSystem.update(dt), 25);
mainLoop.on('update', dt => renderSystem.update(layers, gm.camera), 50);
mainLoop.on('update', dt => touches.nullify(dt), 10000);

mainLoop.on('update', dt => {
	layers.back.clearRect(0, 0, canvas.width, canvas.height);

	if(canvas.layers.webgl) layers.back.drawImage(canvas.layers.webgl, 0, 0);

	layers.back.drawImage(canvas.layers.main, 0, 0);
});


(async () => {
	await MainScene.load();

	// await import('@/webgl/main');

	const main_scene = new MainScene();
	await main_scene.init();

	processSystem.addRoot(main_scene);
	renderSystem.addRoot(main_scene);

	mainLoop.start();
})();
