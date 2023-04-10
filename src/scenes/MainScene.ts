import { Vector2 } from '@ver/Vector2';
import { KeyboardInputInterceptor } from '@ver/KeyboardInputInterceptor';
import { KeymapperOfActions } from '@ver/KeymapperOfActions';
import type { Camera } from '@ver/Camera';
import type { LayersList } from '@ver/CanvasLayer';

import { Node2D } from '@/scenes/nodes/Node2D';
import { TileMap } from '@/scenes/nodes/TileMap';
import { Popup } from '@/scenes/nodes/Popup';
import { NodeCell } from '@/scenes/nodes/NodeCell';
import { Player } from '@/scenes/nodes/Player';

import { GridMap } from '@/modules/GridMap';
import { World } from '@/modules/World';
import { touches, canvas, layers, gm, mapParser } from '@/global';


export class MainScene extends Node2D {
	private keymapperOfActions!: KeymapperOfActions;

	public world: World;

	public player!: Player;
	public tilemap!: TileMap;

	public gridMap = new GridMap({
		tile: new Vector2().set(gm.camera.pixelDensity),
		size: gm.screen,
		coordinates: true
	});

	private popups: Popup[] = [];


	private systemInfoDrawObject = {
		textFPS: '',
		textScreenSize: '',

		padding: new Vector2(10, 10),
		time: 0,

		update(dt: number) {
			if(this.time > 100) {
				this.textFPS = `FPS: ${(1000/dt).toFixed(2)}`;
				this.textScreenSize = `Screen size: ${gm.screen.x}, ${gm.screen.y}`;

				this.time = 0;
			};

			this.time += dt;
		},

		draw(ctx: CanvasRenderingContext2D) {
			ctx.save();
			ctx.beginPath();

			ctx.font = `18px arkhip, Arial`;
			ctx.textBaseline = 'top';

			ctx.strokeStyle = '#111111';
			ctx.strokeText(this.textFPS, this.padding.x, this.padding.y);
			ctx.fillStyle = '#eeeeee';
			ctx.fillText(this.textFPS, this.padding.x, this.padding.y);


			ctx.textAlign = 'end';
			ctx.textBaseline = 'bottom';

			ctx.strokeStyle = '#111111';
			ctx.strokeText(this.textScreenSize, gm.screen.x - 10, gm.screen.y - 10);
			ctx.fillStyle = '#eeeeee';
			ctx.fillText(this.textScreenSize, gm.screen.x - 10, gm.screen.y - 10);

			ctx.restore();
		}
	};


