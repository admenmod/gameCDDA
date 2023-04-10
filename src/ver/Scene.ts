import { EventDispatcher, Event } from './events';
import type { Camera } from './Camera';

type Layers =  Record<string, CanvasRenderingContext2D>;


export class Scene extends EventDispatcher {
	public '@init' = new Event<Scene, []>(this);
	public '@exit' = new Event<Scene, []>(this);

	public '@ready' = new Event<Scene, []>(this);
	public '@destroy' = new Event<Scene, []>(this);

	public '@process' = new Event<Scene, [number]>(this);
	public '@render' = new Event<Scene, [Layers, Camera]>(this);


	protected _isInited: boolean = false;
	protected _isExited: boolean = false;

	protected _isReady: boolean = false;
	protected _isDestroyed: boolean = false;


	public get isInited(): boolean { return this._isInited; }
	public get isExited(): boolean { return this._isExited; }

	public get isReady(): boolean { return this._isReady; }
	public get isDestroyed(): boolean { return this._isDestroyed; }


	protected _init(): void {}
	protected _exit(): void {}

	protected async _ready(): Promise<void> {}
	protected async _destroy(): Promise<void> {}

	protected _process(dt: number): void {}
	protected _render(layers: Layers, camera: Camera): void {}


	public async ready(this: Scene): Promise<void> {
		if(this._isReady) return;

		await this._ready();

		this._isReady = true;
		this._isDestroyed = false;

		this.emit('ready');

		this.init();
	}

	public async destroy(this: Scene): Promise<void> {
		if(this._isDestroyed) return;

		this.exit();

		await this._destroy();

		this._isDestroyed = true;
		this._isReady = false;

		this.emit('destroy');
	}

	public init(this: Scene): void {
		if(!this._isReady || this._isInited) return;

		this._init();

		this._isInited = true;
		this._isExited = false;

		this.emit('init');
	}

	public exit(this: Scene): void {
		if(!this.isDestroyed || this._isExited) return;

		this._exit();

		this._isExited = true;
		this._isInited = false;

		this.emit('exit');
	}

	public process(this: Scene, dt: number): void {
		if(!this._isInited || !this._isReady) return;

		this._process(dt);

		this.emit('process', dt);
	}

	public render(this: Scene, layers: Layers, camera: Camera): void {
		if(!this._isInited || !this._isReady) return;

		this._render(layers, camera);

		this.emit('render', layers, camera);
	}
}
