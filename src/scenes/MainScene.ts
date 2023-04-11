import type { LayersList } from '@ver/CanvasLayer';
import type { Camera } from '@ver/Camera';
import { Vector2 } from '@ver/Vector2';
import type { Scene } from '@ver/Scene';
import { MapParser } from '@ver/MapParser';
import { KeyboardInputInterceptor } from '@ver/KeyboardInputInterceptor';
import { KeymapperOfActions, MappingsMode } from '@ver/KeymapperOfActions';

import { Node2D } from '@/scenes/nodes/Node2D';
import { TileMap } from '@/scenes/nodes/TileMap';
import { Popup } from '@/scenes/nodes/Popup';
import { NodeCell } from '@/scenes/nodes/NodeCell';
import { Player } from '@/scenes/nodes/Player';
import { Apple } from '@/scenes/nodes/Apple';

import { GridMap } from '@/modules/GridMap';
import { World } from '@/modules/World';
import { touches, canvas, layers, gm, keyboardInputInterceptor } from '@/global';


export class MainScene extends Node2D {
	declare public tree: Scene.Tree<typeof MainScene.TREE>;

	protected static readonly TREE = {
		Apple: [Apple],
		Player: [Player],
		World: [World, { size: new Vector2(20, 20) }],
		TileMap: [TileMap, new Vector2(1, 1)]
	} as const;


	public gridMap = new GridMap({
		tile: new Vector2().set(gm.camera.pixelDensity),
		size: gm.screen,
		coordinates: true
	});

	private popups: Popup[] = [];


	private get apple() { return this.tree.Apple; }
	private get player() { return this.tree.Player; }
	private get world() { return this.tree.World; }
	private get tilemap() { return this.tree.TileMap; }


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


	protected async _init(): Promise<void> {
		this.keymapperOfActions = new KeymapperOfActions(this.normal_mode);
		this.keymapperOfActions.init(keyboardInputInterceptor);


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

			// popup.init();
			this.popups.push(popup);
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


		this.normal_mode.register(['w'], () => {
			const o = this.world.getObjectCellUp(this.player.cellpos.buf().add(0, -1));
			if(o) this.player.tryPickup(o);
		});

		this.normal_mode.register(['d'], () => {
			this.player.tryPutfromHandsTo(Vector2.UP);
		});



		const map = await MapParser.instance().loadMap('maps/test-map.json');
		this.tree.TileMap.setMap(map);


		const updateOnResize = (size: Vector2) => {
			this.gridMap.size.set(size);

			// layers.main.beginPath();
			// layers.main.rect(gm.camera.position.x, gm.camera.position.y, gm.camera.size.x, gm.camera.size.y);
			// layers.main.clip();
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
		gm.on('camera.scale', scale => this.gridMap.scale.set(scale));
	}

	protected _ready(): void {
		this.world.date.setHours(6);

		this.player.cellpos.set(8, 8);
		this.apple.cellpos.set(6, 6);


		const tilemap = this.tilemap.getMap()!;
		console.log(tilemap);


		const layer = tilemap.layers[0];

		for(let i = 0; i < layer.data.length; i++) {
			if(layer.data[i] === 0) continue;

			const x = i % layer.width;
			const y = Math.floor(i / layer.width);

			const o = new NodeCell({
				isPickupable: false
			});

			o.cellpos.set(x, y);
			o.init();

			this.world.addObject(o);
		}


		this.player.cellpos.set(8, 8);
		this.world.addObject(this.player);

		this.apple.cellpos.set(6, 6);
		this.world.addObject(this.apple);
	}

	protected _process(dt: number): void {
		this.keymapperOfActions.update(dt);

		const player = this.tree.Player;

		gm.camera.position.moveTime(player.position, 10);
		// gm.camera.position.moveTime(player.globalPosition, 10);
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
		// this.player.process(dt);
		// this.apple.process(dt);
		this.world.process(dt);

		this.systemInfoDrawObject.update(dt);
	}

	protected _render(layers: LayersList, camera: Camera): void {
		layers.main.clearRect(0, 0, gm.screen.x, gm.screen.y);

		this.gridMap.draw(layers.main, camera.getDrawPosition());
		this.tilemap.render(layers, camera);
		// this.player.render(layers, camera);
		// this.apple.render(layers, camera);
		this.world.render(layers, camera);


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
}
