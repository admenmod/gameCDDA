import { Vector2 } from './Vector2';
import { EventDispatcher, Event } from './events';
import { loadImage } from './helpers';


export interface IProperty {
	readonly name: string;
	readonly type: string;
	readonly value: string;
}

export interface ITile {
	readonly id: number;
	readonly properties: IProperty[];
}

export interface ILayer {
	readonly data: Uint8Array | Uint16Array | Uint32Array;

	readonly id: number;
	readonly name: string;
	readonly type: string;

	readonly visible: boolean;
	readonly opacity: number;

	readonly width: number;
	readonly height: number;

	readonly x: number;
	readonly y: number;

	readonly offsetx: number;
	readonly offsety: number;

	readonly properties: IProperty[];
}

export interface ITileset {
	readonly name: string;

	readonly image: string;
	readonly imagewidth: number;
	readonly imageheight: number;

	readonly columns: number;
	readonly firstgid: number;
	readonly margin: number;
	readonly spacing: number;

	readonly tilecount: number;
	readonly tilewidth: number;
	readonly tileheight: number;

	readonly tiles: ITile[];

	readonly properties: IProperty[];
}

export interface IMap {
	readonly version: number;
	readonly type: string;

	readonly width: number;
	readonly height: number;

	readonly nextlayerid: number;
	readonly nextobjectid: number;
	readonly infinite: boolean;
	readonly orientation: string;
	readonly renderorder: string;

	readonly tiledversion: string;
	readonly tilewidth: number;
	readonly tileheight: number;

	readonly layers: ILayer[];
	readonly tilesets: ITileset[];
	readonly properties: IProperty[];
}


const BASE64 = 'data:image/png;base64,';


type Property_ = Property;
class Property extends EventDispatcher implements IProperty {
	public readonly name: string;
	public readonly type: string;
	public readonly value: string;

	constructor(o: IProperty) {
		super();

		this.name = o.name;
		this.type = o.type;
		this.value = o.value;
	}
}


type Tile_ = Tile;
class Tile extends EventDispatcher implements ITile {
	public readonly id: number;
	public readonly properties: Property[] = [];

	constructor(o: ITile) {
		super();

		this.id = o.id;

		for(let i = 0; i < o.properties.length; i++) {
			this.properties[i] = new Property(o.properties[i]);
		}
	}
}


type Layer_ = Layer;
class Layer extends EventDispatcher implements ILayer {
	protected readonly _data: ILayer;

	public readonly data: Uint8Array | Uint16Array | Uint32Array;

	public readonly id: number;
	public readonly name: string;
	public readonly type: string;

	public readonly visible: boolean;
	public readonly opacity: number;

	public readonly width: number;
	public readonly height: number;
	public readonly size: Readonly<Vector2>;

	public readonly x: number;
	public readonly y: number;
	public readonly pos: Readonly<Vector2>;

	public readonly offsetx: number;
	public readonly offsety: number;
	public readonly offset: Readonly<Vector2>;

	public readonly properties: Property[] = [];

	constructor(o: ILayer) {
		super();

		this._data = o;

		this.data = o.data;

		this.id = o.id;
		this.name = o.name;
		this.type = o.type;

		this.visible = o.visible;
		this.opacity = o.opacity;

		this.width = o.width;
		this.height = o.height;
		this.size = Object.freeze(new Vector2(this.width, this.height));

		this.x = o.x;
		this.y = o.y;
		this.pos = Object.freeze(new Vector2(this.x, this.y));

		this.offsetx = o.offsetx;
		this.offsety = o.offsety;
		this.offset = Object.freeze(new Vector2(this.offsetx, this.offsety));

		for(let i = 0; i < o.properties.length; i++) {
			this.properties[i] = new Property(o.properties[i]);
		}
	}
}


type Tileset_ = Tileset;
class Tileset extends EventDispatcher implements ITileset {
	public '@load' = new Event<Tileset, [Tileset, HTMLImageElement]>(this);

	protected _data: ITileset;

	public imagedata!: HTMLImageElement;

	public readonly name: string;

	public readonly image: string;
	public readonly imagewidth: number;
	public readonly imageheight: number;
	public readonly image_size: Readonly<Vector2>;

	public readonly columns: number;
	public readonly firstgid: number;
	public readonly margin: number;
	public readonly spacing: number;

	public readonly tilecount: number;
	public readonly tilewidth: number;
	public readonly tileheight: number;
	public readonly tile_size: Readonly<Vector2>;

	public readonly tiles: Tile[] = [];
	public readonly properties: Property[] = [];

