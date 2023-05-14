import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import { Scene } from '@ver/Scene';
import { MapParser } from '@ver/MapParser';
import type { LayersList } from '@ver/CanvasLayer';
import type { Camera } from '@ver/Camera';
import { KeyboardInputInterceptor } from '@ver/KeyboardInputInterceptor';
import { KeymapperOfActions, MappingsMode } from '@ver/KeymapperOfActions';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';
import { TileMap } from '@/scenes/nodes/TileMap';
import { Popup, PopupContainer } from '@/scenes/nodes/Popup';
import { World } from '@/scenes/nodes/World';
import { NodeCell } from '@/scenes/nodes/NodeCell';
import { Player } from '@/scenes/nodes/Player';
import { Apple } from '@/scenes/nodes/Apple';

import { GridMap } from '@/modules/GridMap';
import { touches, canvas, layers, gm, keyboardInputInterceptor } from '@/global';

import { TextNode } from './nodes/gui/TextNode';


export class MainScene extends Node2D {
	public gridMap = new GridMap({
		tile: new Vector2().set(gm.camera.pixelDensity),
		size: gm.screen,
		coordinates: true
	});


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


	private keymapperOfActions!: KeymapperOfActions;
	private normal_mode = new MappingsMode('normal');


	public TREE() { return {
		World, TileMap, Player, PopupContainer,

		Apple1: Apple,
		Apple2: Apple,
		Apple3: Apple,
		Apple4: Apple,
		Apple5: Apple,

		textdata: TextNode,
		texthelp: TextNode
	}}

	public static map: MapParser.Map;

	protected static async _load(scene: typeof this): Promise<void> {
		await Promise.all([
			super._load(scene),

			NodeCell.load(),
			Popup.load()
		]);

		this.map = await MapParser.instance().loadMap('maps/test-map.json');
	}


	private get world() { return this.getChild('World')!; }
	private get tilemap() { return this.getChild('TileMap')!; }
	private get player() { return this.getChild('Player')!; }
	private get popups() { return this.getChild('PopupContainer')!; }

	private get apple1() { return this.getChild('Apple1')!; }
	private get apple2() { return this.getChild('Apple2')!; }
	private get apple3() { return this.getChild('Apple3')!; }
	private get apple4() { return this.getChild('Apple4')!; }
	private get apple5() { return this.getChild('Apple5')!; }

	private get textdata() { return this.getChild('textdata')!; }
	private get texthelp() { return this.getChild('texthelp')!; }


