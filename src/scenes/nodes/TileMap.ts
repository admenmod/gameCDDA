import { Vector2 } from '@ver/Vector2';
import { MapParser } from '@ver/MapParser';
import { Node2D } from '@/scenes/nodes/Node2D';


export class TileMap extends Node2D {
	public readonly size = new Vector2(1, 1);

	private _cacheTile: { [id: number]: MapParser.Tileset } = {};

	public map!: MapParser.Map;

	//@ts-ignore
	protected async _init(map: MapParser.Map, size?: Vector2): Promise<void> {
		this.map = map;
		if(size) this.size.set(size);
	}


	protected _draw(ctx: CanvasRenderingContext2D, pos: Vector2, scale: Vector2, rot: number, pixelDensity: number): void {
		if(!this.map) return;

		const map = this.map;

		ctx.save();

		for(let i = 0; i < map.layers.length; i++) {
			const layer = map.layers[i];

			if(!layer.visible) continue;

			for(let i = 0; i < layer.data.length; i++) {
				const count = layer.size.buf();

				const id: number = layer.data[i];

				if(id === 0) continue;
				const l = new Vector2(i % count.x, Math.floor(i / count.x));

				let tileset!: MapParser.Tileset;

				if(!(tileset = this._cacheTile[id])) {
					for(let i = 0; i < map.tilesets.length; i++) {
						if(map.tilesets[i].firstgid <= id && !map.tilesets[i+1] || id < map.tilesets[i+1].firstgid) {
							tileset = map.tilesets[i];
							this._cacheTile[id] = tileset;
							break;
						}
					}
				}

				if(!tileset) {
					console.error('tileset not fined');
					continue;
				}

				const tid = id - tileset.firstgid;
				const tc = new Vector2(tid % tileset.columns, Math.floor(tid / tileset.columns));

				const size = new Vector2(this.size).inc(scale).inc(pixelDensity);

				const tileoffset = new Vector2(tc).inc(tileset.tile_size);
				const tilesize = new Vector2(tileset.tile_size);
				const drawsize = new Vector2(size);
				const drawpos = new Vector2(l).inc(size).add(pos).sub(drawsize.buf().div(2));

				ctx.drawImage(
					tileset.imagedata,
					tileoffset.x, tileoffset.y, tilesize.x, tilesize.y,
					drawpos.x, drawpos.y, drawsize.x, drawsize.y
				);
			}
		}

		ctx.restore();
	}
}
