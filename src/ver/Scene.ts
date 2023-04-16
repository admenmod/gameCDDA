import { EventDispatcher, Event } from './events';
import type { Camera } from './Camera';
import type { getInstanceOf } from '@ver/types';


type Layers = Record<string, CanvasRenderingContext2D>;

//@ts-ignore
type getTree<T> = { [K in keyof ReturnType<T['TREE']>]: getInstanceOf<ReturnType<T['TREE']>[K]>; };

export class Scene extends EventDispatcher {
	protected readonly _class: typeof Scene;

	private _owner: Scene | null = null;
	public get owner() { return this._owner; }

	private _name: string = this.constructor.name;
	public get name() { return this._name; }


	protected static _TREE: Record<string, typeof Scene>;
	protected tree: Record<string, Scene> = Object.create(null);

	public TREE(): Record<string, typeof Scene> { return {}; };

	public get(): getTree<this>;
	public get<Name extends keyof getTree<this>>(name: Name): getTree<this>[Name];
	public get(name: any = null) {
		if(name === null) return this.tree;
		return this.tree[name];
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
		if(!this.isLoaded) throw new Error(`(${this.name}) you can't instantiate a scene before it's loaded`);

		for(const id in this._class._TREE) {
			const s = this._class._TREE[id];

			this.tree[id] = new s();
			this.tree[id]._owner = this;
			this.tree[id]._name = id;
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

		for(const id in this.tree) this.tree[id].ready();

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


	private static _init_TREE(path: any[] = [], target_error: any = this.name): void {
		if(!this._TREE) this._TREE = this.prototype.TREE.call(null);

		if(path.includes(this._TREE)) {
			throw new Error(`cyclic dependence found "${this.name} -> ... -> ${target_error} -> ${this.name}"`);
		}

		for(let id in this._TREE) {
			this._TREE[id]._init_TREE([...path, this._TREE], this.name);
		}
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

		this._init_TREE();

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

		this._isUnloaded = true;
		this._isLoaded = false;

		this.emit('unload', this);
	}
}
