import { EventDispatcher, Event } from './events';
import type { Camera } from './Camera';
import type { getInstanceOf } from '@ver/types';


type Layers =  Record<string, CanvasRenderingContext2D>;

export declare namespace Scene {
	export type PickArgs<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;
	export type TREE = Record<string, readonly [typeof Scene, ...any]>;
	export type Tree<T extends Scene.TREE> = { [K in keyof T]: getInstanceOf<T[K][0]>; };
}

export class Scene extends EventDispatcher {
	private readonly _class: typeof Scene;

	private _owner: Scene | null = null;
	public get owner() { return this._owner; }

	private _name: string = this.constructor.name;
	public get name() { return this._name; }


	protected static readonly TREE: Scene.TREE = {};
	public readonly tree: Record<string, Scene> = Object.create(null);

	protected _isInited: boolean = false;
	protected _isExited: boolean = true;

	public get isLoaded(): boolean { return this._class._isLoaded; }
	public get isUnloaded(): boolean { return this._class._isUnloaded; }

	public get isInited(): boolean { return this._isInited; }
	public get isExited(): boolean { return this._isExited; }

	constructor(...args: any[]) {
		super();
		this._class = new.target;

		for(const id in this._class.TREE) {
			const s = this._class.TREE[id][0];
			const p = this._class.TREE[id].slice(1);

			this.tree[id] = new s(...p);
			this.tree[id]._owner = this;
			this.tree[id]._name = id;
		}
	}

	protected _ready(): void {}
	// protected _enter_tree(): void {}
	// protected _exit_tree(): void {}

	protected async _init(): Promise<void> {}
	protected async _exit(): Promise<void> {}

	protected _process(dt: number): void {}
	protected _render(layers: Layers, camera: Camera): void {}


	protected ready() {
		if(!this._isInited || !this.isLoaded) return;

		this._ready();

		for(const id in this.tree) this.tree[id].ready();
	}

	public async init(this: Scene): Promise<void> {
		if(this._isInited || !this.isLoaded) return;

		const proms = [];
		for(const id in this.tree) proms.push(this.tree[id].init());
		await Promise.all(proms);

		await this._init();

		this._isInited = true;
		this._isExited = false;

		this.ready();
	}

	public async exit(this: Scene): Promise<void> {
		if(this._isExited || this.isUnloaded) return;

		await this._exit();

		const proms = [];
		for(const id in this.tree) proms.push(this.tree[id].exit());
		await Promise.all(proms);

		this._isExited = true;
		this._isInited = false;
	}


	public process(this: Scene, dt: number): void {
		if(!this._isInited) return;

		this._process(dt);
	}

	public render(this: Scene, layers: Layers, camera: Camera): void {
		if(!this._isInited) return;

		this._render(layers, camera);
	}


	protected static _isLoaded: boolean = false;
	protected static _isUnloaded: boolean = true;

	public static get isLoaded(): boolean { return this._isLoaded; }
	public static get isUnloaded(): boolean { return this._isUnloaded; }

	protected static async _load(): Promise<void> {}
	protected static async _unload(): Promise<void> {}


	public static async load(this: typeof Scene): Promise<void> {
		if(this._isLoaded) return;

		await this._load();

		const proms = [];
		for(const id in this.TREE) proms.push(this.TREE[id][0].load());
		await Promise.all(proms);

		this._isLoaded = true;
		this._isUnloaded = false;
	}

	public static async unload(this: typeof Scene): Promise<void> {
		if(this._isUnloaded) return;

		await this._unload();

		const proms = [];
		for(const id in this.TREE) proms.push(this.TREE[id][0].unload());
		await Promise.all(proms);

		this._isUnloaded = true;
		this._isLoaded = false;
	}


	public load(): Promise<void> { return this._class.load(); }
	public unload(): Promise<void> { return this._class.unload(); }
}
