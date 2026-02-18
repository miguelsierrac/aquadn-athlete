import ApiClient from '../infrastructure/APIClient';
import { Request } from '../infrastructure/Request';

export class GetMeasurements {
	constructor() {
		this.apiClient = new ApiClient(new Request());
	}

	async execute(athleteId) {
		try {
			const data = {
				deportista: athleteId,
				sort: 'fecha:desc,id:desc',
				per_page: 2,
				page: 0
			};
			const remote = await this.apiClient.get('mediciones', data);
			return remote.mediciones;
		} catch (error) {
			console.error('Error getting measurements:', error);
			throw error;
		}
	}
}
