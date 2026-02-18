export class SaveToken {
	_apiClient;

	constructor(apiClient) {
		this._apiClient = apiClient;
	}

	async handle(athlete) {
		await this._apiClient.post(`deportistas`, {
			items: [{ id: athlete.id, token: athlete.token }]
		});
	}
}
