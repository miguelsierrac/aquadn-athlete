export class GetAllBadges {
	_apiClient;

	constructor(apiClient) {
		this._apiClient = apiClient;
	}

	async handle() {
		let remote = await this._apiClient.get(`insignias`, {});

		if (remote.insignias.length === 0) {
			return [];
		}

		return remote.insignias.map(this.map);
	}

	map(remote) {
		return {
			id: remote.id,
			name: remote.nombre,
			icon: remote.icono,
			description: remote.descripcion
		};
	}
}
