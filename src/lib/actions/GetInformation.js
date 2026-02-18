export class GetInformation {
	_apiClient;

	constructor(apiClient) {
		this._apiClient = apiClient;
	}

	async handle(id) {
		let remote = await this._apiClient.get(`informacion`, { id: id });
		return this.map(remote.informacion[0]);
	}

	map(remote) {
		let weeklyDistance = [];
		try {
			// The API returns this as a string, so it needs to be parsed.
			if (remote.distancia_semanal_json) {
				weeklyDistance = JSON.parse(remote.distancia_semanal_json);
			}
		} catch (e) {
			console.error('Failed to parse distancia_semanal_json:', e);
			// Return empty array on parsing error
		}

		return {
			id: remote.id,
			total_distance: remote.distancia_total,
			weeklyDistance: weeklyDistance,
			monthlyRecord: remote.record_mensual,
			monthlyRecordDate: remote.fecha_record_mensual
		};
	}
}
