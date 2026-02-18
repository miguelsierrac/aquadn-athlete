export class GetLevel {
	_apiClient;

	constructor(apiClient) {
		this._apiClient = apiClient;
	}

	async handle(id) {
		if (!id) {
			return null;
		}
		let remote = await this._apiClient.get(`niveles`, { id: id });

		if (remote.niveles.length === 0) {
			throw new LevelNotFoundError('Cannot find level.');
		}

		return this.map(remote.niveles[0]);
	}

	map(remote) {
		return {
			id: remote.id,
			name: remote.nombre,
			icon: remote.icono,
			color: remote.color,
			skills: remote.habilidades
				.split('\n')
				.map((skill) => skill.trim())
				.filter((skill) => skill.length > 0)
		};
	}
}

export class LevelNotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'LevelNotFoundError';
	}
}
