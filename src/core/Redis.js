const Ioredis = require('ioredis');

class Redis extends Ioredis {
	/**
	 *
	 * @param {import('@core/BaseClient')} client
	 */
	constructor(client) {
		super(process.env.REDIS_URL);

		this.client = client;

		this.ready = false;

		this.disabled = false;

		this.clearALL();
	}

	async clearALL() {
		if (this.disabled) return;
		await this.flushdb();
	}

	async getHash(key) {
		if (this.disabled) return;
		if (!this.ready) return;
		this.client.logger.debug('Redis Cache', `Received request for receiving hash data for key: ${key}.`);
		const data = await this.hgetall(key);
		if (!data || !Object.keys(data).length) return null;
		return JSON.parse(JSON.stringify(data));
	}

	delete(key) {
		if (this.disabled) return;
		if (!this.ready) return;
		this.client.logger.debug('Redis Cache', `Received request for deleting hash data: ${key}`);
		this.del(key);
	}

	deleteHashField(key, field) {
		if (this.disabled) return;
		if (!this.ready) return;
		this.client.logger.debug('Redis Cache', `Received request for deleting hash ${key} field ${field} data`);
		this.hDel(key, field);
	}

	async setHash(key, field, value, time) {
		if (this.disabled) return;
		if (!this.ready) return;

		this.client.logger.debug(
			'Redis Cache',
			`Received request for saving data for key: ${key} of field: ${field}.`
		);
		let json = false;
		if (typeof value === 'object') json = true;

		await this.hSet(key, field, json ? JSON.stringify(value) : value);

		if (time && time !== -1) await this.expire(key, time);
	}
	/**
	 *
	 * @param {string} key Key
	 * @param {number} time Time
	 * @param {{}} values Values
	 */
	async setHashes(key, time, values = {}) {
		if (this.disabled) return;
		if (!this.ready) return;
		if (Object.keys(values).length <= 0) return;

		this.client.logger.debug('Redis Cache', `Received request for saving data for key: ${key}`);

		await this.hSet(key, values);

		if (time && time !== -1) await this.expire(key, time);
	}

	async getKey(key, json = true) {
		if (this.disabled) return;
		if (!this.ready) return null;
		this.client.logger.debug('Redis Cache', `Received request for receiving data for key: ${key}.`);

		const data = await this.get(key);

		if (!data) return null;

		return json ? JSON.parse(data) : data;
	}

	async getHashField(key, field, json = true) {
		if (this.disabled) return;
		if (!this.ready) return null;
		this.client.logger.debug(
			'Redis Cache',
			`Received request for receiving data for key: ${key} field: ${field}`
		);

		const data = await this.hGet(key, field);
		return json ? JSON.parse(data) : data;
	}

	async setKey(key, data, time) {
		if (this.disabled) return;
		if (!this.ready) return;
		this.client.logger.debug('Redis Cache', `Received request for saving data for key: ${key}.`);
		let json = false;
		if (typeof data === 'object' || Array.isArray(data)) json = true;

		await this.set(key, json ? JSON.stringify(data) : data);

		if (time && time !== -1) await this.expire(key, time);
	}
}

module.exports = Redis;

// Note: This cache system is based of galaxies cache system so this should keep up for a while
