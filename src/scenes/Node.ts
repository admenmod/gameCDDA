import { Event } from '@ver/events';
import { Scene } from '@ver/Scene';
import { System } from '@ver/System';


export class ProcessSystem extends System<typeof Node> {
	constructor() {
		super(Node);

		const processPriority = () => this._items.sort(this._sort);

		this['@add'].on(item => {
			item.on('change%processPriority', processPriority);
			processPriority();
		});

		this['@removing'].on(item => item.off('change%processPriority', processPriority));
	}

	public _sort(a: Node, b: Node): number { return a.processPriority - b.processPriority; }

	public update(dt: number) {
		for(let i = 0; i < this._items.length; i++) {
			this._items[i].process(dt);
		}
	}
}


const PARENT_CACHE = Symbol('parent_cache');

export class Node extends Scene {
	protected [PARENT_CACHE]: Node[] = [];

	public '@change%processPriority' = new Event<Node, [Node]>(this);

	private _processPriority: number = 0;
	public get processPriority() { return this._processPriority; }
	public set processPriority(v) {
		this._processPriority = v;
		this['@change%processPriority'].emit(this);
	}


	constructor() {
		super();

		const ontree = () => {
			this[PARENT_CACHE].length = 0;
			this[PARENT_CACHE].push(...this.getChainOwnersOf(Node));
		};

		ontree();

		this['@tree_entered'].on(ontree);
		this['@tree_exiting'].on(ontree);
	}


	protected _process(dt: number): void {}

	public process(dt: number): void {
		this._process(dt);
	}


	public get NODE_TYPE(): string { return this.constructor.name; }

	public static readonly MAX_NESTING = 10000;
}