	constructor(o: ITileset) {
		super();

		this._data = o;

		this.name = o.name;

		this.image = o.image;
		this.imagewidth = o.imagewidth;
		this.imageheight = o.imageheight;
		this.image_size = Object.freeze(new Vector2(this.imagewidth, this.imageheight));

		this.columns = o.columns;
		this.firstgid = o.firstgid;
		this.margin = o.margin;
		this.spacing = o.spacing;

		this.tilecount = o.tilecount;
		this.tilewidth = o.tilewidth;
		this.tileheight = o.tileheight;
		this.tile_size = Object.freeze(new Vector2(this.tilewidth, this.tileheight));

		for(let i = 0; i < o.tiles.length; i++) {
			this.tiles[i] = new Tile(o.tiles[i]);
		}

		for(let i = 0; i < o.properties.length; i++) {
			this.properties[i] = new Property(o.properties[i]);
		}
	}
}


type Map_ = Map;
class Map extends EventDispatcher implements IMap {
	public '@load' = new Event<Map, [Map]>(this);

	protected readonly _data: IMap;

	public readonly version: number;
	public readonly type: string;

	public readonly width: number;
	public readonly height: number;
	public readonly size: Readonly<Vector2>;

	public readonly nextlayerid: number;
	public readonly nextobjectid: number;
	public readonly infinite: boolean;
	public readonly orientation: string;
	public readonly renderorder: string;

	public readonly tiledversion: string;
	public readonly tilewidth: number;
	public readonly tileheight: number;
	public readonly tile_size: Readonly<Vector2>;

	public readonly layers: Layer[] = [];
	public readonly tilesets: Tileset[] = [];
	public readonly properties: Property[] = [];

	constructor(o: IMap) {
		super();

		this._data = o;

		this.version = o.version;
		this.type = o.type;

		this.width = o.width;
		this.height = o.height;
		this.size = Object.freeze(new Vector2(this.width, this.height));

		this.nextlayerid = o.nextlayerid;
		this.nextobjectid = o.nextobjectid;
		this.infinite = o.infinite;
		this.orientation = o.orientation;
		this.renderorder = o.renderorder;

		this.tiledversion = o.tiledversion;
		this.tilewidth = o.tilewidth;
		this.tileheight = o.tileheight;
		this.tile_size = Object.freeze(new Vector2(this.tilewidth, this.tileheight));


		for(let i = 0; i < o.layers.length; i++) {
			this.layers[i] = new Layer(o.layers[i]);
		}

		for(let i = 0; i < o.tilesets.length; i++) {
			this.tilesets[i] = new Tileset(o.tilesets[i]);
		}

		for(let i = 0; i < o.properties.length; i++) {
			this.properties[i] = new Property(o.properties[i]);
		}
	}
}


export declare namespace MapParser {
	export type Property = Property_;
	export type Tile = Tile_;
	export type Layer = Layer_;
	export type Tileset = Tileset_;
	export type Map = Map_;
}


export class MapParser extends EventDispatcher {
	private static _instance: MapParser;

	public '@load:map' = new Event<MapParser, [Map]>(this);
	public '@load:tileset' = new Event<MapParser, [Tileset]>(this);

	protected constructor() {
		super();

		if(MapParser._instance) MapParser._instance = this;
	}

	public static instance(): MapParser { return MapParser._instance || new MapParser(); }

	public loadMap(src: string): Promise<Map> {
		return fetch(src).then(data => data.json()).then((_map: IMap) => {
			for(let i = 0; i < _map.layers.length; i++) {
				//@ts-ignore
				_map.layers[i].data = new Uint16Array(_map.layers[i].data);
			}

			const map = new MapParser.Map(_map);


			const proms: Promise<void>[] = [];

			for(let i = 0; i < map.tilesets.length; i++) {
				const tileset = map.tilesets[i];
				const imagedata = tileset.properties.find(i => i.name === 'imagedata');

				if(!imagedata) return Promise.reject(new Error('error: imagedata'));

				const prom = loadImage(BASE64 + imagedata.value, tileset.imagewidth, tileset.imageheight).then(img => {
					img.name = tileset.image;

					tileset.imagedata = img;

					tileset.emit('load', tileset, img);
					(this as MapParser).emit('load:tileset', tileset);
				});

				proms.push(prom);
			}


			return Promise.all(proms).then(data => {
				map.emit('load', map);
				(this as MapParser).emit('load:map', map);

				return map;
			});
		});
	}


	public static Property = Property;
	public static Tile = Tile;
	public static Layer = Layer;
	public static Tileset = Tileset;
	public static Map = Map;
}
