class Collection extends Map {
	constructor() {
		super();
	}
	/**
	 *
	 * @param {Object | String | Array} key
	 * @param {(key: Object, collection: Collection) => String | Object | Array} defaultValueGenerator
	 * @returns {String | Object | Array}
	 */
	ensure(key, defaultValueGenerator) {
		if (this.has(key)) return this.get(key);
		const defaultValue = defaultValueGenerator(key, this);
		this.set(key, defaultValue);
		return defaultValue;
	}

	/**
	 * @param {Array<String | Object | Number>} key
	 * @returns {Boolean}
	 */
	hasAll(...keys) {
		return keys.every((key) => super.has(key));
	}

	/**
	 * @param {Array<String | Object | Number>} key
	 * @returns {Boolean}
	 */
	hasAny(...keys) {
		return keys.some((key) => super.has(key));
	}

	/**
	 * @param {Number} amount
	 * @returns {Array<String | Object | Number>}
	 */
	first(amount) {
		if (typeof amount === 'undefined') return this.values().next().value;
		if (amount < 0) return this.last(amount * -1);
		amount = Math.min(this.size, amount);
		const iter = this.values();
		return Array.from({ length: amount }, () => iter.next().value);
	}

	/**
	 * @param {Number} amount
	 * @returns {Array<String | Object | Number>}
	 */
	firstKey(amount) {
		if (typeof amount === 'undefined') return this.keys().next().value;
		if (amount < 0) return this.lastKey(amount * -1);
		amount = Math.min(this.size, amount);
		const iter = this.keys();
		return Array.from({ length: amount }, () => iter.next().value);
	}

	/**
	 * @param {Number} amount
	 * @returns {Array<String | Object | Number>}
	 */
	last(amount) {
		if (typeof amount === 'undefined') return this.last();
		if (amount < 0) return this.first(amount * -1);
		amount = Math.min(this.size, amount);
		return [...this.values()].slice(-amount);
	}

	/**
	 * @param {Number} amount
	 * @returns {Array<String | Object | Number>}
	 */
	lastKey(amount) {
		if (typeof amount === 'undefined') return this.lastKey();
		if (amount < 0) return this.firstKey(amount * -1);
		amount = Math.min(this.size, amount);
		return [...this.keys()].slice(-amount);
	}

	/**
	 * @param {Number} index
	 * @returns {String | Object | Number}
	 */
	at(index) {
		index = Math.floor(index);
		return [...this.values()].at(index);
	}

	/**
	 * @param {Number} index
	 * @returns {String | Object | Number}
	 */
	keyAt(index) {
		index = Math.floor(index);
		return [...this.keys()].at(index);
	}

	/**
	 * @param {Number} amount
	 * @returns {String | Object | Number}
	 */
	random(amount) {
		const arr = [...this.values()];
		if (typeof amount === 'undefined') return arr[Math.floor(Math.random() * arr.length)];
		if (!arr.length || !amount) return [];
		return Array.from(
			{ length: Math.min(amount, arr.length) },
			() => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
		);
	}

	/**
	 * @param {Number} amount
	 * @returns {String | Object | Number}
	 */
	randomKey(amount) {
		const arr = [...this.keys()];
		if (typeof amount === 'undefined') return arr[Math.floor(Math.random() * arr.length)];
		if (!arr.length || !amount) return [];
		return Array.from(
			{ length: Math.min(amount, arr.length) },
			() => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
		);
	}

	reverse() {
		const entries = [...this.entries()].reverse();
		this.clear();
		for (const [key, value] of entries) this.set(key, value);
		return this;
	}

	/**
	 *
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {V | undefined}
	 */
	find(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}
		return undefined;
	}

	/**
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {K | undefined}
	 */
	findKey(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return key;
		}
		return undefined;
	}

	/**
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {Collection<K, V>}
	 */
	sweep(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const previousSize = this.size;
		for (const [key, val] of this) {
			if (fn(val, key, this)) this.delete(key);
		}
		return previousSize - this.size;
	}

	/**
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {Collection<K, V>
	 */
	filter(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const results = new this.constructor[Symbol.species]();
		for (const [key, val] of this) {
			if (fn(val, key, this)) results.set(key, val);
		}
		return results;
	}

	/**
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {Collection<K, V>}
	 */
	flatMap(fn, thisArg) {
		const collections = this.map(fn, thisArg);
		return new this.constructor[Symbol.species]().concat(...collections);
	}

	/**
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {Collection<K, V>}
	 */
	map(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const iter = this.entries();
		return Array.from({ length: this.size }, () => {
			const [key, value] = iter.next().value;
			return fn(value, key, this);
		});
	}

	/**
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {Collection<K, V>}
	 */
	mapValues(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const coll = new this.constructor[Symbol.species]();
		for (const [key, val] of this) coll.set(key, fn(val, key, this));
		return coll;
	}

	/**
	 *
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {boolean}
	 */
	some(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return true;
		}
		return false;
	}

	/**
	 *
	 * @param {(value: V, key: K, collection: Collection)} fn
	 * @param {unknown} thisArg
	 * @returns {boolean}
	 */
	every(fn, thisArg) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (!fn(val, key, this)) return false;
		}
		return true;
	}

	/**
	 * @param {(accumulator: any, value: V, key: K, collection: Collection)} fn
	 * @param {any} initialValue
	 * @returns {any}
	 */
	reduce(fn, initialValue) {
		let accumulator;

		if (typeof initialValue !== 'undefined') {
			accumulator = initialValue;
			for (const [key, val] of this) accumulator = fn(accumulator, val, key, this);
			return accumulator;
		}
		let first = true;
		for (const [key, val] of this) {
			if (first) {
				accumulator = val;
				first = false;
				continue;
			}
			accumulator = fn(accumulator, val, key, this);
		}

		// No items iterated.
		if (first) {
			throw new TypeError('Reduce of empty collection with no initial value');
		}

		return accumulator;
	}

	clone() {
		return new this.constructor[Symbol.species](this);
	}

	/**
	 *
	 * @param  {Collection[]} collections
	 * @returns {Collection}
	 */
	concat(...collections) {
		const newColl = this.clone();
		for (const coll of collections) {
			for (const [key, val] of coll) newColl.set(key, val);
		}
		return newColl;
	}

	/**
	 * @param {Collection} collection
	 * @returns {boolean}
	 */
	equals(collection) {
		if (!collection) return false;
		if (this === collection) return true;
		if (this.size !== collection.size) return false;
		for (const [key, value] of this) {
			if (!collection.has(key) || value !== collection.get(key)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param {Collection} collection
	 * @returns {Collection}
	 */
	sort(compareFunction = Collection.defaultSort) {
		const entries = [...this.entries()];
		entries.sort((a, b) => compareFunction(a[1], b[1], a[0], b[0]));

		// Perform clean-up
		super.clear();

		// Set the new entries
		for (const [k, v] of entries) {
			super.set(k, v);
		}
		return this;
	}

	/**
	 * @param {Collection} other
	 * @returns {Collection}
	 */
	difference(other) {
		const coll = new this.constructor[Symbol.species]();
		for (const [k, v] of other) {
			if (!this.has(k)) coll.set(k, v);
		}
		for (const [k, v] of this) {
			if (!other.has(k)) coll.set(k, v);
		}
		return coll;
	}

	toJSON() {
		return [...this.values()];
	}

	static defaultSort(firstValue, secondValue) {
		return Number(firstValue > secondValue) || Number(firstValue === secondValue) - 1;
	}
}

module.exports = { Collection };