	constructor() {
		super();

		if(globalThis.Android) {
			console.log(Android);

			// console.log(Android.log());
		} else console.log('not Android');


		const hiddenInput = document.createElement('input');
		hiddenInput.style.position = 'fixed';
		hiddenInput.style.top = '-1000px';
		canvas.append(hiddenInput);

		const keyboardInputInterceptor = new KeyboardInputInterceptor(hiddenInput);
		keyboardInputInterceptor.init();
		canvas.addEventListener('click', () => keyboardInputInterceptor.focus());
		// keyboardInputInterceptor.input.onblur = () => keyboardInputInterceptor.input.focus();

		keyboardInputInterceptor.on('key:all', e => {
			// console.log(e.type, e.key, e);
		});


		const keymapperOfActions = this.keymapperOfActions = new KeymapperOfActions('normal');
		keymapperOfActions.init(keyboardInputInterceptor);


		const onmappings: KeymapperOfActions.Action = ({ mapping }) => {
			let text: string = '';

			switch(mapping.join('|')) {
				case 'i|i': text = 'open inventory';
					break;
				case 'Ctrl-l': text = 'list l';
					break;
				case 'Ctrl- ': text = 'list space';
					break;
				case 'a|a': text = 'defult action';
					break;
				case 'a|s': text = 'save action';
					break;
				case '\\|h': text = 'Hi';
					break;
				case '\\|h|s': text = 'Hello';
					break;
				default: text = 'Забыл обработать :)'
					break;
			}


			const popup = new Popup({
				pos: this.player.position.buf().add(0, -1.5),
				text: text
			});

			popup.ready();
			this.popups.push(popup);
		};

		keymapperOfActions.register(0, ['i', 'i'], onmappings);

		keymapperOfActions.register(0, ['Ctrl- '], onmappings);
		keymapperOfActions.register(0, ['Ctrl-l'], onmappings);

		keymapperOfActions.register(0, ['\\', 'h'], onmappings);
		keymapperOfActions.register(0, ['\\', 'h', 's'], onmappings);
		keymapperOfActions.register(0, ['a', 's'], onmappings);
		keymapperOfActions.register(0, ['a', 'a'], onmappings);

		keymapperOfActions.register(0, ['ArrowUp'], () => this.player.move(Vector2.UP));
		keymapperOfActions.register(0, ['ArrowDown'], () => this.player.move(Vector2.DOWN));
		keymapperOfActions.register(0, ['ArrowLeft'], () => this.player.move(Vector2.LEFT));
		keymapperOfActions.register(0, ['ArrowRight'], () => this.player.move(Vector2.RIGHT));


		console.log(
`global: ${JSON.stringify(keymapperOfActions.gmaps.map(i => i.mapping.join('|')), null, '\t')
}, ${
	JSON.stringify([...keymapperOfActions.mapmap].map(([mode, maps]) => {
		return `mode: ${mode.toString()} > ${
			JSON.stringify(maps.map(i => i.mapping.join('|')), null, '\t')
		}`;
	}), null, '\t')
}`);


		const updateOnResize = (size: Vector2) => {
			this.gridMap.size.set(size);

			// layers.main.beginPath();
			// layers.main.rect(gm.camera.position.x, gm.camera.position.y, gm.camera.size.x, gm.camera.size.y);
			// layers.main.clip();
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
		gm.on('camera.scale', scale => this.gridMap.scale.set(scale));


		this.tilemap = this.addChild(new TileMap('maps/test-map.json'), 'TileMap');

		this.player = this.addChild(new Player({
			pos: new Vector2(8, 8),
			size: new Vector2(0.95, 0.95)
		}), 'Player');


		this.world = new World({ size: new Vector2(20, 20) });
		this.world.date.setHours(6);


		console.log(`Initialize scene "${this.name}"`);
	}

	//========== Init ==========//
	protected _init(): void {
		const tilemap = this.getNode<TileMap>('TileMap')!.map;
		console.log(tilemap);


		const layer = tilemap.layers[0];

		for(let i = 0; i < layer.data.length; i++) {
			if(layer.data[i] === 0) continue;

			const x = i % layer.width;
			const y = Math.floor(i / layer.width);

			const o = new NodeCell();
			o.cellpos.set(x, y);
			o.ready();

			this.world.addObject(o);
		}


		this.world.addObject(this.player);
		this.player.cellpos.set(8, 8);

		console.log(`Scene: ${this.name}\nScreen size: ${gm.screen.x}, ${gm.screen.y}`);
	}

	//========== Update ==========//
	protected _process(dt: number): void {
		this.keymapperOfActions.update(dt);

		const player = this.getNode<Player>('Player')!;

		gm.camera.position.moveTime(player.globalPosition, 10);
		// gm.camera.position.set(player.globalPosition);

		gm.camera.process(dt, touches);


		for(let i = 0, len = this.popups.length; i < len; i++) {
			this.popups[i].process(dt);
			const l = this.popups.findIndex(i => i.alpha <= 0);

			if(~l) {
				this.popups.splice(l, 1);
				i--;
				len--;
			}
		}

		this.tilemap.process(dt);
		this.player.process(dt);

		this.systemInfoDrawObject.update(dt);
	}

	protected _render(layers: LayersList, camera: Camera): void {
		layers.main.clearRect(0, 0, gm.screen.x, gm.screen.y);

		this.gridMap.draw(layers.main, camera.getDrawPosition());
		this.tilemap.render(layers, camera);
		this.player.render(layers, camera);


		const center = this.getDrawPosition(camera);

		let a = 30 * camera.scale.x;

		layers.main.save();
		layers.main.beginPath();
		layers.main.strokeStyle = '#ffff00';
		layers.main.moveTo(center.x, center.y-a);
		layers.main.lineTo(center.x, center.y+a);
		layers.main.moveTo(center.x-a, center.y);
		layers.main.lineTo(center.x+a, center.y);
		layers.main.stroke();

		layers.main.fillStyle = '#eeeeee';
		// layers.main.font = '20px Arial';
		// layers.main.fillText('timeout: ' + this.keymapperOfActions.timeout.toFixed(0), 10, 120);
		layers.main.font = '15px Arial';
		layers.main.fillText('date: '+this.world.date.getTimeString(), 10, 140);
		layers.main.restore();


		layers.main.save();
		layers.main.fillStyle = '#eeeeee';
		layers.main.font = '15px arkhip';
		layers.main.fillText(this.keymapperOfActions.acc.join(''), 10, gm.screen.y-10);
		layers.main.restore();


		for(let i = 0; i < this.popups.length; i++) this.popups[i].render(layers, camera);


		this.systemInfoDrawObject.draw(layers.main);
	}

	//========== Exit ==========//
	protected _exit(): void {
		console.log(this.name, 'exit');
	}
}
