export class Request {
	async request(
		response_interceptor = () => {},
		url,
		method,
		headers = {},
		body = {},
		redirect = ''
	) {
		if (typeof window === 'undefined') {
			return undefined;
		}

		if (!navigator.onLine) {
			return Promise.reject({
				// eslint-disable-line
				detail: 'No tienes conexión a internet, revisa tu conexión 😢'
			});
		}

		const init = {
			method: method,
			headers: headers
		};

		if (method !== 'GET') {
			init['body'] = body;
		}

		if (redirect !== '') {
			init['redirect'] = redirect;
		}

		return fetch(url, init).then(async (response) => {
			response_interceptor(response);
			if (method === 'DELETE') {
				return response.text();
			} else {
				return response.json().then((json) => {
					if (response.ok) {
						return Promise.resolve(json);
					}
					return Promise.reject(json); // eslint-disable-line
				});
			}
		});
	}
}
