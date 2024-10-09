import { promises as fs } from 'fs';
import * as path from 'path';

export default class Database<T extends Record<string, any>> {
	private filePath: string;
	private data: T | null = null;

	constructor(filename: string) {
		this.filePath = path.resolve(__dirname, filename);
		this.loadData();
	}

	private async loadData(): Promise<void> {
		try {
			const rawData = await fs.readFile(this.filePath, 'utf8');
			this.data = JSON.parse(rawData);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
				console.warn(
					`File ${this.filePath} not found. Initializing new database.`
				);
				this.data = {} as T;
			} else {
				console.error('Error loading JSON data:', err);
				throw err;
			}
		}
	}

	private async saveData(): Promise<void> {
		try {
			await fs.writeFile(
				this.filePath,
				JSON.stringify(this.data, null, 2),
				'utf8'
			);
		} catch (err) {
			console.error('Error saving JSON data:', err);
			throw err;
		}
	}

	public async get(key: keyof T): Promise<T[keyof T] | undefined> {
		if (!this.data) await this.loadData();
		return this.data ? this.data[key] : undefined;
	}

	public async set(key: keyof T, value: T[keyof T]): Promise<void> {
		if (!this.data) await this.loadData();
		this.data![key] = value;
		await this.saveData();
	}

	public async delete(key: keyof T): Promise<void> {
		if (!this.data) await this.loadData();
		delete this.data![key];
		await this.saveData();
	}

	public async getAll(): Promise<T> {
		if (!this.data) await this.loadData();
		return this.data!;
	}
}
