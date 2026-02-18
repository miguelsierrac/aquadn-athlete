import { GetAthlete } from '$lib/actions/GetAthlete';
import { SaveToken } from '$lib/actions/SaveToken';
import { GetInformation } from '$lib/actions/GetInformation';
import { GetLevel } from '$lib/actions/GetLevel';
import { GetAllBadges } from '$lib/actions/GetAllBadges';
import { GetMeasurements } from '$lib/actions/GetMeasurements';
import { GetGamificationData } from '$lib/actions/GetGamificationData';
import ApiClient from '$lib/infrastructure/APIClient';
import { Request } from '$lib/infrastructure/Request';

const fetch = new Request();
const apiClient = new ApiClient(fetch);

export default {
	getAthlete: new GetAthlete(apiClient),
	saveToken: new SaveToken(apiClient),
	getInformation: new GetInformation(apiClient),
	getLevel: new GetLevel(apiClient),
	getAllBadges: new GetAllBadges(apiClient),
	getMeasurements: new GetMeasurements(apiClient),
	getGamificationData: new GetGamificationData(apiClient)
};