	public async _init(this: MainScene): Promise<void> {
		this.getChild('TileMap')!.map = MainScene.map;

		this.world.size.set(20, 20);
		this.world.date.setHours(6);

		this.player.cellpos.set(8, 8);

		this.apple1.cellpos.set(6, 6);
		this.apple2.cellpos.set(7, 6);
		this.apple3.cellpos.set(6, 7);
		this.apple4.cellpos.set(5, 6);
		this.apple5.cellpos.set(6, 5);


		this.keymapperOfActions = new KeymapperOfActions(this.normal_mode);
		this.keymapperOfActions.init(keyboardInputInterceptor);
		this.keymapperOfActions.enable();


		const updateOnResize = (size: Vector2) => {
			this.gridMap.size.set(size);

			// layers.main.beginPath();
			// layers.main.rect(gm.camera.position.x, gm.camera.position.y, gm.camera.size.x, gm.camera.size.y);
			// layers.main.clip();
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
		gm.on('camera.scale', scale => this.gridMap.scale.set(scale));


		await super._init();


		this.world.addObject(this.player);

		this.world.addObject(this.apple1);
		this.world.addObject(this.apple2);
		this.world.addObject(this.apple3);
		this.world.addObject(this.apple4);
		this.world.addObject(this.apple5);


		const tilemap = this.tilemap.map!;
		console.log(tilemap);


		const layer = tilemap.layers[0];
		const oInits: Promise<any>[] = [];
		if(layer.type === 'tilelayer') {
			for(let i = 0; i < layer.data.length; i++) {
				if(layer.data[i] === 0) continue;

				const x = i % layer.width;
				const y = Math.floor(i / layer.width);

				const o = new NodeCell();
				o.isPickupable = false;

				oInits.push(o.init().then(() => {
					o.cellpos.set(x, y);
					this.world.addObject(o);
				}));
			}
		}

		await Promise.all([oInits]);
	}

	protected _ready(this: MainScene): void {
		this.popups.zIndex += 100;

		this.textdata.color = '#99ee22';
		this.textdata.position.set(-10, 5);

		this.texthelp.color = '#779933';
		this.texthelp.position.set(20, 2);
		this.texthelp.text =
`w + Arrow - взять в руки
d + Arrow - выбросить предмет в руках
i + i - open inventory
a + a - default action

dblclick - полноэкранный режим
`


		const onmappings: KeymapperOfActions.Action = ({ mapping }) => {
			let text: string = '';

			switch(mapping.join('|')) {
				case 'i|i': text = 'open inventory';
					break;
				case 'Ctrl-l': text = 'list l';
					break;
				case 'Ctrl- ': text = 'list space';
					break;
				case 'a|a': text = 'default action';
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


			this.popups.createPopap(text, this.player.globalPosition.add(0, -1.5));
		};

		this.normal_mode.register(['i', 'i'], onmappings);

		this.normal_mode.register(['Ctrl- '], onmappings);
		this.normal_mode.register(['Ctrl-l'], onmappings);

		this.normal_mode.register(['\\', 'h'], onmappings);
		this.normal_mode.register(['\\', 'h', 's'], onmappings);
		this.normal_mode.register(['a', 's'], onmappings);
		this.normal_mode.register(['a', 'a'], onmappings);

		this.normal_mode.register(['ArrowUp'], () => this.player.move(Vector2.UP));
		this.normal_mode.register(['ArrowDown'], () => this.player.move(Vector2.DOWN));
		this.normal_mode.register(['ArrowLeft'], () => this.player.move(Vector2.LEFT));
		this.normal_mode.register(['ArrowRight'], () => this.player.move(Vector2.RIGHT));


		const map_pikeup: KeymapperOfActions.Action = mapping => {
			const dir = new Vector2();

			if(mapping.mapping[1] === 'ArrowUp') dir.set(0, -1);
			else if(mapping.mapping[1] === 'ArrowDown') dir.set(0, 1);
			else if(mapping.mapping[1] === 'ArrowLeft') dir.set(-1, 0);
			else if(mapping.mapping[1] === 'ArrowRight') dir.set(1, 0);

			const o = this.world.getObjectCellUp(this.player.cellpos.buf().add(dir));
			if(o) this.player.tryPickup(o);
		};

		this.normal_mode.register(['w', 'ArrowUp'], map_pikeup);
		this.normal_mode.register(['w', 'ArrowDown'], map_pikeup);
		this.normal_mode.register(['w', 'ArrowLeft'], map_pikeup);
		this.normal_mode.register(['w', 'ArrowRight'], map_pikeup);


		const map_put: KeymapperOfActions.Action = mapping => {
			const dir = new Vector2();

			if(mapping.mapping[1] === 'ArrowUp') dir.set(0, -1);
			else if(mapping.mapping[1] === 'ArrowDown') dir.set(0, 1);
			else if(mapping.mapping[1] === 'ArrowLeft') dir.set(-1, 0);
			else if(mapping.mapping[1] === 'ArrowRight') dir.set(1, 0);

			this.player.tryPutfromHandsTo(dir);
		};

		this.normal_mode.register(['d', 'ArrowUp'], map_put);
		this.normal_mode.register(['d', 'ArrowDown'], map_put);
		this.normal_mode.register(['d', 'ArrowLeft'], map_put);
		this.normal_mode.register(['d', 'ArrowRight'], map_put);
	}

	protected _process(this: MainScene, dt: number): void {
		this.keymapperOfActions.update(dt);

		gm.camera.position.moveTime(this.player.globalPosition, 10);
		gm.camera.process(dt, touches);

		this.textdata.text = 'DATE: '+this.world.date.getTimeString();

		this.systemInfoDrawObject.update(dt);
	}

	protected _render(this: MainScene, layers: LayersList, camera: Camera): void {
		layers.main.clearRect(0, 0, gm.screen.x, gm.screen.y);

		this.gridMap.draw(layers.main, camera.getDrawPosition());

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

		this.systemInfoDrawObject.draw(layers.main);
	}
}
