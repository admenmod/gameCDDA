import { EventDispatcher, Event } from './events';
import type { Camera } from './Camera';
import type { getInstanceOf } from '@ver/types';


type Layers = Record<string, CanvasRenderingContext2D>;

//@ts-ignore
type getTree<T> =  { [K in keyof ReturnType<T>]: getInstanceOf<ReturnType<T>[K]>; };

export class Scene extends EventDispatcher {
	protected readonly _class: typeof Scene;

	private _owner: Scene | null = null;
	public get owner() { return this._owner; }

	private _name: string = this.constructor.name;
	public get name() { return this._name; }


	protected static _TREE: Record<string, typeof Scene>;
	protected _tree: Record<string, Scene> = Object.create(null);

	public getTREE(): Record<string, typeof Scene> { return Object.create(null); };
	public get<Name extends keyof getTree<this['getTREE']>>(name: Name): getTree<this['getTREE']>[Name] {
		//@ts-ignore
		return this._tree[name];
	}


	protected _isReady: boolean = false;
	protected _isInited: boolean = false;
	protected _isExited: boolean = true;

	public get isReady(): boolean { return this._isReady; }
	public get isInited(): boolean { return this._isInited; }
	public get isExited(): boolean { return this._isExited; }

	public get isLoaded(): boolean { return this._class._isLoaded; }
	public get isUnloaded(): boolean { return this._class._isUnloaded; }


	constructor() {
		super();
		this._class = new.target;

		this._init_tree();
	}

	private _init_tree(): void {
		if(!this._class._TREE) this._class._TREE = this.getTREE();

		for(const id in this._class._TREE) {
			const s = this._class._TREE[id];

			this._tree[id] = new s();
			this._tree[id]._owner = this;
			this._tree[id]._name = id;
		}
	}


	protected _ready(): void {}
	// protected _enter_tree(): void {}
	// protected _exit_tree(): void {}

	protected async _init(...args: never[]): Promise<void> {}
	protected async _exit(...args: never[]): Promise<void> {}

	protected _process(dt: number, ...args: never[]): void {}
	protected _render(layers: Layers, camera: Camera, ...args: never[]): void {}


    public ready(): void {
		if(this._isReady || !this._isInited || !this.isLoaded) return;

		this._ready();

		for(const id in this._tree) this._tree[id].ready();

		this._isReady = true;
	}

	//@ts-ignore
    public async init(...args: Parameters<this['_init']>): Promise<void>;
    public async init(...args: never[]): Promise<void> {
		if(this._isInited || !this.isLoaded) return;

		await this._init(...args);

		this._isInited = true;
		this._isExited = false;

		if(this._owner === null) this.ready();
	}

	//@ts-ignore
    public async exit(...args: Parameters<this['_exit']>): Promise<void>;
    public async exit(...args: never[]): Promise<void> {
		if(this._isExited || this.isUnloaded) return;

		await this._exit(...args);

		this._isExited = true;
		this._isInited = false;
	}


	//@ts-ignore
    public process(...args: Parameters<this['_process']>): void;
    public process(...args: never[]): void {
		if(!this._isInited) return;

		//@ts-ignore
		this._process(...args);
	}

	//@ts-ignore
    public render<This>(this: This, ...args: Parameters<This['_render']>): void;
    public render(...args: never[]): void {
		if(!this._isInited) return;

		//@ts-ignore
		this._render(...args);
	}


	protected static _isLoaded: boolean = false;
	protected static _isUnloaded: boolean = true;

	public static get isLoaded(): boolean { return this._isLoaded; }
	public static get isUnloaded(): boolean { return this._isUnloaded; }

	protected static async _load(...args: never[]): Promise<void> {}
	protected static async _unload(...args: never[]): Promise<void> {}


	public static '@load' = new Event<typeof Scene, [Scene: typeof Scene]>(this);
	public static '@unload' = new Event<typeof Scene, [Scene: typeof Scene]>(this);

	//@ts-ignore
    public static async load(...args: Parameters<this['_load']>): Promise<void>;
    public static async load(...args: never[]): Promise<void> {
		if(this._isLoaded) return;

		await this._load(...args);

		const proms = [];
		for(const id in this._TREE) proms.push(this._TREE[id].load());
		await Promise.all(proms);

		this._isLoaded = true;
		this._isUnloaded = false;

		this.emit('load', this);
	}

	//@ts-ignore
    public static async unload(...args: Parameters<this['_unload']>): Promise<void>;
    public static async unload(...args: never[]): Promise<void> {
		if(this._isUnloaded) return;

		await this._unload(...args);

		const proms = [];
		for(const id in this._TREE) proms.push(this._TREE[id].unload());
		await Promise.all(proms);

		this._isUnloaded = true;
		this._isLoaded = false;

		this.emit('unload', this);
	}
}
